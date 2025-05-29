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
const db_1 = __importDefault(require("../lib/db"));
const Product_1 = __importDefault(require("../models/Product"));
const Category_1 = __importDefault(require("../models/Category"));
const Vendor_1 = __importDefault(require("../models/Vendor"));
const products = [
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
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, db_1.default)();
            // Clear existing products
            yield Product_1.default.deleteMany({});
            // Create categories if they don't exist
            const categories = yield Promise.all(Array.from(new Set(products.map(p => p.categoryName))).map((name) => __awaiter(this, void 0, void 0, function* () {
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const category = yield Category_1.default.findOneAndUpdate({ slug }, {
                    name,
                    description: `${name} category`,
                    image: "https://via.placeholder.com/300x300",
                    isActive: true,
                    slug
                }, { upsert: true, new: true });
                return category;
            })));
            // Create vendors if they don't exist
            const vendors = yield Promise.all(Array.from(new Set(products.map(p => p.vendorName))).map((name) => __awaiter(this, void 0, void 0, function* () {
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const vendor = yield Vendor_1.default.findOneAndUpdate({ slug }, {
                    name,
                    description: `${name} is a trusted vendor`,
                    logo: "https://via.placeholder.com/300x300",
                    email: `contact@${slug}.com`,
                    commission: 10,
                    isActive: true,
                    isVerified: true,
                    slug
                }, { upsert: true, new: true });
                return vendor;
            })));
            // Create a map for quick lookup
            const categoryMap = new Map(categories.map(c => [c.name, c]));
            const vendorMap = new Map(vendors.map(v => [v.name, v]));
            // Insert products with proper references
            const createdProducts = yield Promise.all(products.map((product) => __awaiter(this, void 0, void 0, function* () {
                const category = categoryMap.get(product.categoryName);
                const vendor = vendorMap.get(product.vendorName);
                if (!category || !vendor) {
                    throw new Error(`Category or vendor not found for product: ${product.name}`);
                }
                const newProduct = yield Product_1.default.create({
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    images: product.images,
                    category: {
                        _id: category._id,
                        name: category.name
                    },
                    vendor: {
                        _id: vendor._id,
                        name: vendor.name
                    },
                    inventory: product.inventory,
                    isActive: product.isActive,
                    rating: 0,
                    reviews: 0
                });
                return newProduct;
            })));
            console.log(`✅ Successfully seeded ${createdProducts.length} products`);
            process.exit(0);
        }
        catch (error) {
            console.error('❌ Error seeding products:', error);
            process.exit(1);
        }
    });
}
seedProducts();
