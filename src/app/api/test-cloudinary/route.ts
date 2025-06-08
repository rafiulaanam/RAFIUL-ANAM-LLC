import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function GET() {
  try {
    // Test Cloudinary configuration
    const config = cloudinary.config();
    
    // Remove sensitive information
    const safeConfig = {
      cloud_name: config.cloud_name,
      api_key: config.api_key ? "present" : "missing",
      api_secret: config.api_secret ? "present" : "missing",
    };

    return NextResponse.json({
      success: true,
      config: safeConfig,
    });
  } catch (error) {
    console.error("Cloudinary configuration error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get Cloudinary configuration" },
      { status: 500 }
    );
  }
} 