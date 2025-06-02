import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is logged in
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to place an order" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      items,
      shippingInfo,
      shippingMethod,
      paymentMethod,
      subtotal,
      shippingCost,
      tax,
      total,
    } = data;

    // Validate request data
    if (!items?.length || !shippingInfo || !shippingMethod || !paymentMethod) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();

    // Create order in database
    const order = await db.collection("orders").insertOne({
      userId: session.user.id,
      items,
      shippingInfo,
      shippingMethod,
      paymentMethod,
      subtotal,
      shippingCost,
      tax,
      total,
      status: "pending",
      paymentStatus: "pending",
      createdAt: new Date(),
    });

    // Handle payment method
    if (paymentMethod === "stripe") {
      // Create Stripe checkout session
      const lineItems = items.map(item => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      }));

      // Add shipping cost as a line item
      if (shippingCost > 0) {
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: "Shipping",
              description: shippingMethod === "express" ? "Express Shipping" : "Standard Shipping",
            },
            unit_amount: Math.round(shippingCost * 100),
          },
          quantity: 1,
        });
      }

      // Add tax as a line item
      if (tax > 0) {
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: "Tax",
              description: "Sales Tax",
            },
            unit_amount: Math.round(tax * 100),
          },
          quantity: 1,
        });
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        customer_email: session.user.email || undefined,
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.insertedId}?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?canceled=true`,
        metadata: {
          orderId: order.insertedId.toString(),
        },
      });

      return NextResponse.json({
        checkoutUrl: checkoutSession.url,
        orderId: order.insertedId,
      });
    } else {
      // For COD, just return the order ID
      return NextResponse.json({ orderId: order.insertedId });
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