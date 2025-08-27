require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

const addCategoriesToCenters = async () => {
  try {
    console.log("🔍 Finding centers without categories...");

    // Find all CENTER users without categories or with empty categories
    const centersWithoutCategories = await User.find({
      role: "CENTER",
      $or: [
        { categories: { $exists: false } },
        { categories: { $size: 0 } },
        { categories: null },
      ],
    });

    console.log(
      `📋 Found ${centersWithoutCategories.length} centers without categories:`
    );
    centersWithoutCategories.forEach((center) => {
      console.log(`  - ${center.name} (${center.email})`);
    });

    if (centersWithoutCategories.length === 0) {
      console.log("✅ All centers already have categories.");
      return;
    }

    // Define default categories based on center location/name
    const defaultCategoriesByLocation = {
      Kathmandu: ["Electronics", "Clothing", "Books", "Home & Garden"],
      Pokhara: ["Clothing", "Footwear", "Accessories", "Sports"],
      Biratnagar: ["Electronics", "Home & Garden", "Sports", "Automotive"],
      Chitwan: ["Agriculture", "Spices & Herbs", "Grains & Pulses"],
      Butwal: ["Footwear", "Clothing", "Accessories"],
      Dharan: ["Electronics", "Books", "Sports"],
      Janakpur: ["Agriculture", "Spices & Herbs", "Handicrafts"],
      Nepalgunj: ["Agriculture", "Grains & Pulses", "Beverages"],
      Hetauda: ["Home & Garden", "Automotive", "Tools"],
      Birgunj: ["Electronics", "Automotive", "Industrial"],
      Dhangadhi: ["Agriculture", "Livestock", "Grains & Pulses"],
      Mahendranagar: ["Agriculture", "Livestock", "Spices & Herbs"],
      Gorkha: ["Handicrafts", "Tourism", "Agriculture"],
      Baglung: ["Handicrafts", "Agriculture", "Tourism"],
      Tansen: ["Handicrafts", "Tourism", "Agriculture"],
    };

    // Default fallback categories
    const defaultCategories = ["Electronics", "Clothing", "Home & Garden"];

    // Update each center with appropriate categories
    for (const center of centersWithoutCategories) {
      let categoriesToAdd = defaultCategories;

      // Try to match by district name
      const district = center.district;
      if (district && defaultCategoriesByLocation[district]) {
        categoriesToAdd = defaultCategoriesByLocation[district];
      } else {
        // Try to match by center name
        const centerName = center.name.toLowerCase();
        for (const [location, categories] of Object.entries(
          defaultCategoriesByLocation
        )) {
          if (centerName.includes(location.toLowerCase())) {
            categoriesToAdd = categories;
            break;
          }
        }
      }

      // Special case for "Das Local Footwear Ltd."
      if (
        center.name.toLowerCase().includes("footwear") ||
        center.email.includes("dasdeepu")
      ) {
        categoriesToAdd = ["Footwear", "Clothing", "Accessories"];
      }

      // Update the center
      const result = await User.findByIdAndUpdate(
        center._id,
        {
          $set: {
            categories: categoriesToAdd,
            updatedAt: new Date(),
          },
        },
        { new: true }
      );

      console.log(
        `✅ Updated ${center.name} with categories: ${categoriesToAdd.join(
          ", "
        )}`
      );
    }

    console.log(
      `\n🎉 Successfully updated ${centersWithoutCategories.length} centers with categories.`
    );

    // Verify the updates
    const updatedCenters = await User.find({
      role: "CENTER",
      categories: { $exists: true, $ne: [] },
    }).select("name email categories");

    console.log(
      `\n📊 Centers with categories after update: ${updatedCenters.length}`
    );
    console.log("\n✅ Updated centers:");
    updatedCenters.forEach((center) => {
      console.log(`  - ${center.name}: ${center.categories.join(", ")}`);
    });
  } catch (error) {
    console.error("❌ Error adding categories to centers:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed.");
  }
};

connectDB().then(() => {
  addCategoriesToCenters();
});
