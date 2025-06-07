import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";

export async function GET() {
  try {
    await sendVerificationEmail(
      process.env.SMTP_USER!, // Send to yourself for testing
      "Test User",
      "test-token-123"
    );

    return NextResponse.json({
      message: "Test email sent successfully",
    });
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { error: "Failed to send test email", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 