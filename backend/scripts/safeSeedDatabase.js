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
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

const safeSeedDatabase = async () => {
  try {
    console.log("🛡️ Starting SAFE database seeding...");
    
    // TRIPLE SAFETY CHECK
    const existingUsers = await User.countDocuments();
    const existingCategories = await Category.countDocuments();
    const existingProducts = await Product.countDocuments();
    
    console.log(`📊 Current Database State:`);
    console.log(`   Users: ${existingUsers}`);
    console.log(`   Categories: ${existingCategories}`);
    console.log(`   Products: ${existingProducts}`);
    
    // Check for force flag
    const forceFlag = process.argv.includes('--force');
    const confirmFlag = process.argv.includes('--confirm');
    
    if (existingUsers > 0 && !forceFlag) {
      console.log("\n⚠️  DATABASE CONTAINS DATA!");
      console.log("🔒 Seeding BLOCKED to protect existing data.");
      console.log("\n📋 Found existing data:");
      
      // Show existing users by role
      const adminCount = await User.countDocuments({ role: 'ADMIN' });
      const vendorCount = await User.countDocuments({ role: 'VENDOR' });
      const centerCount = await User.countDocuments({ role: 'CENTER' });
      
      console.log(`   👨‍💼 Admins: ${adminCount}`);
      console.log(`   🏪 Vendors: ${vendorCount}`);
      console.log(`   🏢 Centers: ${centerCount}`);
      
      console.log("\n🚨 To force seeding (WILL DELETE ALL DATA):");
      console.log("   node scripts/safeSeedDatabase.js --force --confirm");
      console.log("\n💡 To check users: node scripts/checkAllUsers.js");
      return;
    }
    
    if (forceFlag && !confirmFlag) {
      console.log("\n⚠️  FORCE FLAG DETECTED!");
      console.log("🔒 Confirmation required to proceed.");
      console.log("\n🚨 This will DELETE ALL existing data!");
      console.log("   Add --confirm flag to proceed:");
      console.log("   node scripts/safeSeedDatabase.js --force --confirm");
      return;
    }
    
    if (forceFlag && confirmFlag) {
      console.log("\n🚨 FORCE SEEDING CONFIRMED - DELETING ALL DATA!");
      
      // Create backup before deletion
      const backupData = {
        timestamp: new Date().toISOString(),
        users: await User.find({}).lean(),
        categories: await Category.find({}).lean(),
        products: await Product.find({}).lean(),
        orders: await Order.find({}).lean()
      };
      
      const backupPath = path.join(__dirname, `../backups/force_backup_${Date.now()}.json`);
      const backupDir = path.dirname(backupPath);
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
      console.log(`💾 Backup created: ${backupPath}`);
    }
    
    // Proceed with seeding only if database is empty OR force confirmed
    if (existingUsers === 0 || (forceFlag && confirmFlag)) {
      console.log("🌱 Proceeding with database seeding...");
      
      // Clear existing data only if forced
      if (forceFlag && confirmFlag) {
        await User.deleteMany({});
        await Category.deleteMany({});
        await Conversation.deleteMany({});
        await Message.deleteMany({});
        await Notification.deleteMany({});
        await Order.deleteMany({});
        await Product.deleteMany({});
        console.log("🧹 Cleared existing data");
      }
      
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
      
      // Add sample categories
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
          subcategories: ["Men's Wear", "Women's Wear", "Ethnic Wear", "Kids Wear"],
          isActive: true,
        },
        {
          name: "Books",
          description: "Books and educational materials",
          subcategories: ["Fiction", "Non-Fiction", "Educational", "Technical"],
          isActive: true,
        }
      ];
      
      await Category.insertMany(sampleCategories);
      console.log(`📦 Created ${sampleCategories.length} sample categories`);
      
      // Create sample distribution centers
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
          categories: ["Electronics", "Clothing", "Books"],
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
          categories: ["Clothing", "Books"],
          isActive: true,
        }
      ];
      
      const centerUsers = [];
      for (const center of sampleCenters) {
        const centerUser = await User.create(center);
        centerUsers.push(centerUser);
        console.log(`🏢 Created center user: ${center.name}`);
      }
      
      // Create sample vendors
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
        }
      ];
      
      const vendorUsers = [];
      for (const vendor of sampleVendors) {
        const vendorUser = await User.create(vendor);
        vendorUsers.push(vendorUser);
        console.log(`🏪 Created vendor user: ${vendor.businessName}`);
      }
      
      console.log("\n✅ Safe database seeding completed successfully!");
      console.log("\n📊 Seeding Summary:");
      console.log(`   👤 Admin Users: 1`);
      console.log(`   🏢 Distribution Centers: ${centerUsers.length}`);
      console.log(`   🏪 Vendors: ${vendorUsers.length}`);
      console.log(`   📂 Categories: ${sampleCategories.length}`);
    }
    
  } catch (error) {
    console.error("❌ Error in safe seeding:", error);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log("🔒 Database connection closed");
  }
};

// Run the safe seeding
connectDB().then(() => {
  safeSeedDatabase();
});

module.exports = { safeSeedDatabase };