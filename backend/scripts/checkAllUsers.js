require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const checkAllUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Get all users with their status
    const allUsers = await User.find({})
      .select(
        "name email role status businessName district province createdAt updatedAt"
      )
      .sort({ createdAt: -1 });

    console.log("\n📊 ALL USERS IN DATABASE:");
    console.log("==========================");
    console.log(`Total Users: ${allUsers.length}\n`);

    // Group by role and status
    const usersByRole = {
      ADMIN: allUsers.filter((u) => u.role === "ADMIN"),
      VENDOR: allUsers.filter((u) => u.role === "VENDOR"),
      CENTER: allUsers.filter((u) => u.role === "CENTER"),
    };

    Object.keys(usersByRole).forEach((role) => {
      const users = usersByRole[role];
      if (users.length > 0) {
        console.log(`\n🔹 ${role} USERS (${users.length}):`);
        users.forEach((user, index) => {
          console.log(`${index + 1}. ${user.name}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Status: ${user.status}`);
          if (user.businessName)
            console.log(`   Business: ${user.businessName}`);
          if (user.district)
            console.log(`   Location: ${user.district}, ${user.province}`);
          console.log(`   Created: ${user.createdAt}`);
          console.log(`   Updated: ${user.updatedAt}`);
          console.log(`   ID: ${user._id}\n`);
        });
      }
    });

    // Status summary
    const statusCounts = {
      PENDING: allUsers.filter((u) => u.status === "PENDING").length,
      APPROVED: allUsers.filter((u) => u.status === "APPROVED").length,
      REJECTED: allUsers.filter((u) => u.status === "REJECTED").length,
      SUSPENDED: allUsers.filter((u) => u.status === "SUSPENDED").length,
    };

    console.log("\n📈 STATUS SUMMARY:");
    console.log("==================");
    Object.keys(statusCounts).forEach((status) => {
      console.log(`${status}: ${statusCounts[status]}`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔒 Disconnected from MongoDB");
  }
};

checkAllUsers();
