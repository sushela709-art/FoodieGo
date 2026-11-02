const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticate = async (req, res, next) => {
    try {

        // Get authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Token is required"
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            {
                algorithms: ["HS256"]
            }
        );

        // Validate user ID
        if (!mongoose.Types.ObjectId.isValid(decoded.sub)) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        // Find user
        const user = await User.findById(decoded.sub);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "User not found or inactive"
            });
        }

        // Attach user to request
        req.user = user;

        next();

    } catch (error) {

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        console.error("Authentication error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Authentication error"
        });
    }
};

module.exports = authenticate;
