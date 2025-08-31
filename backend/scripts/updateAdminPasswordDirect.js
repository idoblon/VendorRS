require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function updateAdminPasswordDirect() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Hash new password
    const newPassword = "Password@123";
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password directly in database
    const result = await User.updateOne(
      { email: "admin@example.com" },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount === 1) {
      console.log(`✅ Admin password updated directly in database to: ${newPassword}`);
    } else {
      console.log("❌ Failed to update admin password");
      return;
    }

    // Verify the new password works
    const adminUser = await User.findOne({ email: "admin@example.com" });
    const isMatch = await bcrypt.compare(newPassword, adminUser.password);
    console.log(`Password verification: ${isMatch ? "✅ Success" : "❌ Failed"}`);

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

updateAdminPasswordDirect();
