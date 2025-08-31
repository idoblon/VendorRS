require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function checkVendorsAndCenters() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Check all users by role
    const allUsers = await User.find({});
    console.log(`\n📊 TOTAL USERS IN DATABASE: ${allUsers.length}`);

    // Check vendors
    const allVendors = await User.find({ role: "VENDOR" });
    const approvedVendors = await User.find({ role: "VENDOR", status: "APPROVED" });
    const pendingVendors = await User.find({ role: "VENDOR", status: "PENDING" });
    const rejectedVendors = await User.find({ role: "VENDOR", status: "REJECTED" });

    console.log(`\n🏪 VENDORS:`);
    console.log(`  Total: ${allVendors.length}`);
    console.log(`  Approved: ${approvedVendors.length}`);
    console.log(`  Pending: ${pendingVendors.length}`);
    console.log(`  Rejected: ${rejectedVendors.length}`);

    if (approvedVendors.length > 0) {
      console.log(`\n✅ APPROVED VENDORS DETAILS:`);
      approvedVendors.forEach((vendor, index) => {
        console.log(`  ${index + 1}. ${vendor.businessName || vendor.name}`);
        console.log(`     Email: ${vendor.email}`);
        console.log(`     Status: ${vendor.status}`);
        console.log(`     ID: ${vendor._id}`);
        console.log(`     Active: ${vendor.isActive}`);
        console.log("");
      });
    }

    // Check centers
    const allCenters = await User.find({ role: "CENTER" });
    const approvedCenters = await User.find({ role: "CENTER", status: "APPROVED" });
    const pendingCenters = await User.find({ role: "CENTER", status: "PENDING" });
    const rejectedCenters = await User.find({ role: "CENTER", status: "REJECTED" });

    console.log(`\n🏢 CENTERS:`);
    console.log(`  Total: ${allCenters.length}`);
    console.log(`  Approved: ${approvedCenters.length}`);
    console.log(`  Pending: ${pendingCenters.length}`);
    console.log(`  Rejected: ${rejectedCenters.length}`);

    if (approvedCenters.length > 0) {
      console.log(`\n✅ APPROVED CENTERS DETAILS:`);
      approvedCenters.forEach((center, index) => {
        console.log(`  ${index + 1}. ${center.name}`);
        console.log(`     Email: ${center.email}`);
        console.log(`     Status: ${center.status}`);
        console.log(`     ID: ${center._id}`);
        console.log(`     Active: ${center.isActive}`);
        console.log("");
      });
    }

    // Check admin users
    const adminUsers = await User.find({ role: "ADMIN" });
    console.log(`\n👨‍💼 ADMINS:`);
    console.log(`  Total: ${adminUsers.length}`);

    if (adminUsers.length > 0) {
      adminUsers.forEach((admin, index) => {
        console.log(`  ${index + 1}. ${admin.name}`);
        console.log(`     Email: ${admin.email}`);
        console.log(`     Status: ${admin.status}`);
        console.log(`     Active: ${admin.isActive}`);
      });
    }

    // Summary
    console.log(`\n📋 SUMMARY:`);
    console.log(`  Approved Vendors: ${approvedVendors.length}`);
    console.log(`  Approved Centers: ${approvedCenters.length}`);
    console.log(`  Admin Users: ${adminUsers.length}`);

    if (approvedVendors.length === 0 && approvedCenters.length === 0) {
      console.log(`\n⚠️  WARNING: No approved vendors or centers found!`);
      console.log(`   This explains why the admin dashboard shows no data.`);
      console.log(`   💡 Solution: Run the database seeding script:`);
      console.log(`      cd backend && npm run seed`);
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

checkVendorsAndCenters();
