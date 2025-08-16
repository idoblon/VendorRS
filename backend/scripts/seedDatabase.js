require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require('fs');
const path = require('path');

// Import models
const User = require("../models/User");
const Category = require("../models/Category");

const connectDB = async () => {
  console.log(process.env.MONGODB_URI, "this is the uri");
  try {
    await mongoose.connect(
      "mongodb+srv://enriquednes:7SklmNmEYOr80f1C@cluster0.nva9zxz.mongodb.net/",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    console.log("🧹 Cleared existing data");

    // Create Admin User with secure credentials
     await User.create({
      name: "System Administrator",
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      password: "Password@123",
      phone: "+91 9999999999",
      role: "ADMIN",
      status: "APPROVED",
      isActive: true,
    });
    console.log("👨‍💼 Created admin user");

     // seed category
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
      { name: "Health & Beauty" }
    ];

    await Category.insertMany(sampleCategories);
    console.log(`📦 Created ${sampleCategories.length} sample categories`);
    // Define centers with province and district information
    
    // Create Center Users with province and district information

  } catch (error) {
    console.error("❌ Error seeding database:", error);
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
