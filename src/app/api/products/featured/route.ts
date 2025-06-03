import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    console.log("Starting featured products fetch...");
    const client = await clientPromise;
    const db = client.db();
    
    // Build query for featured products
    const query = {
      deletedAt: { $exists: false },
      isPublished: true,
      isFeatured: true
    };

    // Fetch featured products
    console.log("Fetching featured and published products...");
    const products = await db
      .collection("products")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(8)
      .toArray();

    console.log("Featured and published products found:", products.length);

    // Transform products
    const transformedProducts = await Promise.all(
      products.map(async (product) => {
        // Get category details
        const category = product.categoryId
          ? await db.collection("categories").findOne(
              { _id: new ObjectId(product.categoryId) },
              { projection: { name: 1 } }
            )
          : null;

        return {
          ...product,
          _id: product._id.toString(),
          categoryId: product.categoryId?.toString(),
          categoryName: category?.name || null,
          discount: product.comparePrice 
            ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
            : 0
        };
      })
    );

    return NextResponse.json({ 
      products: transformedProducts,
      message: transformedProducts.length === 0 ? "No featured products available yet" : undefined
    });

  } catch (error) {
    console.error("Error fetching featured products:", error);
    return NextResponse.json(
      { 
        products: [],
        error: "Failed to fetch products",
        message: error instanceof Error ? error.message : "Something went wrong. Please try again later."
      },
      { status: 500 }
    );
  }
} 