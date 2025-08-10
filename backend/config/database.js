const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = async () => {
  const mongoUrl = process.env.MONGODB_URI;
  if (!mongoUrl) {
    console.error("❌ MongoDB URI is not defined in environment variables.");
    process.exit(1);
  }
await mongoose.connect(mongoUrl)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
};

module.exports=  connectDB;