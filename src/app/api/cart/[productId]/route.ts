import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";

interface Params {
  params: {
    productId: string;
  };
}

// PATCH /api/cart/[productId] - Update cart item quantity
export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { quantity } = await req.json();
    const { db } = await connectToDatabase();

    if (quantity <= 0) {
      await db.collection("carts").updateOne(
        { userId: session.user.id },
        {
          $unset: { [`items.${params.productId}`]: "" },
        }
      );
    } else {
      await db.collection("carts").updateOne(
        { userId: session.user.id },
        {
          $set: {
            [`items.${params.productId}`]: {
              productId: params.productId,
              quantity,
              updatedAt: new Date(),
            },
          },
        },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/cart/[productId] - Remove item from cart
export async function DELETE(_: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { db } = await connectToDatabase();
    await db.collection("carts").updateOne(
      { userId: session.user.id },
      {
        $unset: { [`items.${params.productId}`]: "" },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing cart item:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 