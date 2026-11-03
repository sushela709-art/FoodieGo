
const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem");

// Get authenticated user ID
const getUserId = (req) => req.user.id || req.user._id;

// Validate quantity
const isValidQuantity = (quantity) => {
    return Number.isInteger(quantity) && quantity > 0;
};

// 1. GET CART
exports.getCart = async (req, res) => {
    try {
        const userId = getUserId(req);

        let cart = await Cart.findOne({ user: userId })
            .populate("items.menuItem");

        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: []
            });
        }

        let subtotal = 0;

        const items = cart.items
            .filter(item => item.menuItem)
            .map(item => {
                const menuItem = item.menuItem;

                const lineTotal = menuItem.price * item.quantity;
                subtotal += lineTotal;

                return {
                    menuItem,
                    quantity: item.quantity,
                    lineTotal
                };
            });

        res.status(200).json({
            success: true,
            cart: {
                _id: cart._id,
                user: cart.user,
                items,
                subtotal
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// 2. ADD ITEM TO CART
exports.addToCart = async (req, res) => {
    try {
        const userId = getUserId(req);

        const { menuItemId, quantity } = req.body;

        if (!menuItemId) {
            return res.status(400).json({
                success: false,
                message: "Menu item ID is required"
            });
        }

        if (!isValidQuantity(quantity)) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
            });
        }

        const menuItem = await MenuItem.findById(menuItemId);

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        if (!menuItem.isAvailable) {
            return res.status(400).json({
                success: false,
                message: "Menu item is not available"
            });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({
                user: userId,
                items: []
            });
        }

        const existingItem = cart.items.find(
            item => item.menuItem.toString() === menuItemId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                menuItem: menuItemId,
                quantity
            });
        }

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Item added to cart successfully",
            cart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// 3. UPDATE CART ITEM QUANTITY
exports.updateCartItem = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { menuItemId } = req.params;
        const { quantity } = req.body;

        if (!isValidQuantity(quantity)) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
            });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const item = cart.items.find(
            item => item.menuItem.toString() === menuItemId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }

        const menuItem = await MenuItem.findById(menuItemId);

        if (!menuItem || !menuItem.isAvailable) {
            return res.status(400).json({
                success: false,
                message: "Menu item is unavailable"
            });
        }

        item.quantity = quantity;

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully",
            cart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// 4. REMOVE ITEM FROM CART
exports.removeCartItem = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { menuItemId } = req.params;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const initialLength = cart.items.length;

        cart.items = cart.items.filter(
            item => item.menuItem.toString() !== menuItemId
        );

        if (cart.items.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
            cart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// 5. CLEAR CART
exports.clearCart = async (req, res) => {
    try {
        const userId = getUserId(req);

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        cart.items = [];

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            cart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
