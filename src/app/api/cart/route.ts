import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
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
    await dbConnect();

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
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Find existing cart or create new one
    let cart = await Cart.findOne({ userId: session.user.email });

    if (cart) {
      // Cart exists - check if item exists
      const itemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        // Update existing item
        cart.items[itemIndex].quantity = quantity;
      } else {
        // Add new item
        cart.items.push({
          productId: product._id,
          quantity,
          price: product.price,
          name: product.name,
          image: product.images[0]
        });
      }

      // Save updated cart
      cart = await cart.save();
    } else {
      // Create new cart
      cart = await Cart.create({
        userId: session.user.email,
        items: [{
          productId: product._id,
          quantity,
          price: product.price,
          name: product.name,
          image: product.images[0]
        }]
      });
    }

    // Populate product details before returning
    await cart.populate('items.productId');
    return NextResponse.json(cart);
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

    await dbConnect();
    
    const cart = await Cart.findOne(
      { userId: session.user.email },
      { items: 1, _id: 0 }
    ).populate('items.productId');

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

    await dbConnect();
    
    await Cart.deleteOne({ userId: session.user.email });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
} 