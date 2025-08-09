const express = require('express');
const { authenticate, authorize, requireApproval } = require('../middleware/auth');
const { validateProduct, validateObjectId, validatePagination } = require('../middleware/validation');
const Product = require('../models/Product');
const DistributionCenter = require('../models/DistributionCenter');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Private
router.get('/', authenticate, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const category = req.query.category;
    const centerId = req.query.centerId;
    const search = req.query.search;
    const vendorId = req.query.vendorId;
    const status = req.query.status || 'available';

    // Build query
    const query = { isActive: true };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (vendorId) {
      query.vendorId = vendorId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // If centerId is specified, filter products available at that center
    if (centerId) {
      query['availability.centerId'] = centerId;
      query['availability.stock'] = { $gt: 0 };
    }

    const products = await Product.find(query)
      .populate('vendorId', 'name businessName email phone')
      .populate('availability.centerId', 'name location code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Private
router.get('/:id', authenticate, validateObjectId('id'), async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true
    })
    .populate('vendorId', 'name businessName email phone')
    .populate('availability.centerId', 'name location code status');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

// @route   POST /api/products
// @desc    Create new product (Vendor only)
// @access  Private (Vendor)
router.post('/', authenticate, authorize('VENDOR'), requireApproval, validateProduct, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subcategory,
      price,
      availability,
      specifications,
      images,
      tags
    } = req.body;

    // Verify that all specified centers exist
    const centerIds = availability.map(item => item.centerId);
    const existingCenters = await DistributionCenter.find({
      _id: { $in: centerIds },
      isActive: true,
      status: 'active'
    });

    if (existingCenters.length !== centerIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more distribution centers are invalid or inactive'
      });
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      category,
      subcategory,
      price,
      vendorId: req.user._id,
      availability,
      specifications: specifications || {},
      images: images || [],
      tags: tags || [],
      status: 'available'
    });

    await product.populate('vendorId', 'name businessName');
    await product.populate('availability.centerId', 'name location code');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product (Vendor only - own products)
// @access  Private (Vendor)
router.put('/:id', authenticate, authorize('VENDOR'), requireApproval, validateObjectId('id'), async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subcategory,
      price,
      availability,
      specifications,
      images,
      tags,
      status
    } = req.body;

    const product = await Product.findOne({
      _id: req.params.id,
      vendorId: req.user._id,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have permission to edit it'
      });
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (subcategory) product.subcategory = subcategory;
    if (price) product.price = price;
    if (availability) {
      // Verify centers exist
      const centerIds = availability.map(item => item.centerId);
      const existingCenters = await DistributionCenter.find({
        _id: { $in: centerIds },
        isActive: true
      });

      if (existingCenters.length === centerIds.length) {
        product.availability = availability;
      }
    }
    if (specifications) product.specifications = { ...product.specifications, ...specifications };
    if (images) product.images = images;
    if (tags) product.tags = tags;
    if (status && ['available', 'out_of_stock', 'discontinued'].includes(status)) {
      product.status = status;
    }

    await product.save();
    await product.populate('availability.centerId', 'name location code');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// @route   PUT /api/products/:id/stock
// @desc    Update product stock (Vendor only)
// @access  Private (Vendor)
router.put('/:id/stock', authenticate, authorize('VENDOR'), requireApproval, validateObjectId('id'), async (req, res) => {
  try {
    const { centerId, stock } = req.body;

    if (!centerId || typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid centerId and non-negative stock value are required'
      });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      vendorId: req.user._id,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have permission to edit it'
      });
    }

    // Find and update the availability for the specific center
    const availabilityIndex = product.availability.findIndex(
      item => item.centerId.toString() === centerId
    );

    if (availabilityIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product is not available at the specified center'
      });
    }

    product.availability[availabilityIndex].stock = stock;
    product.availability[availabilityIndex].lastUpdated = new Date();

    // Update product status based on total stock
    const totalStock = product.availability.reduce((sum, item) => sum + item.stock, 0);
    product.status = totalStock > 0 ? 'available' : 'out_of_stock';

    await product.save();

    res.json({
      success: true,
      message: 'Product stock updated successfully',
      data: { 
        product: {
          _id: product._id,
          name: product.name,
          availability: product.availability,
          status: product.status
        }
      }
    });

  } catch (error) {
    console.error('Update product stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product stock'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (Vendor only - own products)
// @access  Private (Vendor)
router.delete('/:id', authenticate, authorize('VENDOR'), requireApproval, validateObjectId('id'), async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      vendorId: req.user._id,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have permission to delete it'
      });
    }

    // Soft delete - mark as inactive
    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Private
router.get('/categories', authenticate, async (req, res) => {
  try {
    const categories = [
      'Electronics',
      'Furniture', 
      'Stationery',
      'Wearables',
      'Accessories',
      'Books',
      'Sports',
      'Home & Garden',
      'Automotive',
      'Health & Beauty'
    ];

    res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// @route   GET /api/products/search/suggestions
// @desc    Get search suggestions
// @access  Private
router.get('/search/suggestions', authenticate, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    const suggestions = await Product.find({
      isActive: true,
      status: 'available',
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    })
    .select('name category')
    .limit(10);

    const uniqueSuggestions = [...new Set(suggestions.map(p => p.name))];

    res.json({
      success: true,
      data: { suggestions: uniqueSuggestions }
    });

  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch search suggestions'
    });
  }
});

// @route   GET /api/products/vendor/:vendorId
// @desc    Get products by vendor
// @access  Private
router.get('/vendor/:vendorId', authenticate, validateObjectId('vendorId'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const products = await Product.find({
      vendorId: req.params.vendorId,
      isActive: true
    })
    .populate('availability.centerId', 'name location code')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Product.countDocuments({
      vendorId: req.params.vendorId,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor products'
    });
  }
});

module.exports = router;