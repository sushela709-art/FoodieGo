
const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authenticate");
const authorizeRole = require("../middleware/authorizeRole");

router.get(
    "/dashboard",
    authenticate,
    authorizeRole("admin"),
    (req, res) => {

        res.status(200).json({
            success: true,
            message: "Welcome to FoodieGo Admin Dashboard",
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        });

    }
);

module.exports = router;
