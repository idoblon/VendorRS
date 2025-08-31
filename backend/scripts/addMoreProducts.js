require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

const addMoreProducts = async () => {
  try {
    console.log("🌱 Adding more products to the database...");

    // Get all vendors
    const vendors = await User.find({ role: "VENDOR", status: "APPROVED" });
    
    if (vendors.length === 0) {
      console.log("❌ No approved vendors found. Please seed the database first.");
      return;
    }

    console.log(`🏢 Found ${vendors.length} approved vendors`);

    // Define additional products for each category
    const additionalProducts = [
      // Electronics
      {
        name: "Wireless Bluetooth Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        category: "Electronics",
        subcategory: "Audio",
        price: 2500,
        currency: "NPR",
        availability: [
          {
            province: "Bagmati",
            district: "Kathmandu",
            stock: 30,
            reservedStock: 0
          }
        ],
        specifications: {
          brand: "TechSound",
          model: "WS-500",
          color: "Black",
          warranty: {
            duration: 12,
            unit: "months",
            terms: "1-year warranty on manufacturing defects"
          }
        },
        images: [
          {
            filename: "wireless_headphones.jpg",
            originalName: "wireless_headphones.jpg",
            path: "/images/wireless_headphones.jpg",
            url: "/image/placeholder.svg",
            isPrimary: true
          }
        ],
        tags: ["wireless", "bluetooth", "headphones", "audio"],
        status: "available"
      },
      // Furniture
      {
        name: "Modern Wooden Dining Table",
        description: "Elegant 6-seater dining table made from sustainable wood",
        category: "Furniture",
        subcategory: "Dining",
        price: 15000,
        currency: "NPR",
        availability: [
          {
            province: "Gandaki",
            district: "Pokhara",
            stock: 10,
            reservedStock: 0
          }
        ],
        specifications: {
          dimensions: {
            length: 180,
            width: 90,
            height: 75,
            unit: "cm"
          },
          material: "Teak Wood",
          brand: "Nepal Furniture Co.",
          color: "Natural Wood",
          warranty: {
            duration: 24,
            unit: "months",
            terms: "2-year warranty on structural integrity"
          }
        },
        images: [
          {
            filename: "dining_table.jpg",
            originalName: "dining_table.jpg",
            path: "/images/dining_table.jpg",
            url: "/image/placeholder.svg",
            isPrimary: true
          }
        ],
        tags: ["dining", "wooden", "furniture", "table"],
        status: "available"
      },
      // Clothing
      {
        name: "Traditional Dhaka Top",
        description: "Handwoven traditional Nepali dhaka top with intricate patterns",
        category: "Clothing",
        subcategory: "Ethnic Wear",
        price: 1200,
        currency: "NPR",
        availability: [
          {
            province: "Bagmati",
            district: "Kathmandu",
            stock: 50,
            reservedStock: 0
          }
        ],
        specifications: {
          material: "Cotton",
          color: "Multicolor",
          brand: "Nepali Textiles",
          size: "M"
        },
        images: [
          {
            filename: "dhaka_top.jpg",
            originalName: "dhaka_top.jpg",
            path: "/images/dhaka_top.jpg",
            url: "/image/placeholder.svg",
            isPrimary: true
          }
        ],
        tags: ["traditional", "dhaka", "ethnic", "women"],
        status: "available"
      },
      // Footwear
      {
        name: "Handcrafted Leather Boots",
        description: "Premium leather boots made by skilled artisans in Nepal",
        category: "Footwear",
        subcategory: "Boots",
        price: 3500,
        currency: "NPR",
        availability: [
          {
            province: "Koshi",
            district: "Biratnagar",
            stock: 25,
            reservedStock: 0
          }
        ],
        specifications: {
          material: "Genuine Leather",
          color: "Brown",
          size: "8",
          brand: "Nepal Leather Works"
        },
        images: [
          {
            filename: "leather_boots.jpg",
            originalName: "leather_boots.jpg",
            path: "/images/leather_boots.jpg",
            url: "/image/placeholder.svg",
            isPrimary: true
          }
        ],
        tags: ["leather", "boots", "handcrafted", "footwear"],
        status: "available"
      },
      // Accessories
      {
        name: "Pashmina Shawl",
        description: "Luxurious 100% pure pashmina shawl from Nepal",
        category: "Accessories",
        subcategory: "Scarves",
        price: 4500,
        currency: "NPR",
        availability: [
          {
            province: "Bagmati",
            district: "Kathmandu",
            stock: 40,
            reservedStock: 0
          }
        ],
        specifications: {
          material: "100% Pashmina",
          color: "Royal Blue",
          dimensions: {
            length: 80,
            width: 200,
            unit: "cm"
          },
          brand: "Nepal Pashmina House"
        },
        images: [
          {
            filename: "pashmina_shawl.jpg",
            originalName: "pashmina_shawl.jpg",
            path: "/images/pashmina_shawl.jpg",
            url: "/image/placeholder.svg",
            isPrimary: true
          }
        ],
        tags: ["pashmina", "shawl", "luxury", "accessory"],
        status: "available"
      },
      // Books
      {
        name: "Nepali Folk Tales",
        description: "Collection of traditional Nepali folk tales for all ages",
        category: "Books",
        subcategory: "Fiction",
        price: 500,
        currency: "NPR",
        availability: [
          {
            province: "Gandaki",
            district: "Pokhara",
            stock: 100,
            reservedStock: 0
          }
        ],
        specifications: {
          author: "Various Authors",
          publisher: "Nepal Publications",
          language: "Nepali",
          pages: 250,
          isbn: "978-9999999999"
        },
        images: [
          {
            filename: "folk_tales.jpg",
            originalName: "folk_tales.jpg",
            path: "/images/folk_tales.jpg",
            url: "/image/placeholder.svg",
            isPrimary: true
          }
        ],
        tags: ["folk tales", "nepali", "literature", "stories"],
        status: "available"
      },
      // Sports
      {
        name: "Yoga Mat",
        description: "Eco-friendly non-slip yoga mat for all types of yoga practice",
        category: "Sports",
        subcategory: "Yoga",
        price: 1200,
        currency: "NPR",
        availability: [
          {
            province: "Bagmati",
            district: "Kathmandu",
            stock: 60,
            reservedStock: 0
          }
        ],
        specifications: {
          material: "Natural Rubber",
          color: "Purple",
          dimensions: {
            length: 173,
            width: 61,
            unit: "cm"
          },
          brand: "Nepal Sports Gear"
        },
        images: [
          {
            filename: "yoga_mat.jpg",
            originalName: "yoga_mat.jpg",
            path: "/images/yoga_mat.jpg",
            url: "/image/placeholder.svg",
            isPrimary: true
          }
        ],
        tags: ["yoga", "fitness", "eco-friendly", "sports"],
        status: "available"
      },
      // Home & Garden
      {
        name: "Handwoven Basket Set",
        description: "Set of 3 handwoven baskets made from locally sourced materials",
        category: "Home & Garden",
        subcategory: "Storage",
        price: 1800,
        currency: "NPR",
        availability: [
          {
            province: "Koshi",
            district: "Biratnagar",
            stock: 35,
            reservedStock: 0
          }
        ],
        specifications: {
          material: "Bamboo and Grass",
          color: "Natural",
          dimensions: [
            { size: "Large", diameter: 30, height: 15, unit: "cm" },
            { size: "Medium", diameter: 25, height: 12, unit: "cm" },
            { size: "Small", diameter: 20, height: 10, unit: "cm" }
          ],
          brand: "Nepal Handicrafts"
        },
        images: [
          {
            filename: "basket_set.jpg",
            originalName: "basket_set.jpg",
            path: "/images/basket_set.jpg",
            url: "/image/placeholder.svg",
            isPrimary: true
          }
        ],
        tags: ["handwoven", "basket", "storage", "home"],
        status: "available"
      },
      // Automotive
      {
        name: "Car Air Freshener",
        description: "Long-lasting aromatic car air freshener with traditional Nepali scents",
        category: "Automotive",
        subcategory: "Accessories",
        price: 300,
        currency: "NPR",
        availability: [
          {
            province: "Bagmati",
            district: "Kathmandu",
            stock: 200,
            reservedStock: 0
          }
        ],
        specifications: {
          scent: "Himalayan Cedar",
          duration: "30 days",
          brand: "Nepal Automotive",
          color: "Green"
        },
        images: [
          {
            filename: "air_freshener.jpg",
            originalName: "air_freshener.jpg",
            path: "/images/air_freshener.jpg",
            url: "/image/placeholder.svg",
            isPrimary: true
          }
        ],
        tags: ["air freshener", "aromatic", "car", "automotive"],
        status: "available"
      },
      // Health & Beauty
      {
        name: "Himalayan Salt Soap",
        description: "Natural soap made with Himalayan salt and herbal extracts",
        category: "Health & Beauty",
        subcategory: "Skincare",
        price: 250,
        currency: "NPR",
        availability: [
          {
            province: "Gandaki",
            district: "Pokhara",
            stock: 150,
            reservedStock: 0
          }
        ],
        specifications: {
          ingredients: "Himalayan Salt, Neem, Turmeric",
          weight: {
            value: 150,
            unit: "g"
          },
          brand: "Nepal Natural Care"
        },
        images: [
          {
            filename: "salt_soap.jpg",
            originalName: "salt_soap.jpg",
            path: "/images/salt_soap.jpg",
            url: "/image/placeholder.svg",
            isPrimary: true
          }
        ],
        tags: ["himalayan", "salt", "soap", "natural", "skincare"],
        status: "available"
      },
      // Spices & Herbs
      {
        name: "Organic Cardamom",
        description: "Premium quality organic cardamom pods from Nepal",
        category: "Spices & Herbs",
        subcategory: "Spices",
        price: 800,
        currency: "NPR",
        availability: [
          {
            province: "Bagmati",
            district: "Kathmandu",
            stock: 80,
            reservedStock: 0
          }
        ],
        specifications: {
          weight: {
            value: 100,
            unit: "g"
          },
          color: "Green",
          brand: "Nepal Spices",
          origin: "Ilam"
        },
        images: [
          {
            filename: "cardamom.jpg",
            originalName: "cardamom.jpg",
            path: "/images/cardamom.jpg",
            url: "/image/placeholder.svg",
            isPrimary: true
          }
        ],
        tags: ["cardamom", "organic", "spices", "premium"],
        status: "available"
      },
      // Grains & Pulses
      {
        name: "Basmati Rice",
        description: "Premium quality basmati rice imported from India",
        category: "Grains & Pulses",
        subcategory: "Rice",
        price: 150,
        currency: "NPR",
        availability: [
          {
            province: "Koshi",
            district: "Biratnagar",
            stock: 500,
            reservedStock: 0
          }
        ],
        specifications: {
          weight: {
            value: 1000,
            unit: "g"
          },
          brand: "Nepal Grains",
          origin: "India"
        },
        images: [
          {
            filename: "basmati_rice.jpg",
            originalName: "basmati_rice.jpg",
            path: "/images/basmati_rice.jpg",
            url: "/image/placeholder.svg",
            isPrimary: true
          }
        ],
        tags: ["basmati", "rice", "grains", "premium"],
        status: "available"
      },
      // Beverages
      {
        name: "Himalayan Herbal Tea",
        description: "Blend of Himalayan herbs for a refreshing and healthy tea",
        category: "Beverages",
        subcategory: "Tea",
        price: 400,
        currency: "NPR",
        availability: [
          {
            province: "Bagmati",
            district: "Kathmandu",
            stock: 120,
            reservedStock: 0
          }
        ],
        specifications: {
          ingredients: "Himalayan Herbs, Ginger, Lemon",
          weight: {
            value: 100,
            unit: "g"
          },
          brand: "Nepal Tea House"
        },
        images: [
          {
            filename: "herbal_tea.jpg",
            originalName: "herbal_tea.jpg",
            path: "/images/herbal_tea.jpg",
            url: "/image/placeholder.svg",
            isPrimary: true
          }
        ],
        tags: ["herbal", "tea", "himalayan", "healthy"],
        status: "available"
      },
      // Snacks & Sweets
      {
        name: "Mixed Dry Fruits",
        description: "Assorted premium dry fruits for healthy snacking",
        category: "Snacks & Sweets",
        subcategory: "Dry Fruits",
        price: 1200,
        currency: "NPR",
        availability: [
          {
            province: "Gandaki",
            district: "Pokhara",
            stock: 90,
            reservedStock: 0
          }
        ],
        specifications: {
          ingredients: "Almonds, Cashews, Walnuts, Raisins",
          weight: {
            value: 500,
            unit: "g"
          },
          brand: "Nepal Nuts"
        },
        images: [
          {
            filename: "dry_fruits.jpg",
            originalName: "dry_fruits.jpg",
            path: "/images/dry_fruits.jpg",
            url: "/image/placeholder.svg",
            isPrimary: true
          }
        ],
        tags: ["dry fruits", "snacks", "healthy", "premium"],
        status: "available"
      }
    ];

    // Create products for each vendor
    const createdProducts = [];
    for (const vendor of vendors) {
      console.log(`🏪 Creating products for vendor: ${vendor.businessName || vendor.name}`);
      
      // Assign products to vendors based on their categories or randomly
      for (const productData of additionalProducts) {
        // Create a copy of the product data and assign the vendor ID
        const productToCreate = {
          ...productData,
          vendorId: vendor._id
        };
        
        try {
          const product = await Product.create(productToCreate);
          createdProducts.push(product);
          console.log(`  📦 Created product: ${product.name}`);
        } catch (error) {
          console.error(`  ❌ Failed to create product: ${productData.name}`, error.message);
        }
      }
    }

    console.log(`✅ Successfully created ${createdProducts.length} additional products!`);
    
  } catch (error) {
    console.error("❌ Error adding products:", error);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log("🔒 Database connection closed");
  }
};

// Run the function
connectDB().then(() => {
  addMoreProducts();
});
