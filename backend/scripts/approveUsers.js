require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

const approveUsers = async () => {
  try {
    console.log("🔍 Finding pending users...");

    // Find all pending centers and vendors
    const pendingUsers = await User.find({
      role: { $in: ["CENTER", "VENDOR"] },
      status: "PENDING",
    });

    console.log(`📋 Found ${pendingUsers.length} pending users:`);
    pendingUsers.forEach((user) => {
      console.log(
        `  - ${user.email} (${user.role}) - ${user.name || user.businessName}`
      );
    });

    if (pendingUsers.length === 0) {
      console.log("✅ No pending users found.");
      return;
    }

    // Approve all pending users
    const result = await User.updateMany(
      {
        role: { $in: ["CENTER", "VENDOR"] },
        status: "PENDING",
      },
      {
        $set: {
          status: "APPROVED",
          updatedAt: new Date(),
        },
      }
    );

    console.log(`✅ Successfully approved ${result.modifiedCount} users.`);

    // Verify the updates
    const approvedUsers = await User.find({
      role: { $in: ["CENTER", "VENDOR"] },
      status: "APPROVED",
    }).select("email role name businessName status");

    console.log(`\n📊 Total approved users: ${approvedUsers.length}`);
    console.log("\n✅ Approved users can now login:");
    approvedUsers.forEach((user) => {
      console.log(`  - ${user.email} (${user.role}) - Status: ${user.status}`);
    });
  } catch (error) {
    console.error("❌ Error approving users:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed.");
  }
};

connectDB().then(() => {
  approveUsers();
});
