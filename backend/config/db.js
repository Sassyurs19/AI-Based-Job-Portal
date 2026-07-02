const mongoose = require("mongoose");
const dns = require('dns').promises;

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 50000,
      socketTimeoutMS: 45000,
      family: 4
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;