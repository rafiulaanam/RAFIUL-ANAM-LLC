import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";

export async function GET() {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?.email || authSession.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Get all vendor requests
    const requests = await db
      .collection("vendorRequests")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $match: {
            user: { $ne: [] } // Only include requests with valid users
          }
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            name: "$user.name",
            email: "$user.email",
            image: "$user.image",
            phone: 1,
            address: 1,
            storeName: 1,
            storeDescription: 1,
            documents: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            businessType: 1,
            registrationNumber: 1,
            taxId: 1,
            processedBy: 1,
            processedAt: 1
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        }
      ])
      .toArray();

    // Transform dates to ISO strings for consistent handling
    const formattedRequests = requests.map(request => ({
      ...request,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt?.toISOString(),
      processedAt: request.processedAt?.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: formattedRequests
    });

  } catch (error) {
    console.error("Error fetching vendor requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor requests" },
      { status: 500 }
    );
  }
} 