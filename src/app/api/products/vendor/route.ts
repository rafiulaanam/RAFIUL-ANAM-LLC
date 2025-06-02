import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

// GET vendor's products
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    
    // Get vendor details
    const vendor = await db.collection("users").findOne({
      email: session.user.email,
      $or: [
        { role: "VENDOR" },
        { role: "vendor" },
        { role: "Vendor" }
      ]
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Fetch products for this vendor
    const products = await db
      .collection("products")
      .find({ 
        vendorId: vendor._id,
        deletedAt: { $exists: false } 
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Transform _id to string for JSON serialization
    const transformedProducts = products.map(product => ({
      ...product,
      _id: product._id.toString(),
      vendorId: product.vendorId.toString(),
      categoryId: product.categoryId ? product.categoryId.toString() : null
    }));

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST new product as vendor
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Get vendor details
    const vendor = await db.collection("users").findOne({
      email: session.user.email,
      $or: [
        { role: "VENDOR" },
        { role: "vendor" },
        { role: "Vendor" }
      ]
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.price || !data.categoryId || !data.images?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create product with vendor ID
    const product = {
      ...data,
      vendorId: vendor._id,
      categoryId: new ObjectId(data.categoryId),
      price: Number(data.price),
      comparePrice: data.comparePrice ? Number(data.comparePrice) : undefined,
      stock: Number(data.stock),
      lowStockThreshold: Number(data.lowStockThreshold),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("products").insertOne(product);

    return NextResponse.json({
      ...product,
      _id: result.insertedId.toString(),
      vendorId: vendor._id.toString(),
      categoryId: product.categoryId.toString()
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
} 