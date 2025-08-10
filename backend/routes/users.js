const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const {
  validateObjectId,
  validatePagination,
} = require("../middleware/validation");
const User = require("../models/User");
const { sendMail } = require("../service/send-mail");

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get("/profile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Populate center information if user is CENTER role
    if (user.role === "CENTER" && user.centerId) {
      await user.populate("centerId");
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update current user profile
// @access  Private
router.put("/profile", authenticate, async (req, res) => {
  try {
    const {
      name,
      phone,
      businessName,
      address,
      district,
      bankDetails,
      contactPersons,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update basic fields
    if (name) user.name = name;
    if (phone) user.phone = phone;

    // Update vendor-specific fields
    if (user.role === "VENDOR") {
      if (businessName) user.businessName = businessName;
      if (address) user.address = address;
      if (district) user.district = district;
      if (bankDetails)
        user.bankDetails = { ...user.bankDetails, ...bankDetails };
      if (contactPersons) user.contactPersons = contactPersons;
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
});

// @route   GET /api/users/vendors
// @desc    Get all vendors (Admin only)
// @access  Private (Admin)
router.get(
  "/vendors",
  authenticate,
  authorize("ADMIN"),
  validatePagination,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const status = req.query.status;
      const search = req.query.search;

      // Build query
      const query = { role: "VENDOR" };

      if (status && status !== "all") {
        query.status = status.toUpperCase();
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { businessName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      // Get vendors with pagination
      const vendors = await User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments(query);

      res.json({
        success: true,
        data: {
          vendors,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total,
            limit,
          },
        },
      });
    } catch (error) {
      console.error("Get vendors error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch vendors",
      });
    }
  }
);

// @route   GET /api/users/vendors/:id
// @desc    Get vendor by ID (Admin only)
// @access  Private (Admin)
router.get(
  "/vendors/:id",
  authenticate,
  authorize("ADMIN"),
  validateObjectId("id"),
  async (req, res) => {
    try {
      const vendor = await User.findOne({
        _id: req.params.id,
        role: "VENDOR",
      }).select("-password");

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: "Vendor not found",
        });
      }

      res.json({
        success: true,
        data: { vendor },
      });
    } catch (error) {
      console.error("Get vendor error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch vendor",
      });
    }
  }
);

// @route   PUT /api/users/vendors/:id/status
// @desc    Update vendor status (Admin only)
// @access  Private (Admin)
router.put(
  "/vendors/:id/status",
  authenticate,
  authorize("ADMIN"),
  validateObjectId("id"),
  async (req, res) => {
    try {
      const { status, notes } = req.body;

      console.log("Vendor status update request:", {
        vendorId: req.params.id,
        status,
        notes,
        body: req.body,
      });

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      if (!["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status value: ${status}. Must be one of: PENDING, APPROVED, REJECTED, SUSPENDED`,
        });
      }

      const vendor = await User.findOne({
        _id: req.params.id,
        role: "VENDOR",
      });

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: "Vendor not found",
        });
      }

      const oldStatus = vendor.status;
      vendor.status = status;

      // Add status change to history (you might want to create a separate model for this)
      // For now, we'll just save the status
      await vendor.save();

      // Create notification for the vendor about status change
      try {
        const Notification = require("../models/Notification");

        // Notification message based on status
        let title, message;

        switch (status) {
          case "APPROVED":
            title = "Application Approved";
            message = `Congratulations! Your vendor application has been approved. Your Vendor ID is: ${vendor._id}. You can now access all vendor features and start listing your products.`;
            await sendMail(vendor.email, message);
            break;
          case "REJECTED":
            title = "Application Rejected";
            message = `We regret to inform you that your vendor application has been rejected. ${
              notes ? "Reason: " + notes + ". " : ""
            }Please contact support for more information or to reapply.`;
            break;
          case "SUSPENDED":
            title = "Account Suspended";
            message = `Your vendor account has been suspended. ${
              notes ? "Reason: " + notes + ". " : ""
            }Please contact support for more information.`;
            break;
          default:
            title = "Application Status Updated";
            message = `Your application status has been updated to ${status}.`;
        }

        // Create notification for the vendor
        await Notification.create({
          recipient: vendor._id,
          sender: req.user._id,
          type: "STATUS_UPDATE",
          title,
          message,
          relatedId: vendor._id,
          onModel: "Users",
        });

        console.log(
          `Notification created for vendor ${vendor.businessName} about status change to ${status}`
        );

        // TODO: Email notification will be added later once nodemailer is properly configured
        console.log(
          `Email notification would be sent to ${vendor.email} about status change to ${status}`
        );
      } catch (notificationError) {
        console.error(
          "Failed to create vendor notification:",
          notificationError
        );
        // Continue with the process even if notification fails
      }

      console.log(
        `Vendor ${vendor.businessName} status changed from ${oldStatus} to ${status}`
      );

      res.json({
        success: true,
        message: `Vendor status updated to ${status}`,
        data: { vendor },
      });
    } catch (error) {
      console.error("Update vendor status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update vendor status",
      });
    }
  }
);

// @route   GET /api/users/centers
// @desc    Get all center users (Admin only)
// @access  Private (Admin)
router.get(
  "/centers",
  authenticate,
  authorize("ADMIN"),
  validatePagination,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const centerUsers = await User.find({ role: "CENTER" })
        .select("-password")
        .populate("centerId", "name location code status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments({ role: "CENTER" });

      res.json({
        success: true,
        data: {
          centerUsers,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total,
            limit,
          },
        },
      });
    } catch (error) {
      console.error("Get center users error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch center users",
      });
    }
  }
);

// @route   PUT /api/users/:id/activate
// @desc    Activate/Deactivate user (Admin only)
// @access  Private (Admin)
router.put(
  "/:id/activate",
  authenticate,
  authorize("ADMIN"),
  validateObjectId("id"),
  async (req, res) => {
    try {
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be a boolean value",
        });
      }

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Prevent admin from deactivating themselves
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Cannot deactivate your own account",
        });
      }

      user.isActive = isActive;
      await user.save();

      res.json({
        success: true,
        message: `User ${isActive ? "activated" : "deactivated"} successfully`,
        data: { user },
      });
    } catch (error) {
      console.error("Toggle user activation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update user activation status",
      });
    }
  }
);

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validateObjectId("id"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Prevent admin from deleting themselves
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete your own account",
        });
      }

      // In a real application, you might want to soft delete or archive the user
      // and handle related data (orders, messages, etc.)
      await User.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete user",
      });
    }
  }
);

// @route   GET /api/users/stats
// @desc    Get user statistics (Admin only)
// @access  Private (Admin)
router.get("/stats", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const stats = await Promise.all([
      User.countDocuments({ role: "VENDOR" }),
      User.countDocuments({ role: "VENDOR", status: "APPROVED" }),
      User.countDocuments({ role: "VENDOR", status: "PENDING" }),
      User.countDocuments({ role: "VENDOR", status: "REJECTED" }),
      User.countDocuments({ role: "CENTER" }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
    ]);

    const [
      totalVendors,
      approvedVendors,
      pendingVendors,
      rejectedVendors,
      totalCenters,
      activeUsers,
      inactiveUsers,
    ] = stats;

    res.json({
      success: true,
      data: {
        vendors: {
          total: totalVendors,
          approved: approvedVendors,
          pending: pendingVendors,
          rejected: rejectedVendors,
        },
        centers: {
          total: totalCenters,
        },
        users: {
          active: activeUsers,
          inactive: inactiveUsers,
          total: activeUsers + inactiveUsers,
        },
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics",
    });
  }
});

module.exports = router;
