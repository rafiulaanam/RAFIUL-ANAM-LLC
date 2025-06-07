import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Find user with reset token that has not expired
    const user = await db.collection("users").findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // First, invalidate all existing sessions for this user
    await db.collection("sessions").deleteMany({
      userId: user._id.toString()
    });

    // Then update user password and remove reset token
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
          resetToken: null,  // Explicitly set to null
          resetTokenExpiry: null,  // Explicitly set to null
        }
      }
    );

    // Also update any active sessions to require re-login
    await db.collection("accounts").updateMany(
      { userId: user._id.toString() },
      {
        $set: {
          access_token: null,
          refresh_token: null,
          expires_at: null
        }
      }
    );

    return NextResponse.json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}