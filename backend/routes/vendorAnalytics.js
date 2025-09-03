const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const { findTopCentersByRevenue } = require('../utils/minHeap');

const router = express.Router();

// @route   GET /api/orders/vendor/analytics/:vendorId
// @desc    Get top performing centers for a vendor using heap-based algorithm
// @access  Private (Vendor)
router.get('/vendor/analytics/:vendorId', authenticate, authorize('VENDOR'), async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID is required'
      });
    }

    // Ensure the authenticated user matches the vendorId param
    if (req.user._id.toString() !== vendorId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only access your own analytics'
      });
    }

    // Fetch all orders for the vendor with relevant statuses
    const orders = await Order.find({
      vendorId: vendorId,
      isActive: true,
      status: { $in: ['DELIVERED', 'SHIPPED', 'CONFIRMED'] }
    }).lean();

    // Fetch centers data (approved centers)
    const centers = await User.find({
      role: 'CENTER',
      status: 'APPROVED',
      isActive: true
    }).lean();

    // Use heap-based Top-K algorithm to find top centers by sales
    const topCenters = findTopCentersByRevenue(orders, centers, 10);

    res.json({
      success: true,
      message: 'Top performing centers retrieved successfully for vendor',
      data: {
        centers: topCenters,
        totalCenters: topCenters.length
      }
    });

  } catch (error) {
    console.error('Get vendor top centers analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor top centers analytics',
      error: error.message
    });
  }
});

module.exports = router;
