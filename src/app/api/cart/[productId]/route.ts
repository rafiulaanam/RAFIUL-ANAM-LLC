import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

// PUT /api/cart/[productId] - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params?.productId;
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { quantity } = await request.json();
    if (quantity < 0) {
      return NextResponse.json(
        { error: "Invalid quantity" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Verify product exists and is available
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

    if (quantity === 0) {
      // Remove item if quantity is 0
      await db.collection("carts").updateOne(
        { userId: session.user.id },
        { $unset: { [`items.${productId}`]: "" } }
      );
    } else {
      // Update quantity
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
    }

    // Get updated cart
    const cart = await db.collection("carts").findOne({ userId: session.user.id });
    const items = cart?.items || {};

    // Get product details for remaining items
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
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    );
  }
}

// DELETE /api/cart/[productId] - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params?.productId;
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Get current cart to check quantity
    const cart = await db.collection("carts").findOne({ userId: session.user.id });
    const currentItem = cart?.items?.[productId];

    if (!currentItem) {
      return NextResponse.json(
        { error: "Item not found in cart" },
        { status: 404 }
      );
    }

    // If quantity > 1, decrease by 1. Otherwise, remove the item
    if (currentItem.quantity > 1) {
      await db.collection("carts").updateOne(
        { userId: session.user.id },
        {
          $set: {
            [`items.${productId}.quantity`]: currentItem.quantity - 1,
            [`items.${productId}.updatedAt`]: new Date()
          }
        }
      );
    } else {
      await db.collection("carts").updateOne(
        { userId: session.user.id },
        { $unset: { [`items.${productId}`]: "" } }
      );
    }

    // Get updated cart
    const updatedCart = await db.collection("carts").findOne({ userId: session.user.id });
    const items = updatedCart?.items || {};

    // Get product details for remaining items
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
    console.error("Error removing cart item:", error);
    return NextResponse.json(
      { error: "Failed to remove cart item" },
      { status: 500 }
    );
  }
} 