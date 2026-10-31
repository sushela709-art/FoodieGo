
const Restaurant = require("../models/Restaurant");

// CREATE
exports.createRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.create(req.body);

        res.status(201).json({
            success: true,
            message: "Restaurant created successfully",
            data: restaurant
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// GET ALL
exports.getRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find();

        res.status(200).json({
            success: true,
            count: restaurants.length,
            data: restaurants
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET BY ID
exports.getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        res.status(200).json({
            success: true,
            data: restaurant
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid restaurant ID"
        });
    }
};

// UPDATE
exports.updateRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Restaurant updated successfully",
            data: restaurant
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE
exports.deleteRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndDelete(
            req.params.id
        );

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Restaurant deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid restaurant ID"
        });
    }
};