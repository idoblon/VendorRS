const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  const mongoUrl = process.env.MONGODB_URI;
  if (!mongoUrl) {
    console.error("❌ MongoDB URI is not defined in environment variables.");
    process.exit(1);
  }

  try {
    // Enhanced connection options for better persistence
    await mongoose.connect(mongoUrl, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    });

    console.log("✅ MongoDB connected successfully");

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
