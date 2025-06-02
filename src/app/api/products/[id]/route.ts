import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/db';
import Product from '@/models/product';
import { ProductResponse } from '@/types/types';
import { ObjectId } from "mongodb";

interface Params {
  params: {
    id: string;
  };
}

// GET single product
export async function GET(request: Request, { params }: Params) {
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

    const product = await db.collection("products").findOne({
      _id: new ObjectId(params.id),
      vendorId: vendor._id,
      deletedAt: { $exists: false }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...product,
      _id: product._id.toString(),
      vendorId: product.vendorId.toString(),
      categoryId: product.categoryId ? product.categoryId.toString() : null
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PATCH update product
export async function PATCH(request: Request, { params }: Params) {
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

    // Check if product exists and belongs to vendor
    const existingProduct = await db.collection("products").findOne({
      _id: new ObjectId(params.id),
      vendorId: vendor._id,
      deletedAt: { $exists: false }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.price || !data.categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update product
    const updateData = {
      ...data,
      categoryId: new ObjectId(data.categoryId),
      price: Number(data.price),
      comparePrice: data.comparePrice ? Number(data.comparePrice) : undefined,
      stock: Number(data.stock),
      lowStockThreshold: Number(data.lowStockThreshold),
      updatedAt: new Date()
    };

    await db.collection("products").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    const updatedProduct = await db.collection("products").findOne({
      _id: new ObjectId(params.id)
    });

    return NextResponse.json({
      ...updatedProduct,
      _id: updatedProduct._id.toString(),
      vendorId: updatedProduct.vendorId.toString(),
      categoryId: updatedProduct.categoryId.toString()
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE product (soft delete)
export async function DELETE(request: Request, { params }: Params) {
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

    // Check if product exists and belongs to vendor
    const product = await db.collection("products").findOne({
      _id: new ObjectId(params.id),
      vendorId: vendor._id,
      deletedAt: { $exists: false }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Soft delete the product
    await db.collection("products").updateOne(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          deletedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
} 