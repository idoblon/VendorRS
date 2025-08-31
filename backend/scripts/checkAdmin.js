require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function checkAdminUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Find all admin users
    const adminUsers = await User.find({ role: "ADMIN" });

    if (adminUsers.length === 0) {
      console.log("❌ No admin users found in the database");
      console.log("💡 Suggestion: Run the seed database script to create admin user");
      console.log("   Command: cd backend && npm run seed");
    } else {
      console.log(`✅ Found ${adminUsers.length} admin user(s):`);
      adminUsers.forEach((user, index) => {
        console.log(`\nAdmin ${index + 1}:`);
        console.log(`  ID: ${user._id}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Status: ${user.status}`);
        console.log(`  Active: ${user.isActive}`);
        console.log(`  Password Hash: ${user.password ? user.password.substring(0, 20) + "..." : "No password"}`);
        console.log(`  Password Length: ${user.password ? user.password.length : 0}`);
      });
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

checkAdminUsers();
