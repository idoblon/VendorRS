const express = require("express");
const {
  authenticate,
  authorize,
  requireApproval,
} = require("../middleware/auth");
const {
  validateProduct,
  validateObjectId,
  validatePagination,
} = require("../middleware/validation");
const Product = require("../models/Product");
const User = require("../models/User");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Path to the nepaladdress.json file for province and district data
const nepalAddressPath = path.join(
  __dirname,
  "../../src/data/nepaladdress.json"
);
const nepalAddressData = JSON.parse(fs.readFileSync(nepalAddressPath, "utf8"));

const router = express.Router();

// Helper function to sort products by availability in specified province/district
function sortProductsByAvailability(products, province, district) {
  return products.sort((a, b) => {
    // Find availability entries that match the province/district criteria
    const aAvailability = a.availability.find((item) => {
      if (district) {
        return item.province === province && item.district === district;
      }
      return item.province === province;
    });

    const bAvailability = b.availability.find((item) => {
      if (district) {
        return item.province === province && item.district === district;
      }
      return item.province === province;
    });

    // If both have matching availability, sort by stock (higher stock first)
    if (aAvailability && bAvailability) {
      return bAvailability.stock - aAvailability.stock;
    }

    // If only one has matching availability, prioritize it
    if (aAvailability) return -1;
    if (bAvailability) return 1;

    // If neither has matching availability, maintain original order
    return 0;
  });
}

// @route   GET /api/products
// @desc    Get all products
// @access  Private
router.get("/", authenticate, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const category = req.query.category;
    const province = req.query.province;
    const district = req.query.district;
    const search = req.query.search;
    const vendorId = req.query.vendorId;
    const status = req.query.status || "available";

    // Build query
    const query = { isActive: true };

    if (status && status !== "all") {
      query.status = status;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (vendorId) {
      query.vendorId = vendorId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // If province is specified, filter products available in that province
    // Only apply stock filtering when explicitly doing location-based filtering
    // For category-only searches, show all products regardless of stock
    if (province) {
      query["availability.province"] = province;
      
      // Only filter by stock > 0 when doing location-based filtering
      // Don't apply stock filtering for category-only searches
      if (province && !category) {
        query["availability.stock"] = { $gt: 0 };
      }

      // If district is also specified, further filter by district
      if (district) {
        query["availability.district"] = district;
      }
    }

    let products = await Product.find(query)
      .populate("vendorId", "name businessName email phone")
      .populate("availability.centerId", "name location code")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Apply sorting algorithm if province/district specified
    if (province) {
      // Sort products by availability in the specified province/district
      products = sortProductsByAvailability(products, province, district);
    }

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Private
router.get("/categories", authenticate, async (req, res) => {
  try {
    const categories = [
      "Electronics",
      "Furniture",
      "Clothing",
      "Footwear",
      "Accessories",
      "Books",
      "Sports",
      "Home & Garden",
      "Automotive",
      "Health & Beauty",
      "Spices & Herbs",
      "Grains & Pulses",
      "Beverages",
      "Snacks & Sweets",
      "Stationery",
      "Wearables",
    ];

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Private
router.get("/:id", authenticate, validateObjectId("id"), async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("vendorId", "name businessName email phone");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: { product },
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
});

// @route   POST /api/products
// @desc    Create new product (Center or Vendor)
// @access  Private (Center or Vendor)
router.post(
  "/",
  authenticate,
  authorize("VENDOR", "CENTER"),
  requireApproval,
  validateProduct,
  async (req, res) => {
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
      } = req.body;

      // For centers creating products, validate that the center exists as a user
      if (req.user.role === "CENTER") {
        // Centers can only create products for themselves
        const centerAvailability = availability.find(item => item.centerId === req.user._id.toString());
        if (!centerAvailability) {
          return res.status(400).json({
            success: false,
            message: "Center must include their own centerId in availability",
          });
        }
      } else if (req.user.role === "VENDOR") {
        // For vendors, validate that specified centers exist as users with CENTER role
        const centerIds = availability.map((item) => item.centerId);
        const existingCenters = await User.find({
          _id: { $in: centerIds },
          role: "CENTER",
          isActive: true,
          status: "APPROVED",
        });

        if (existingCenters.length !== centerIds.length) {
          return res.status(400).json({
            success: false,
            message: "One or more centers are invalid or inactive",
          });
        }
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
        status: "available",
      });

      await product.populate("vendorId", "name businessName");
      await product.populate("availability.centerId", "name location code");

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: { product },
      });
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create product",
      });
    }
  }
);

// @route   PUT /api/products/:id
// @desc    Update product (Vendor only - own products)
// @access  Private (Vendor)
router.put(
  "/:id",
  authenticate,
  authorize("VENDOR"),
  requireApproval,
  validateObjectId("id"),
  async (req, res) => {
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
        status,
      } = req.body;

      const product = await Product.findOne({
        _id: req.params.id,
        vendorId: req.user._id,
        isActive: true,
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found or you do not have permission to edit it",
        });
      }

      // Update fields
      if (name) product.name = name;
      if (description) product.description = description;
      if (category) product.category = category;
      if (subcategory) product.subcategory = subcategory;
      if (price) product.price = price;
      if (availability) {
        // Verify centers exist as users with CENTER role
        const centerIds = availability.map((item) => item.centerId);
        const existingCenters = await User.find({
          _id: { $in: centerIds },
          role: "CENTER",
          isActive: true,
          status: "APPROVED",
        });

        if (existingCenters.length === centerIds.length) {
          product.availability = availability;
        }
      }
      if (specifications)
        product.specifications = {
          ...product.specifications,
          ...specifications,
        };
      if (images) product.images = images;
      if (tags) product.tags = tags;
      if (
        status &&
        ["available", "out_of_stock", "discontinued"].includes(status)
      ) {
        product.status = status;
      }

      await product.save();
      await product.populate("availability.centerId", "name location code");

      res.json({
        success: true,
        message: "Product updated successfully",
        data: { product },
      });
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update product",
      });
    }
  }
);

// @route   PUT /api/products/:id/stock
// @desc    Update product stock (Vendor only)
// @access  Private (Vendor)
router.put(
  "/:id/stock",
  authenticate,
  authorize("VENDOR"),
  requireApproval,
  validateObjectId("id"),
  async (req, res) => {
    try {
      const { centerId, stock } = req.body;

      if (!centerId || typeof stock !== "number" || stock < 0) {
        return res.status(400).json({
          success: false,
          message: "Valid centerId and non-negative stock value are required",
        });
      }

      const product = await Product.findOne({
        _id: req.params.id,
        vendorId: req.user._id,
        isActive: true,
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found or you do not have permission to edit it",
        });
      }

      // Find and update the availability for the specific center
      const availabilityIndex = product.availability.findIndex(
        (item) => item.centerId.toString() === centerId
      );

      if (availabilityIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Product is not available at the specified center",
        });
      }

      product.availability[availabilityIndex].stock = stock;
      product.availability[availabilityIndex].lastUpdated = new Date();

      // Update product status based on total stock
      const totalStock = product.availability.reduce(
        (sum, item) => sum + item.stock,
        0
      );
      product.status = totalStock > 0 ? "available" : "out_of_stock";

      await product.save();

      res.json({
        success: true,
        message: "Product stock updated successfully",
        data: {
          product: {
            _id: product._id,
            name: product.name,
            availability: product.availability,
            status: product.status,
          },
        },
      });
    } catch (error) {
      console.error("Update product stock error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update product stock",
      });
    }
  }
);

// @route   DELETE /api/products/:id
// @desc    Delete product (Vendor only - own products)
// @access  Private (Vendor)
router.delete(
  "/:id",
  authenticate,
  authorize("VENDOR"),
  requireApproval,
  validateObjectId("id"),
  async (req, res) => {
    try {
      const product = await Product.findOne({
        _id: req.params.id,
        vendorId: req.user._id,
        isActive: true,
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found or you do not have permission to delete it",
        });
      }

      // Soft delete - mark as inactive
      product.isActive = false;
      await product.save();

      res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete product",
      });
    }
  }
);

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Private
router.get("/categories", authenticate, async (req, res) => {
  try {
    const categories = [
      "Electronics",
      "Furniture",
      "Clothing",
      "Footwear",
      "Accessories",
      "Books",
      "Sports",
      "Home & Garden",
      "Automotive",
      "Health & Beauty",
      "Spices & Herbs",
      "Grains & Pulses",
      "Beverages",
      "Snacks & Sweets",
      "Stationery",
      "Wearables",
    ];

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
});

// @route   GET /api/products/search/suggestions
// @desc    Get search suggestions
// @access  Private
router.get("/search/suggestions", authenticate, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] },
      });
    }

    const suggestions = await Product.find({
      isActive: true,
      status: "available",
      $or: [
        { name: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ],
    })
      .select("name category")
      .limit(10);

    const uniqueSuggestions = [...new Set(suggestions.map((p) => p.name))];

    res.json({
      success: true,
      data: { suggestions: uniqueSuggestions },
    });
  } catch (error) {
    console.error("Get search suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch search suggestions",
    });
  }
});

// @route   GET /api/products/vendor/:vendorId
// @desc    Get products by vendor
// @access  Private
router.get(
  "/vendor/:vendorId",
  authenticate,
  validateObjectId("vendorId"),
  validatePagination,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;

      const products = await Product.find({
        vendorId: req.params.vendorId,
        isActive: true,
      })
        .populate("availability.centerId", "name location code")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Product.countDocuments({
        vendorId: req.params.vendorId,
        isActive: true,
      });

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total,
            limit,
          },
        },
      });
    } catch (error) {
      console.error("Get vendor products error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch vendor products",
      });
    }
  }
);

// get product based on center
// @route   GET /api/products/center/:centerId
// @desc    Get products available at a specific center
router.get("/center/:centerId", async (req, res) => {
  try {
    const centerObjectId = new mongoose.Types.ObjectId(req.params.centerId);

    console.log(centerObjectId, ":this isd c4enter od");
    const products = await Product.find({
      "availability.centerId": req.params.centerId,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { products },
    });
  } catch (error) {
    console.error("Get center products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch center products" + error,
    });
  }
  // @route   GET /api/products/vendor/:vendorId/category/:category
  // @desc    Get products by vendor and category
  // @access  Private
  router.get(
    "/vendor/:vendorId/category/:category",
    authenticate,
    async (req, res) => {
      try {
        const category = req.params.category;

        const products = await Product.find({
          vendorId: req.params.vendorId,
          category: category,
          isActive: true,
        }).sort({ createdAt: -1 });

        res.json({
          success: true,
          data: { products },
        });
      } catch (error) {
        console.error("Get vendor products by category error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch vendor products by category",
        });
      }
    }
  );
});

module.exports = router;
