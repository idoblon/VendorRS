const mongoose = require('mongoose');

const distributionCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  location: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'Nepal' }
  },
  region: {
    type: String,
    enum: ['Province 1', 'Madhesh Province', 'Bagmati Province', 'Gandaki Province', 'Lumbini Province', 'Karnali Province', 'Sudurpashchim Province'],
    required: true
  },
  contactPerson: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    designation: String
  },
  operationalDetails: {
    capacity: { type: Number, required: true, min: 1 },
    currentOrders: { type: Number, default: 0 },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' }
    },
    workingDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }]
  },
  services: [{
    type: String,
    enum: ['Storage', 'Packaging', 'Distribution', 'Quality Check', 'Returns Processing']
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  establishedDate: {
    type: Date,
    required: true
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  facilities: [{
    name: String,
    description: String,
    capacity: Number
  }],
  performanceMetrics: {
    averageProcessingTime: { type: Number, default: 0 }, // in hours
    successRate: { type: Number, default: 100 }, // percentage
    customerRating: { type: Number, default: 5, min: 1, max: 5 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Update updatedAt field before saving
distributionCenterSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate utilization percentage
distributionCenterSchema.virtual('utilizationPercentage').get(function() {
  return Math.round((this.operationalDetails.currentOrders / this.operationalDetails.capacity) * 100);
});

// Ensure virtual fields are serialized
distributionCenterSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('DistributionCenter', distributionCenterSchema);