import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Check if products collection exists and has documents
    const collectionExists = await db.listCollections({ name: 'products' }).hasNext();
    if (!collectionExists) {
      // Return empty array if collection doesn't exist
      return NextResponse.json({ 
        products: [],
        message: "No products available in the shop yet" 
      });
    }

    // Fetch featured products with inventory > 0
    const products = await db
      .collection("products")
      .find({ 
        isActive: true,
        quantity: { $gt: 0 }
      })
      .sort({ 
        featured: -1,
        rating: -1,
        createdAt: -1 
      })
      .limit(8)
      .project({
        _id: 1,
        name: 1,
        price: 1,
        description: 1,
        images: 1,
        rating: 1,
        category: 1,
        featured: 1,
        quantity: 1
      })
      .toArray();

    return NextResponse.json({ 
      products,
      message: products.length === 0 ? "No products available in the shop yet" : undefined
    });

  } catch (error) {
    console.error("Error fetching featured products:", error);
    return NextResponse.json(
      { 
        products: [],
        error: "Failed to fetch products",
        message: "Something went wrong. Please try again later."
      },
      { status: 500 }
    );
  
  }
} 