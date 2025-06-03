import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";

// DELETE remove from wishlist
export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId } = params;

    const client = await clientPromise;
    const db = client.db();

    // Remove item from wishlist
    const result = await db.collection("wishlists").findOneAndUpdate(
      { userEmail: session.user.email },
      {
        $pull: {
          items: { productId }
        }
      },
      { returnDocument: "after" }
    );

    return NextResponse.json({
      items: result?.items || []
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
} 