import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

type ProductAction = "approve" | "reject" | "feature" | "unfeature" | "delete";

interface ProductUpdateData {
  status?: "approved" | "rejected" | "pending";
  isActive?: boolean;
  isFeatured?: boolean;
  deletedAt?: Date;
  updatedAt: Date;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can perform this action" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { action, productIds } = data as { action: ProductAction; productIds: string[] };

    if (!action || !productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const updateData: ProductUpdateData = {
      updatedAt: new Date(),
    };

    switch (action) {
      case "approve":
        updateData.status = "approved";
        updateData.isActive = true;
        break;
      case "reject":
        updateData.status = "rejected";
        updateData.isActive = false;
        break;
      case "feature":
        updateData.isFeatured = true;
        break;
      case "unfeature":
        updateData.isFeatured = false;
        break;
      case "delete":
        updateData.deletedAt = new Date();
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    // Convert string IDs to ObjectIds
    const objectIds = productIds.map(id => new ObjectId(id));

    // Update products
    const result = await db.collection("products").updateMany(
      { _id: { $in: objectIds } },
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    return NextResponse.json(
      { error: "Failed to perform action" },
      { status: 500 }
    );
  }
} 