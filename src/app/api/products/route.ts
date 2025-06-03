import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { ProductQueryParams, PaginatedResponse, IProduct } from '@/types/types';
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

// GET products with filtering, sorting, and pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const sort = searchParams.get("sort") || "newest";
    const search = searchParams.get("q") || "";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "1000");

    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db();

    // Build query
    const query: any = {
      deletedAt: { $exists: false },
      isPublished: true,
      price: { $gte: minPrice, $lte: maxPrice }
    };

    if (category) {
      query.categoryId = new ObjectId(category);
    }

    if (brand) {
      query.brand = brand;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } }
      ];
    }

    // Build sort
    let sortQuery: any = {};
    switch (sort) {
      case "price-asc":
        sortQuery.price = 1;
        break;
      case "price-desc":
        sortQuery.price = -1;
        break;
      case "rating":
        sortQuery.rating = -1;
        break;
      default: // newest
        sortQuery.createdAt = -1;
    }

    // Get total count for pagination
    const total = await db.collection("products").countDocuments(query);

    // Fetch products with pagination
    const products = await db
      .collection("products")
      .find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Transform products
    const transformedProducts = await Promise.all(
      products.map(async (product) => {
        // Get vendor details
        const vendor = await db.collection("users").findOne(
          { _id: product.vendorId },
          { projection: { name: 1 } }
        );

        // Get category details
        const category = product.categoryId
          ? await db.collection("categories").findOne(
              { _id: product.categoryId },
              { projection: { name: 1 } }
            )
          : null;

        return {
          ...product,
          _id: product._id.toString(),
          vendorId: product.vendorId.toString(),
          categoryId: product.categoryId?.toString(),
          vendor: vendor ? { _id: vendor._id.toString(), name: vendor.name } : null,
          category: category
            ? { _id: category._id.toString(), name: category.name }
            : null,
        };
      })
    );

    return NextResponse.json({
      products: transformedProducts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + limit < total
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
    const session = await getServerSession(authOptions) as CustomSession | null;

    if (!session?.user?.role || !["ADMIN", "VENDOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log('Received product data:', data);
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'categoryId', 'brand', 'stock'];
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      return NextResponse.json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Validate numeric fields
    if (isNaN(data.price) || data.price < 0) {
      return NextResponse.json({
        error: "Price must be a valid positive number"
      }, { status: 400 });
    }

    if (isNaN(data.stock) || data.stock < 0) {
      return NextResponse.json({
        error: "Stock must be a valid positive number"
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Validate that the category exists
    const categoryExists = await db
      .collection("categories")
      .findOne({ _id: new ObjectId(data.categoryId) });

    if (!categoryExists) {
      return NextResponse.json(
        { error: "Selected category does not exist" },
        { status: 400 }
      );
    }

    // If vendor, validate that the vendor exists
    if (session.user.role === "VENDOR") {
      const vendorExists = await db
        .collection("users")
        .findOne({ 
          _id: new ObjectId(session.user.id),
          role: "VENDOR"
        });

      if (!vendorExists) {
        return NextResponse.json(
          { error: "Vendor account not found" },
          { status: 400 }
        );
      }
    }
    
    // Prepare the product data
    const productData = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      images: data.images || [],
      category: new ObjectId(data.categoryId),
      brand: data.brand,
      inventory: {
        quantity: parseInt(data.stock),
        lowStockThreshold: data.lowStockThreshold || 5
      },
      isActive: data.isPublished || false,
      isFeatured: data.isFeatured || false,
      trackInventory: data.trackInventory || true,
      sku: data.sku || null,
      comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
      vendor: {
        _id: new ObjectId(session.user.id),
        name: session.user.name || "Unknown Vendor",
        email: session.user.email || ""
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: session.user.id
    };

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
          $lookup: {
            from: "vendors",
            localField: "vendor",
            foreignField: "_id",
            as: "vendorDetails"
          }
        },
        {
          $unwind: {
            path: "$vendorDetails",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            price: 1,
            comparePrice: 1,
            images: 1,
            brand: 1,
            inventory: 1,
            isActive: 1,
            isFeatured: 1,
            trackInventory: 1,
            sku: 1,
            createdAt: 1,
            updatedAt: 1,
            createdBy: 1,
            category: {
              _id: "$categoryDetails._id",
              name: "$categoryDetails.name"
            },
            vendor: {
              _id: "$vendorDetails._id",
              name: "$vendorDetails.name",
              email: "$vendorDetails.email"
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
    const session = await getServerSession(authOptions) as CustomSession | null;

    if (!session?.user?.role || !["ADMIN", "VENDOR"].includes(session.user.role)) {
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

    // If vendor, validate they own the product
    if (session.user.role === "VENDOR") {
      const product = await db
        .collection("products")
        .findOne({ 
          _id: new ObjectId(_id),
          "vendor._id": new ObjectId(session.user.id)
        });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found or you don't have permission to edit it" },
          { status: 404 }
        );
      }
    }

    const result = await db.collection("products").findOneAndUpdate(
      { 
        _id: new ObjectId(_id),
        ...(session.user.role === "VENDOR" ? { "vendor._id": new ObjectId(session.user.id) } : {})
      },
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
    const session = await getServerSession(authOptions) as CustomSession | null;

    if (!session?.user?.role || !["ADMIN", "VENDOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // If vendor, validate they own the product
    if (session.user.role === "VENDOR") {
      const product = await db
        .collection("products")
        .findOne({ 
          _id: new ObjectId(id),
          "vendor._id": new ObjectId(session.user.id)
        });

    if (!product) {
        return NextResponse.json(
          { success: false, error: "Product not found or you don't have permission to delete it" },
          { status: 404 }
        );
      }
    }

    const result = await db.collection("products").findOneAndDelete({
      _id: new ObjectId(id),
      ...(session.user.role === "VENDOR" ? { "vendor._id": new ObjectId(session.user.id) } : {})
    });

    if (!result) {
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