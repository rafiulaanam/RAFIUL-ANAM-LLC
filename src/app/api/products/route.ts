import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { MongoClient, ObjectId } from "mongodb";
import type { Session } from "next-auth";

interface CustomSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
  }
}

interface ProductQuery {
  deletedAt?: { $exists: boolean };
  $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
  status?: string;
  "category._id"?: ObjectId;
  "vendor._id"?: string;
  vendorId?: string;
  price?: {
    $gte?: number;
    $lte?: number;
  };
  isPublished?: boolean;
}

interface SortQuery {
  [key: string]: 1 | -1;
}

// GET products with filtering, sorting, and pagination
export async function GET(request: Request) {
  let client: MongoClient | null = null;

  try {
    // Check authentication
    const session = await getServerSession(authOptions) as CustomSession | null;
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const minPrice = Number(searchParams.get("minPrice")) || 0;
    const maxPrice = Number(searchParams.get("maxPrice")) || Infinity;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const sort = searchParams.get("sort") || "newest";

    // Connect to database
    console.log("Connecting to MongoDB...");
    client = await clientPromise;
    const db = client.db();
    console.log("Connected to MongoDB successfully");

    // Build query
    const query: ProductQuery = {
      deletedAt: { $exists: false },
    };

    // For regular users, only show published products
    if (session.user.role !== "ADMIN" && session.user.role !== "VENDOR") {
      console.log("Regular user - showing only published products");
      query.isPublished = true;
    } else {
      console.log(`${session.user.role} user - showing all products`);
    }

    // If user is a vendor, only show their products
    if (session.user.role === "VENDOR") {
      console.log("Vendor user - filtering by vendorId:", session.user.id);
      query.vendorId = session.user.id;
    }

    // Search by name or description
    if (search) {
      console.log("Adding search filter:", search);
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by status (only for admin/vendor)
    if (session.user.role === "ADMIN" || session.user.role === "VENDOR") {
      if (status && status !== "all") {
        console.log("Admin/Vendor - filtering by status:", status);
        query.status = status;
      }
    }

    // Filter by category
    if (category && category !== "all") {
      try {
        console.log("Filtering by category:", category);
        query["category._id"] = new ObjectId(category);
      } catch (error) {
        console.error("Invalid category ID:", error);
        return NextResponse.json({
          products: [],
          total: 0,
          error: "Invalid category ID"
        });
      }
    }

    // Filter by price
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        console.log("Setting minimum price:", minPrice);
        query.price.$gte = minPrice;
      }
      if (maxPrice !== Infinity) {
        console.log("Setting maximum price:", maxPrice);
        query.price.$lte = maxPrice;
      }
    }

    console.log("Final MongoDB query:", JSON.stringify(query, null, 2));

    // Build sort query
    const sortQuery: SortQuery = {};
    switch (sort) {
      case "price-low":
        sortQuery.price = 1;
        break;
      case "price-high":
        sortQuery.price = -1;
        break;
      case "rating":
        sortQuery.rating = -1;
        break;
      case "popular":
        sortQuery.reviewCount = -1;
        break;
      default:
        sortQuery.createdAt = -1;
    }

    // Get total count for pagination
    const total = await db.collection("products").countDocuments(query);
    console.log("Total matching products:", total);

    // Get products with pagination
    const products = await db
      .collection("products")
      .find(query)
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    console.log(`Returning ${products.length} products for page ${page}`);

    // Transform products for response
    const transformedProducts = products.map(product => {
      try {
        return {
          _id: product._id.toString(),
          name: product.name || "",
          description: product.description || "",
          price: product.price || 0,
          comparePrice: product.comparePrice,
          images: product.images || [],
          brand: product.brand || "",
          rating: product.rating || 0,
          reviewCount: product.reviewCount || 0,
          status: product.status || "pending",
          isPublished: !!product.isPublished,
          isFeatured: !!product.isFeatured,
          isNew: !!product.isNew,
          isBestSeller: !!product.isBestSeller,
          category: {
            _id: product.category?._id?.toString() || "",
            name: product.category?.name || "",
          },
          vendor: {
            _id: product.vendor?._id?.toString() || "",
            name: product.vendor?.name || "",
          },
          inventory: product.inventory || { quantity: 0, lowStockThreshold: 0 },
          createdAt: product.createdAt || new Date(),
          updatedAt: product.updatedAt || new Date(),
        };
      } catch (error) {
        console.error("Error transforming product:", error, product);
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({
      products: transformedProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error("Error in products API:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        return NextResponse.json(
          { error: "Database connection failed" },
          { status: 503 }
        );
      }
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Database not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// POST new product
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as CustomSession | null;
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const client = await clientPromise;
    const db = client.db();

    // Validate required fields
    const requiredFields = [
      "name",
      "description",
      "price",
      "images",
      "category",
      "brand",
      "inventory",
    ];

    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      return NextResponse.json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      }, { status: 400 });
    }

    // Validate category
    const category = await db
      .collection("categories")
      .findOne({ _id: new ObjectId(data.category) });

    if (!category) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Set initial status based on role
    const status = session.user.role === "ADMIN" ? "approved" : "pending";

    // Create product
    const product = {
      ...data,
      category: {
        _id: category._id,
        name: category.name,
      },
      vendorId: session.user.id,
      vendor: {
        _id: session.user.id,
        name: session.user.name,
      },
      status,
      isActive: session.user.role === "ADMIN" ? data.isActive : false,
      isFeatured: session.user.role === "ADMIN" ? data.isFeatured : false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("products").insertOne(product);

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    if (!data._id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if product exists and get current data
    const existingProduct = await db
      .collection("products")
      .findOne({ _id: new ObjectId(data._id) });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (session.user.role !== "ADMIN" && existingProduct.vendorId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to edit this product" },
        { status: 403 }
      );
    }

    // Validate category if it's being updated
    let category = existingProduct.category;
    if (data.category && data.category !== existingProduct.category._id.toString()) {
      category = await db
        .collection("categories")
        .findOne({ _id: new ObjectId(data.category) });

      if (!category) {
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      ...data,
      category: {
        _id: category._id,
        name: category.name,
      },
      updatedAt: new Date(),
    };

    // Vendors can't modify certain fields
    if (session.user.role !== "ADMIN") {
      delete updateData.status;
      delete updateData.isActive;
      delete updateData.isFeatured;
      updateData.status = "pending"; // Set back to pending when vendor updates
    }

    const result = await db.collection("products").findOneAndUpdate(
      { _id: new ObjectId(data._id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    return NextResponse.json({
      success: true,
      data: {
        ...result.value,
        _id: result.value._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if product exists and get current data
    const existingProduct = await db
      .collection("products")
      .findOne({ _id: new ObjectId(id) });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (session.user.role !== "ADMIN" && existingProduct.vendorId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this product" },
        { status: 403 }
      );
    }

    // Soft delete
    await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          deletedAt: new Date(),
          updatedAt: new Date(),
        },
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