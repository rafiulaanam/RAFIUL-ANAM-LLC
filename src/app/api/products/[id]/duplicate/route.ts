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
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    // Find the original product
    const originalProduct = await db
      .collection("products")
      .findOne({ _id: new ObjectId(params.id) });

    if (!originalProduct) {
      return NextResponse.json({
        success: false,
        error: "Original product not found"
      }, { status: 404 });
    }

    // Handle category ID based on product structure
    const categoryId = originalProduct.category._id || originalProduct.category;
    
    // Get category details
    const category = await db
      .collection("categories")
      .findOne({ _id: new ObjectId(categoryId) });

    if (!category) {
      return NextResponse.json({
        success: false,
        error: "Category not found"
      }, { status: 404 });
    }

    // Prepare duplicate data
    const duplicateData = {
      name: `${originalProduct.name} (Copy)`,
      description: originalProduct.description,
      price: originalProduct.price,
      images: originalProduct.images || [originalProduct.image], // Handle both array and single image
      category: new ObjectId(categoryId), // Store as ObjectId for consistency
      brand: originalProduct.brand,
      inventory: originalProduct.inventory,
      isActive: originalProduct.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: session.user.id
    };

    // Insert the new product
    const result = await db.collection("products").insertOne(duplicateData);

    // Fetch the created product with populated category
    const newProduct = await db
      .collection("products")
      .aggregate([
        {
          $match: { _id: result.insertedId }
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetails"
          }
        },
        {
          $unwind: "$categoryDetails"
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            price: 1,
            image: { $arrayElemAt: ["$images", 0] },
            images: 1,
            brand: 1,
            inventory: 1,
            isActive: 1,
            createdAt: 1,
            updatedAt: 1,
            createdBy: 1,
            category: {
              _id: "$categoryDetails._id",
              name: "$categoryDetails.name"
            }
          }
        }
      ])
      .next();

    if (!newProduct) {
      throw new Error("Failed to fetch duplicated product");
    }

    return NextResponse.json({
      success: true,
      data: newProduct
    });
  } catch (error: any) {
    console.error('Product Duplicate Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to duplicate product"
    }, { status: 500 });
  }
} 