import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = headers().get("stripe-signature") || "";

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret || ""
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (!orderId) {
          console.error("No order ID in session metadata");
          return NextResponse.json(
            { error: "No order ID found" },
            { status: 400 }
          );
        }

        // Update order status
        await db.collection("orders").updateOne(
          { _id: new ObjectId(orderId) },
          {
            $set: {
              paymentStatus: "paid",
              status: "processing",
              paidAt: new Date(),
              paymentDetails: {
                paymentId: session.payment_intent,
                paymentMethod: "stripe",
                amount: session.amount_total ? session.amount_total / 100 : 0,
                currency: session.currency,
              },
            },
          }
        );

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          await db.collection("orders").updateOne(
            { _id: new ObjectId(orderId) },
            {
              $set: {
                paymentStatus: "failed",
                status: "cancelled",
              },
            }
          );
        }

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
} 