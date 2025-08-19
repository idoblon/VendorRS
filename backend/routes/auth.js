const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  validateUserRegistration,
  validateUserLogin,
} = require("../middleware/validation");
const User = require("../models/User");
const { sendMail } = require("../service/send-mail");

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  console.log(
    process.env.JWT_SECRET,
    "Generating token for user ID",
    process.env.JWT_EXPIRE
  );
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  console.log(`Generated JWT token: ${token}`);
  return token;
};

// @route   POST /api/auth/register
// @desc    Register a new user (vendor or center)
// @access  Public
const multer = require("multer");
const upload = multer(); // Initialize multer for form-data parsing

router.post(
  "/register",
  upload.any(), // Parse form-data with file uploads
  validateUserRegistration,
  async (req, res) => {
    try {
      // Parse form data
      const {
        name,
        email,
        password,
        phone,
        role,
        businessName,
        panNumber,
        address,
        district,
        province,
        bankDetails,
        contactPersons,
        categories,
      } = req.body;

      // Parse JSON strings from form data
      let parsedBankDetails = {};
      let parsedContactPersons = [];
      let parsedCategories = [];

      try {
        parsedBankDetails = bankDetails ? JSON.parse(bankDetails) : {};
        parsedContactPersons = contactPersons ? JSON.parse(contactPersons) : [];
        parsedCategories = categories ? JSON.parse(categories) : [];
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: "Invalid bankDetails, contactPersons, or categories format",
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      // Create user object
      const userData = {
        name,
        email,
        password,
        phone,
        role,
        status: role === "ADMIN" ? "APPROVED" : "PENDING",
      };

      // Add role-specific fields
      if (role === "VENDOR") {
        userData.businessName = businessName;
        userData.panNumber = panNumber;
        userData.address = address;
        userData.district = district;
        userData.province = province;
        userData.bankDetails = parsedBankDetails;
        userData.contactPersons = parsedContactPersons;
      } else if (role === "CENTER") {
        userData.businessName = businessName;
        userData.panNumber = panNumber;
        userData.address = address;
        userData.district = district;
        userData.province = province;
        userData.categories = parsedCategories;
        userData.bankDetails = parsedBankDetails;
        userData.contactPersons = parsedContactPersons;
        userData.status = "APPROVED"; // Centers are pre-approved
      }

      // Create user
      const user = await User.create(userData);

      // Generate token
      const token = generateToken(user._id);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Create notification for admin
      if (role === "VENDOR" || role === "CENTER") {
        try {
          const Notification = require("../models/Notification");
          const notificationType =
            role === "VENDOR" ? "VENDOR_APPLICATION" : "CENTER_APPLICATION";
          const title =
            role === "VENDOR"
              ? "New Vendor Application"
              : "New Center Application";
          const message =
            role === "VENDOR"
              ? `${businessName} (${name}) has submitted a vendor application for approval.`
              : `${businessName} (${name}) has submitted a center application for approval.`;

          await Notification.notifyAdmins({
            type: notificationType,
            title: title,
            message: message,
            relatedId: user._id,
            onModel: "User",
          });
        } catch (error) {
          console.error("Notification creation failed:", error);
        }
      }

      res.status(201).json({
        success: true,
        message: `${role.toLowerCase()} registered successfully`,
        data: {
          user: user.toJSON(),
          token,
          expiresIn: process.env.JWT_EXPIRE,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      // Check if it's a validation error
      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors
        });
      }
      
      res.status(500).json({
        success: false,
        message: "Registration failed",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", validateUserLogin, async (req, res) => {
  try {
    const { email, password, role } = req.body;
    // Find user by email

    const user = await User.findOne({ email, role: role.toUpperCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact administrator.",
      });
    }

    // Check if vendor or center account is approved
    if ((user.role === "VENDOR" || user.role === "CENTER") && user.status !== "APPROVED") {
      return res.status(401).json({
        success: false,
        message: `${user.role.toLowerCase()} account is not approved yet. Please wait for administrator approval.`,
      });
    }

    // Generate token
    const token = generateToken(user._id);
    console.log(token);
    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // No need to populate center information as we've removed the centerId dependency

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: user.toJSON(),
        token,
        expiresIn: process.env.JWT_EXPIRE,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Demo login endpoint removed

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // In a real application, you would:
    // 1. Generate a reset token
    // 2. Save it to the database with expiration
    // 3. Send email with reset link

    // For demo purposes, we'll just return success
    res.json({
      success: true,
      message: "Password reset instructions sent to your email",
      demo: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to process password reset request",
    });
  }
});

// @route   GET /api/auth/verify-token
// @desc    Verify JWT token
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle demo tokens
    if (decoded.demo) {
      return res.json({
        success: true,
        message: "Demo token is valid",
        demo: true,
        data: { userId: decoded.id },
      });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid token or user not found",
      });
    }

    // No need to populate center information as we've removed the centerId dependency

    res.json({
      success: true,
      message: "Token is valid",
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    res.status(500).json({
      success: false,
      message: "Token verification failed",
    });
  }
});

module.exports = router;
