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
    console.log("🌱 Starting database seeding with sample data...");

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

    // Seed categories
    const sampleCategories = [
      { name: "Furniture" },
      { name: "Electronics" },
      { name: "Clothing" },
      { name: "Footwear" },
      { name: "Accessories" },
      { name: "Books" },
      { name: "Sports" },
      { name: "Home & Garden" },
      { name: "Automotive" },
      { name: "Health & Beauty" },
      { name: "Spices & Herbs" },
      { name: "Grains & Pulses" },
      { name: "Beverages" },
      { name: "Snacks & Sweets" },
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
            name: "Prakash Gurung",
            phone: "+977 9801234569",
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

    // Create conversations between vendors and centers
    const conversations = [];

    // Create conversation between Kathmandu Center and Nepal Spices & Herbs
    const conversation1 = await Conversation.create({
      participants: [
        {
          user: centerUsers[0]._id,
          role: "CENTER",
        },
        {
          user: vendorUsers[0]._id,
          role: "VENDOR",
        },
      ],
      conversationType: "VENDOR_CENTER",
      title: "Spices & Herbs Order Discussion",
      description:
        "Discussion about spice orders between Kathmandu Center and Nepal Spices & Herbs",
      isActive: true,
    });
    conversations.push(conversation1);
    console.log(
      "💬 Created conversation between Kathmandu Center and Nepal Spices & Herbs"
    );

    // Create conversation between Pokhara Center and Trekking Gear Nepal
    const conversation2 = await Conversation.create({
      participants: [
        {
          user: centerUsers[1]._id,
          role: "CENTER",
        },
        {
          user: vendorUsers[1]._id,
          role: "VENDOR",
        },
      ],
      conversationType: "VENDOR_CENTER",
      title: "Trekking Gear Order Discussion",
      description:
        "Discussion about trekking gear orders between Pokhara Center and Trekking Gear Nepal",
      isActive: true,
    });
    conversations.push(conversation2);
    console.log(
      "💬 Created conversation between Pokhara Center and Trekking Gear Nepal"
    );

    // Create conversation between Biratnagar Center and Nepal Handicrafts
    const conversation3 = await Conversation.create({
      participants: [
        {
          user: centerUsers[2]._id,
          role: "CENTER",
        },
        {
          user: vendorUsers[2]._id,
          role: "VENDOR",
        },
      ],
      conversationType: "VENDOR_CENTER",
      title: "Handicrafts Order Discussion",
      description:
        "Discussion about handicrafts orders between Biratnagar Center and Nepal Handicrafts",
      isActive: true,
    });
    conversations.push(conversation3);
    console.log(
      "💬 Created conversation between Biratnagar Center and Nepal Handicrafts"
    );

    // Create sample messages for conversations
    const messages = [];

    // Messages for conversation 1 (Kathmandu Center - Nepal Spices & Herbs)
    const message1 = await Message.create({
      conversationId: conversation1._id.toString(),
      sender: centerUsers[0]._id,
      receiver: vendorUsers[0]._id,
      content:
        "Hello! We are interested in placing an order for your premium spices. Could you please share your latest catalog?",
      messageType: "text",
    });
    messages.push(message1);

    const message2 = await Message.create({
      conversationId: conversation1._id.toString(),
      sender: vendorUsers[0]._id,
      receiver: centerUsers[0]._id,
      content:
        "Hello! Thank you for your interest. Please find attached our latest catalog with all our premium spices.",
      messageType: "text",
      attachments: [
        {
          filename: "spices_catalog.pdf",
          originalName: "spices_catalog.pdf",
          path: "/uploads/spices_catalog.pdf",
          size: 1024000,
          mimeType: "application/pdf",
        },
      ],
    });
    messages.push(message2);

    const message3 = await Message.create({
      conversationId: conversation1._id.toString(),
      sender: centerUsers[0]._id,
      receiver: vendorUsers[0]._id,
      content:
        "Thank you for sharing the catalog. We are interested in ordering 50kg of Turmeric Powder and 30kg of Cumin Seeds.",
      messageType: "text",
    });
    messages.push(message3);

    // Update conversation with last message
    conversation1.lastMessage = {
      content: message3.content,
      sender: centerUsers[0]._id,
      timestamp: message3.createdAt,
      messageType: message3.messageType,
    };
    conversation1.metadata.totalMessages = 3;
    conversation1.metadata.lastActivityAt = message3.createdAt;
    await conversation1.save();

    // Messages for conversation 2 (Pokhara Center - Trekking Gear Nepal)
    const message4 = await Message.create({
      conversationId: conversation2._id.toString(),
      sender: centerUsers[1]._id,
      receiver: vendorUsers[1]._id,
      content:
        "Hi there! We'd like to know about your trekking backpack options.",
      messageType: "text",
    });
    messages.push(message4);

    const message5 = await Message.create({
      conversationId: conversation2._id.toString(),
      sender: vendorUsers[1]._id,
      receiver: centerUsers[1]._id,
      content:
        "Sure! We have various backpacks ranging from 30L to 80L capacity. Would you like to see our selection?",
      messageType: "text",
    });
    messages.push(message5);

    // Update conversation with last message
    conversation2.lastMessage = {
      content: message5.content,
      sender: vendorUsers[1]._id,
      timestamp: message5.createdAt,
      messageType: message5.messageType,
    };
    conversation2.metadata.totalMessages = 2;
    conversation2.metadata.lastActivityAt = message5.createdAt;
    await conversation2.save();

    // Create sample notifications
    const notifications = [];

    // Notification for admin about new vendor application
    const notification1 = await Notification.create({
      recipient: adminUser._id,
      sender: vendorUsers[0]._id,
      type: "VENDOR_APPLICATION",
      title: "New Vendor Application",
      message: "Nepal Spices & Herbs Co. has applied to join the platform.",
      relatedId: vendorUsers[0]._id,
      onModel: "User",
    });
    notifications.push(notification1);

    // Notification for admin about new center application
    const notification2 = await Notification.create({
      recipient: adminUser._id,
      sender: centerUsers[0]._id,
      type: "CENTER_APPLICATION",
      title: "New Center Application",
      message:
        "Kathmandu Distribution Center has applied to join the platform.",
      relatedId: centerUsers[0]._id,
      onModel: "User",
    });
    notifications.push(notification2);

    // Notification for center about order status update
    const notification3 = await Notification.create({
      recipient: centerUsers[0]._id,
      sender: vendorUsers[0]._id,
      type: "ORDER_UPDATE",
      title: "Order Status Update",
      message:
        "Your order for spices has been confirmed and is now in processing.",
      relatedId: null, // Will be set when order is created
      onModel: null,
    });
    notifications.push(notification3);

    console.log(`🔔 Created ${notifications.length} sample notifications`);

    // Create sample products for vendors
    const products = [];

    // Products for Nepal Spices & Herbs (using valid category)
    const product1 = await Product.create({
      name: "Premium Turmeric Powder",
      description:
        "High-quality turmeric powder sourced from organic farms in Nepal",
      category: "Health & Beauty", // Using valid category
      subcategory: "Turmeric",
      price: 500,
      currency: "NPR",
      vendorId: vendorUsers[0]._id,
      availability: [
        {
          province: "Bagmati",
          district: "Kathmandu",
          stock: 100,
          reservedStock: 0,
        },
        {
          province: "Gandaki",
          district: "Pokhara",
          stock: 50,
          reservedStock: 0,
        },
      ],
      specifications: {
        weight: {
          value: 1000,
          unit: "g",
        },
        color: "Golden Yellow",
        brand: "Nepal Spices",
        warranty: {
          duration: 12,
          unit: "months",
          terms: "12-month shelf life from manufacturing date",
        },
      },
      images: [
        {
          filename: "turmeric_powder.jpg",
          originalName: "turmeric_powder.jpg",
          path: "/images/turmeric_powder.jpg",
          url: "https://example.com/images/turmeric_powder.jpg",
          isPrimary: true,
        },
      ],
      tags: ["organic", "premium", "spice"],
      status: "available",
    });
    products.push(product1);

    const product2 = await Product.create({
      name: "Cumin Seeds",
      description: "Freshly ground cumin seeds with rich aroma and flavor",
      category: "Health & Beauty", // Using valid category
      subcategory: "Cumin",
      price: 300,
      currency: "NPR",
      vendorId: vendorUsers[0]._id,
      availability: [
        {
          province: "Bagmati",
          district: "Kathmandu",
          stock: 150,
          reservedStock: 0,
        },
      ],
      specifications: {
        weight: {
          value: 500,
          unit: "g",
        },
        color: "Dark Brown",
        brand: "Nepal Spices",
        warranty: {
          duration: 12,
          unit: "months",
          terms: "12-month shelf life from manufacturing date",
        },
      },
      images: [
        {
          filename: "cumin_seeds.jpg",
          originalName: "cumin_seeds.jpg",
          path: "/images/cumin_seeds.jpg",
          url: "https://example.com/images/cumin_seeds.jpg",
          isPrimary: true,
        },
      ],
      tags: ["organic", "spice", "seasoning"],
      status: "available",
    });
    products.push(product2);

    // Products for Trekking Gear Nepal (using valid category)
    const product3 = await Product.create({
      name: "Trekking Backpack 40L",
      description:
        "Durable trekking backpack with multiple compartments and comfortable straps",
      category: "Sports", // Using valid category
      subcategory: "Backpacks",
      price: 2500,
      currency: "NPR",
      vendorId: vendorUsers[1]._id,
      availability: [
        {
          province: "Gandaki",
          district: "Pokhara",
          stock: 20,
          reservedStock: 0,
        },
      ],
      specifications: {
        dimensions: {
          length: 40,
          width: 25,
          height: 15,
          unit: "cm",
        },
        weight: {
          value: 1200,
          unit: "g",
        },
        color: "Black",
        material: "Water-resistant nylon",
        brand: "Trekking Gear Nepal",
        warranty: {
          duration: 24,
          unit: "months",
          terms: "2-year warranty on stitching and zippers",
        },
      },
      images: [
        {
          filename: "trekking_backpack.jpg",
          originalName: "trekking_backpack.jpg",
          path: "/images/trekking_backpack.jpg",
          url: "https://example.com/images/trekking_backpack.jpg",
          isPrimary: true,
        },
      ],
      tags: ["trekking", "outdoor", "backpack"],
      status: "available",
    });
    products.push(product3);

    // Products for Nepal Handicrafts (using valid category)
    const product4 = await Product.create({
      name: "Handwoven Thangka Painting",
      description: "Authentic handwoven thangka painting from Tibet",
      category: "Accessories", // Using valid category
      subcategory: "Art & Craft",
      price: 15000,
      currency: "NPR",
      vendorId: vendorUsers[2]._id,
      availability: [
        {
          province: "Koshi",
          district: "Biratnagar",
          stock: 5,
          reservedStock: 0,
        },
      ],
      specifications: {
        dimensions: {
          length: 30,
          width: 20,
          unit: "cm",
        },
        weight: {
          value: 200,
          unit: "g",
        },
        color: "Multicolor",
        material: "Cotton and silk",
        brand: "Nepal Handicrafts",
        warranty: {
          duration: 6,
          unit: "months",
          terms: "6-month warranty on fabric and colors",
        },
      },
      images: [
        {
          filename: "thangka_painting.jpg",
          originalName: "thangka_painting.jpg",
          path: "/images/thangka_painting.jpg",
          url: "https://example.com/images/thangka_painting.jpg",
          isPrimary: true,
        },
      ],
      tags: ["handmade", "art", "tibetan"],
      status: "available",
    });
    products.push(product4);

    console.log(`📦 Created ${products.length} sample products`);

    // Create sample orders
    const orders = [];

    // Order from Kathmandu Center to Nepal Spices & Herbs
    const order1 = await Order.create({
      centerId: centerUsers[0]._id,
      vendorId: vendorUsers[0]._id,
      items: [
        {
          productId: product1._id,
          productName: "Premium Turmeric Powder",
          quantity: 50,
          unitPrice: 500,
          totalPrice: 25000,
          specifications: {
            color: "Golden Yellow",
            size: "1000g",
          },
        },
        {
          productId: product2._id,
          productName: "Cumin Seeds",
          quantity: 30,
          unitPrice: 300,
          totalPrice: 9000,
          specifications: {
            color: "Dark Brown",
            size: "500g",
          },
        },
      ],
      orderSummary: {
        subtotal: 34000,
        tax: {
          rate: 13,
          amount: 4420,
        },
        shipping: {
          method: "Standard",
          cost: 500,
        },
        discount: {
          type: "percentage",
          value: 5,
          amount: 1700,
        },
        totalAmount: 37220,
      },
      status: "CONFIRMED",
      deliveryDetails: {
        expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        address: {
          street: "123 Main Street",
          city: "Kathmandu",
          state: "Bagmati",
          pincode: "44600",
          country: "Nepal",
        },
        instructions: "Deliver to the main office",
      },
      payment: {
        method: "Bank Transfer",
        status: "COMPLETED",
        transactionId: "BANK123456789",
        paidAmount: 37220,
        paidDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      priority: "HIGH",
      tags: ["spices", "premium"],
      notes: "Special order for festival season",
    });
    orders.push(order1);
    console.log(
      "📦 Created order from Kathmandu Center to Nepal Spices & Herbs"
    );

    // Update conversation with order reference
    conversation1.orderReference = order1._id;
    await conversation1.save();

    // Order from Pokhara Center to Trekking Gear Nepal
    const order2 = await Order.create({
      centerId: centerUsers[1]._id,
      vendorId: vendorUsers[1]._id,
      items: [
        {
          productId: product3._id,
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

    console.log("✅ Database seeding completed successfully!");
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
