import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const sampleProducts = [
  {
    name: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 199.99,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60",
    ],
    category: "Electronics",
    rating: 4.5,
    quantity: 50,
    featured: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Smart Watch Series X",
    description: "Advanced smartwatch with health monitoring features",
    price: 299.99,
    images: [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=60",
    ],
    category: "Electronics",
    rating: 4.7,
    quantity: 30,
    featured: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Professional Camera Kit",
    description: "Complete camera kit for professional photography",
    price: 1299.99,
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
    ],
    category: "Electronics",
    rating: 4.9,
    quantity: 15,
    featured: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Designer Leather Bag",
    description: "Handcrafted premium leather bag",
    price: 399.99,
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=60",
    ],
    category: "Fashion",
    rating: 4.6,
    quantity: 25,
    featured: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Luxury Watch Collection",
    description: "Premium luxury watch with Swiss movement",
    price: 2999.99,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60",
    ],
    category: "Fashion",
    rating: 4.8,
    quantity: 10,
    featured: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Premium Coffee Maker",
    description: "Professional-grade coffee maker for perfect brews",
    price: 199.99,
    images: [
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=60",
    ],
    category: "Home & Kitchen",
    rating: 4.4,
    quantity: 40,
    featured: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Wireless Gaming Mouse",
    description: "High-precision wireless gaming mouse",
    price: 79.99,
    images: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=60",
    ],
    category: "Gaming",
    rating: 4.7,
    quantity: 60,
    featured: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "4K Gaming Monitor",
    description: "Ultra-wide 4K gaming monitor with HDR",
    price: 699.99,
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=60",
    ],
    category: "Gaming",
    rating: 4.8,
    quantity: 20,
    featured: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seedProducts() {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI as string);
    const db = client.db();

    // Clear existing products
    await db.collection('products').deleteMany({});

    // Insert sample products
    const result = await db.collection('products').insertMany(sampleProducts);
    
    console.log(`Successfully seeded ${result.insertedCount} products`);
    
    // Create indexes
    await db.collection('products').createIndex({ name: 1 });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ featured: 1 });
    await db.collection('products').createIndex({ isActive: 1 });
    
    console.log('Created indexes for products collection');
    
    await client.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

// Run the seed function
seedProducts(); 