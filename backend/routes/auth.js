const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  validateUserRegistration,
  validateUserLogin,
} = require("../middleware/validation");
const User = require("../models/User");

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user (vendor or center)
// @access  Public
router.post("/register", validateUserRegistration, async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      businessName,
      panNumber,
      gstNumber,
      address,
      district,
      bankDetails,
      contactPersons,
      centerId,
    } = req.body;

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
      userData.gstNumber = gstNumber;
      userData.address = address;
      userData.district = district;
      userData.bankDetails = bankDetails;
      userData.contactPersons = contactPersons || [];
    } else if (role === "CENTER") {
      userData.centerId = centerId;
      userData.status = "APPROVED"; // Centers are pre-approved
    }

    // Create user
    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create notification for admin if a new vendor registers
    if (role === "VENDOR") {
      try {
        const Notification = require('../models/Notification');
        await Notification.notifyAdmins({
          type: 'VENDOR_APPLICATION',
          title: 'New Vendor Application',
          message: `${businessName} (${name}) has submitted a vendor application for approval.`,
          relatedId: user._id,
          onModel: 'Users'
        });
        console.log('Admin notification created for new vendor application');
      } catch (notificationError) {
        console.error('Failed to create admin notification:', notificationError);
        // Continue with the registration process even if notification fails
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
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user && (await user.comparePassword(password))) {
      console.log("password matched");
    }
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    console.log(isPasswordValid);
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

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Populate center information if user is CENTER role
    if (user.role === "CENTER" && user.centerId) {
      await user.populate("centerId", "name location code");
    }

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
    console.error("Login error:", error);
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
    console.error("Forgot password error:", error);
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

    // Populate center information if user is CENTER role
    if (user.role === "CENTER" && user.centerId) {
      await user.populate("centerId", "name location code");
    }

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

    console.error("Token verification error:", error);
    res.status(500).json({
      success: false,
      message: "Token verification failed",
    });
  }
});

module.exports = router;
