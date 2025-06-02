import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import clientPromise from "@/lib/db";

// GET all active categories
export async function GET() {
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db();
    
    const categories = await db.collection("categories")
      .find({ isActive: true })
      .project({ name: 1, description: 1 })
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
} 