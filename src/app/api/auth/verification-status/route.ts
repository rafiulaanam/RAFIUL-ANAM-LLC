import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get("email");
    const email = session?.user?.email || emailParam;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne(
      { email: email.toLowerCase() },
      {
        projection: {
          isVerified: 1,
          verificationToken: 1,
          verificationTokenExpiry: 1,
        },
      }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const hasToken = !!user.verificationToken;
    const isExpired = user.verificationTokenExpiry ? new Date(user.verificationTokenExpiry) < new Date() : true;

    return NextResponse.json({
      isVerified: user.isVerified || false,
      hasToken,
      isExpired,
      expiryTime: user.verificationTokenExpiry,
      message: user.isVerified
        ? "Email is verified"
        : hasToken && !isExpired
        ? "Verification pending"
        : "No active verification token",
    });
  } catch (error) {
    console.error("Verification status error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 