import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

// Helper function to create slug from name
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Helper function to validate image URL
function isValidImageUrl(url: string): boolean {
  return url.startsWith('https://') && (
    url.endsWith('.jpg') || 
    url.endsWith('.jpeg') || 
    url.endsWith('.png') || 
    url.endsWith('.webp') || 
    url.endsWith('.gif')
  );
}

// GET all categories
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const checkProducts = searchParams.get("checkProducts");
    const categoryId = searchParams.get("categoryId");

    const client = await clientPromise;
    const db = client.db();

    // If checking products for a specific category
    if (checkProducts === "true" && categoryId) {
      const products = await db
        .collection("products")
        .find({ "category._id": new ObjectId(categoryId) })
        .project({ _id: 1, name: 1, status: 1, isPublished: 1 })
        .toArray();

      return NextResponse.json({
        productsUsingCategory: products.map(p => ({
          _id: p._id.toString(),
          name: p.name,
          status: p.status,
          isPublished: p.isPublished
        }))
      });
    }

    // Regular categories fetch
    const categories = await db.collection("categories").find({}).toArray();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST new category
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, image, status } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Validate image URL if provided
    if (image && !isValidImageUrl(image)) {
      return NextResponse.json(
        { error: "Invalid image URL. Must be a valid HTTPS URL ending with jpg, jpeg, png, webp, or gif" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if category with same name exists
    const existingCategory = await db
      .collection("categories")
      .findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    const slug = createSlug(name);
    const newCategory = {
      name,
      slug,
      description: description || "",
      image: image || null,
      status: status || "active",
      isActive: status !== "inactive",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: session.user.id,
    };

    const result = await db.collection("categories").insertOne(newCategory);
    const category = await db
      .collection("categories")
      .findOne({ _id: result.insertedId });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

// PATCH update category
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, description, image, status } = await req.json();

    if (!id || !name) {
      return NextResponse.json(
        { error: "ID and name are required" },
        { status: 400 }
      );
    }

    // Validate image URL if provided
    if (image && !isValidImageUrl(image)) {
      return NextResponse.json(
        { error: "Invalid image URL. Must be a valid HTTPS URL ending with jpg, jpeg, png, webp, or gif" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if another category with same name exists
    const existingCategory = await db
      .collection("categories")
      .findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: new ObjectId(id) },
      });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    const slug = createSlug(name);
    const updateData: any = {
      name,
      slug,
      description,
      updatedAt: new Date(),
      updatedBy: session.user.id,
    };

    // Only update image if provided
    if (image !== undefined) {
      updateData.image = image;
    }

    // Update status and isActive if provided
    if (status) {
      updateData.status = status;
      updateData.isActive = status === "active";
    }

    const result = await db.collection("categories").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const updatedCategory = await db
      .collection("categories")
      .findOne({ _id: new ObjectId(id) });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if category is being used by any products
    const productsUsingCategory = await db
      .collection("products")
      .findOne({ "category._id": new ObjectId(id) });

    if (productsUsingCategory) {
      console.log("Found product using category:", productsUsingCategory._id);
      return NextResponse.json(
        { error: "Cannot delete category that is being used by products" },
        { status: 400 }
      );
    }

    // Attempt to delete the category
    const result = await db.collection("categories").deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    
    // Handle invalid ObjectId error
    if (error instanceof Error && error.message.includes("ObjectId")) {
      return NextResponse.json(
        { error: "Invalid category ID format" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
} 