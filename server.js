
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from FoodieGo root folder
dotenv.config({
  path: path.resolve(process.cwd(), ".env")
});

console.log("MongoDB URI loaded:", !!process.env.MONGO_URI);

const app = express();

app.use(express.json());

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in root .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
const restaurantRoutes = require("./src/routes/restaurantRoutes");

app.use("/api/restaurants", restaurantRoutes);

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
};

startServer();
