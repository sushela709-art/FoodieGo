
const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cartController");
const authenticate = require("../middleware/authenticate");

// Protect all cart routes
router.use(authenticate);

// Get cart
router.get("/", cartController.getCart);

// Add item to cart
router.post("/items", cartController.addToCart);

// Update cart item quantity
router.patch("/items/:menuItemId", cartController.updateCartItem);

// Remove item from cart
router.delete("/items/:menuItemId", cartController.removeCartItem);

// Clear cart
router.delete("/", cartController.clearCart);

module.exports = router;
