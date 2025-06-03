import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

// GET all vendor requests (admin only)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const client = await clientPromise;
    const db = client.db();

    // Get vendor requests with user details
    const requests = await db
      .collection("vendorrequests")
      .aggregate([
        {
          $match: { status }
        },
        {
          $lookup: {
            from: "users",
            let: { userId: { $toObjectId: "$userId" } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$userId"] }
                }
              },
              {
                $project: {
                  name: 1,
                  email: 1,
                  image: 1
                }
              }
            ],
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },
        {
          $sort: { createdAt: -1 }
        }
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error("Error fetching vendor requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor requests" },
      { status: 500 }
    );
  }
}

// PUT update vendor request status (admin only)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { requestId, status, notes } = data;

    if (!requestId || !status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Get the vendor request
    const vendorRequest = await db
      .collection("vendorrequests")
      .findOne({ _id: new ObjectId(requestId) });

    if (!vendorRequest) {
      return NextResponse.json(
        { error: "Vendor request not found" },
        { status: 404 }
      );
    }

    // Update vendor request status
    await db.collection("vendorrequests").updateOne(
      { _id: new ObjectId(requestId) },
      {
        $set: {
          status,
          notes,
          updatedAt: new Date()
        }
      }
    );

    // If approved, update user role to vendor
    if (status === "approved") {
      await db.collection("users").updateOne(
        { _id: new ObjectId(vendorRequest.userId) },
        {
          $set: {
            role: "VENDOR",
            storeName: vendorRequest.storeName,
            storeDescription: vendorRequest.storeDescription,
            logo: vendorRequest.logo,
            updatedAt: new Date()
          }
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Vendor request ${status}`
    });

  } catch (error) {
    console.error("Error updating vendor request:", error);
    return NextResponse.json(
      { error: "Failed to update vendor request" },
      { status: 500 }
    );
  }
} 