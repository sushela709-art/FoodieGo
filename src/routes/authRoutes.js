const mongoose = require("mongoose");
const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    getCurrentUser
} = require("../controllers/authController");

const authenticate = require("../middleware/authenticate");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get current user
router.get("/me", authenticate, getCurrentUser);

module.exports = router;
