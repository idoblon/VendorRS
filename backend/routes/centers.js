const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validateDistributionCenter, validateObjectId, validatePagination } = require('../middleware/validation');
const DistributionCenter = require('../models/DistributionCenter');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/centers
// @desc    Get all distribution centers
// @access  Private
router.get('/', authenticate, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const region = req.query.region;
    const search = req.query.search;

    // Build query
    const query = { isActive: true };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (region && region !== 'all') {
      query.region = region;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const centers = await DistributionCenter.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await DistributionCenter.countDocuments(query);

    res.json({
      success: true,
      data: {
        centers,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get centers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch distribution centers'
    });
  }
});

// @route   GET /api/centers/:id
// @desc    Get distribution center by ID
// @access  Private
router.get('/:id', authenticate, validateObjectId('id'), async (req, res) => {
  try {
    const center = await DistributionCenter.findOne({
      _id: req.params.id,
      isActive: true
    }).populate('createdBy', 'name email');

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Distribution center not found'
      });
    }

    res.json({
      success: true,
      data: { center }
    });

  } catch (error) {
    console.error('Get center error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch distribution center'
    });
  }
});

// @route   POST /api/centers
// @desc    Create new distribution center (Admin only)
// @access  Private (Admin)
router.post('/', authenticate, authorize('ADMIN'), validateDistributionCenter, async (req, res) => {
  try {
    const {
      name,
      code,
      location,
      address,
      region,
      contactPerson,
      operationalDetails,
      services,
      establishedDate,
      coordinates,
      facilities
    } = req.body;

    // Check if center code already exists
    const existingCenter = await DistributionCenter.findOne({ code: code.toUpperCase() });
    if (existingCenter) {
      return res.status(400).json({
        success: false,
        message: 'Distribution center with this code already exists'
      });
    }

    // Create distribution center
    const center = await DistributionCenter.create({
      name,
      code: code.toUpperCase(),
      location,
      address,
      region,
      contactPerson,
      operationalDetails,
      services: services || [],
      establishedDate: establishedDate || new Date(),
      coordinates,
      facilities: facilities || [],
      createdBy: req.user._id
    });

    // Create center user account
    const centerUser = await User.create({
      name: contactPerson.name,
      email: contactPerson.email,
      password: process.env.CENTER_PASSWORD || 'ChangeThisSecurePassword', // Default password - should be changed on first login
      phone: contactPerson.phone,
      role: 'CENTER',
      status: 'APPROVED',
      centerId: center._id,
      isActive: true
    });

    await center.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Distribution center created successfully',
      data: { 
        center,
        centerUser: {
          id: centerUser._id,
          name: centerUser.name,
          email: centerUser.email
        }
      }
    });

  } catch (error) {
    console.error('Create center error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create distribution center'
    });
  }
});

// @route   PUT /api/centers/:id
// @desc    Update distribution center (Admin only)
// @access  Private (Admin)
router.put('/:id', authenticate, authorize('ADMIN'), validateObjectId('id'), async (req, res) => {
  try {
    const {
      name,
      location,
      address,
      region,
      contactPerson,
      operationalDetails,
      services,
      coordinates,
      facilities
    } = req.body;

    const center = await DistributionCenter.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Distribution center not found'
      });
    }

    // Update fields
    if (name) center.name = name;
    if (location) center.location = location;
    if (address) center.address = { ...center.address, ...address };
    if (region) center.region = region;
    if (contactPerson) center.contactPerson = { ...center.contactPerson, ...contactPerson };
    if (operationalDetails) center.operationalDetails = { ...center.operationalDetails, ...operationalDetails };
    if (services) center.services = services;
    if (coordinates) center.coordinates = coordinates;
    if (facilities) center.facilities = facilities;

    await center.save();
    await center.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Distribution center updated successfully',
      data: { center }
    });

  } catch (error) {
    console.error('Update center error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update distribution center'
    });
  }
});

// @route   PUT /api/centers/:id/status
// @desc    Update distribution center status (Admin only)
// @access  Private (Admin)
router.put('/:id/status', authenticate, authorize('ADMIN'), validateObjectId('id'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive', 'maintenance'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const center = await DistributionCenter.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Distribution center not found'
      });
    }

    center.status = status;
    await center.save();

    res.json({
      success: true,
      message: `Distribution center status updated to ${status}`,
      data: { center }
    });

  } catch (error) {
    console.error('Update center status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update center status'
    });
  }
});

// @route   PUT /api/centers/:id/capacity
// @desc    Update distribution center capacity (Admin only)
// @access  Private (Admin)
router.put('/:id/capacity', authenticate, authorize('ADMIN'), validateObjectId('id'), async (req, res) => {
  try {
    const { capacity, currentOrders } = req.body;

    if (capacity && (typeof capacity !== 'number' || capacity < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be a positive number'
      });
    }

    if (currentOrders && (typeof currentOrders !== 'number' || currentOrders < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Current orders must be a non-negative number'
      });
    }

    const center = await DistributionCenter.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Distribution center not found'
      });
    }

    if (capacity) center.operationalDetails.capacity = capacity;
    if (currentOrders !== undefined) center.operationalDetails.currentOrders = currentOrders;

    await center.save();

    res.json({
      success: true,
      message: 'Distribution center capacity updated successfully',
      data: { center }
    });

  } catch (error) {
    console.error('Update center capacity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update center capacity'
    });
  }
});

// @route   DELETE /api/centers/:id
// @desc    Delete distribution center (Admin only)
// @access  Private (Admin)
router.delete('/:id', authenticate, authorize('ADMIN'), validateObjectId('id'), async (req, res) => {
  try {
    const center = await DistributionCenter.findById(req.params.id);

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Distribution center not found'
      });
    }

    // Soft delete - mark as inactive instead of removing
    center.isActive = false;
    await center.save();

    // Also deactivate associated center user
    await User.updateOne(
      { centerId: center._id },
      { isActive: false }
    );

    res.json({
      success: true,
      message: 'Distribution center deleted successfully'
    });

  } catch (error) {
    console.error('Delete center error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete distribution center'
    });
  }
});

// @route   GET /api/centers/stats/overview
// @desc    Get distribution centers statistics (Admin only)
// @access  Private (Admin)
router.get('/stats/overview', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const stats = await Promise.all([
      DistributionCenter.countDocuments({ isActive: true }),
      DistributionCenter.countDocuments({ isActive: true, status: 'active' }),
      DistributionCenter.countDocuments({ isActive: true, status: 'inactive' }),
      DistributionCenter.countDocuments({ isActive: true, status: 'maintenance' }),
      DistributionCenter.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$region', count: { $sum: 1 } } }
      ]),
      DistributionCenter.aggregate([
        { $match: { isActive: true } },
        { $group: { 
          _id: null, 
          totalCapacity: { $sum: '$operationalDetails.capacity' },
          totalCurrentOrders: { $sum: '$operationalDetails.currentOrders' }
        }}
      ])
    ]);

    const [
      totalCenters,
      activeCenters,
      inactiveCenters,
      maintenanceCenters,
      regionStats,
      capacityStats
    ] = stats;

    const regionDistribution = regionStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const capacity = capacityStats[0] || { totalCapacity: 0, totalCurrentOrders: 0 };

    res.json({
      success: true,
      data: {
        total: totalCenters,
        byStatus: {
          active: activeCenters,
          inactive: inactiveCenters,
          maintenance: maintenanceCenters
        },
        byRegion: regionDistribution,
        capacity: {
          total: capacity.totalCapacity,
          utilized: capacity.totalCurrentOrders,
          utilizationPercentage: capacity.totalCapacity > 0 
            ? Math.round((capacity.totalCurrentOrders / capacity.totalCapacity) * 100)
            : 0
        }
      }
    });

  } catch (error) {
    console.error('Get center stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch center statistics'
    });
  }
});

// @route   GET /api/centers/regions
// @desc    Get available regions
// @access  Private
router.get('/regions', authenticate, async (req, res) => {
  try {
    const regions = [
      'North India',
      'South India', 
      'East India',
      'West India',
      'Central India',
      'Northeast India'
    ];

    res.json({
      success: true,
      data: { regions }
    });

  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch regions'
    });
  }
});

module.exports = router;