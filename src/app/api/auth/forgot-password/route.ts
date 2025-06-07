import { NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "@/lib/db";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    console.log("Connecting to database...");
    const client = await clientPromise;
    const db = client.db();
    console.log("Database connection successful");

    // Find user by email
    console.log("Searching for user with email:", email);
    const user = await db.collection("users").findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      console.log("No user found with email:", email);
      // Return success even if user not found for security
      return NextResponse.json({
        message: "If an account exists with this email, you will receive a password reset link"
      });
    }

    console.log("User found, generating reset token...");
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token expires in 1 hour

    // Update user with reset token
    console.log("Updating user with reset token...");
    const updateResult = await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          resetToken,
          resetTokenExpiry,
          updatedAt: new Date(),
        },
      }
    );

    if (!updateResult.modifiedCount) {
      console.error("Failed to update user with reset token");
      throw new Error("Failed to update user with reset token");
    }

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    console.log("Reset URL generated:", resetUrl);

    // Send reset email
    console.log("Attempting to send reset email...");
    try {
      await sendEmail({
        to: user.email,
        subject: "Reset Your Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Reset Your Password</h2>
            <p>Hello ${user.name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>Best regards,<br/>Your App Team</p>
          </div>
        `,
      });
      console.log("Reset email sent successfully");
    } catch (emailError) {
      console.error("Error sending reset email:", emailError);
      // Revert the token update since email failed
      await db.collection("users").updateOne(
        { _id: user._id },
        {
          $unset: {
            resetToken: "",
            resetTokenExpiry: "",
          },
        }
      );
      throw new Error("Failed to send reset email");
    }

    return NextResponse.json({
      message: "If an account exists with this email, you will receive a password reset link"
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "";
    console.error("Error details:", { message: errorMessage, stack: errorStack });
    
    return NextResponse.json(
      { error: "Something went wrong", details: errorMessage },
      { status: 500 }
    );
  }
}