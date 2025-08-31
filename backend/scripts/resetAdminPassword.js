require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function resetAdminPassword() {
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
    console.log(`  Current Password Hash: ${adminUser.password}`);

    // Hash new password
    const newPassword = "Password@123";
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password without triggering pre-save hook
    adminUser.set('password', hashedPassword);
    await adminUser.save();

    console.log(`\n✅ Admin password reset to: ${newPassword}`);
    console.log(`  New Password Hash: ${hashedPassword}`);

    // Reload user from database to get updated password
    const updatedUser = await User.findById(adminUser._id);

    // Verify the new password works
    const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
    console.log(`  Password verification: ${isMatch ? "✅ Success" : "❌ Failed"}`);

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

resetAdminPassword();
