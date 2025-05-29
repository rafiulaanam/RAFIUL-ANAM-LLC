"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var db_1 = require("../lib/db");
var Product_1 = require("../models/Product");
var Category_1 = require("../models/Category");
var Vendor_1 = require("../models/Vendor");
var products = [
    {
        name: "Stainless Steel Water Bottle",
        description: "Vacuum insulated bottle keeps drinks cold for 24 hours.",
        price: 17.99,
        images: ["https://via.placeholder.com/300x300?text=Water+Bottle"],
        categoryName: "Health & Household",
        vendorName: "Hydro Flask",
        inventory: {
            quantity: 80,
            lowStockThreshold: 10
        },
        isActive: true
    },
    {
        name: "Wireless Bluetooth Earbuds",
        description: "True wireless earbuds with noise cancellation and 24-hour battery life.",
        price: 89.99,
        images: ["https://via.placeholder.com/300x300?text=Earbuds"],
        categoryName: "Electronics",
        vendorName: "SoundCore",
        inventory: {
            quantity: 50,
            lowStockThreshold: 10
        },
        isActive: true
    },
    {
        name: "Smart Fitness Watch",
        description: "Track your health and fitness with this advanced smartwatch.",
        price: 199.99,
        images: ["https://via.placeholder.com/300x300?text=Smart+Watch"],
        categoryName: "Electronics",
        vendorName: "FitTech",
        inventory: {
            quantity: 30,
            lowStockThreshold: 5
        },
        isActive: true
    },
    {
        name: "Organic Green Tea",
        description: "Premium organic green tea leaves from Japan.",
        price: 24.99,
        images: ["https://via.placeholder.com/300x300?text=Green+Tea"],
        categoryName: "Food & Beverages",
        vendorName: "TeaHouse",
        inventory: {
            quantity: 100,
            lowStockThreshold: 20
        },
        isActive: true
    },
    {
        name: "Yoga Mat",
        description: "Non-slip exercise mat perfect for yoga and fitness.",
        price: 29.99,
        images: ["https://via.placeholder.com/300x300?text=Yoga+Mat"],
        categoryName: "Sports & Outdoors",
        vendorName: "FitLife",
        inventory: {
            quantity: 45,
            lowStockThreshold: 8
        },
        isActive: true
    },
    {
        name: "Leather Wallet",
        description: "Genuine leather wallet with RFID protection.",
        price: 39.99,
        images: ["https://via.placeholder.com/300x300?text=Wallet"],
        categoryName: "Fashion",
        vendorName: "LeatherCraft",
        inventory: {
            quantity: 60,
            lowStockThreshold: 12
        },
        isActive: true
    },
    {
        name: "Plant-Based Protein Powder",
        description: "Organic vegan protein powder with 25g protein per serving.",
        price: 34.99,
        images: ["https://via.placeholder.com/300x300?text=Protein+Powder"],
        categoryName: "Health & Household",
        vendorName: "NutriLife",
        inventory: {
            quantity: 75,
            lowStockThreshold: 15
        },
        isActive: true
    },
    {
        name: "Bamboo Cutting Board",
        description: "Eco-friendly bamboo cutting board with juice groove.",
        price: 19.99,
        images: ["https://via.placeholder.com/300x300?text=Cutting+Board"],
        categoryName: "Home & Kitchen",
        vendorName: "EcoHome",
        inventory: {
            quantity: 90,
            lowStockThreshold: 18
        },
        isActive: true
    },
    {
        name: "LED Desk Lamp",
        description: "Adjustable LED desk lamp with wireless charging base.",
        price: 49.99,
        images: ["https://via.placeholder.com/300x300?text=Desk+Lamp"],
        categoryName: "Home & Kitchen",
        vendorName: "TechLight",
        inventory: {
            quantity: 40,
            lowStockThreshold: 8
        },
        isActive: true
    },
    {
        name: "Reusable Shopping Bags",
        description: "Set of 5 durable, foldable shopping bags made from recycled materials.",
        price: 15.99,
        images: ["https://via.placeholder.com/300x300?text=Shopping+Bags"],
        categoryName: "Home & Kitchen",
        vendorName: "EcoHome",
        inventory: {
            quantity: 120,
            lowStockThreshold: 24
        },
        isActive: true
    }
];
function seedProducts() {
    return __awaiter(this, void 0, void 0, function () {
        var categories, vendors, categoryMap_1, vendorMap_1, createdProducts, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, (0, db_1.default)()];
                case 1:
                    _a.sent();
                    // Clear existing products
                    return [4 /*yield*/, Product_1.default.deleteMany({})];
                case 2:
                    // Clear existing products
                    _a.sent();
                    return [4 /*yield*/, Promise.all(__spreadArray([], new Set(products.map(function (p) { return p.categoryName; })), true).map(function (name) { return __awaiter(_this, void 0, void 0, function () {
                            var slug;
                            return __generator(this, function (_a) {
                                slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                return [2 /*return*/, Category_1.default.findOneAndUpdate({ slug: slug }, {
                                        name: name,
                                        description: "".concat(name, " category"),
                                        image: "https://via.placeholder.com/300x300",
                                        isActive: true,
                                        slug: slug
                                    }, { upsert: true, new: true })];
                            });
                        }); }))];
                case 3:
                    categories = _a.sent();
                    return [4 /*yield*/, Promise.all(__spreadArray([], new Set(products.map(function (p) { return p.vendorName; })), true).map(function (name) { return __awaiter(_this, void 0, void 0, function () {
                            var slug;
                            return __generator(this, function (_a) {
                                slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                return [2 /*return*/, Vendor_1.default.findOneAndUpdate({ slug: slug }, {
                                        name: name,
                                        description: "".concat(name, " is a trusted vendor"),
                                        logo: "https://via.placeholder.com/300x300",
                                        email: "contact@".concat(slug, ".com"),
                                        commission: 10,
                                        isActive: true,
                                        isVerified: true,
                                        slug: slug
                                    }, { upsert: true, new: true })];
                            });
                        }); }))];
                case 4:
                    vendors = _a.sent();
                    categoryMap_1 = new Map(categories.map(function (c) { return [c.name, c]; }));
                    vendorMap_1 = new Map(vendors.map(function (v) { return [v.name, v]; }));
                    return [4 /*yield*/, Promise.all(products.map(function (product) { return __awaiter(_this, void 0, void 0, function () {
                            var category, vendor;
                            return __generator(this, function (_a) {
                                category = categoryMap_1.get(product.categoryName);
                                vendor = vendorMap_1.get(product.vendorName);
                                if (!category || !vendor) {
                                    throw new Error("Category or vendor not found for product: ".concat(product.name));
                                }
                                return [2 /*return*/, Product_1.default.create(__assign(__assign({}, product), { category: {
                                            _id: category._id,
                                            name: category.name
                                        }, vendor: {
                                            _id: vendor._id,
                                            name: vendor.name
                                        } }))];
                            });
                        }); }))];
                case 5:
                    createdProducts = _a.sent();
                    console.log("\u2705 Successfully seeded ".concat(createdProducts.length, " products"));
                    process.exit(0);
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('❌ Error seeding products:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
seedProducts();
