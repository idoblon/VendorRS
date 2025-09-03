const express = require('express');
const { authenticate, authorize, requireApproval } = require('../middleware/auth');
const { validateOrder, validateObjectId, validatePagination } = require('../middleware/validation');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Notification = require('../models/Notification');
// Sorting is now implemented directly in the route handlers

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
// @desc    Get orders sorted using efficient built-in algorithm
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
    
    // Apply direct JavaScript sorting
    const ascending = order.toLowerCase() !== 'desc';
    const sortedOrders = [...plainOrders].sort((a, b) => {
      // Get values based on sortBy field (supports nested fields with dot notation)
      const getNestedValue = (obj, path) => {
        return path.split('.').reduce((o, key) => (o && o[key] !== undefined) ? o[key] : null, obj);
      };
      
      const valueA = getNestedValue(a, sortBy);
      const valueB = getNestedValue(b, sortBy);
      
      // Handle different data types
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return ascending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      } else {
        return ascending ? valueA - valueB : valueB - valueA;
      }
    });
    
    res.json({
      success: true,
      message: 'Orders sorted using JavaScript built-in sort',
      sortingInfo: {
        algorithm: 'Built-in Sort',
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
    const center = await User.findById(req.user.centerId); // Center is a user with CENTER role
    if (!center) {
      return res.status(400).json({
        success: false,
        message: 'Center not found'
      });
    }

    // Get vendor information to calculate discount based on district
    const vendor = await User.findById(products[0].vendorId); // Get vendor to access district info
    if (!vendor) {
      return res.status(400).json({
        success: false,
        message: 'Vendor not found'
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

    // Calculate discount based on vendor's district (up to 15%)
    let discountAmount = 0;
    let discountPercentage = 0;
    
    if (vendor.district && center.district) {
      // Simple logic: if vendor and center are in the same district, give 15% discount
      // If in different districts, give 5% discount (or no discount if not specified)
      if (vendor.district === center.district) {
        discountPercentage = 15; // 15% discount for same district
      } else if (vendor.district !== center.district) {
        discountPercentage = 5; // 5% discount for different districts
      }
      discountAmount = (subtotal * discountPercentage) / 100;
    }

    // Calculate tax and total
    const taxRate = 18;
    const taxAmount = (subtotal * taxRate) / 100;
    const shippingCost = 500; // Fixed shipping cost
    const totalAmountBeforeCommission = subtotal + taxAmount + shippingCost - discountAmount;
    
    // Calculate admin commission (up to 10%)
    let adminCommissionAmount = 0;
    let adminCommissionPercentage = 0;
    
    // For simplicity, we'll calculate a fixed 5% commission from the total amount (before discount)
    // In a real system, this would be configurable per admin or based on business rules
    adminCommissionPercentage = 5; // 5% commission (up to 10% max)
    adminCommissionAmount = (totalAmountBeforeCommission * adminCommissionPercentage) / 100;
    
    // Final total amount after commission deduction (for vendor)
    const finalTotalAmount = totalAmountBeforeCommission - adminCommissionAmount;

    // Create order
    const order = await Order.create({
      centerId: center._id,
      vendorId: products[0].vendorId, // Assuming all products are from same vendor
      items: processedItems,
      orderSummary: {
        subtotal,
        tax: { rate: taxRate, amount: taxAmount },
        shipping: { method: 'Standard', cost: shippingCost },
        discount: { amount: discountAmount, value: discountPercentage },
        totalAmount: finalTotalAmount // Final amount after commission deduction
      },
      deliveryDetails: deliveryDetails || {},
      payment: {
        method: payment.method,
        status: 'PENDING'
      },
      priority: priority || 'MEDIUM',
      notes,
      // Add commission information to order
      adminCommission: {
        amount: adminCommissionAmount,
        percentage: adminCommissionPercentage
      }
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
    await User.updateOne( // Changed to use User model for center
      { _id: center._id },
      { $inc: { 'operationalDetails.currentOrders': 1 } }
    );

    await order.populate('centerId', 'name location code');
    await order.populate('vendorId', 'name businessName email district');
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
      await User.updateOne(
        { _id: order.centerId },
        { $inc: { 'operationalDetails.currentOrders': -1 } }
      );
      
      // Record admin commission when order is delivered
      // This would typically be handled by a separate commission service in a real system
      console.log(`Admin commission of ${order.adminCommission?.amount || 0} recorded for order ${order._id}`);
    } else if (status === 'DELIVERED') {
      // Update delivery date
      order.deliveryDetails.actualDate = new Date();

      // Decrease center's current orders count
      await User.updateOne(
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
      
      // Record admin commission when payment is completed
      // This would typically be handled by a separate commission service in a real system
      console.log(`Admin commission of ${order.adminCommission?.amount || 0} recorded for order ${order._id}`);
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
      ]),
      // Get total commission (for admins)
      Order.aggregate([
        { $match: matchQuery },
        { $group: { _id: null, totalCommission: { $sum: '$adminCommission.amount' } } }
      ])
    ]);

    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
      revenueStats,
      commissionStats
    ] = stats;

    const totalRevenue = revenueStats[0]?.totalRevenue || 0;
    const totalCommission = commissionStats[0]?.totalCommission || 0;

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
        },
        commission: {
          total: totalCommission,
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


// vendor product order
router.post('/vendor/:vendorId/order', authenticate, async (req, res) => {
  try {
    const { centerId, items, paymentMethod, shippingMethod, discount, vendorId, stripePaymentIntentId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must include at least one item'
      });
    }

    // Validate each item and fetch product details
    let validItems = [];
    for (const item of items) {
      const { productId, quantity } = item;
      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Each item must include a valid productId and quantity > 0'
        });
      }
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${productId}`
        });
      }
      validItems.push({
        productId: product._id,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        totalPrice: product.price * quantity,
        specifications: item.specifications || {}
      });
    }

    // Get vendor and center information to calculate discount and commission
    const vendor = await User.findById(vendorId); // Get vendor to access district info
    const center = await User.findById(centerId); // Get center to access district info
    
    if (!vendor) {
      return res.status(400).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    if (!center) {
      return res.status(400).json({
        success: false,
        message: 'Center not found'
      });
    }

    // Calculate subtotal
    const subtotal = validItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Set default tax rate and calculate tax amount
    const taxRate = 18; // or get from config
    const taxAmount = (subtotal * taxRate) / 100;

    // Set shipping cost from shippingMethod or 0
    const shippingCost = shippingMethod?.cost || 0;

    // Calculate discount based on vendor's district (up to 15%)
    let discountAmount = 0;
    let discountPercentage = 0;
    
    if (vendor.district && center.district) {
      // Simple logic: if vendor and center are in the same district, give 15% discount
      // If in different districts, give 5% discount (or no discount if not specified)
      if (vendor.district === center.district) {
        discountPercentage = 15; // 15% discount for same district
      } else if (vendor.district !== center.district) {
        discountPercentage = 5; // 5% discount for different districts
      }
      discountAmount = (subtotal * discountPercentage) / 100;
    }

    // Calculate total amount before commission
    const totalAmountBeforeCommission = subtotal + taxAmount + shippingCost - discountAmount;
    
    // Calculate admin commission (up to 10%)
    let adminCommissionAmount = 0;
    let adminCommissionPercentage = 0;
    
    // For simplicity, we'll calculate a fixed 5% commission from the total amount (before discount)
    // In a real system, this would be configurable per admin or based on business rules
    adminCommissionPercentage = 5; // 5% commission (up to 10% max)
    adminCommissionAmount = (totalAmountBeforeCommission * adminCommissionPercentage) / 100;
    
    // Final total amount after commission deduction (for vendor)
    const finalTotalAmount = totalAmountBeforeCommission - adminCommissionAmount;

    // Create the order object
    const order = new Order({
      centerId,
      vendorId,
      items: validItems,
      orderSummary: {
        subtotal,
        tax: { rate: taxRate, amount: taxAmount },
        shipping: {
          method: shippingMethod?.method || '',
          cost: shippingCost
        },
        discount: {
          type: discount?.type || undefined,
          value: discount?.value || 0,
          amount: discountAmount
        },
        totalAmount: finalTotalAmount // Final amount after commission deduction
      },
      payment: {
        method: paymentMethod,
        status: 'COMPLETED',
        paidAmount: finalTotalAmount,
        stripePaymentIntentId: paymentMethod === 'Stripe' ? stripePaymentIntentId : undefined
      },
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      // Add commission information to order
      adminCommission: {
        amount: adminCommissionAmount,
        percentage: adminCommissionPercentage
      }
    });

    await order.save();

    // Create notification for the center about the new order
    try {
      const notification = await Notification.create({
        recipient: centerId,
        sender: vendorId,
        type: 'ORDER_UPDATE',
        title: 'New Order Received',
        message: `You have received a new order from ${vendor.businessName || vendor.name}. Order ID: ${order._id}. Total amount: ₹${finalTotalAmount.toFixed(2)}`,
        relatedId: order._id,
        onModel: 'Order'
      });

      console.log(`Notification created for center ${center.name} about order ${order._id}`);

      // Emit socket event to notify center in real-time
      const io = req.app.get('io'); // Get socket.io instance from app
      if (io) {
        io.to(`user_${centerId}`).emit('order_notification', {
          orderId: order._id,
          status: order.status,
          message: `New order received from ${vendor.businessName || vendor.name}`,
          from: vendor.name,
          amount: finalTotalAmount,
          itemsCount: validItems.length
        });

        console.log(`Real-time notification sent to center ${center.name} via socket`);
      }
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Don't fail the order creation if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place order',
      error: error.message
    });
  }
});


// get vendor orders
router.get('/vendor/:vendorId/orders', authenticate, async (req, res) => {
  const { vendorId } = req.params;

  try {
    const orders = await Order.find({ vendorId });
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor orders',
      error: error.message
    });
  }
});

// @route   GET /api/orders/centers/sales-ranking/:vendorId
// @desc    Get centers ranked by total sales for a vendor using heap-based Top-K algorithm
// @access  Private (Vendor)
const { MinHeap, findTopCentersByRevenue } = require('../utils/minHeap');
const mongoose = require('mongoose');

router.get('/centers/sales-ranking/:vendorId', authenticate, async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID is required'
      });
    }

    // Fetch all orders for the vendor with relevant statuses
    const orders = await Order.find({
      vendorId: vendorId,
      isActive: true,
      status: { $in: ['DELIVERED', 'SHIPPED', 'CONFIRMED'] }
    }).lean();

    // Fetch centers data (approved centers)
    const centers = await mongoose.model('User').find({
      role: 'CENTER',
      status: 'APPROVED',
      isActive: true
    }).lean();

    // Use heap-based Top-K algorithm to find top centers by sales
    const topCenters = findTopCentersByRevenue(orders, centers, 10);

    res.json({
      success: true,
      message: 'Centers ranked by total sales retrieved successfully using heap-based Top-K',
      data: {
        centers: topCenters,
        totalCenters: topCenters.length
      }
    });

  } catch (error) {
    console.error('Get centers sales ranking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch centers sales ranking',
      error: error.message
    });
  }
});

// @route   GET /api/orders/admin/analytics
// @desc    Get comprehensive analytics for admin dashboard using heap-based algorithm
// @access  Private (Admin)
router.get('/admin/analytics', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    // Fetch all approved centers
    const centers = await User.find({
      role: 'CENTER',
      status: 'APPROVED',
      isActive: true
    }).lean();

    // Fetch all orders with relevant statuses for performance calculation
    const orders = await Order.find({
      isActive: true,
      status: { $in: ['DELIVERED', 'SHIPPED', 'CONFIRMED'] }
    })
    .populate('centerId', 'name businessName address district province')
    .populate('vendorId', 'name businessName')
    .lean();

    // Calculate comprehensive analytics for each center
    const centersAnalytics = centers.map(center => {
      // Filter orders for this center
      const centerOrders = orders.filter(order =>
        order.centerId && order.centerId._id.toString() === center._id.toString()
      );

      // Calculate performance metrics
      const totalOrders = centerOrders.length;
      const totalRevenue = centerOrders.reduce((sum, order) => sum + (order.orderSummary?.totalAmount || 0), 0);
      const totalCommission = centerOrders.reduce((sum, order) => sum + (order.adminCommission?.amount || 0), 0);
      const totalProductsOrdered = centerOrders.reduce((sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0), 0
      );

      // Calculate performance score based on multiple factors
      const orderFrequency = totalOrders / Math.max(1, (Date.now() - new Date(center.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)); // orders per month
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const performanceScore = Math.min(100, (orderFrequency * 10) + (averageOrderValue / 1000) + (totalRevenue / 50000));

      // Get last activity date
      const lastOrder = centerOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      const lastActivity = lastOrder ? lastOrder.createdAt : center.createdAt;

      return {
        ...center,
        performanceScore: Math.round(performanceScore),
        totalOrders,
        totalRevenue,
        totalCommission,
        totalProductsOrdered,
        averageOrderValue: Math.round(averageOrderValue),
        lastActivity,
        orderFrequency: Math.round(orderFrequency * 100) / 100
      };
    });

    // Use heap-based algorithm to get top performing centers
    const topCenters = findTopCentersByRevenue(orders, centers, 20);

    // Calculate overall system statistics
    const totalSystemOrders = orders.length;
    const totalSystemRevenue = orders.reduce((sum, order) => sum + (order.orderSummary?.totalAmount || 0), 0);
    const totalSystemCommission = orders.reduce((sum, order) => sum + (order.adminCommission?.amount || 0), 0);

    // Get recent orders for activity feed
    const recentOrders = await Order.find({
      isActive: true
    })
    .populate('centerId', 'name businessName')
    .populate('vendorId', 'name businessName')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    res.json({
      success: true,
      message: 'Admin analytics retrieved successfully using heap-based algorithm',
      data: {
        centersAnalytics: centersAnalytics.sort((a, b) => b.performanceScore - a.performanceScore),
        topCenters,
        systemStats: {
          totalOrders: totalSystemOrders,
          totalRevenue: totalSystemRevenue,
          totalCommission: totalSystemCommission,
          totalCenters: centers.length,
          averageOrderValue: totalSystemOrders > 0 ? Math.round(totalSystemRevenue / totalSystemOrders) : 0
        },
        recentActivity: recentOrders.map(order => ({
          id: order._id,
          type: 'order',
          description: `Order from ${order.centerId?.name || 'Unknown Center'} to ${order.vendorId?.businessName || 'Unknown Vendor'}`,
          amount: order.orderSummary?.totalAmount || 0,
          timestamp: order.createdAt,
          status: order.status
        }))
      }
    });

  } catch (error) {
    console.error('Get admin analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin analytics',
      error: error.message
    });
  }
});

// @route   GET /api/orders/centers/performance
// @desc    Get centers performance data for vendors (similar to admin analytics but accessible to vendors)
// @access  Private (Vendor)
router.get('/centers/performance', authenticate, async (req, res) => {
  try {
    // Fetch all approved centers
    const centers = await User.find({
      role: 'CENTER',
      status: 'APPROVED',
      isActive: true
    }).lean();

    // Fetch all orders with relevant statuses for performance calculation
    const orders = await Order.find({
      isActive: true,
      status: { $in: ['DELIVERED', 'SHIPPED', 'CONFIRMED'] }
    })
    .populate('centerId', 'name businessName address district province')
    .populate('vendorId', 'name businessName')
    .lean();

    // Calculate comprehensive analytics for each center
    const centersAnalytics = centers.map(center => {
      // Filter orders for this center
      const centerOrders = orders.filter(order =>
        order.centerId && order.centerId._id.toString() === center._id.toString()
      );

      // Calculate performance metrics
      const totalOrders = centerOrders.length;
      const totalRevenue = centerOrders.reduce((sum, order) => sum + (order.orderSummary?.totalAmount || 0), 0);
      const totalCommission = centerOrders.reduce((sum, order) => sum + (order.adminCommission?.amount || 0), 0);
      const totalProductsOrdered = centerOrders.reduce((sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0), 0
      );

      // Calculate performance score based on multiple factors
      const orderFrequency = totalOrders / Math.max(1, (Date.now() - new Date(center.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)); // orders per month
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const performanceScore = Math.min(100, (orderFrequency * 10) + (averageOrderValue / 1000) + (totalRevenue / 50000));

      // Get last activity date
      const lastOrder = centerOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      const lastActivity = lastOrder ? lastOrder.createdAt : center.createdAt;

      return {
        _id: center._id,
        name: center.name,
        businessName: center.businessName,
        location: center.address?.city || center.district || 'Unknown',
        district: center.district,
        province: center.province,
        status: center.status,
        performanceScore: Math.round(performanceScore),
        totalOrders,
        totalRevenue,
        totalCommission,
        totalProductsOrdered,
        averageOrderValue: Math.round(averageOrderValue),
        lastActivity,
        orderFrequency: Math.round(orderFrequency * 100) / 100
      };
    });

    // Use heap-based algorithm to get top performing centers by revenue
    const topCentersByRevenue = findTopCentersByRevenue(orders, centers, 10);

    res.json({
      success: true,
      message: 'Centers performance data retrieved successfully',
      data: {
        centers: topCentersByRevenue,
        totalCenters: topCentersByRevenue.length
      }
    });

  } catch (error) {
    console.error('Get centers performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch centers performance data',
      error: error.message
    });
  }
});

router.get("/analytics/:vendorId", async (req, res) => {
  const { vendorId } = req.params;

  // get order fomr order table
  const orders = await Order.find({ vendorId });
  // Fetch orders for the specific vendor

  const totalOrdersPlaced = orders.length;

  const totalAmountSpent = orders.reduce((sum, order) => sum + order.orderSummary.totalAmount, 0);

  // Calculate total discounts received
  const totalDiscounts = orders.reduce((sum, order) => sum + (order.orderSummary.discount?.amount || 0), 0);

  // Calculate total commission paid to admins
  const totalCommissionPaid = orders.reduce((sum, order) => sum + (order.adminCommission?.amount || 0), 0);

  const totalProductOrders = orders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );
  const format = [
    { name: 'Total Orders Placed', value: totalOrdersPlaced },
    { name: 'Total Amount Spent', value: totalAmountSpent },
    { name: 'Total Discounts Received', value: totalDiscounts },
    { name: 'Total Commission Paid', value: totalCommissionPaid },
    { name: 'Total Products Ordered', value: totalProductOrders }
  ];

  res.json({
    success: true,
    data: format
  });
});

module.exports = router;