const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Notification = require("../models/Notification");
const sendMail = require("../service/send-mail");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only PDF and image files are allowed"));
    }
  },
});

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post(
  "/register",
  upload.single("panDocument"),
  [
    body("name", "Name is required").not().isEmpty(),
    body("email", "Please include a valid email").isEmail(),
    body(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
    body("role", "Role is required")
      .optional({ checkFalsy: true })
      .custom((value) => {
        if (!value) return true; // Allow empty/undefined values
        const validRoles = [
          "admin",
          "vendor",
          "center",
          "ADMIN",
          "VENDOR",
          "CENTER",
        ];
        return validRoles.includes(value);
      })
      .withMessage("Invalid role"),
    body("businessName")
      .if(
        body("role").custom(
          (value) => value && value.toUpperCase() === "VENDOR"
        )
      )
      .notEmpty()
      .withMessage("Business name is required for vendors"),
    body("panNumber")
      .if(
        body("role").custom((value) => {
          const upperRole = value ? value.toUpperCase() : "";
          return upperRole === "VENDOR" || upperRole === "CENTER";
        })
      )
      .notEmpty()
      .withMessage("PAN number is required for vendors and centers")
      .isLength({ min: 9, max: 9 })
      .withMessage("PAN number must be exactly 9 digits")
      .isNumeric()
      .withMessage("PAN number must contain only numbers"),
    body("district")
      .if(
        body("role").custom(
          (value) => value && value.toUpperCase() === "VENDOR"
        )
      )
      .notEmpty()
      .withMessage("District is required for vendors"),
  ],
  async (req, res) => {
    // Add detailed logging
    console.log("=== REGISTRATION DEBUG ===");
    console.log("Headers:", req.headers);
    console.log("Content-Type:", req.get("Content-Type"));
    console.log("Body:", req.body);
    console.log("File:", req.file);
    console.log("========================");

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(
        "Validation errors:",
        JSON.stringify(errors.array(), null, 2)
      );
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      businessName,
      panNumber,
      district,
      province,
      contactPersons,
      bankDetails,
    } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ msg: "User already exists" });
      }

      // Create user object with basic fields
      const userData = {
        name,
        email,
        password,
        role: role,
        phone,
        address,
        isActive: true,
      };

      // Add vendor-specific fields if role is VENDOR
      if (role === "VENDOR") {
        userData.businessName = businessName;
        userData.panNumber = panNumber;
        userData.district = district;

        // Parse and add contact persons if provided
        if (contactPersons) {
          try {
            userData.contactPersons =
              typeof contactPersons === "string"
                ? JSON.parse(contactPersons)
                : contactPersons;
          } catch (e) {
            console.error("Error parsing contactPersons:", e);
          }
        }

        // Parse and add bank details if provided
        if (bankDetails) {
          try {
            userData.bankDetails =
              typeof bankDetails === "string"
                ? JSON.parse(bankDetails)
                : bankDetails;
          } catch (e) {
            console.error("Error parsing bankDetails:", e);
          }
        }
      }

      // Add center-specific fields if role is CENTER
      if (role === "CENTER") {
        userData.panNumber = panNumber;
        userData.district = district;
        userData.province = province;
      }

      user = new User(userData);

      // REMOVE these lines - User model pre-save hook handles password hashing
      // const salt = await bcrypt.genSalt(10);
      // user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Create notification for admins about new vendor application
      if (role === "VENDOR") {
        try {
          await Notification.notifyAdmins({
            sender: user._id,
            type: "VENDOR_APPLICATION",
            title: "New Vendor Application",
            message: `${
              businessName || name
            } has applied to join the platform.`,
            relatedId: user._id,
            onModel: "User",
          });
          console.log(
            `Admin notification created for new vendor: ${businessName || name}`
          );
        } catch (notificationError) {
          console.error(
            "Failed to create admin notification:",
            notificationError
          );
          // Continue with registration even if notification fails
        }
      }

      // Create notification for admins about new center application
      if (role === "CENTER") {
        try {
          await Notification.notifyAdmins({
            sender: user._id,
            type: "CENTER_APPLICATION",
            title: "New Center Application",
            message: `${name} has applied to join the platform as a distribution center.`,
            relatedId: user._id,
            onModel: "User",
          });
          console.log(`Admin notification created for new center: ${name}`);
        } catch (notificationError) {
          console.error(
            "Failed to create admin notification:",
            notificationError
          );
          // Continue with registration even if notification fails
        }
      }

      const payload = {
        id: user.id,
        role: user.role,
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
        (err, token) => {
          if (err) throw err;
          res.json({
            success: true,
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  "/login",
  [
    body("email", "Please include a valid email").isEmail(),
    body("password", "Password is required").exists(),
    // Login validation (lines 273-283)
    body("role")
      .optional({ checkFalsy: true })
      .custom((value) => {
        if (!value) return true; // Allow empty/undefined values
        const validRoles = [
          "admin",
          "vendor",
          "center",
          "ADMIN",
          "VENDOR",
          "CENTER",
        ];
        return validRoles.includes(value);
      })
      .withMessage("Invalid role"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;
    console.log("Login attempt:", { email, role, hasPassword: !!password });

    try {
      let user = await User.findOne({ email });
      console.log(
        "User found:",
        user
          ? {
              id: user._id,
              email: user.email,
              role: user.role,
              status: user.status,
              isActive: user.isActive,
              businessName: user.businessName,
            }
          : null
      );

      if (!user) {
        console.log("Login failed: User not found");
        return res.status(400).json({ msg: "Invalid Credentials" });
      }

      if (!user.isActive) {
        console.log("Login failed: Account deactivated");
        return res.status(400).json({ msg: "Account is deactivated" });
      }

      // Validate role if provided - convert to uppercase for comparison
      if (role && user.role !== role.toUpperCase()) {
        console.log("Login failed: Role mismatch", {
          userRole: user.role,
          providedRole: role,
        });
        return res.status(400).json({ msg: "Invalid role for this account" });
      }

      // Add this status check for vendors and centers
      if (
        (user.role === "VENDOR" || user.role === "CENTER") &&
        user.status !== "APPROVED"
      ) {
        console.log("Login failed: Account not approved", {
          status: user.status,
        });
        return res.status(400).json({
          msg: "Account pending approval",
          status: user.status,
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Password match:", isMatch);

      if (!isMatch) {
        console.log("Login failed: Password mismatch");
        return res.status(400).json({ msg: "Invalid Credentials" });
      }

      console.log("Login successful for user:", user.email);

      const payload = {
        id: user.id,
        role: user.role,
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
        (err, token) => {
          if (err) throw err;
          res.json({
            success: true,
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role.toUpperCase(),
            },
          });
        }
      );
    } catch (err) {
      console.error("Login error:", err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   POST /api/auth/verify-token
// @desc    Verify JWT token
// @access  Private
router.post("/verify-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Check for demo token
    if (
      token === "demo_token_admin" ||
      token === "demo_token_vendor" ||
      token === "demo_token_customer"
    ) {
      const demoUser = {
        id: "demo_user_id",
        name: "Demo User",
        email: "demo@example.com",
        role: token.includes("admin")
          ? "admin"
          : token.includes("vendor")
          ? "vendor"
          : "customer",
      };
      return res.json({
        success: true,
        user: demoUser,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid token or user not found",
      });
    }

    res.json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
});

// @route   GET /api/auth/verify-token
// @desc    Verify JWT token (GET version)
// @access  Private
router.get("/verify-token", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Check for demo token
    if (
      token === "demo_token_admin" ||
      token === "demo_token_vendor" ||
      token === "demo_token_customer"
    ) {
      const demoUser = {
        id: "demo_user_id",
        name: "Demo User",
        email: "demo@example.com",
        role: token.includes("admin")
          ? "admin"
          : token.includes("vendor")
          ? "vendor"
          : "customer",
      };
      return res.json({
        success: true,
        user: demoUser,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid token or user not found",
      });
    }

    res.json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post(
  "/forgot-password",
  [body("email", "Please include a valid email").isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET + user.password,
        { expiresIn: "1h" }
      );

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&id=${user.id}`;

      await sendMail({
        to: user.email,
        subject: "Password Reset Request",
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      });

      res.json({ msg: "Password reset email sent" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post(
  "/reset-password",
  [
    body("token", "Token is required").not().isEmpty(),
    body(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password, id } = req.body;

    try {
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // Verify token
      jwt.verify(token, process.env.JWT_SECRET + user.password);

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      res.json({ msg: "Password reset successful" });
    } catch (err) {
      console.error(err.message);
      res.status(400).json({ msg: "Invalid or expired token" });
    }
  }
);

module.exports = router;
