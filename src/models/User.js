
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    // User name
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },

    // User email
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },

    // Store only the hashed password
    passwordHash: {
        type: String,
        required: true,
        select: false
    },

    // User role
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    },

    // Account status
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Remove passwordHash from JSON responses
userSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
