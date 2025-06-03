import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid vendor ID" },
        { status: 400 }
      );
    }

    const data = await request.json();
    const updateData: { isActive?: boolean; isVerified?: boolean } = {};

    // Validate update data
    if (typeof data.isActive === "boolean") {
      updateData.isActive = data.isActive;
    }
    if (typeof data.isVerified === "boolean") {
      updateData.isVerified = data.isVerified;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid update data provided" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Update vendor status
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id), role: "VENDOR" },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );

    if (!result.matchedCount) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    if (!result.modifiedCount) {
      return NextResponse.json(
        { error: "No changes made" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Vendor updated successfully"
    });

  } catch (error) {
    console.error("Error updating vendor:", error);
    return NextResponse.json(
      { error: "Failed to update vendor" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid vendor ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Get vendor details with aggregated data
    const vendor = await db
      .collection("users")
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id),
            role: "VENDOR"
          }
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
            storeName: 1,
            storeDescription: 1,
            isVerified: 1,
            isActive: 1,
            totalProducts: { $size: "$products" },
            totalOrders: { $size: "$orders" },
            totalRevenue: {
              $sum: "$orders.total"
            },
            joinedAt: "$createdAt",
            lastLogin: 1,
            products: {
              $slice: ["$products", 5] // Get last 5 products
            },
            recentOrders: {
              $slice: ["$orders", 5] // Get last 5 orders
            }
          }
        }
      ])
      .next();

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vendor
    });

  } catch (error) {
    console.error("Error fetching vendor:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor" },
      { status: 500 }
    );
  }
} 