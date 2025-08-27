const express = require("express");
const mongoose = require("mongoose"); // ADD THIS LINE
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
      categories,
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

    // Update center-specific fields
    if (user.role === "CENTER") {
      if (businessName) user.businessName = businessName;
      if (address) user.address = address;
      if (district) user.district = district;
      if (categories) user.categories = categories;
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
      const limit = parseInt(req.query.limit) || 50; // Increase from 10 to 50
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
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const { status, notes } = req.body;

      console.log("Vendor status update request:", {
        vendorId: req.params.id,
        status,
        notes,
        body: req.body,
      });

      if (!status) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      if (!["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].includes(status)) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Invalid status value: ${status}. Must be one of: PENDING, APPROVED, REJECTED, SUSPENDED`,
        });
      }

      const vendor = await User.findOneAndUpdate(
        { _id: req.params.id, role: "VENDOR" },
        {
          status: status,
          updatedAt: new Date(),
        },
        {
          new: true,
          session: session,
          runValidators: true,
        }
      );

      if (!vendor) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: "Vendor not found",
        });
      }

      const oldStatus = vendor.status;

      // Create notification
      try {
        const Notification = require("../models/Notification");

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
            await sendMail(vendor.email, message);
            break;
          case "SUSPENDED":
            title = "Account Suspended";
            message = `Your vendor account has been suspended. ${
              notes ? "Reason: " + notes + ". " : ""
            }Please contact support for more information.`;
            await sendMail(vendor.email, message);
            break;
          default:
            title = "Application Status Updated";
            message = `Your application status has been updated to ${status}.`;
        }

        await Notification.create(
          [
            {
              recipient: vendor._id,
              sender: req.user._id,
              type: "STATUS_UPDATE",
              title,
              message,
              relatedId: vendor._id,
              onModel: "User",
            },
          ],
          { session }
        );

        console.log(
          `Notification created for vendor ${vendor.businessName} about status change to ${status}`
        );
      } catch (notificationError) {
        console.error(
          "Failed to create vendor notification:",
          notificationError
        );
      }

      // CRITICAL: Commit the transaction
      await session.commitTransaction();

      console.log(`Vendor ${vendor.businessName} status changed to ${status}`);

      res.json({
        success: true,
        message: `Vendor status updated to ${status}`,
        data: { vendor },
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("Update vendor status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update vendor status",
        error: error.message,
      });
    } finally {
      session.endSession();
    }
  }
);

// @route   PUT /api/users/centers/:id/status
// @desc    Update center application status (Admin only)
// @access  Private (Admin)
router.put(
  "/centers/:id/status",
  authenticate,
  authorize("ADMIN"),
  validateObjectId("id"),
  async (req, res) => {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const { status, notes } = req.body;

      console.log("Center status update request:", {
        centerId: req.params.id,
        status,
        notes,
        body: req.body,
      });

      if (!status) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      // FIXED: Remove the incorrect !! (double negation)
      if (!["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].includes(status)) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Invalid status value: ${status}. Must be one of: PENDING, APPROVED, REJECTED, SUSPENDED`,
        });
      }

      // Get old status for logging
      const existingCenter = await User.findById(req.params.id).session(
        session
      );
      const oldStatus = existingCenter ? existingCenter.status : "UNKNOWN";

      // Find and update with session
      const center = await User.findOneAndUpdate(
        { _id: req.params.id, role: "CENTER" },
        {
          status: status,
          updatedAt: new Date(),
        },
        {
          new: true,
          session: session,
          runValidators: true,
        }
      );

      if (!center) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: "Center not found",
        });
      }

      // Verify the update was successful
      const verifyUpdate = await User.findById(req.params.id).session(session);
      if (verifyUpdate.status !== status) {
        await session.abortTransaction();
        throw new Error("Status update verification failed");
      }

      // Create notification
      try {
        const Notification = require("../models/Notification");

        let title, message;

        switch (status) {
          case "APPROVED":
            title = "Application Approved";
            message = `Congratulations! Your center application has been approved. Your Center ID is: ${center._id}. You can now access all center features.`;
            await sendMail(center.email, message);
            break;
          case "REJECTED":
            title = "Application Rejected";
            message = `We regret to inform you that your center application has been rejected. ${
              notes ? "Reason: " + notes + ". " : ""
            }Please contact support for more information or to reapply.`;
            await sendMail(center.email, message);
            break;
          case "SUSPENDED":
            title = "Account Suspended";
            message = `Your center account has been suspended. ${
              notes ? "Reason: " + notes + ". " : ""
            }Please contact support for more information.`;
            await sendMail(center.email, message);
            break;
          default:
            title = "Application Status Updated";
            message = `Your application status has been updated to ${status}.`;
        }

        await Notification.create(
          [
            {
              recipient: center._id,
              sender: req.user._id,
              type: "STATUS_UPDATE",
              title,
              message,
              relatedId: center._id,
              onModel: "User",
            },
          ],
          { session }
        );

        console.log(
          `Notification created for center ${center.name} about status change to ${status}`
        );
      } catch (notificationError) {
        console.error(
          "Failed to create center notification:",
          notificationError
        );
        // Continue with the process even if notification fails
      }

      // CRITICAL FIX: Commit the transaction
      await session.commitTransaction();

      console.log(
        `Center ${center.name} status changed from ${oldStatus} to ${status}`
      );

      res.json({
        success: true,
        message: `Center status updated to ${status}`,
        data: { center },
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("Update center status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update center status",
        error: error.message,
      });
    } finally {
      session.endSession();
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
      const status = req.query.status;
      const search = req.query.search;

      // Build query
      const query = { role: "CENTER" };

      if (status && status !== "all") {
        query.status = status.toUpperCase();
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      console.log("Fetching CENTER users with query:", query);

      const centerUsers = await User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments(query);

      console.log(`Found ${centerUsers.length} CENTER users`);

      res.json({
        success: true,
        data: {
          centers: centerUsers, // Change from 'centerUsers' to 'centers'
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

// @route   GET /api/users/centers/category/:category
// @desc    Get centers by category (for vendors to find matching centers)
// @access  Private (Vendor)
router.get(
  "/centers/category/:category",
  authenticate,
  authorize("VENDOR"),
  async (req, res) => {
    try {
      const category = req.params.category;

      // Find active centers that have the specified category
      const centers = await User.find({
        role: "CENTER",
        status: "APPROVED",
        isActive: true,
        categories: { $in: [category] },
      }).select("-password");

      res.json({
        success: true,
        data: { centers },
      });
    } catch (error) {
      console.error("Get centers by category error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch centers by category",
      });
    }
  }
);

// @route   GET /api/users/centers/categories
// @desc    Get all categories from centers
// @access  Private
router.get("/centers/categories", authenticate, async (req, res) => {
  try {
    // Get all unique categories from active centers
    const categories = await User.distinct("categories", {
      role: "CENTER",
      status: "APPROVED",
      isActive: true,
    });

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error("Get center categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch center categories",
    });
  }
});

module.exports = router;
