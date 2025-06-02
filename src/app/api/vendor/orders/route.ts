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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is logged in and is a vendor
    if (!session?.user || !session.user.role || session.user.role !== "VENDOR") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Fetch all orders, sorted by creation date (newest first)
    const orders = await db
      .collection<Order>("orders")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Convert ObjectId to string and format dates
    const formattedOrders = orders.map(order => ({
      ...order,
      _id: order._id.toString(),
      createdAt: order.createdAt.toISOString(),
      paidAt: order.paidAt?.toISOString(),
      updatedAt: order.updatedAt?.toISOString()
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
} 