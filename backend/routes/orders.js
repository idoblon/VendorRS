const express = require('express');
const { authenticate, authorize, requireApproval } = require('../middleware/auth');
const { validateOrder, validateObjectId, validatePagination } = require('../middleware/validation');
const Order = require('../models/Order');
const Product = require('../models/Product');
const DistributionCenter = require('../models/DistributionCenter');
const { bubbleSort, sortByField } = require('../utils/sorting');

const router = express.Router();

// @route   GET /api/orders
// @desc    Get orders (filtered by user role)
// @access  Private
router.get('/', authenticate, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    // Build query based on user role
    let query = { isActive: true };
    
    if (req.user.role === 'VENDOR') {
      query.vendorId = req.user._id;
    } else if (req.user.role === 'CENTER') {
      query.centerId = req.user.centerId;
    }
    // Admin can see all orders

    if (status && status !== 'all') {
      query.status = status.toUpperCase();
    }

    const orders = await Order.find(query)
      .populate('centerId', 'name location code contactPerson')
      .populate('vendorId', 'name businessName email phone')
      .populate('items.productId', 'name category images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// @route   GET /api/orders/sorted
// @desc    Get orders sorted using bubble sort algorithm
// @access  Private
router.get('/sorted', authenticate, async (req, res) => {
  try {
    const { sortBy = 'createdAt', order = 'desc', limit = 50 } = req.query;
    
    // Build query based on user role
    let query = { isActive: true };
    
    if (req.user.role === 'VENDOR') {
      query.vendorId = req.user._id;
    } else if (req.user.role === 'CENTER') {
      query.centerId = req.user.centerId;
    }
    
    // Get orders without pagination (limited to prevent performance issues)
    const orders = await Order.find(query)
      .populate('centerId', 'name location code contactPerson')
      .populate('vendorId', 'name businessName email phone')
      .populate('items.productId', 'name category images')
      .limit(parseInt(limit));
    
    // Convert to plain objects for sorting
    const plainOrders = orders.map(order => order.toObject());
    
    // Apply bubble sort algorithm
    const ascending = order.toLowerCase() !== 'desc';
    const sortedOrders = sortByField(plainOrders, sortBy, ascending);
    
    res.json({
      success: true,
      message: 'Orders sorted using bubble sort algorithm',
      sortingInfo: {
        algorithm: 'Bubble Sort',
        field: sortBy,
        order: ascending ? 'ascending' : 'descending'
      },
      data: sortedOrders
    });
  } catch (error) {
    console.error('Sort orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sort orders',
      error: error.message
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', authenticate, validateObjectId('id'), async (req, res) => {
  try {
    let query = { _id: req.params.id, isActive: true };
    
    // Filter by user role
    if (req.user.role === 'VENDOR') {
      query.vendorId = req.user._id;
    } else if (req.user.role === 'CENTER') {
      query.centerId = req.user.centerId;
    }

    const order = await Order.findOne(query)
      .populate('centerId', 'name location code contactPerson address')
      .populate('vendorId', 'name businessName email phone address')
      .populate('items.productId', 'name category images specifications')
      .populate('statusHistory.updatedBy', 'name role')
      .populate('communication.from', 'name role')
      .populate('communication.to', 'name role');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or you do not have permission to view it'
      });
    }

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
});

// @route   POST /api/orders
// @desc    Create new order (Center only)
// @access  Private (Center)
router.post('/', authenticate, authorize('CENTER'), requireApproval, validateOrder, async (req, res) => {
  try {
    const {
      items,
      deliveryDetails,
      payment,
      priority,
      notes
    } = req.body;

    // Verify all products exist and are available
    const productIds = items.map(item => item.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
      status: 'available'
    }).populate('availability.centerId');

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more products are not available'
      });
    }

    // Verify stock availability at the center
    const center = await DistributionCenter.findById(req.user.centerId);
    if (!center) {
      return res.status(400).json({
        success: false,
        message: 'Distribution center not found'
      });
    }

    // Process order items and calculate totals
    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.productId);
      
      // Check stock at this center
      const availability = product.availability.find(
        a => a.centerId._id.toString() === center._id.toString()
      );

      if (!availability || availability.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      processedItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
        specifications: item.specifications || {}
      });
    }

    // Calculate tax and total
    const taxRate = 18; // GST rate
    const taxAmount = (subtotal * taxRate) / 100;
    const shippingCost = 500; // Fixed shipping cost
    const totalAmount = subtotal + taxAmount + shippingCost;

    // Create order
    const order = await Order.create({
      centerId: center._id,
      vendorId: products[0].vendorId, // Assuming all products are from same vendor
      items: processedItems,
      orderSummary: {
        subtotal,
        tax: { rate: taxRate, amount: taxAmount },
        shipping: { method: 'Standard', cost: shippingCost },
        discount: { amount: 0 },
        totalAmount
      },
      deliveryDetails: deliveryDetails || {},
      payment: {
        method: payment.method,
        status: 'PENDING'
      },
      priority: priority || 'MEDIUM',
      notes
    });

    // Update product stock (reserve stock)
    for (const item of processedItems) {
      await Product.updateOne(
        { 
          _id: item.productId,
          'availability.centerId': center._id
        },
        {
          $inc: { 'availability.$.reservedStock': item.quantity }
        }
      );
    }

    // Update center's current orders count
    await DistributionCenter.updateOne(
      { _id: center._id },
      { $inc: { 'operationalDetails.currentOrders': 1 } }
    );

    await order.populate('centerId', 'name location code');
    await order.populate('vendorId', 'name businessName email');
    await order.populate('items.productId', 'name category');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private
router.put('/:id/status', authenticate, validateObjectId('id'), async (req, res) => {
  try {
    const { status, notes } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    let query = { _id: req.params.id, isActive: true };
    
    // Filter by user role
    if (req.user.role === 'VENDOR') {
      query.vendorId = req.user._id;
    } else if (req.user.role === 'CENTER') {
      query.centerId = req.user.centerId;
    }

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or you do not have permission to update it'
      });
    }

    // Validate status transition
    const currentStatus = order.status;
    const validTransitions = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['IN_PROGRESS', 'CANCELLED'],
      'IN_PROGRESS': ['SHIPPED', 'CANCELLED'],
      'SHIPPED': ['DELIVERED', 'RETURNED'],
      'DELIVERED': ['RETURNED'],
      'CANCELLED': [],
      'RETURNED': []
    };

    if (!validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${currentStatus} to ${status}`
      });
    }

    // Update order status
    order.status = status;
    
    // Add to status history
    order.statusHistory.push({
      status,
      updatedBy: req.user._id,
      notes: notes || `Status changed to ${status}`
    });

    // Handle stock updates based on status
    if (status === 'CONFIRMED') {
      // Convert reserved stock to actual stock reduction
      for (const item of order.items) {
        await Product.updateOne(
          { 
            _id: item.productId,
            'availability.centerId': order.centerId
          },
          {
            $inc: { 
              'availability.$.stock': -item.quantity,
              'availability.$.reservedStock': -item.quantity
            }
          }
        );
      }
    } else if (status === 'CANCELLED') {
      // Release reserved stock
      for (const item of order.items) {
        await Product.updateOne(
          { 
            _id: item.productId,
            'availability.centerId': order.centerId
          },
          {
            $inc: { 'availability.$.reservedStock': -item.quantity }
          }
        );
      }
      
      // Decrease center's current orders count
      await DistributionCenter.updateOne(
        { _id: order.centerId },
        { $inc: { 'operationalDetails.currentOrders': -1 } }
      );
    } else if (status === 'DELIVERED') {
      // Update delivery date
      order.deliveryDetails.actualDate = new Date();
      
      // Decrease center's current orders count
      await DistributionCenter.updateOne(
        { _id: order.centerId },
        { $inc: { 'operationalDetails.currentOrders': -1 } }
      );
    }

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: { order }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

// @route   PUT /api/orders/:id/payment
// @desc    Update order payment status
// @access  Private
router.put('/:id/payment', authenticate, validateObjectId('id'), async (req, res) => {
  try {
    const { paymentStatus, transactionId, paidAmount } = req.body;

    const validPaymentStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'];
    
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status value'
      });
    }

    let query = { _id: req.params.id, isActive: true };
    
    // Filter by user role
    if (req.user.role === 'VENDOR') {
      query.vendorId = req.user._id;
    } else if (req.user.role === 'CENTER') {
      query.centerId = req.user.centerId;
    }

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or you do not have permission to update it'
      });
    }

    // Update payment details
    order.payment.status = paymentStatus;
    
    if (transactionId) order.payment.transactionId = transactionId;
    if (paidAmount) order.payment.paidAmount = paidAmount;
    
    if (paymentStatus === 'COMPLETED') {
      order.payment.paidDate = new Date();
      order.payment.paidAmount = order.payment.paidAmount || order.orderSummary.totalAmount;
    }

    await order.save();

    res.json({
      success: true,
      message: `Payment status updated to ${paymentStatus}`,
      data: { order }
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status'
    });
  }
});

// @route   POST /api/orders/:id/communication
// @desc    Add communication to order
// @access  Private
router.post('/:id/communication', authenticate, validateObjectId('id'), async (req, res) => {
  try {
    const { message, to } = req.body;

    if (!message || !to) {
      return res.status(400).json({
        success: false,
        message: 'Message and recipient are required'
      });
    }

    let query = { _id: req.params.id, isActive: true };
    
    // Filter by user role
    if (req.user.role === 'VENDOR') {
      query.vendorId = req.user._id;
    } else if (req.user.role === 'CENTER') {
      query.centerId = req.user.centerId;
    }

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or you do not have permission to access it'
      });
    }

    // Add communication
    order.communication.push({
      from: req.user._id,
      to,
      message,
      timestamp: new Date()
    });

    await order.save();
    await order.populate('communication.from', 'name role');
    await order.populate('communication.to', 'name role');

    res.json({
      success: true,
      message: 'Communication added successfully',
      data: { 
        communication: order.communication[order.communication.length - 1]
      }
    });

  } catch (error) {
    console.error('Add communication error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add communication'
    });
  }
});

// @route   GET /api/orders/stats/overview
// @desc    Get order statistics
// @access  Private
router.get('/stats/overview', authenticate, async (req, res) => {
  try {
    let matchQuery = { isActive: true };
    
    // Filter by user role
    if (req.user.role === 'VENDOR') {
      matchQuery.vendorId = req.user._id;
    } else if (req.user.role === 'CENTER') {
      matchQuery.centerId = req.user.centerId;
    }

    const stats = await Promise.all([
      Order.countDocuments(matchQuery),
      Order.countDocuments({ ...matchQuery, status: 'PENDING' }),
      Order.countDocuments({ ...matchQuery, status: 'CONFIRMED' }),
      Order.countDocuments({ ...matchQuery, status: 'DELIVERED' }),
      Order.countDocuments({ ...matchQuery, status: 'CANCELLED' }),
      Order.aggregate([
        { $match: matchQuery },
        { $group: { _id: null, totalRevenue: { $sum: '$orderSummary.totalAmount' } } }
      ])
    ]);

    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
      revenueStats
    ] = stats;

    const totalRevenue = revenueStats[0]?.totalRevenue || 0;

    res.json({
      success: true,
      data: {
        total: totalOrders,
        byStatus: {
          pending: pendingOrders,
          confirmed: confirmedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        },
        revenue: {
          total: totalRevenue,
          currency: 'INR'
        }
      }
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics'
    });
  }
});

module.exports = router;