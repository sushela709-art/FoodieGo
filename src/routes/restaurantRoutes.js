
const express = require("express");

const {
    createRestaurant,
    getRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant
} = require("../controllers/restaurantController");

const router = express.Router();

// POST - Create Restaurant
router.post("/", createRestaurant);

// GET - Get All Restaurants
router.get("/", getRestaurants);

// GET - Get Restaurant by ID
router.get("/:id", getRestaurantById);

// PUT - Update Restaurant
router.put("/:id", updateRestaurant);

// DELETE - Delete Restaurant
router.delete("/:id", deleteRestaurant);

module.exports = router;