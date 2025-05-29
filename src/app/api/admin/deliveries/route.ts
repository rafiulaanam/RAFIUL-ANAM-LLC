import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const client = await clientPromise;
    const db = client.db();

    // Build query
    const query: any = {
      status: { $in: ["shipped", "out_for_delivery", "delivered"] }
    };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { "customer.email": { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { orderNumber: { $regex: search, $options: "i" } },
        { trackingId: { $regex: search, $options: "i" } }
      ];
    }

    // Get total count for pagination
    const total = await db.collection("orders").countDocuments(query);

    // Get orders with delivery information
    const orders = await db
      .collection("orders")
      .find(query)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    return NextResponse.json(
      { error: "Failed to fetch deliveries" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { status, trackingId } = data;

    if (!status && !trackingId) {
      return NextResponse.json(
        { error: "Status or tracking ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const updateData: any = {
      updatedAt: new Date(),
      updatedBy: session.user.id
    };

    if (status) updateData.status = status;
    if (trackingId) updateData.trackingId = trackingId;

    const result = await db.collection("orders").findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error updating delivery:", error);
    return NextResponse.json(
      { error: "Failed to update delivery" },
      { status: 500 }
    );
  }
} 