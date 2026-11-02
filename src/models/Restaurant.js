const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        address: {
            type: String
        },
        price: {
            type: Number,
            required: true
        },
        cuisine: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);