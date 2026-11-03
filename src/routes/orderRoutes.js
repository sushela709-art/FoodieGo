
const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");

// Import JWT authentication middleware
const authenticate = require("../middleware/authenticate");

// Protect all order routes
router.use(authenticate);

// POST /api/orders
// Place a new order
router.post(
    "/",
    orderController.placeOrder
);

// GET /api/orders
// Get logged-in customer's order history
router.get(
    "/",
    orderController.getOrderHistory
);

// GET /api/orders/:id
// Get single order details
router.get(
    "/:id",
    orderController.getOrderById
);

module.exports = router;
