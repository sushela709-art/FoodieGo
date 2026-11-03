
const mongoose = require("mongoose");

const Cart = require("../models/Cart");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");

// Get logged-in user's ID
const getUserId = (req) => {
    return req.user?.id || req.user?._id;
};

// Validate MongoDB ObjectId
const isValidId = (id) => {
    return mongoose.isValidObjectId(id);
};


// ========================================
// 1. PLACE ORDER
// POST /api/orders
// ========================================

exports.placeOrder = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { deliveryAddress } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Validate delivery address
        if (
            typeof deliveryAddress !== "string" ||
            !deliveryAddress.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Delivery address is required"
            });
        }

        // Find customer's cart
        const cart = await Cart.findOne({ user: userId });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        const orderItems = [];

        let subtotal = 0;
        let restaurantId = null;

        // Validate every cart item
        for (const cartItem of cart.items) {

            // Validate menu item ID
            if (!isValidId(cartItem.menuItem)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid menu item ID"
                });
            }

            // Find menu item
            const menuItem = await MenuItem.findById(
                cartItem.menuItem
            );

            if (!menuItem) {
                return res.status(404).json({
                    success: false,
                    message: "One or more menu items no longer exist"
                });
            }

            // Check availability
            if (!menuItem.isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: `${menuItem.name} is currently unavailable`
                });
            }

            // Validate quantity
            if (
                !Number.isInteger(cartItem.quantity) ||
                cartItem.quantity <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid item quantity in cart"
                });
            }

            // IMPORTANT: Your MenuItem model uses restaurantId
            if (!menuItem.restaurantId) {
                return res.status(400).json({
                    success: false,
                    message: `Restaurant information missing for ${menuItem.name}`
                });
            }

            const currentRestaurantId =
                menuItem.restaurantId.toString();

            // Check that all items belong to one restaurant
            if (restaurantId === null) {
                restaurantId = currentRestaurantId;
            } else if (
                restaurantId !== currentRestaurantId
            ) {
                return res.status(400).json({
                    success: false,
                    message: "You can order items from only one restaurant at a time"
                });
            }

            // Validate database price
            const unitPrice = Number(menuItem.price);

            if (
                !Number.isFinite(unitPrice) ||
                unitPrice <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid menu item price"
                });
            }

            // Calculate line total
            const lineTotal = Math.round(
                unitPrice * cartItem.quantity * 100
            ) / 100;

            subtotal = Math.round(
                (subtotal + lineTotal) * 100
            ) / 100;

            // Store item snapshots
            orderItems.push({
                menuItem: menuItem._id,
                itemName: menuItem.name,
                unitPrice: unitPrice,
                quantity: cartItem.quantity,
                lineTotal: lineTotal
            });
        }

        // Verify restaurant actually exists
        const restaurantExists = await Restaurant.exists({
            _id: restaurantId
        });

        if (!restaurantExists) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        // Calculate final total
        const total = subtotal;

        // Create order
        const order = await Order.create({
            user: userId,
            restaurant: restaurantId,
            items: orderItems,
            subtotal: subtotal,
            total: total,
            deliveryAddress: deliveryAddress.trim(),
            status: "placed"
        });

        // Clear cart ONLY after successful order creation
        cart.items = [];
        await cart.save();

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order
        });

    } catch (error) {
        console.error("Place Order Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to place order",
            error: error.message
        });
    }
};


// ========================================
// 2. GET ORDER HISTORY
// GET /api/orders
// ========================================

exports.getOrderHistory = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const orders = await Order.find({
            user: userId
        })
            .populate("items.menuItem", "name image")
            .populate("restaurant", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error("Get Order History Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve order history"
        });
    }
};


// ========================================
// 3. GET SINGLE ORDER DETAILS
// GET /api/orders/:id
// ========================================

exports.getOrderById = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Validate order ID
        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        // Find order
        const order = await Order.findById(id)
            .populate("items.menuItem", "name image")
            .populate("restaurant", "name")
            .populate("user", "name email");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Check ownership
        const orderUserId = order.user?._id
            ? order.user._id.toString()
            : order.user?.toString();

        const isOwner =
            orderUserId === userId.toString();

        // Check admin permission
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error("Get Order Details Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve order details"
        });
    }
};
