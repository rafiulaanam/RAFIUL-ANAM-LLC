import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

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
    if (!data.storeName || !data.storeDescription) {
      return NextResponse.json(
        { error: "Store name and description are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if user already has a pending request
    const existingRequest = await db.collection("vendorrequests").findOne({
      userId: session.user.id,
      status: "pending"
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending vendor request" },
        { status: 400 }
      );
    }

    // Check if user is already a vendor
    const user = await db.collection("users").findOne({
      _id: new ObjectId(session.user.id)
    });

    if (user?.role === "VENDOR") {
      return NextResponse.json(
        { error: "You are already a vendor" },
        { status: 400 }
      );
    }

    // Create vendor request
    const vendorRequest = {
      userId: session.user.id,
      storeName: data.storeName,
      storeDescription: data.storeDescription,
      logo: data.logo || null,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("vendorrequests").insertOne(vendorRequest);

    return NextResponse.json({
      success: true,
      data: {
        ...vendorRequest,
        _id: result.insertedId
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
export async function GET(request: Request) {
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

    const vendorRequest = await db.collection("vendorrequests")
      .findOne(
        { userId: session.user.id },
        { sort: { createdAt: -1 } }
      );

    return NextResponse.json({
      success: true,
      data: vendorRequest
    });

  } catch (error) {
    console.error("Error fetching vendor request:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor request" },
      { status: 500 }
    );
  }
} 