import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: ObjectId;
  userId: string;
  items: OrderItem[];
  shippingInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    notes?: string;
  };
  shippingMethod: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: Date;
  paidAt?: Date;
  updatedAt?: Date;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is logged in and is a vendor
    if (!session?.user || !session.user.role || session.user.role !== "VENDOR") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Validate order ID
    if (!params.id || !ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { status } = data;

    // Validate status
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid order status. Status must be one of: " + validStatuses.join(", ") },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if order exists
    const existingOrder = await db.collection<Order>("orders").findOne({
      _id: new ObjectId(params.id)
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order status
    const result = await db.collection<Order>("orders").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    if (!result.modifiedCount) {
      return NextResponse.json(
        { error: "Failed to update order status" },
        { status: 500 }
      );
    }

    // If order is marked as delivered, update payment status to paid for COD orders
    if (status === "delivered" && existingOrder.paymentMethod === "cod" && existingOrder.paymentStatus !== "paid") {
      await db.collection<Order>("orders").updateOne(
        { _id: new ObjectId(params.id) },
        {
          $set: {
            paymentStatus: "paid",
            paidAt: new Date(),
          },
        }
      );
    }

    // Get updated order
    const updatedOrder = await db.collection<Order>("orders").findOne({
      _id: new ObjectId(params.id)
    });

    // Format the order data
    const formattedOrder = updatedOrder ? {
      ...updatedOrder,
      _id: updatedOrder._id.toString(),
      createdAt: updatedOrder.createdAt.toISOString(),
      paidAt: updatedOrder.paidAt?.toISOString(),
      updatedAt: updatedOrder.updatedAt?.toISOString()
    } : null;

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while updating the order" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is logged in and is a vendor
    if (!session?.user || !session.user.role || session.user.role !== "vendor") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Fetch order
    const order = await db.collection<Order>("orders").findOne({
      _id: new ObjectId(params.id),
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Format the order data
    const formattedOrder = {
      ...order,
      _id: order._id.toString(),
      createdAt: order.createdAt.toISOString(),
      paidAt: order.paidAt?.toISOString(),
      updatedAt: order.updatedAt?.toISOString()
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
} 