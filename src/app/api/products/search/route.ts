import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const brand = searchParams.get("brand") || "";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "1000");
    const sort = searchParams.get("sort") || "newest";

    const client = await clientPromise;
    const db = client.db();

    // Build query
    const query: any = {
      deletedAt: { $exists: false }
    };

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by category
    if (category) {
      try {
        query.categoryId = new ObjectId(category);
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid category ID" },
          { status: 400 }
        );
      }
    }

    // Filter by brand
    if (brand) {
      query.brand = brand;
    }

    // Filter by price range
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      query.price = {};
      if (!isNaN(minPrice)) query.price.$gte = minPrice;
      if (!isNaN(maxPrice)) query.price.$lte = maxPrice;
    }

    // Build sort object
    let sortQuery: any = {};
    switch (sort) {
      case "price_asc":
        sortQuery.price = 1;
        break;
      case "price_desc":
        sortQuery.price = -1;
        break;
      case "rating":
        sortQuery.rating = -1;
        break;
      case "newest":
      default:
        sortQuery.createdAt = -1;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;

    // Check if collection exists
    const collections = await db.listCollections({ name: "products" }).toArray();
    if (collections.length === 0) {
      return NextResponse.json({ products: [], total: 0, hasMore: false });
    }

    // Get products with vendor and category information
    const products = await db
      .collection("products")
      .aggregate([
        { $match: query },
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
        },
        { $sort: sortQuery },
        { $skip: skip },
        { $limit: limit }
      ])
      .toArray();

    // Transform ObjectIds to strings
    const transformedProducts = products.map(product => {
      try {
        return {
          ...product,
          _id: product._id.toString(),
          vendorId: product.vendorId?.toString() || "",
          categoryId: product.categoryId?.toString() || "",
          vendor: product.vendor ? {
            ...product.vendor,
            _id: product.vendor._id.toString()
          } : undefined,
          category: product.category ? {
            ...product.category,
            _id: product.category._id.toString()
          } : undefined
        };
      } catch (error) {
        return null;
      }
    }).filter(Boolean);

    // Get total count for pagination
    const total = await db.collection("products").countDocuments(query);

    return NextResponse.json({
      products: transformedProducts,
      total,
      hasMore: skip + products.length < total
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
} 