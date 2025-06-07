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
  vendorId: string;
}

type VendorItems = {
  [key: string]: OrderItem[];
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Validate order data
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Group items by vendor
    const itemsByVendor = data.items.reduce((acc: VendorItems, item: OrderItem) => {
      if (!acc[item.vendorId]) {
        acc[item.vendorId] = [];
      }
      acc[item.vendorId].push(item);
      return acc;
    }, {});

    // Start a session for transaction
    const dbSession = await client.startSession();
    const orderIds: ObjectId[] = [];

    try {
      await dbSession.withTransaction(async () => {
        // Create orders for each vendor
        for (const [vendorId, items] of Object.entries<OrderItem[]>(itemsByVendor)) {
          const order = {
            userId: session.user.id,
            vendorId,
            items,
            status: "pending",
            totalAmount: items.reduce((sum: number, item: OrderItem) => sum + (item.price * item.quantity), 0),
            shippingAddress: data.shippingAddress,
            paymentMethod: data.paymentMethod,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const result = await db.collection("orders").insertOne(order, { session: dbSession });
          orderIds.push(result.insertedId);

          // Create notification for vendor
          const notification = {
            type: "NEW_ORDER",
            title: "New Order Received",
            message: `You have received a new order worth $${order.totalAmount.toFixed(2)}`,
            isRead: false,
            recipientRole: "VENDOR",
            recipientId: vendorId,
            relatedId: result.insertedId.toString(),
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await db.collection("notifications").insertOne(notification, { session: dbSession });
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          orderIds: orderIds.map(id => id.toString())
        }
      });

    } finally {
      await dbSession.endSession();
    }

  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is logged in
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to view orders" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Fetch all orders for the user, sorted by creation date (newest first)
    const orders = await db
      .collection("orders")
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
} 