import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripeInstance } from "@/lib/stripe";
import { connectToDatabase } from "@/lib/db";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const stripe = getStripeInstance();
    
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET');
      return NextResponse.json(
        { error: 'Webhook secret is not configured' },
        { status: 500 }
      );
    }

    const body = await req.text();
    const signature = headers().get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature found in request" },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    // Connect to database
    await connectToDatabase();

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session);
        break;

      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handleSuccessfulPaymentIntent(paymentIntent);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const client = await connectToDatabase();
  const db = client.db();

  // Update order status if orderId exists in metadata
  if (session.metadata?.orderId) {
    await db.collection("orders").updateOne(
      { _id: session.metadata.orderId },
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
  }
}

async function handleSuccessfulPaymentIntent(paymentIntent: Stripe.PaymentIntent) {
  const client = await connectToDatabase();
  const db = client.db();

  // Update payment status if orderId exists in metadata
  if (paymentIntent.metadata?.orderId) {
    await db.collection("orders").updateOne(
      { _id: paymentIntent.metadata.orderId },
      {
        $set: {
          paymentStatus: "paid",
          status: "processing",
          paidAt: new Date(),
        },
      }
    );
  }
} 