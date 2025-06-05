import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productIds, action } = await request.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "No products selected" },
        { status: 400 }
      );
    }

    if (!["delete", "approve", "reject", "feature", "unfeature"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Convert string IDs to ObjectIds
    const objectIds = productIds.map(id => new ObjectId(id));

    let result;
    switch (action) {
      case "delete":
        result = await db.collection("products").updateMany(
          { _id: { $in: objectIds } },
          { $set: { deletedAt: new Date() } }
        );
        break;

      case "approve":
        result = await db.collection("products").updateMany(
          { _id: { $in: objectIds } },
          {
            $set: {
              status: "approved",
              isActive: true,
              updatedAt: new Date(),
              updatedBy: session.user.id
            }
          }
        );
        break;

      case "reject":
        result = await db.collection("products").updateMany(
          { _id: { $in: objectIds } },
          {
            $set: {
              status: "rejected",
              isActive: false,
              updatedAt: new Date(),
              updatedBy: session.user.id
            }
          }
        );
        break;

      case "feature":
        result = await db.collection("products").updateMany(
          { _id: { $in: objectIds } },
          {
            $set: {
              isFeatured: true,
              updatedAt: new Date(),
              updatedBy: session.user.id
            }
          }
        );
        break;

      case "unfeature":
        result = await db.collection("products").updateMany(
          { _id: { $in: objectIds } },
          {
            $set: {
              isFeatured: false,
              updatedAt: new Date(),
              updatedBy: session.user.id
            }
          }
        );
        break;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}ed ${result.modifiedCount} products`
    });
  } catch (error) {
    console.error("Error in bulk action:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 }
    );
  }
} 