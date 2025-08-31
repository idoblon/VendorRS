require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function testAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Find admin user
    const adminUser = await User.findOne({ email: "admin@example.com" });

    if (!adminUser) {
      console.log("❌ Admin user not found");
      return;
    }

    console.log("Admin user found:");
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  Password Hash: ${adminUser.password}`);

    // Test password comparison
    const testPassword = "Password@123";
    const isMatch = await bcrypt.compare(testPassword, adminUser.password);

    console.log(`\nTesting password "${testPassword}":`);
    console.log(`  Password matches: ${isMatch}`);

    if (!isMatch) {
      console.log("❌ Password does not match!");
      console.log("💡 The stored password hash may not correspond to 'Password@123'");
      console.log("💡 Suggestion: Reset admin password or re-seed database");
    } else {
      console.log("✅ Password matches correctly");
      console.log("💡 The password is correct, login should work");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

testAdminPassword();
