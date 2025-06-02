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
    const client = await clientPromise;
    const db = client.db();

    // Convert string ID to ObjectId
    let productId;
    try {
      if (!ObjectId.isValid(params.id)) {
        return NextResponse.json(
          { error: "Invalid product ID format" },
          { status: 400 }
        );
      }
      productId = new ObjectId(params.id);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid product ID format" },
        { status: 400 }
      );
    }

    // Get product with vendor and category information
    const [product] = await db
      .collection("products")
      .aggregate([
        {
          $match: {
            _id: productId,
            deletedAt: { $exists: false }
          }
        },
        {
          $lookup: {
            from: "users",
            let: { vendorId: "$vendorId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$vendorId"] }
                }
              },
              {
                $project: {
                  name: 1,
                  _id: 1
                }
              }
            ],
            as: "vendor"
          }
        },
        {
          $lookup: {
            from: "categories",
            let: { categoryId: "$categoryId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$categoryId"] }
                }
              },
              {
                $project: {
                  name: 1,
                  _id: 1
                }
              }
            ],
            as: "category"
          }
        },
        {
          $addFields: {
            vendor: { $arrayElemAt: ["$vendor", 0] },
            category: { $arrayElemAt: ["$category", 0] }
          }
        }
      ])
      .toArray();

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Transform ObjectIds to strings
    const transformedProduct = {
      ...product,
      _id: product._id.toString(),
      vendorId: product.vendorId ? product.vendorId.toString() : null,
      categoryId: product.categoryId ? product.categoryId.toString() : null,
      images: Array.isArray(product.images) 
        ? product.images 
        : product.image 
          ? [product.image]
          : ['/placeholder-image.jpg'],
      vendor: product.vendor ? {
        ...product.vendor,
        _id: product.vendor._id.toString()
      } : null,
      category: product.category ? {
        ...product.category,
        _id: product.category._id.toString()
      } : null
    };

    return NextResponse.json(transformedProduct);
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