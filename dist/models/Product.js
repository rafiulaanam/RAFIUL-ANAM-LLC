"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var productSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    images: [{
            type: String,
            required: true,
        }],
    category: {
        _id: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
    },
    vendor: {
        _id: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    reviews: {
        type: Number,
        default: 0,
    },
    inventory: {
        quantity: {
            type: Number,
            required: true,
            min: 0,
        },
        lowStockThreshold: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
var Product = mongoose_1.default.models.Product || mongoose_1.default.model('Product', productSchema);
exports.default = Product;
