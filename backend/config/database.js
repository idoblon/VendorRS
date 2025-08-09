const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = async () => {
  const mongoUrl = process.env.MONGODB_URI || "";

  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("successfully connected")
  } catch (error) {
    console.log("unable to connect with mongodb")
    process.exit(1);
  }
};

module.exports=  connectDB;