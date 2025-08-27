require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Order = require("../models/Order");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

const monitorDatabase = async () => {
  try {
    console.log("📊 Database Monitoring Report");
    console.log("=" .repeat(50));
    
    // Count all collections
    const userCount = await User.countDocuments();
    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    
    console.log(`\n📈 Collection Counts:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Categories: ${categoryCount}`);
    console.log(`   Products: ${productCount}`);
    console.log(`   Orders: ${orderCount}`);
    
    // User breakdown by role and status
    const adminCount = await User.countDocuments({ role: 'ADMIN' });
    const vendorCount = await User.countDocuments({ role: 'VENDOR' });
    const centerCount = await User.countDocuments({ role: 'CENTER' });
    
    console.log(`\n👥 Users by Role:`);
    console.log(`   👨‍💼 Admins: ${adminCount}`);
    console.log(`   🏪 Vendors: ${vendorCount}`);
    console.log(`   🏢 Centers: ${centerCount}`);
    
    // Status breakdown
    const approvedUsers = await User.countDocuments({ status: 'APPROVED' });
    const pendingUsers = await User.countDocuments({ status: 'PENDING' });
    const rejectedUsers = await User.countDocuments({ status: 'REJECTED' });
    
    console.log(`\n📋 Users by Status:`);
    console.log(`   ✅ Approved: ${approvedUsers}`);
    console.log(`   ⏳ Pending: ${pendingUsers}`);
    console.log(`   ❌ Rejected: ${rejectedUsers}`);
    
    // Recent activity
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role status createdAt');
    
    console.log(`\n🕒 Recent Users (Last 5):`);
    recentUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.role}) - ${user.status} - ${user.createdAt.toLocaleDateString()}`);
    });
    
    // Database health check
    const dbStats = await mongoose.connection.db.stats();
    console.log(`\n💾 Database Stats:`);
    console.log(`   Collections: ${dbStats.collections}`);
    console.log(`   Data Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Index Size: ${(dbStats.indexSize / 1024 / 1024).toFixed(2)} MB`);
    
    console.log(`\n✅ Database monitoring completed!`);
    
  } catch (error) {
    console.error("❌ Error monitoring database:", error);
  } finally {
    await mongoose.connection.close();
  }
};

connectDB().then(() => {
  monitorDatabase();
});