"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var categorySchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a category name'],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please provide a category description'],
    },
    image: {
        type: String,
        required: [true, 'Please provide a category image'],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    slug: {
        type: String,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
// Create slug from name before saving
categorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }
    if (this.isModified()) {
        this.updatedAt = new Date();
    }
    next();
});
var Category = mongoose_1.default.models.Category || mongoose_1.default.model('Category', categorySchema);
exports.default = Category;
