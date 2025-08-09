const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DistributionCenter',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    specifications: {
      color: String,
      size: String,
      variant: String
    }
  }],
  orderSummary: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    tax: {
      rate: { type: Number, default: 18 }, // GST rate in percentage
      amount: { type: Number, required: true }
    },
    shipping: {
      method: String,
      cost: { type: Number, default: 0 }
    },
    discount: {
      type: { type: String, enum: ['percentage', 'fixed'] },
      value: Number,
      amount: { type: Number, default: 0 }
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'],
    default: 'PENDING'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  deliveryDetails: {
    expectedDate: Date,
    actualDate: Date,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    },
    instructions: String,
    trackingNumber: String
  },
  payment: {
    method: {
      type: String,
      enum: ['UPI', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash on Delivery'],
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'PENDING'
    },
    transactionId: String,
    paidAmount: { type: Number, default: 0 },
    paidDate: Date,
    dueDate: Date
  },
  communication: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: String,
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }
  }],
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  tags: [String],
  notes: String,
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    uploadDate: { type: Date, default: Date.now },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(6, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Add status to history when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      notes: `Status changed to ${this.status}`
    });
  }
  next();
});

// Calculate order summary before saving
orderSchema.pre('save', function(next) {
  // Calculate subtotal
  this.orderSummary.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Calculate tax amount
  this.orderSummary.tax.amount = (this.orderSummary.subtotal * this.orderSummary.tax.rate) / 100;
  
  // Calculate total amount
  this.orderSummary.totalAmount = 
    this.orderSummary.subtotal + 
    this.orderSummary.tax.amount + 
    this.orderSummary.shipping.cost - 
    this.orderSummary.discount.amount;
  
  next();
});

// Index for efficient queries
orderSchema.index({ centerId: 1, status: 1 });
orderSchema.index({ vendorId: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);