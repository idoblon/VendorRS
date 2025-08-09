const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Furniture', 'Stationery', 'Wearables', 'Accessories', 'Books', 'Sports', 'Home & Garden', 'Automotive', 'Health & Beauty']
  },
  subcategory: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  availability: [{
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DistributionCenter',
      required: true
    },
    stock: {
      type: Number,
      required: true,
      min: 0
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  specifications: {
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: { type: String, default: 'cm' }
    },
    weight: {
      value: Number,
      unit: { type: String, default: 'kg' }
    },
    color: String,
    material: String,
    brand: String,
    model: String,
    warranty: {
      duration: Number,
      unit: { type: String, enum: ['days', 'months', 'years'] },
      terms: String
    }
  },
  images: [{
    filename: String,
    originalName: String,
    path: String,
    url: String,
    isPrimary: { type: Boolean, default: false },
    uploadDate: { type: Date, default: Date.now }
  }],
  tags: [String],
  status: {
    type: String,
    enum: ['available', 'out_of_stock', 'discontinued', 'pending_approval'],
    default: 'available'
  },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  salesData: {
    totalSold: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    lastSaleDate: Date
  },
  seo: {
    slug: String,
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
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

// Update updatedAt field before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate slug from name
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.seo.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

// Calculate total stock across all centers
productSchema.virtual('totalStock').get(function() {
  return this.availability.reduce((total, item) => total + item.stock, 0);
});

// Calculate available stock (total - reserved)
productSchema.virtual('availableStock').get(function() {
  return this.availability.reduce((total, item) => total + (item.stock - item.reservedStock), 0);
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });

// Index for search functionality
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ vendorId: 1, status: 1 });

module.exports = mongoose.model('Product', productSchema);