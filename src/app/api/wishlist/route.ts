import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

// GET wishlist items
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Get user's wishlist
    const wishlist = await db.collection("wishlists").findOne({
      userEmail: session.user.email
    });

    return NextResponse.json({
      items: wishlist?.items || []
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// POST add to wishlist
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { productId, name, price, image } = data;

    if (!productId || !name || !price || !image) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Add item to wishlist
    const result = await db.collection("wishlists").findOneAndUpdate(
      { userEmail: session.user.email },
      {
        $setOnInsert: { userEmail: session.user.email },
        $addToSet: {
          items: {
            productId,
            name,
            price,
            image,
            addedAt: new Date().toISOString()
          }
        }
      },
      { upsert: true, returnDocument: "after" }
    );

    return NextResponse.json({
      items: result?.items || []
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

// DELETE clear wishlist
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Clear wishlist
    await db.collection("wishlists").updateOne(
      { userEmail: session.user.email },
      { $set: { items: [] } }
    );

    return NextResponse.json({
      items: []
    });
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    return NextResponse.json(
      { error: "Failed to clear wishlist" },
      { status: 500 }
    );
  }
} 