
const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String
        },
        address: {
            type: String
        },
        price: {
            type: Number,
            required: true,
            min: 0.01
        },
        category: {
            type: String,
            required: true,
            enum: [
                "Starter",
                "Main Course",
                "Dessert",
                "Beverage",
                "Side Dish"
            ]
        },
        cuisine: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true
        },
        deliveryTime: {
            type: Number,
            required: true
        },
        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);