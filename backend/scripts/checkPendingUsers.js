require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const checkPendingUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Find pending vendors
    const pendingVendors = await User.find({
      role: "VENDOR",
      status: "PENDING",
    }).select("name email businessName createdAt");

    // Find pending centers
    const pendingCenters = await User.find({
      role: "CENTER",
      status: "PENDING",
    }).select("name email district province createdAt");

    console.log("\n📊 PENDING REGISTRATIONS SUMMARY:");
    console.log("================================");
    console.log(`Pending Vendors: ${pendingVendors.length}`);
    console.log(`Pending Centers: ${pendingCenters.length}`);

    if (pendingVendors.length > 0) {
      console.log("\n🏪 PENDING VENDORS:");
      pendingVendors.forEach((vendor, index) => {
        console.log(`${index + 1}. ${vendor.name} (${vendor.businessName})`);
        console.log(`   Email: ${vendor.email}`);
        console.log(`   Registered: ${vendor.createdAt}`);
        console.log(`   ID: ${vendor._id}\n`);
      });
    }

    if (pendingCenters.length > 0) {
      console.log("\n🏢 PENDING CENTERS:");
      pendingCenters.forEach((center, index) => {
        console.log(`${index + 1}. ${center.name}`);
        console.log(`   Email: ${center.email}`);
        console.log(`   Location: ${center.district}, ${center.province}`);
        console.log(`   Registered: ${center.createdAt}`);
        console.log(`   ID: ${center._id}\n`);
      });
    }

    if (pendingVendors.length === 0 && pendingCenters.length === 0) {
      console.log("\n✅ No pending registrations found.");
      console.log(
        "All vendors and centers are either approved, rejected, or suspended."
      );
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔒 Disconnected from MongoDB");
  }
};

checkPendingUsers();
