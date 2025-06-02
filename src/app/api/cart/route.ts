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
    if (!session?.user?.id) {
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
    const product = await db.collection("products").findOne({ 
      _id: new ObjectId(productId),
      deletedAt: { $exists: false }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check stock availability
    if (product.stock !== undefined && quantity > product.stock) {
      return NextResponse.json(
        { error: "Not enough stock available" },
        { status: 400 }
      );
    }

    // Get current cart
    const cart = await db.collection("carts").findOne({ userId: session.user.id });

    if (cart) {
      // Update existing cart
      await db.collection("carts").updateOne(
        { userId: session.user.id },
        {
          $set: {
            [`items.${productId}`]: {
              quantity,
              updatedAt: new Date()
            }
          }
        },
        { upsert: true }
      );
    } else {
      // Create new cart
      await db.collection("carts").insertOne({
        userId: session.user.id,
        items: {
          [productId]: {
            quantity,
            updatedAt: new Date()
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Get updated cart with product details
    const updatedCart = await db.collection("carts").findOne({ userId: session.user.id });
    const items = updatedCart?.items || {};

    // Get product details for all items in cart
    const productIds = Object.keys(items);
    const products = productIds.length > 0
      ? await db.collection("products").find({ 
          _id: { $in: productIds.map(id => new ObjectId(id)) },
          deletedAt: { $exists: false }
        }).toArray()
      : [];

    // Format cart items with product details
    const cartItems = products.map(product => ({
      productId: product._id.toString(),
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: items[product._id.toString()].quantity,
      stock: product.stock
    }));

    return NextResponse.json({ items: cartItems });
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
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Get cart
    const cart = await db.collection("carts").findOne({ userId: session.user.id });
    const items = cart?.items || {};

    // Get product details for cart items
    const productIds = Object.keys(items);
    
    // Filter out invalid ObjectIds and convert valid ones
    const validObjectIds = productIds.reduce<ObjectId[]>((acc, id) => {
      try {
        if (ObjectId.isValid(id)) {
          acc.push(new ObjectId(id));
        }
      } catch (error) {
        console.error(`Invalid ObjectId: ${id}`);
      }
      return acc;
    }, []);

    // Get products with valid IDs
    const products = validObjectIds.length > 0
      ? await db.collection("products").find({ 
          _id: { $in: validObjectIds },
          deletedAt: { $exists: false }
        }).toArray()
      : [];

    // Format cart items with product details
    const cartItems = products.map(product => ({
      productId: product._id.toString(),
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: items[product._id.toString()].quantity,
      stock: product.stock
    }));

    return NextResponse.json({ items: cartItems });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to load your cart. Please try again." },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    await db.collection("carts").updateOne(
      { userId: session.user.id },
      { $set: { items: {} } }
    );

    return NextResponse.json({ items: [] });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 