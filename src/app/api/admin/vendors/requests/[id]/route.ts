import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId, ClientSession } from "mongodb";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?.email || authSession.user.role !== "ADMIN") {
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

    // Get vendor request details
    const vendorRequest = await db
      .collection("vendorRequests")
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id)
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
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
        }
      ])
      .next();

    if (!vendorRequest) {
      return NextResponse.json(
        { error: "Request not found" },
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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?.email || authSession.user.role !== "ADMIN") {
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
    if (!data.status || !["approved", "rejected"].includes(data.status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Start a MongoDB session for the transaction
    const mongoSession: ClientSession = client.startSession();

    try {
      await mongoSession.withTransaction(async () => {
        // Get the vendor request
        const vendorRequest = await db
          .collection("vendorRequests")
          .findOne(
            { _id: new ObjectId(id) },
            { session: mongoSession }
          );

        if (!vendorRequest) {
          throw new Error("Request not found");
        }

        if (vendorRequest.status !== "pending") {
          throw new Error("Request has already been processed");
        }

        // Update the request status
        await db.collection("vendorRequests").updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status: data.status,
              updatedAt: new Date(),
              processedBy: authSession.user.email,
              processedAt: new Date()
            }
          },
          { session: mongoSession }
        );

        // If approved, update the user's role to VENDOR
        if (data.status === "approved") {
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

        // Create a notification for the vendor
        await db.collection("notifications").insertOne({
          userId: new ObjectId(vendorRequest.userId),
          type: "VENDOR_REQUEST",
          title: data.status === "approved" ? "Vendor Application Approved" : "Vendor Application Rejected",
          message: data.status === "approved"
            ? "Congratulations! Your vendor application has been approved. You can now start selling on our platform."
            : "Your vendor application has been rejected. Please contact support for more information.",
          isRead: false,
          createdAt: new Date()
        }, { session: mongoSession });
      });

      return NextResponse.json({
        success: true,
        message: `Vendor request ${data.status} successfully`
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