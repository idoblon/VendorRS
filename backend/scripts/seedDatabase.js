require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// Import models
const User = require("../models/User");
const Category = require("../models/Category");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const Order = require("../models/Order");
const Product = require("../models/Product");

const connectDB = async () => {
  console.log(process.env.MONGODB_URI, "this is the uri");
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

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding check...");
    
    // Check if data already exists
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log("📊 Database already contains data. Skipping seeding.");
      console.log(`Found ${existingUsers} existing users.`);
      return;
    }
    
    console.log("📭 Database is empty. Proceeding with seeding...");
    
    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    await Order.deleteMany({});
    await Product.deleteMany({});
    console.log("🧹 Cleared existing data");

    // Create Admin User with secure credentials
    const adminUser = await User.create({
      name: "System Administrator",
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      password: process.env.ADMIN_PASSWORD || "Password@123",
      phone: "+91 9999999999",
      role: "ADMIN",
      status: "APPROVED",
      isActive: true,
    });
    console.log("👨‍💼 Created admin user");

    // Seed categories with detailed structure (needed for center signup)
    const sampleCategories = [
      {
        name: "Electronics",
        description: "Electronic devices and gadgets",
        subcategories: ["Mobile Phones", "Laptops", "Audio", "Cameras"],
        isActive: true,
      },
      {
        name: "Clothing",
        description: "Apparel and fashion items",
        subcategories: [
          "Men's Wear",
          "Women's Wear",
          "Ethnic Wear",
          "Kids Wear",
        ],
        isActive: true,
      },
      {
        name: "Books",
        description: "Books and educational materials",
        subcategories: [
          "Fiction",
          "Non-Fiction",
          "Educational",
          "Technical",
        ],
        isActive: true,
      },
      {
        name: "Sports",
        description: "Sports and fitness equipment",
        subcategories: ["Outdoor", "Indoor", "Fitness", "Team Sports"],
        isActive: true,
      },
      {
        name: "Accessories",
        description: "Fashion and lifestyle accessories",
        subcategories: ["Bags", "Jewelry", "Watches", "Scarves"],
        isActive: true,
      },
      {
        name: "Furniture",
        description: "Home and office furniture",
        subcategories: ["Living Room", "Bedroom", "Office", "Outdoor"],
        isActive: true,
      },
      {
        name: "Footwear",
        description: "Shoes and footwear",
        subcategories: ["Casual", "Formal", "Sports", "Traditional"],
        isActive: true,
      },
      {
        name: "Home & Garden",
        description: "Home improvement and gardening",
        subcategories: ["Tools", "Plants", "Decor", "Kitchen"],
        isActive: true,
      },
      {
        name: "Automotive",
        description: "Vehicle parts and accessories",
        subcategories: ["Parts", "Accessories", "Tools", "Care Products"],
        isActive: true,
      },
      {
        name: "Health & Beauty",
        description: "Health and beauty products",
        subcategories: ["Skincare", "Makeup", "Health Supplements", "Personal Care"],
        isActive: true,
      },
      {
        name: "Spices & Herbs",
        description: "Cooking spices and herbs",
        subcategories: ["Whole Spices", "Ground Spices", "Herbs", "Spice Mixes"],
        isActive: true,
      },
      {
        name: "Grains & Pulses",
        description: "Rice, grains and pulses",
        subcategories: ["Rice", "Wheat", "Lentils", "Beans"],
        isActive: true,
      },
      {
        name: "Beverages",
        description: "Drinks and beverages",
        subcategories: ["Tea", "Coffee", "Juices", "Soft Drinks"],
        isActive: true,
      },
      {
        name: "Snacks & Sweets",
        description: "Snacks and sweet items",
        subcategories: ["Traditional Sweets", "Chips", "Cookies", "Nuts"],
        isActive: true,
      },
    ];

    await Category.insertMany(sampleCategories);
    console.log(`📦 Created ${sampleCategories.length} sample categories`);

    // Define sample centers with province and district information
    const sampleCenters = [
      {
        name: "Kathmandu Distribution Center",
        email: "kathmandu@center.com",
        password: process.env.CENTER_PASSWORD || "Password@123",
        phone: "+977 1 1234567",
        role: "CENTER",
        status: "APPROVED",
        panNumber: "PANC123456789",
        province: "Bagmati",
        district: "Kathmandu",
        categories: ["Spices & Herbs", "Grains & Pulses", "Beverages"],
        isActive: true,
      },
      {
        name: "Pokhara Distribution Center",
        email: "pokhara@center.com",
        password: process.env.CENTER_PASSWORD || "Password@123",
        phone: "+977 61 123456",
        role: "CENTER",
        status: "APPROVED",
        panNumber: "PANC987654321",
        province: "Gandaki",
        district: "Pokhara",
        categories: ["Clothing", "Footwear", "Accessories"],
        isActive: true,
      },
      {
        name: "Biratnagar Distribution Center",
        email: "biratnagar@center.com",
        password: process.env.CENTER_PASSWORD || "Password@123",
        phone: "+977 1 1234567",
        role: "CENTER",
        status: "APPROVED",
        panNumber: "PANC456789123",
        province: "Koshi",
        district: "Biratnagar",
        categories: ["Electronics", "Home & Garden", "Sports"],
        isActive: true,
      },
      {
        name: "Chitwan Distribution Center",
        email: "chitwan@center.com",
        password: process.env.CENTER_PASSWORD || "Password@123",
        phone: "+977 56 123456",
        role: "CENTER",
        status: "APPROVED",
        panNumber: "PANC789123456",
        province: "Bagmati",
        district: "Chitwan",
        categories: ["Grains & Pulses", "Beverages", "Snacks & Sweets"],
        isActive: true,
      },
      {
        name: "Butwal Distribution Center",
        email: "butwal@center.com",
        password: process.env.CENTER_PASSWORD || "Password@123",
        phone: "+977 71 123456",
        role: "CENTER",
        status: "APPROVED",
        panNumber: "PANC321654987",
        province: "Lumbini",
        district: "Butwal",
        categories: ["Clothing", "Footwear", "Accessories"],
        isActive: true,
      },
      {
        name: "Dharan Distribution Center",
        email: "dharan@center.com",
        password: process.env.CENTER_PASSWORD || "Password@123",
        phone: "+977 25 123456",
        role: "CENTER",
        status: "APPROVED",
        panNumber: "PANC654987321",
        province: "Koshi",
        district: "Dharan",
        categories: ["Electronics", "Sports", "Books"],
        isActive: true,
      },
      {
        name: "Nepalgunj Distribution Center",
        email: "nepalgunj@center.com",
        password: process.env.CENTER_PASSWORD || "Password@123",
        phone: "+977 81 123456",
        role: "CENTER",
        status: "APPROVED",
        panNumber: "PANC987321654",
        province: "Lumbini",
        district: "Nepalgunj",
        categories: ["Spices & Herbs", "Home & Garden", "Automotive"],
        isActive: true,
      },
      {
        name: "Janakpur Distribution Center",
        email: "janakpur@center.com",
        password: process.env.CENTER_PASSWORD || "Password@123",
        phone: "+977 41 123456",
        role: "CENTER",
        status: "APPROVED",
        panNumber: "PANC147258369",
        province: "Madhesh",
        district: "Janakpur",
        categories: ["Grains & Pulses", "Beverages", "Health & Beauty"],
        isActive: true,
      },
    ];

    // Create center users
    const centerUsers = [];
    for (const center of sampleCenters) {
      const centerUser = await User.create(center);
      centerUsers.push(centerUser);
      console.log(`🏢 Created center user: ${center.name}`);
    }

    // Define sample vendors with business information
    const sampleVendors = [
      {
        name: "Nepal Spices & Herbs Co.",
        email: "spices@vendor.com",
        password: process.env.VENDOR_PASSWORD || "Password@123",
        phone: "+977 9801234567",
        role: "VENDOR",
        status: "APPROVED",
        businessName: "Nepal Spices & Herbs Co.",
        panNumber: "PAN123456789",
        address: "123 Spice Street",
        district: "Kathmandu",
        bankDetails: {
          bankName: "Nepal Bank Ltd.",
          accountNumber: "1234567890",
          ifscCode: "NB000012345",
          branch: "Kathmandu Branch",
          holderName: "Nepal Spices & Herbs Co.",
        },
        contactPersons: [
          {
            name: "Rajesh Thapa",
            phone: "+977 9801234567",
            isPrimary: true,
          },
        ],
        isActive: true,
      },
      {
        name: "Trekking Gear Nepal",
        email: "trekking@vendor.com",
        password: process.env.VENDOR_PASSWORD || "Password@123",
        phone: "+977 9801234568",
        role: "VENDOR",
        status: "APPROVED",
        businessName: "Trekking Gear Nepal",
        panNumber: "PAN987654321",
        address: "456 Trekking Road",
        district: "Pokhara",
        bankDetails: {
          bankName: "Nepal Investment Bank",
          accountNumber: "0987654321",
          ifscCode: "NIB000098765",
          branch: "Pokhara Branch",
          holderName: "Trekking Gear Nepal",
        },
        contactPersons: [
          {
            name: "Sunita Shrestha",
            phone: "+977 9801234568",
            isPrimary: true,
          },
        ],
        isActive: true,
      },
      {
        name: "Nepal Handicrafts",
        email: "handicrafts@vendor.com",
        password: process.env.VENDOR_PASSWORD || "Password@123",
        phone: "+977 9801234569",
        role: "VENDOR",
        status: "APPROVED",
        businessName: "Nepal Handicrafts",
        panNumber: "PAN456789123",
        address: "789 Craft Avenue",
        district: "Biratnagar",
        bankDetails: {
          bankName: "Nepal Finance Bank",
          accountNumber: "1122334455",
          ifscCode: "NFB00011223",
          branch: "Biratnagar Branch",
          holderName: "Nepal Handicrafts",
        },
        contactPersons: [
          {
            name: "Karma Sherpa",
            phone: "+977 9801234569",
            isPrimary: true,
          },
        ],
        isActive: true,
      },
      {
        name: "Organic Farm Nepal",
        email: "organic@vendor.com",
        password: process.env.VENDOR_PASSWORD || "Password@123",
        phone: "+977 9801234570",
        role: "VENDOR",
        status: "APPROVED",
        businessName: "Organic Farm Nepal",
        panNumber: "PAN789123456",
        address: "321 Farm Road",
        district: "Chitwan",
        bankDetails: {
          bankName: "Agricultural Development Bank",
          accountNumber: "5566778899",
          ifscCode: "ADB00055667",
          branch: "Chitwan Branch",
          holderName: "Organic Farm Nepal",
        },
        contactPersons: [
          {
            name: "Bishnu Prasad",
            phone: "+977 9801234570",
            isPrimary: true,
          },
        ],
        isActive: true,
      },
      {
        name: "Tech Solutions Nepal",
        email: "tech@vendor.com",
        password: process.env.VENDOR_PASSWORD || "Password@123",
        phone: "+977 9801234571",
        role: "VENDOR",
        status: "APPROVED",
        businessName: "Tech Solutions Nepal",
        panNumber: "PAN321654987",
        address: "654 Tech Park",
        district: "Lalitpur",
        bankDetails: {
          bankName: "Standard Chartered Bank",
          accountNumber: "9988776655",
          ifscCode: "SCB00099887",
          branch: "Lalitpur Branch",
          holderName: "Tech Solutions Nepal",
        },
        contactPersons: [
          {
            name: "Anita Gurung",
            phone: "+977 9801234571",
            isPrimary: true,
          },
        ],
        isActive: true,
      },
    ];

    // Create vendor users
    const vendorUsers = [];
    for (const vendor of sampleVendors) {
      const vendorUser = await User.create(vendor);
      vendorUsers.push(vendorUser);
      console.log(`🏪 Created vendor user: ${vendor.name}`);
    }

    // Get the already created categories
    const createdCategories = await Category.find({});
    console.log(`📂 Using ${createdCategories.length} existing categories`);

    // Define comprehensive product list (combining original and additional products)
    const allProducts = [
      // Original products
      {
        name: "Organic Turmeric Powder",
        description: "Premium quality organic turmeric powder from Nepal",
        category: "Beverages",
        subcategory: "Spices",
        price: 250,
        currency: "NPR",
        vendorId: vendorUsers[0]._id,
        availability: [
          {
            province: "Bagmati",
            district: "Kathmandu",
            stock: 100,
            reservedStock: 0,
          },
        ],
        specifications: {
          weight: {
            value: 500,
            unit: "g"
          },
          organic: true,
          brand: "Nepal Spices",
        },
        images: [
          {
            filename: "turmeric.jpg",
            originalName: "turmeric.jpg",
            path: "/images/turmeric.jpg",
            url: "https://example.com/images/turmeric.jpg",
            isPrimary: true,
          },
        ],
        tags: ["organic", "spices", "turmeric", "healthy"],
        status: "available",
      },
      {
        name: "Himalayan Black Tea",
        description: "High-altitude black tea from the Himalayas",
        category: "Beverages",
        subcategory: "Tea",
        price: 800,
        currency: "NPR",
        vendorId: vendorUsers[0]._id,
        availability: [
          {
            province: "Bagmati",
            district: "Kathmandu",
            stock: 50,
            reservedStock: 5,
          },
        ],
        specifications: {
          weight: {
            value: 250,
            unit: "g"
          },
          type: "Black Tea",
          origin: "Nepal Himalayas",
        },
        images: [
          {
            filename: "black_tea.jpg",
            originalName: "black_tea.jpg",
            path: "/images/black_tea.jpg",
            url: "https://example.com/images/black_tea.jpg",
            isPrimary: true,
          },
        ],
        tags: ["tea", "himalayan", "black tea", "premium"],
        status: "available",
      },
      {
        name: "Trekking Backpack 40L",
        description: "Durable 40L trekking backpack for outdoor adventures",
        category: "Sports",
        subcategory: "Outdoor Sports",
        price: 2500,
        currency: "NPR",
        vendorId: vendorUsers[1]._id,
        availability: [
          {
            province: "Gandaki",
            district: "Pokhara",
            stock: 25,
            reservedStock: 2,
          },
        ],
        specifications: {
          capacity: "40L",
          material: "Ripstop Nylon",
          waterproof: true,
          brand: "Trekking Gear Nepal",
        },
        images: [
          {
            filename: "backpack.jpg",
            originalName: "backpack.jpg",
            path: "/images/backpack.jpg",
            url: "https://example.com/images/backpack.jpg",
            isPrimary: true,
          },
        ],
        tags: ["trekking", "backpack", "outdoor", "adventure"],
        status: "available",
      },
      // Additional products from addMoreProducts.js
      {
        name: "Wireless Bluetooth Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        category: "Electronics",
        subcategory: "Audio",
        price: 2500,
        currency: "NPR",
        vendorId: vendorUsers[4]._id, // Tech Solutions Nepal
        availability: [
          {
            province: "Bagmati",
            district: "Kathmandu",
            stock: 30,
            reservedStock: 0,
          },
        ],
        specifications: {
          connectivity: "Bluetooth 5.0",
          batteryLife: "20 hours",
          noiseCancellation: true,
          brand: "Tech Solutions",
        },
        images: [
          {
            filename: "bluetooth_headphones.jpg",
            originalName: "bluetooth_headphones.jpg",
            path: "/images/bluetooth_headphones.jpg",
            url: "https://example.com/images/bluetooth_headphones.jpg",
            isPrimary: true,
          },
        ],
        tags: ["wireless", "bluetooth", "headphones", "audio"],
        status: "available",
      },
      {
        name: "Traditional Dhaka Top",
        description:
          "Handwoven traditional Nepali dhaka top with intricate patterns",
        category: "Clothing",
        subcategory: "Ethnic Wear",
        price: 1200,
        currency: "NPR",
        vendorId: vendorUsers[2]._id, // Nepal Handicrafts
        availability: [
          {
            province: "Bagmati",
            district: "Kathmandu",
            stock: 50,
            reservedStock: 0,
          },
        ],
        specifications: {
          material: "Cotton",
          color: "Multicolor",
          brand: "Nepali Textiles",
          size: "M",
        },
        images: [
          {
            filename: "dhaka_top.jpg",
            originalName: "dhaka_top.jpg",
            path: "/images/dhaka_top.jpg",
            url: "https://example.com/images/dhaka_top.jpg",
            isPrimary: true,
          },
        ],
        tags: ["traditional", "dhaka", "ethnic", "women"],
        status: "available",
      },
      {
        name: "Handcrafted Leather Boots",
        description: "Premium leather boots made by skilled artisans in Nepal",
        category: "Footwear",
        subcategory: "Boots",
        price: 3500,
        currency: "NPR",
        vendorId: vendorUsers[2]._id, // Nepal Handicrafts
        availability: [
          {
            province: "Koshi",
            district: "Biratnagar",
            stock: 25,
            reservedStock: 0,
          },
        ],
        specifications: {
          material: "Genuine Leather",
          color: "Brown",
          size: "8",
          brand: "Nepal Leather Works",
        },
        images: [
          {
            filename: "leather_boots.jpg",
            originalName: "leather_boots.jpg",
            path: "/images/leather_boots.jpg",
            url: "https://example.com/images/leather_boots.jpg",
            isPrimary: true,
          },
        ],
        tags: ["leather", "boots", "handcrafted", "footwear"],
        status: "available",
      },
      {
        name: "Pashmina Shawl",
        description: "Luxurious 100% pure pashmina shawl from Nepal",
        category: "Accessories",
        subcategory: "Scarves",
        price: 4500,
        currency: "NPR",
        vendorId: vendorUsers[2]._id, // Nepal Handicrafts
        availability: [
          {
            province: "Bagmati",
            district: "Kathmandu",
            stock: 40,
            reservedStock: 0,
          },
        ],
        specifications: {
          material: "100% Pashmina",
          color: "Royal Blue",
          dimensions: {
            length: 80,
            width: 200,
            unit: "cm",
          },
          brand: "Nepal Pashmina House",
        },
        images: [
          {
            filename: "pashmina_shawl.jpg",
            originalName: "pashmina_shawl.jpg",
            path: "/images/pashmina_shawl.jpg",
            url: "https://example.com/images/pashmina_shawl.jpg",
            isPrimary: true,
          },
        ],
        tags: ["pashmina", "shawl", "luxury", "accessory"],
        status: "available",
      },
      {
        name: "Nepali Folk Tales",
        description: "Collection of traditional Nepali folk tales for all ages",
        category: "Books",
        subcategory: "Fiction",
        price: 500,
        currency: "NPR",
        vendorId: vendorUsers[2]._id, // Nepal Handicrafts
        availability: [
          {
            province: "Gandaki",
            district: "Pokhara",
            stock: 100,
            reservedStock: 0,
          },
        ],
        specifications: {
          author: "Various Authors",
          publisher: "Nepal Publications",
          language: "Nepali",
          pages: 250,
          isbn: "978-9999999999",
        },
        images: [
          {
            filename: "folk_tales.jpg",
            originalName: "folk_tales.jpg",
            path: "/images/folk_tales.jpg",
            url: "https://example.com/images/folk_tales.jpg",
            isPrimary: true,
          },
        ],
        tags: ["folk tales", "nepali", "literature", "stories"],
        status: "available",
      },
      {
        name: "Yoga Mat",
        description:
          "Eco-friendly non-slip yoga mat for all types of yoga practice",
        category: "Sports",
        subcategory: "Yoga",
        price: 1200,
        currency: "NPR",
        vendorId: vendorUsers[1]._id, // Trekking Gear Nepal
        availability: [
          {
            province: "Bagmati",
            district: "Kathmandu",
            stock: 60,
            reservedStock: 0,
          },
        ],
        specifications: {
          material: "Natural Rubber",
          color: "Purple",
          dimensions: {
            length: 173,
            width: 61,
            unit: "cm",
          },
          brand: "Nepal Sports Gear",
        },
        images: [
          {
            filename: "yoga_mat.jpg",
            originalName: "yoga_mat.jpg",
            path: "/images/yoga_mat.jpg",
            url: "https://example.com/images/yoga_mat.jpg",
            isPrimary: true,
          },
        ],
        tags: ["yoga", "fitness", "eco-friendly", "sports"],
        status: "available",
      },
      {
        name: "Handwoven Basket Set",
        description:
          "Set of 3 handwoven baskets made from locally sourced materials",
        category: "Home & Garden",
        subcategory: "Storage",
        price: 1800,
        currency: "NPR",
        vendorId: vendorUsers[2]._id, // Nepal Handicrafts
        availability: [
          {
            province: "Koshi",
            district: "Biratnagar",
            stock: 35,
            reservedStock: 0,
          },
        ],
        specifications: {
          material: "Bamboo",
          color: "Natural",
          setSize: 3,
          brand: "Nepal Handicrafts",
        },
        images: [
          {
            filename: "basket_set.jpg",
            originalName: "basket_set.jpg",
            path: "/images/basket_set.jpg",
            url: "https://example.com/images/basket_set.jpg",
            isPrimary: true,
          },
        ],
        tags: ["handwoven", "baskets", "storage", "eco-friendly"],
        status: "available",
      },
      {
        name: "Organic Honey",
        description: "Pure organic honey harvested from Himalayan wildflowers",
        category: "Beverages",
        subcategory: "Natural Products",
        price: 600,
        currency: "NPR",
        vendorId: vendorUsers[3]._id, // Organic Farm Nepal
        availability: [
          {
            province: "Bagmati",
            district: "Chitwan",
            stock: 80,
            reservedStock: 0,
          },
        ],
        specifications: {
          weight: {
            value: 500,
            unit: "g"
          },
          organic: true,
          source: "Himalayan Wildflowers",
          brand: "Organic Farm Nepal",
        },
        images: [
          {
            filename: "organic_honey.jpg",
            originalName: "organic_honey.jpg",
            path: "/images/organic_honey.jpg",
            url: "https://example.com/images/organic_honey.jpg",
            isPrimary: true,
          },
        ],
        tags: ["organic", "honey", "natural", "himalayan"],
        status: "available",
      },
      {
        name: "Smartphone Case",
        description:
          "Durable protective case for smartphones with shock absorption",
        category: "Electronics",
        subcategory: "Mobile Phones",
        price: 800,
        currency: "NPR",
        vendorId: vendorUsers[4]._id, // Tech Solutions Nepal
        availability: [
          {
            province: "Bagmati",
            district: "Lalitpur",
            stock: 150,
            reservedStock: 0,
          },
        ],
        specifications: {
          material: "TPU + PC",
          color: "Black",
          compatibility: "Universal",
          brand: "Tech Solutions",
        },
        images: [
          {
            filename: "phone_case.jpg",
            originalName: "phone_case.jpg",
            path: "/images/phone_case.jpg",
            url: "https://example.com/images/phone_case.jpg",
            isPrimary: true,
          },
        ],
        tags: ["smartphone", "case", "protection", "accessories"],
        status: "available",
      },
    ];

    // Create products
    const createdProducts = [];
    for (const product of allProducts) {
      const createdProduct = await Product.create(product);
      createdProducts.push(createdProduct);
      console.log(`📦 Created product: ${product.name}`);
    }

    // Create sample conversations
const conversations = [];

// Conversation 1: Kathmandu Center with Nepal Spices
const conversation1 = await Conversation.create({
  participants: [
    {
      user: centerUsers[0]._id,
      role: "CENTER"
    },
    {
      user: vendorUsers[0]._id,
      role: "VENDOR"
    }
  ],
  conversationType: "VENDOR_CENTER",
  title: "Spice Order Discussion",
  lastMessage: {
    content: "Thank you for the quick response!",
    sender: centerUsers[0]._id,
    timestamp: new Date(),
    messageType: "text"
  },
  isActive: true,
});
conversations.push(conversation1);

// Conversation 2: Pokhara Center with Trekking Gear Nepal
const conversation2 = await Conversation.create({
  participants: [
    {
      user: centerUsers[1]._id,
      role: "CENTER"
    },
    {
      user: vendorUsers[1]._id,
      role: "VENDOR"
    }
  ],
  conversationType: "VENDOR_CENTER",
  title: "Trekking Equipment Inquiry",
  lastMessage: {
    content: "We can provide bulk discount for orders above 50 units.",
    sender: vendorUsers[1]._id,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    messageType: "text"
  },
  isActive: true,
});
conversations.push(conversation2);

    console.log(`💬 Created ${conversations.length} sample conversations`);

    // Create sample messages
    const messages = [];

    // Messages for conversation 1
    const message1 = await Message.create({
      conversationId: conversation1._id,
      sender: centerUsers[0]._id,
      receiver: vendorUsers[0]._id,
      content: "Hello, we're interested in ordering turmeric powder in bulk.",
      messageType: "text",
    });
    messages.push(message1);

    const message2 = await Message.create({
      conversationId: conversation1._id,
      sender: vendorUsers[0]._id,
      receiver: centerUsers[0]._id,
      content:
        "Thank you for your interest! We can offer competitive prices for bulk orders. How many units are you looking for?",
      messageType: "text",
    });
    messages.push(message2);

    const message3 = await Message.create({
      conversationId: conversation1._id,
      sender: centerUsers[0]._id,
      receiver: vendorUsers[0]._id,
      content: "We need around 100 units. What's your best price?",
      messageType: "text",
    });
    messages.push(message3);

    const message4 = await Message.create({
      conversationId: conversation1._id,
      sender: vendorUsers[0]._id,
      receiver: centerUsers[0]._id,
      content:
        "For 100 units, we can offer NPR 200 per unit. This includes free delivery within Kathmandu.",
      messageType: "text",
    });
    messages.push(message4);

    const message5 = await Message.create({
      conversationId: conversation1._id,
      sender: centerUsers[0]._id,
      receiver: vendorUsers[0]._id,
      content: "That sounds great! Thank you for the quick response!",
      messageType: "text",
    });
    messages.push(message5);

    // Messages for conversation 2
    const message6 = await Message.create({
      conversationId: conversation2._id,
      sender: centerUsers[1]._id,
      receiver: vendorUsers[1]._id,
      content:
        "Hi, we're looking for trekking backpacks for our distribution center.",
      messageType: "text",
    });
    messages.push(message6);

    const message7 = await Message.create({
      conversationId: conversation2._id,
      sender: vendorUsers[1]._id,
      receiver: centerUsers[1]._id,
      content:
        "Hello! We have various trekking backpacks available. What capacity and quantity are you interested in?",
      messageType: "text",
    });
    messages.push(message7);

    const message8 = await Message.create({
      conversationId: conversation2._id,
      sender: centerUsers[1]._id,
      receiver: vendorUsers[1]._id,
      content: "We need 40L capacity backpacks, around 50 units.",
      messageType: "text",
    });
    messages.push(message8);

    const message9 = await Message.create({
      conversationId: conversation2._id,
      sender: vendorUsers[1]._id,
      receiver: centerUsers[1]._id,
      content:
        "Perfect! We have 40L trekking backpacks in stock. We can provide bulk discount for orders above 50 units.",
      messageType: "text",
    });
    messages.push(message9);

    console.log(`📨 Created ${messages.length} sample messages`);

    // Create sample notifications
    const notifications = [];

    // Notification for vendor about new message
    const notification1 = await Notification.create({
      recipient: vendorUsers[0]._id,
      title: "New Message",
      message: "You have a new message from Kathmandu Distribution Center",
      type: "MESSAGE",
      relatedId: conversation1._id,
      isRead: false,
    });
    notifications.push(notification1);

    // Notification for center about new message
    const notification2 = await Notification.create({
      recipient: centerUsers[1]._id,
      title: "New Message",
      message: "You have a new message from Trekking Gear Nepal",
      type: "MESSAGE",
      relatedId: conversation2._id,
      isRead: false,
    });
    notifications.push(notification2);

    // System notification for admin
    const notification3 = await Notification.create({
      recipient: adminUser._id,
      title: "System Update",
      message: "Database has been successfully seeded with sample data",
      type: "SYSTEM",
      isRead: false,
    });
    notifications.push(notification3);

    console.log(`🔔 Created ${notifications.length} sample notifications`);

    // Create sample orders
    const orders = [];

    // Order from Kathmandu Center to Nepal Spices
    const order1 = await Order.create({
      centerId: centerUsers[0]._id,
      vendorId: vendorUsers[0]._id,
      items: [
        {
          productId: createdProducts[0]._id, // Organic Turmeric Powder
          productName: "Organic Turmeric Powder",
          quantity: 50,
          unitPrice: 250,
          totalPrice: 12500,
          specifications: {
            weight: {
              value: 500,
              unit: "g"
            },
            organic: true,
          },
        },
        {
          productId: createdProducts[1]._id, // Himalayan Black Tea
          productName: "Himalayan Black Tea",
          quantity: 20,
          unitPrice: 800,
          totalPrice: 16000,
          specifications: {
            weight: {
              value: 250,
              unit: "g"
            },
            type: "Black Tea",
          },
        },
      ],
      orderSummary: {
        subtotal: 28500,
        tax: {
          rate: 13,
          amount: 3705,
        },
        shipping: {
          method: "Standard",
          cost: 500,
        },
        discount: {
          type: "percentage",
          value: 5,
          amount: 1425,
        },
        totalAmount: 31280,
      },
      status: "CONFIRMED",
      deliveryDetails: {
        expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        address: {
          street: "123 Distribution Street",
          city: "Kathmandu",
          state: "Bagmati",
          pincode: "44600",
          country: "Nepal",
        },
        instructions: "Please deliver during business hours",
      },
      payment: {
        method: "Bank Transfer",
        status: "COMPLETED",
        transactionId: "TXN123456789",
        paidAmount: 31280,
        paidDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      priority: "HIGH",
      tags: ["spices", "organic", "bulk"],
      notes: "First order from this center",
    });
    orders.push(order1);
    console.log("📦 Created order from Kathmandu Center to Nepal Spices");

    // Update conversation with order reference
    conversation1.orderReference = order1._id;
    await conversation1.save();

    // Order from Pokhara Center to Trekking Gear Nepal
    const order2 = await Order.create({
      centerId: centerUsers[1]._id,
      vendorId: vendorUsers[1]._id,
      items: [
        {
          productId: createdProducts[2]._id, // Trekking Backpack 40L
          productName: "Trekking Backpack 40L",
          quantity: 10,
          unitPrice: 2500,
          totalPrice: 25000,
          specifications: {
            color: "Black",
            size: "40L",
          },
        },
      ],
      orderSummary: {
        subtotal: 25000,
        tax: {
          rate: 13,
          amount: 3250,
        },
        shipping: {
          method: "Express",
          cost: 1000,
        },
        discount: {
          type: "fixed",
          value: 0,
          amount: 0,
        },
        totalAmount: 29250,
      },
      status: "PENDING",
      deliveryDetails: {
        expectedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        address: {
          street: "456 Mountain View",
          city: "Pokhara",
          state: "Gandaki",
          pincode: "33700",
          country: "Nepal",
        },
        instructions: "Deliver to the warehouse",
      },
      payment: {
        method: "Credit Card",
        status: "PENDING",
        transactionId: null,
        paidAmount: 0,
        paidDate: null,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      priority: "MEDIUM",
      tags: ["trekking", "outdoor"],
      notes: "Bulk order for staff",
    });
    orders.push(order2);
    console.log("📦 Created order from Pokhara Center to Trekking Gear Nepal");

    // Update conversation with order reference
    conversation2.orderReference = order2._id;
    await conversation2.save();

    console.log(`📦 Created ${orders.length} sample orders`);

    // Create backup of seeded data
    const backupData = {
      timestamp: new Date().toISOString(),
      users: {
        admin: 1,
        vendors: vendorUsers.length,
        centers: centerUsers.length,
      },
      categories: createdCategories.length,
      products: createdProducts.length,
      conversations: conversations.length,
      messages: messages.length,
      notifications: notifications.length,
      orders: orders.length,
    };

    // Save backup to file
    const backupPath = path.join(
      __dirname,
      `../backups/seed_backup_${Date.now()}.json`
    );
    const backupDir = path.dirname(backupPath);

    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log(`💾 Backup saved to: ${backupPath}`);

    console.log("\n✅ Comprehensive database seeding completed successfully!");
    console.log("\n📊 Seeding Summary:");
    console.log(`   👤 Admin Users: 1`);
    console.log(`   🏢 Distribution Centers: ${centerUsers.length}`);
    console.log(`   🏪 Vendors: ${vendorUsers.length}`);
    console.log(`   📂 Categories: ${createdCategories.length}`);
    console.log(`   📦 Products: ${createdProducts.length}`);
    console.log(`   💬 Conversations: ${conversations.length}`);
    console.log(`   📨 Messages: ${messages.length}`);
    console.log(`   🔔 Notifications: ${notifications.length}`);
    console.log(`   📋 Orders: ${orders.length}`);
    console.log(
      "\n🎉 Your VendorRS application is now ready with comprehensive sample data!"
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log("🔒 Database connection closed");
  }
};

// Run the seeding
connectDB().then(() => {
  seedDatabase();
});

module.exports = { seedDatabase };
