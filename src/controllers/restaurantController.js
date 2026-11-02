
const Restaurant = require("../models/Restaurant");

// CREATE RESTAURANT
const createRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.create(req.body);

        res.status(201).json({
            message: "Restaurant created successfully",
            data: restaurant
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

// GET ALL RESTAURANTS
const getRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find();

        res.status(200).json({
            message: "Restaurants fetched successfully",
            data: restaurants
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// GET RESTAURANT BY ID
const getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({
                message: "Restaurant not found"
            });
        }

        res.status(200).json({
            data: restaurant
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

// UPDATE RESTAURANT
const updateRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!restaurant) {
            return res.status(404).json({
                message: "Restaurant not found"
            });
        }

        res.status(200).json({
            message: "Restaurant updated successfully",
            data: restaurant
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

// DELETE RESTAURANT
const deleteRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndDelete(
            req.params.id
        );

        if (!restaurant) {
            return res.status(404).json({
                message: "Restaurant not found"
            });
        }

        res.status(200).json({
            message: "Restaurant deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

module.exports = {
    createRestaurant,
    getRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant
};  