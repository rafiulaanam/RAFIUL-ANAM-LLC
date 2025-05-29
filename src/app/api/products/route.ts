import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import Product from '@/models/product';
import { ProductQueryParams, PaginatedResponse, IProduct } from '@/types/types';

// GET products with filtering, sorting, and pagination
export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const products = await db
      .collection("products")
      .aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetails"
          }
        },
        {
          $unwind: {
            path: "$categoryDetails",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            price: 1,
            image: { $arrayElemAt: ["$images", 0] }, // Convert images array to single image
            images: 1, // Keep the original images array
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
      .toArray();

    return NextResponse.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST new product
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log('Received product data:', data);
    
    // Prepare the product data
    const productData = {
      ...data,
      // Convert single image to images array
      images: [data.image],
      // Remove the single image field
      image: undefined,
      // Set category with proper ObjectId
      category: new ObjectId(data.category),
      // Set vendor as the admin user for now
      vendor: new ObjectId(session.user.id),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: session.user.id
    };

    const client = await clientPromise;
    const db = client.db();

    // Validate that the category exists
    const categoryExists = await db
      .collection("categories")
      .findOne({ _id: new ObjectId(data.category) });

    if (!categoryExists) {
      return NextResponse.json(
        { error: "Selected category does not exist" },
        { status: 400 }
      );
    }

    const result = await db.collection("products").insertOne(productData);

    // Fetch the created product with populated category
    const product = await db
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
            image: { $arrayElemAt: ["$images", 0] }, // Convert back to single image for frontend
            images: 1, // Keep the original images array
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

    if (!product) {
      throw new Error("Failed to fetch created product");
    }

    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error: any) {
    console.error("Product POST Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to create product"
    }, { status: 500 });
  }
}

// PUT update product
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log('Received update data:', data);

    if (!data._id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    if (!data.category || !data.category._id) {
      return NextResponse.json({ error: "Category data is invalid" }, { status: 400 });
    }

    const { _id, category, ...updateData } = data;

    const client = await clientPromise;
    const db = client.db();

    // Validate that the category exists
    const categoryExists = await db
      .collection("categories")
      .findOne({ _id: new ObjectId(category._id) });

    console.log('Found category:', categoryExists);

    if (!categoryExists) {
      return NextResponse.json(
        { error: "Selected category does not exist" },
        { status: 400 }
      );
    }

    const result = await db.collection("products").findOneAndUpdate(
      { _id: new ObjectId(_id) },
      {
        $set: {
          ...updateData,
          category: {
            _id: new ObjectId(category._id),
            name: categoryExists.name
          },
          updatedAt: new Date(),
          updatedBy: session.user.id
        }
      },
      { returnDocument: "after" }
    );

    console.log('Update result:', result);

    if (!result) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error("Product PUT Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to update product",
      details: error.stack
    }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(request: Request) {
  try {
    await clientPromise;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const product = await db.collection("products").findOneAndDelete({ _id: new ObjectId(id) });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error: any) {
    console.error('Product DELETE Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to delete product"
    }, { status: 500 });
  }
} 