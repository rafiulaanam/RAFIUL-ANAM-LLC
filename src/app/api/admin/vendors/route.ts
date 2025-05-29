import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get all users with VENDOR role
    const vendors = await db
      .collection("users")
      .aggregate([
        {
          $match: { role: "VENDOR" }
        },
        {
          $lookup: {
            from: "products",
            let: { vendorId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$vendor._id", "$$vendorId"]
                  }
                }
              }
            ],
            as: "products"
          }
        },
        {
          $lookup: {
            from: "orders",
            let: { vendorId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$vendor._id", "$$vendorId"]
                  }
                }
              }
            ],
            as: "orders"
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            image: 1,
            storeName: { $ifNull: ["$storeName", ""] },
            storeDescription: { $ifNull: ["$storeDescription", ""] },
            isVerified: { $ifNull: ["$isVerified", false] },
            isActive: { $ifNull: ["$isActive", true] },
            totalProducts: { $size: "$products" },
            totalOrders: { $size: "$orders" },
            totalRevenue: {
              $sum: "$orders.total"
            },
            joinedAt: "$createdAt",
            lastLogin: { $ifNull: ["$lastLogin", null] }
          }
        },
        {
          $sort: { joinedAt: -1 }
        }
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      data: vendors
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
} 