import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/cart - Add/Update item in cart
export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db();

    // Get request body
    const { productId, quantity } = await req.json();

    // Validate input
    if (!productId || typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    // Get product details
    const product = await db.collection("products").findOne({ _id: new ObjectId(productId) });
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Find existing cart or create new one
    const cart = await db.collection("carts").findOne({ userId: session.user.email });

    if (cart) {
      // Cart exists - check if item exists
      const itemIndex = cart.items.findIndex(
        (item: any) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        // Update existing item
        await db.collection("carts").updateOne(
          { userId: session.user.email },
          { 
            $set: { 
              [`items.${itemIndex}.quantity`]: quantity,
              updatedAt: new Date()
            } 
          }
        );
      } else {
        // Add new item
        await db.collection("carts").updateOne(
          { userId: session.user.email },
          {
            $push: {
              items: {
                productId: new ObjectId(productId),
                quantity,
                price: product.price,
                name: product.name,
                image: product.images[0]
              }
            },
            $set: { updatedAt: new Date() }
          }
        );
      }
    } else {
      // Create new cart
      await db.collection("carts").insertOne({
        userId: session.user.email,
        items: [{
          productId: new ObjectId(productId),
          quantity,
          price: product.price,
          name: product.name,
          image: product.images[0]
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Get updated cart
    const updatedCart = await db.collection("carts")
      .aggregate([
        { $match: { userId: session.user.email } },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "productDetails"
          }
        }
      ])
      .next();

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("Cart API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/cart - Get user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const cart = await db.collection("carts")
      .aggregate([
        { $match: { userId: session.user.email } },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "productDetails"
          }
        }
      ])
      .next();

    return NextResponse.json(cart?.items || []);
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Remove item from cart
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    await db.collection("carts").deleteOne({ userId: session.user.email });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
} 