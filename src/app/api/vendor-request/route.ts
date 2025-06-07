import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";

// POST new vendor request
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    const requiredFields = [
      "businessName",
      "ownerName",
      "email",
      "phone",
      "address",
      "businessType",
      "description"
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if user already has a pending or approved request
    const existingRequest = await db.collection("vendor_requests").findOne({
      userId: session.user.id,
      status: { $in: ["pending", "approved"] }
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending or approved vendor request" },
        { status: 400 }
      );
    }

    // Create vendor request
    const vendorRequest = {
      userId: session.user.id,
      ...data,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("vendor_requests").insertOne(vendorRequest);

    // Create notification for admin
    const notification = {
      type: "VENDOR_REQUEST",
      title: "New Vendor Request",
      message: `${data.businessName} has submitted a vendor application`,
      isRead: false,
      recipientRole: "ADMIN",
      relatedId: result.insertedId.toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection("notifications").insertOne(notification);

    return NextResponse.json({
      success: true,
      data: {
        requestId: result.insertedId.toString()
      }
    });

  } catch (error) {
    console.error("Error creating vendor request:", error);
    return NextResponse.json(
      { error: "Failed to create vendor request" },
      { status: 500 }
    );
  }
}

// GET vendor request status for current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Get user's vendor request
    const request = await db.collection("vendor_requests").findOne({
      userId: session.user.id
    });

    return NextResponse.json(request);

  } catch (error) {
    console.error("Error fetching vendor request:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor request" },
      { status: 500 }
    );
  }
} 