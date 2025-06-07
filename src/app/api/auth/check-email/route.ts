import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Find user by email
    const user = await db.collection("users").findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return NextResponse.json({ exists: false });
    }

    // If user exists but is not verified, return special response
    if (!user.isVerified) {
      return NextResponse.json({
        exists: true,
        isVerified: false,
        message: "Email exists but not verified"
      });
    }

    // If user exists and is verified
    return NextResponse.json({
      exists: true,
      isVerified: true,
      message: "Email already registered and verified"
    });

  } catch (error) {
    console.error("Check email error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}