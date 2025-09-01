require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Import models
const User = require("../models/User");
const Category = require("../models/Category");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const Order = require("../models/Order");
const Product = require("../models/Product");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

const question = (query) => new Promise(resolve => rl.question(query, resolve));

const createBackup = async () => {
  try {
    console.log("💾 Creating backup of current data...");
    
    const backupData = {
      timestamp: new Date().toISOString(),
      users: await User.find({}).lean(),
      categories: await Category.find({}).lean(),
      products: await Product.find({}).lean(),
      conversations: await Conversation.find({}).lean(),
      messages: await Message.find({}).lean(),
      notifications: await Notification.find({}).lean(),
      orders: await Order.find({}).lean(),
    };

    const backupPath = path.join(
      __dirname,
      `../backups/pre_seed_backup_${Date.now()}.json`
    );
    const backupDir = path.dirname(backupPath);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log(`✅ Backup saved to: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error("❌ Failed to create backup:", error);
    return null;
  }
};

const clearDatabase = async () => {
  try {
    console.log("🧹 Clearing existing data...");
    await User.deleteMany({});
    await Category.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    await Order.deleteMany({});
    await Product.deleteMany({});
    console.log("✅ Database cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    throw error;
  }
};

const seedCategories = async () => {
  try {
    console.log("📦 Seeding categories...");
    
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

    const categories = await Category.insertMany(sampleCategories);
    console.log(`✅ Created ${categories.length} categories`);
    return categories;
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    throw error;
  }
};

const seedAdminUser = async () => {
  try {
    console.log("👨‍💼 Creating admin user...");
    
    const adminUser = await User.create({
      name: "System Administrator",
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      password: process.env.ADMIN_PASSWORD || "Password@123",
      phone: "+977 9817977212",
      role: "ADMIN",
      status: "APPROVED",
      isActive: true,
    });
    
    console.log("✅ Admin user created:", adminUser.email);
    return adminUser;
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  }
};

const seedCenters = async () => {
  try {
    console.log("🏢 Creating distribution centers...");
    
    const sampleCenters = [
      {
        name: "Kathmandu Distribution Center",
        email: "kathmandu@center.com",
        password"Password@123",
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
        name: "Beverages factory",
        email: "aryanshth3070@yopmail.com",
        password: process.env.CENTER_PASSWORD || "Password@123",
        phone: "+977 9801234572",
        role: "CENTER",
        status: "APPROVED",
        panNumber: "PANC654321098",
        province: "Bagmati",
        district: "Kathmandu",
        categories: ["Beverages"],
        isActive: true,
      },
    ];

    const centerUsers = [];
    for (const center of sampleCenters) {
      const centerUser = await User.create(center);
      centerUsers.push(centerUser);
      console.log(`✅ Created center: ${center.name}`);
    }
    
    console.log(`✅ Created ${centerUsers.length} distribution centers`);
    return centerUsers;
  } catch (error) {
    console.error("❌ Error creating centers:", error);
    throw error;
  }
};

const seedVendors = async () => {
  try {
    console.log("🏪 Creating vendor users...");
    
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

    const vendorUsers = [];
    for (const vendor of sampleVendors) {
      const vendorUser = await User.create(vendor);
      vendorUsers.push(vendorUser);
      console.log(`✅ Created vendor: ${vendor.businessName}`);
    }
    
    console.log(`✅ Created ${vendorUsers.length} vendor users`);
    return vendorUsers;
  } catch (error) {
    console.error("❌ Error creating vendors:", error);
    throw error;
  }
};

const seedProducts = async (vendorUsers, centerUsers) => {
  try {
    console.log("📦 Creating products...");

    const allProducts = [
      // Nepal Spices & Herbs Co. Products
      {
        name: "Organic Turmeric Powder",
        description: "Premium quality organic turmeric powder from Nepal",
        category: "Spices & Herbs",
        subcategory: "Ground Spices",
        price: 250,
        currency: "NPR",
        vendorId: vendorUsers[0]._id,
        availability: [
          {
            centerId: centerUsers[0]._id, // Kathmandu Distribution Center
            province: "Bagmati",
            district: "Kathmandu",
            stock: 100,
            reservedStock: 0,
          },
          {
            centerId: centerUsers[1]._id, // Pokhara Distribution Center
            province: "Gandaki",
            district: "Pokhara",
            stock: 50,
            reservedStock: 0,
          },
        ],
        specifications: {
          weight: { value: 500, unit: "g" },
          organic: true,
          origin: "Nepal",
          shelfLife: "24 months",
          brand: "Nepal Spices",
        },
        images: [{ filename: "spices.jpg", originalName: "spices.jpg", path: "/images/spices.jpg", url: "/image/placeholder.svg", isPrimary: true }],
        tags: ["organic", "spices", "turmeric", "healthy", "ayurvedic"],
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
            centerId: centerUsers[0]._id, // Kathmandu Distribution Center
            province: "Bagmati",
            district: "Kathmandu",
            stock: 50,
            reservedStock: 5,
          },
        ],
        specifications: {
          weight: { value: 250, unit: "g" },
          type: "Black Tea",
          origin: "Nepal Himalayas",
          caffeine: "Medium",
          brand: "Himalayan Tea Co.",
        },
        images: [{ filename: "beverages.jpg", originalName: "beverages.jpg", path: "/images/beverages.jpg", url: "/image/placeholder.svg", isPrimary: true }],
        tags: ["tea", "himalayan", "black tea", "premium", "organic"],
        status: "available",
      },

      // Trekking Gear Nepal Products
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
            centerId: centerUsers[1]._id, // Pokhara Distribution Center
            province: "Gandaki",
            district: "Pokhara",
            stock: 25,
            reservedStock: 2,
          },
          {
            centerId: centerUsers[0]._id, // Kathmandu Distribution Center
            province: "Bagmati",
            district: "Kathmandu",
            stock: 15,
            reservedStock: 0,
          },
        ],
        specifications: {
          capacity: "40L",
          material: "Ripstop Nylon",
          waterproof: true,
          compartments: 5,
          brand: "Trekking Gear Nepal",
        },
        images: [{ filename: "sports.jpg", originalName: "sports.jpg", path: "/images/sports.jpg", url: "/image/placeholder.svg", isPrimary: true }],
        tags: ["trekking", "backpack", "outdoor", "adventure", "hiking"],
        status: "available",
      },

      // Nepal Handicrafts Products
      {
        name: "Traditional Dhaka Top",
        description: "Handwoven traditional Nepali dhaka top with intricate patterns",
        category: "Clothing",
        subcategory: "Ethnic Wear",
        price: 1200,
        currency: "NPR",
        vendorId: vendorUsers[2]._id,
        availability: [
          {
            centerId: centerUsers[0]._id, // Kathmandu Distribution Center
            province: "Bagmati",
            district: "Kathmandu",
            stock: 50,
            reservedStock: 0,
          },
          {
            centerId: centerUsers[2]._id, // Biratnagar Distribution Center
            province: "Koshi",
            district: "Biratnagar",
            stock: 25,
            reservedStock: 0,
          },
        ],
        specifications: {
          material: "Cotton",
          color: "Multicolor",
          size: "M",
          handmade: true,
          brand: "Nepali Textiles",
        },
        images: [{ filename: "clothing.jpg", originalName: "clothing.jpg", path: "/images/clothing.jpg", url: "/image/placeholder.svg", isPrimary: true }],
        tags: ["traditional", "dhaka", "ethnic", "women", "handmade"],
        status: "available",
      },

      // Organic Farm Nepal Products
      {
        name: "Organic Honey",
        description: "Pure organic honey harvested from Himalayan wildflowers",
        category: "Beverages",
        subcategory: "Natural Products",
        price: 600,
        currency: "NPR",
        vendorId: vendorUsers[3]._id,
        availability: [
          {
            centerId: centerUsers[3]._id, // Chitwan Distribution Center
            province: "Bagmati",
            district: "Chitwan",
            stock: 80,
            reservedStock: 0,
          },
          {
            centerId: centerUsers[0]._id, // Kathmandu Distribution Center
            province: "Bagmati",
            district: "Kathmandu",
            stock: 40,
            reservedStock: 0,
          },
        ],
        specifications: {
          weight: { value: 500, unit: "g" },
          organic: true,
          source: "Himalayan Wildflowers",
          raw: true,
          brand: "Organic Farm Nepal",
        },
        images: [{ filename: "beverages.jpg", originalName: "beverages.jpg", path: "/images/beverages.jpg", url: "/image/placeholder.svg", isPrimary: true }],
        tags: ["organic", "honey", "natural", "himalayan", "raw"],
        status: "available",
      },

      // Tech Solutions Nepal Products
      {
        name: "Wireless Bluetooth Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        category: "Electronics",
        subcategory: "Audio",
        price: 2500,
        currency: "NPR",
        vendorId: vendorUsers[4]._id,
        availability: [
          {
            centerId: centerUsers[0]._id, // Kathmandu Distribution Center (closest to Lalitpur)
            province: "Bagmati",
            district: "Lalitpur",
            stock: 30,
            reservedStock: 0,
          },
          {
            centerId: centerUsers[0]._id, // Kathmandu Distribution Center
            province: "Bagmati",
            district: "Kathmandu",
            stock: 20,
            reservedStock: 0,
          },
        ],
        specifications: {
          connectivity: "Bluetooth 5.0",
          batteryLife: "20 hours",
          noiseCancellation: true,
          color: "Black",
          brand: "Tech Solutions",
        },
        images: [{ filename: "bluetooth_headphones.jpg", originalName: "bluetooth_headphones.jpg", path: "/images/bluetooth_headphones.jpg", url: "/image/placeholder.svg", isPrimary: true }],
        tags: ["wireless", "bluetooth", "headphones", "audio", "tech"],
        status: "available",
      },
    ];

    const createdProducts = [];
    for (const product of allProducts) {
      const createdProduct = await Product.create(product);
      createdProducts.push(createdProduct);
      console.log(`✅ Created product: ${product.name}`);
    }

    console.log(`✅ Created ${createdProducts.length} products`);
    return createdProducts;
  } catch (error) {
    console.error("❌ Error creating products:", error);
    throw error;
  }
};

const seedConversationsAndMessages = async (centerUsers, vendorUsers) => {
  try {
    console.log("💬 Creating conversations and messages...");
    
    const conversations = [];
    const messages = [];

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
      content: "Thank you for your interest! We can offer competitive prices for bulk orders. How many units are you looking for?",
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
      content: "For 100 units, we can offer NPR 200 per unit. This includes free delivery within Kathmandu.",
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

    console.log(`✅ Created ${conversations.length} conversations and ${messages.length} messages`);
    return { conversations, messages };
  } catch (error) {
    console.error("❌ Error creating conversations/messages:", error);
    throw error;
  }
};

const seedNotifications = async (adminUser, centerUsers, vendorUsers) => {
  try {
    console.log("🔔 Creating notifications...");
    
    const notifications = [];

    // Notification for vendor about new message
    const notification1 = await Notification.create({
      recipient: vendorUsers[0]._id,
      title: "New Message",
      message: "You have a new message from Kathmandu Distribution Center",
      type: "MESSAGE",
      relatedId: null,
      isRead: false,
    });
    notifications.push(notification1);

    // Notification for center about new message
    const notification2 = await Notification.create({
      recipient: centerUsers[1]._id,
      title: "New Message",
      message: "You have a new message from Trekking Gear Nepal",
      type: "MESSAGE",
      relatedId: null,
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

    console.log(`✅ Created ${notifications.length} notifications`);
    return notifications;
  } catch (error) {
    console.error("❌ Error creating notifications:", error);
    throw error;
  }
};

const seedOrders = async (centerUsers, vendorUsers, products) => {
  try {
    console.log("📋 Creating orders...");
    
    const orders = [];

    // Order from Kathmandu Center to Nepal Spices
    const order1 = await Order.create({
      centerId: centerUsers[0]._id,
      vendorId: vendorUsers[0]._id,
      items: [
        {
          productId: products[0]._id, // Organic Turmeric Powder
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
          productId: products[1]._id, // Himalayan Black Tea
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
    console.log("✅ Created order from Kathmandu Center to Nepal Spices");

    // Order from Pokhara Center to Trekking Gear Nepal
    const order2 = await Order.create({
      centerId: centerUsers[1]._id,
      vendorId: vendorUsers[1]._id,
      items: [
        {
          productId: products[2]._id, // Trekking Backpack 40L
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
    console.log("✅ Created order from Pokhara Center to Trekking Gear Nepal");

    console.log(`✅ Created ${orders.length} orders`);
    return orders;
  } catch (error) {
    console.error("❌ Error creating orders:", error);
    throw error;
  }
};

const showApprovedEntities = async () => {
  try {
    console.log("\n📊 APPROVED VENDORS AND CENTERS:");
    console.log("==================================");

    // Show approved vendors
    const approvedVendors = await User.find({ 
      role: "VENDOR", 
      status: "APPROVED" 
    }).select("name email businessName district province categories");

    console.log("\n🏪 APPROVED VENDORS:");
    console.log("===================");
    approvedVendors.forEach((vendor, index) => {
      console.log(`${index + 1}. ${vendor.businessName || vendor.name}`);
      console.log(`   📧 Email: ${vendor.email}`);
      console.log(`   📍 Location: ${vendor.district}, ${vendor.province}`);
      if (vendor.categories && vendor.categories.length > 0) {
        console.log(`   📂 Categories: ${vendor.categories.join(", ")}`);
      }
      console.log(`   🆔 ID: ${vendor._id}`);
      console.log("");
    });

    // Show approved centers
    const approvedCenters = await User.find({ 
      role: "CENTER", 
      status: "APPROVED" 
    }).select("name email district province categories");

    console.log("🏢 APPROVED DISTRIBUTION CENTERS:");
    console.log("================================");
    approvedCenters.forEach((center, index) => {
      console.log(`${index + 1}. ${center.name}`);
      console.log(`   📧 Email: ${center.email}`);
      console.log(`   📍 Location: ${center.district}, ${center.province}`);
      if (center.categories && center.categories.length > 0) {
        console.log(`   📂 Categories: ${center.categories.join(", ")}`);
      }
      console.log(`   🆔 ID: ${center._id}`);
      console.log("");
    });

    // Show products by vendor
    console.log("📦 PRODUCTS BY VENDOR:");
    console.log("======================");
    for (const vendor of approvedVendors) {
      const vendorProducts = await Product.find({ vendorId: vendor._id })
        .select("name category price stock status");
      
      console.log(`\n🏪 ${vendor.businessName || vendor.name}:`);
      if (vendorProducts.length > 0) {
        vendorProducts.forEach((product, pIndex) => {
          console.log(`   ${pIndex + 1}. ${product.name}`);
          console.log(`      📂 Category: ${product.category}`);
          console.log(`      💰 Price: NPR ${product.price}`);
          console.log(`      📊 Status: ${product.status}`);
          const totalStock = product.availability?.reduce((sum, loc) => sum + (loc.stock || 0), 0) || 0;
          console.log(`      📦 Total Stock: ${totalStock}`);
        });
      } else {
        console.log("   No products found");
      }
    }

  } catch (error) {
    console.error("❌ Error showing approved entities:", error);
  }
};

const seedDatabase = async (mode = "full") => {
  try {
    console.log("🌱 Starting database seeding...");
    
    // Check if data already exists
    const existingUsers = await User.countDocuments();
    
    if (existingUsers > 0 && mode === "full") {
      console.log("📊 Database already contains data.");
      console.log(`Found ${existingUsers} existing users.`);
      
      const answer = await question("❓ Do you want to clear all existing data and reseed? (yes/no): ");
      if (answer.toLowerCase() !== 'yes') {
        console.log("🚫 Seeding cancelled.");
        rl.close();
        await mongoose.connection.close();
        return;
      }
      
      // Create backup before clearing
      await createBackup();
      await clearDatabase();
    }

    console.log("📭 Proceeding with seeding...");

    // Seed in sequence
    const categories = await seedCategories();
    const adminUser = await seedAdminUser();
    const centerUsers = await seedCenters();
    const vendorUsers = await seedVendors();
    const products = await seedProducts(vendorUsers, centerUsers);
    const { conversations, messages } = await seedConversationsAndMessages(centerUsers, vendorUsers);
    const notifications = await seedNotifications(adminUser, centerUsers, vendorUsers);
    const orders = await seedOrders(centerUsers, vendorUsers, products);

    // Show comprehensive summary
    console.log("\n🎉 COMPREHENSIVE DATABASE SEEDING COMPLETED!");
    console.log("============================================");
    console.log(`👤 Admin Users: 1`);
    console.log(`🏢 Distribution Centers: ${centerUsers.length}`);
    console.log(`🏪 Vendors: ${vendorUsers.length}`);
    console.log(`📂 Categories: ${categories.length}`);
    console.log(`📦 Products: ${products.length}`);
    console.log(`💬 Conversations: ${conversations.length}`);
    console.log(`📨 Messages: ${messages.length}`);
    console.log(`🔔 Notifications: ${notifications.length}`);
    console.log(`📋 Orders: ${orders.length}`);

    // Show approved vendors and centers with their details
    await showApprovedEntities();

    console.log("\n🔑 LOGIN CREDENTIALS:");
    console.log("====================");
    console.log("👨‍💼 Admin:");
    console.log(`   Email: ${process.env.ADMIN_EMAIL || "admin@example.com"}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || "Password@123"}`);
    
    console.log("\n🏢 Distribution Centers:");
    centerUsers.forEach(center => {
      console.log(`   ${center.name}:`);
      console.log(`      Email: ${center.email}`);
      console.log(`      Password: ${process.env.CENTER_PASSWORD || "Password@123"}`);
    });

    console.log("\n🏪 Vendors:");
    vendorUsers.forEach(vendor => {
      console.log(`   ${vendor.businessName || vendor.name}:`);
      console.log(`      Email: ${vendor.email}`);
      console.log(`      Password: ${process.env.VENDOR_PASSWORD || "Password@123"}`);
    });

    console.log("\n🚀 Your VendorRS application is now ready with comprehensive sample data!");
    console.log("💡 All vendors and centers are APPROVED and ready for testing!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    console.error(error.stack);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log("🔒 Database connection closed");
  }
};

// Handle command line arguments
const mode = process.argv.includes("--safe") ? "safe" : 
            process.argv.includes("--minimal") ? "minimal" : "full";

// Run the seeding
connectDB().then(() => {
  seedDatabase(mode);
});

module.exports = { seedDatabase };
