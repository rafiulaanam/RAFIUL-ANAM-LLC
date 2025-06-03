import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Find the original product
    const originalProduct = await db.collection("products").findOne({
      _id: new ObjectId(params.id),
      vendorId: vendor._id
    });

    if (!originalProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Create a duplicate product with modified name and SKU
    const duplicateProduct = {
      ...originalProduct,
      _id: new ObjectId(),
      name: `${originalProduct.name} (Copy)`,
      sku: originalProduct.sku ? `${originalProduct.sku}-copy` : undefined,
      isPublished: false, // Set as draft by default
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert the duplicate product
    const result = await db.collection("products").insertOne(duplicateProduct);

    // Return the new product with string IDs
    return NextResponse.json({
      ...duplicateProduct,
      _id: result.insertedId.toString(),
      vendorId: duplicateProduct.vendorId.toString(),
      categoryId: duplicateProduct.categoryId.toString()
    });
  } catch (error) {
    console.error("Error duplicating product:", error);
    return NextResponse.json(
      { error: "Failed to duplicate product" },
      { status: 500 }
    );
  }
} 