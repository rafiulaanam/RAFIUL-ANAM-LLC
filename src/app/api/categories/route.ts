import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import clientPromise from "@/lib/db";

// GET all active categories with product count
export async function GET() {
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db();
    
    // First get all active categories
    const categories = await db.collection("categories")
      .find({ isActive: true })
      .project({ name: 1, description: 1, image: 1 })
      .sort({ name: 1 })
      .toArray();

    // Get product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await db.collection("products")
          .countDocuments({ categoryId: category._id.toString(), isActive: true });
        
        return {
          ...category,
          productCount
        };
      })
    );

    return NextResponse.json(categoriesWithCount);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
} 