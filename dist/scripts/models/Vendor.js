"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const vendorSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a vendor name'],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please provide a vendor description'],
    },
    logo: {
        type: String,
        required: [true, 'Please provide a vendor logo'],
    },
    coverImage: {
        type: String,
    },
    email: {
        type: String,
        required: [true, 'Please provide a vendor email'],
        unique: true,
        lowercase: true,
    },
    phone: {
        type: String,
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
    },
    socialMedia: {
        website: String,
        facebook: String,
        twitter: String,
        instagram: String,
    },
    businessInfo: {
        registrationNumber: String,
        taxId: String,
        businessType: String,
    },
    bankInfo: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        swiftCode: String,
    },
    commission: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 10,
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        count: {
            type: Number,
            default: 0,
        },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    slug: {
        type: String,
        unique: true,
    },
    seo: {
        title: String,
        description: String,
        keywords: [String],
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
vendorSchema.pre('save', function (next) {
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
// Method to update ratings
vendorSchema.methods.updateRatings = function (rating) {
    return __awaiter(this, void 0, void 0, function* () {
        const oldTotal = this.rating.average * this.rating.count;
        this.rating.count += 1;
        this.rating.average = (oldTotal + rating) / this.rating.count;
        yield this.save();
    });
};
// Virtual for getting vendor status
vendorSchema.virtual('status').get(function () {
    if (!this.isActive)
        return 'inactive';
    if (!this.isVerified)
        return 'pending';
    return 'active';
});
const Vendor = mongoose_1.default.models.Vendor || mongoose_1.default.model('Vendor', vendorSchema);
exports.default = Vendor;
