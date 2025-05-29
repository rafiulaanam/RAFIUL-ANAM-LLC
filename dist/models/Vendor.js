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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var vendorSchema = new mongoose_1.default.Schema({
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
    return __awaiter(this, void 0, void 0, function () {
        var oldTotal;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    oldTotal = this.rating.average * this.rating.count;
                    this.rating.count += 1;
                    this.rating.average = (oldTotal + rating) / this.rating.count;
                    return [4 /*yield*/, this.save()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
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
var Vendor = mongoose_1.default.models.Vendor || mongoose_1.default.model('Vendor', vendorSchema);
exports.default = Vendor;
