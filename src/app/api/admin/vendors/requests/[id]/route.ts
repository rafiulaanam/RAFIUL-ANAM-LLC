import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

// GET single vendor request
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
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Get vendor request details with user information
    const vendorRequest = await db
      .collection("vendorrequests")
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id)
          }
        },
        {
          $lookup: {
            from: "users",
            let: { userId: { $toObjectId: "$userId" } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$userId"]
                  }
                }
              }
            ],
            as: "user"
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
            phone: "$user.phone",
            address: "$user.address",
            storeName: 1,
            storeDescription: 1,
            logo: 1,
            businessType: 1,
            registrationNumber: 1,
            taxId: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            processedBy: 1,
            processedAt: 1
          }
        }
      ])
      .next();

    if (!vendorRequest) {
      return NextResponse.json(
        { error: "Vendor request not found" },
        { status: 404 }
      );
    }

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

// PATCH update vendor request status
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
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { status } = data;

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Start a session for transaction
    const mongoSession = client.startSession();

    try {
      await mongoSession.withTransaction(async () => {
        // Get the vendor request
        const vendorRequest = await db
          .collection("vendorrequests")
          .findOne(
            { _id: new ObjectId(id) },
            { session: mongoSession }
          );

        if (!vendorRequest) {
          throw new Error("Vendor request not found");
        }

        if (vendorRequest.status !== "pending") {
          throw new Error("Request has already been processed");
        }

        // Update vendor request status
        await db.collection("vendorrequests").updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status,
              processedBy: session.user.email,
              processedAt: new Date(),
              updatedAt: new Date()
            }
          },
          { session: mongoSession }
        );

        // If approved, update user role to VENDOR
        if (status === "approved") {
          await db.collection("users").updateOne(
            { _id: new ObjectId(vendorRequest.userId) },
            {
              $set: {
                role: "VENDOR",
                isVerified: true,
                isActive: true,
                storeName: vendorRequest.storeName,
                storeDescription: vendorRequest.storeDescription,
                businessType: vendorRequest.businessType,
                registrationNumber: vendorRequest.registrationNumber,
                taxId: vendorRequest.taxId,
                updatedAt: new Date()
              }
            },
            { session: mongoSession }
          );
        }
      });

      return NextResponse.json({
        success: true,
        message: `Vendor request ${status} successfully`
      });

    } finally {
      await mongoSession.endSession();
    }

  } catch (error) {
    console.error("Error updating vendor request:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to update vendor request" 
      },
      { status: 500 }
    );
  }
} 