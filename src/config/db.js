const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Checking MONGODB URI:", !!process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully");
    console.log("Database:", mongoose.connection.name);

  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDB;