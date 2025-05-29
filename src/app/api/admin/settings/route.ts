import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const settings = await db.collection("settings").findOne({ type: "global" });

    return NextResponse.json({
      success: true,
      data: settings || {
        type: "global",
        storeName: "My E-commerce Store",
        storeDescription: "",
        contactEmail: "",
        supportEmail: "",
        currency: "USD",
        taxRate: 0,
        shippingMethods: [],
        paymentMethods: {
          stripe: { enabled: false, testMode: true },
          paypal: { enabled: false, testMode: true }
        },
        emailNotifications: {
          orderConfirmation: true,
          orderShipped: true,
          orderDelivered: true,
          lowStockAlert: true
        },
        maintenance: {
          enabled: false,
          message: ""
        }
      }
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("settings").updateOne(
      { type: "global" },
      { 
        $set: {
          ...data,
          updatedAt: new Date(),
          updatedBy: session.user.id
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
} 