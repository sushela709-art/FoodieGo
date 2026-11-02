
const mongoose = require("mongoose");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");

// 1. CREATE MENU ITEM
exports.createMenuItem = async (req, res) => {
    try {
        const {
            name,
            description,
            address,
            price,
            category,
            cuisine,
            image,
            restaurantId,
            deliveryTime,
            isAvailable
        } = req.body;

        if (!name || !name.trim() || !category ||
            price === undefined || Number(price) <= 0 ||
            !restaurantId || !deliveryTime ||
            !cuisine || !image) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields with a positive price"
            });
        }

        if (!mongoose.isValidObjectId(restaurantId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid restaurant ID"
            });
        }

        const restaurant = await Restaurant.findById(restaurantId);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        const item = await MenuItem.create({
            name,
            description,
            address,
            price,
            category,
            cuisine,
            image,
            restaurantId,
            deliveryTime,
            isAvailable
        });

        res.status(201).json({
            success: true,
            message: "Menu item created successfully",
            data: item
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid menu item data"
        });
    }
};


// 2. GET ALL MENU ITEMS WITH FILTERING,
// SORTING AND PAGINATION
exports.getMenuItems = async (req, res) => {
    try {
        const {
            restaurantId,
            category,
            isAvailable,
            sort,
            page = 1,
            limit = 10
        } = req.query;

        const filter = {};

        // Restaurant filter
        if (restaurantId) {
            if (!mongoose.isValidObjectId(restaurantId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid restaurant ID"
                });
            }

            const restaurant = await Restaurant.findById(restaurantId);

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: "Restaurant not found"
                });
            }

            filter.restaurantId = restaurantId;
        }

        // Category filter
        const allowedCategories = [
            "Starter",
            "Main Course",
            "Dessert",
            "Beverage",
            "Side Dish"
        ];

        if (category) {
            if (!allowedCategories.includes(category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category"
                });
            }

            filter.category = category;
        }

        // Availability filter
        if (isAvailable !== undefined) {
            if (!["true", "false"].includes(isAvailable)) {
                return res.status(400).json({
                    success: false,
                    message: "isAvailable must be true or false"
                });
            }

            filter.isAvailable = isAvailable === "true";
        }

        // Sorting
        const sortOptions = {
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            newest: { createdAt: -1 }
        };

        if (sort && !sortOptions[sort]) {
            return res.status(400).json({
                success: false,
                message: "Invalid sort option"
            });
        }

        const sortOrder = sortOptions[sort] || { createdAt: -1 };

        // Pagination
        const currentPage = Number(page);
        const pageLimit = Number(limit);

        if (
            !Number.isInteger(currentPage) ||
            !Number.isInteger(pageLimit) ||
            currentPage < 1 ||
            pageLimit < 1 ||
            pageLimit > 50
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid page or limit. Maximum limit is 50"
            });
        }

        const skip = (currentPage - 1) * pageLimit;

        const totalItems = await MenuItem.countDocuments(filter);

        const items = await MenuItem.find(filter)
            .sort(sortOrder)
            .skip(skip)
            .limit(pageLimit);

        res.status(200).json({
            success: true,
            currentPage,
            totalPages: Math.ceil(totalItems / pageLimit),
            totalItems,
            items
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch menu items"
        });
    }
};


// 3. GET ONE MENU ITEM
exports.getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid menu item ID"
            });
        }

        const item = await MenuItem.findById(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        res.status(200).json({
            success: true,
            data: item
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch menu item"
        });
    }
};


// 4. UPDATE MENU ITEM
exports.updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid menu item ID"
            });
        }

        const allowedFields = [
            "name",
            "description",
            "address",
            "price",
            "category",
            "cuisine",
            "image",
            "restaurantId",
            "deliveryTime",
            "isAvailable"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided"
            });
        }

        if (updates.price !== undefined &&
            (!Number.isFinite(Number(updates.price)) ||
            Number(updates.price) <= 0)) {
            return res.status(400).json({
                success: false,
                message: "Price must be positive"
            });
        }

        if (updates.name !== undefined &&
            (!updates.name.trim())) {
            return res.status(400).json({
                success: false,
                message: "Name cannot be empty"
            });
        }

        if (updates.restaurantId !== undefined) {
            if (!mongoose.isValidObjectId(updates.restaurantId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid restaurant ID"
                });
            }

            const restaurant = await Restaurant.findById(
                updates.restaurantId
            );

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: "Restaurant not found"
                });
            }
        }

        const item = await MenuItem.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Menu item updated successfully",
            data: item
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid update data"
        });
    }
};


// 5. DELETE MENU ITEM
exports.deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid menu item ID"
            });
        }

        const item = await MenuItem.findByIdAndDelete(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Menu item deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to delete menu item"
        });
    }
};