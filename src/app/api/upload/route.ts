import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { connectToDatabase } from "@/lib/db";

interface CloudinaryUploadOptions {
  folder: string;
  resource_type: "auto" | "image" | "video" | "raw";
  allowed_formats: string[];
  transformation?: Array<{
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    fetch_format?: string;
  }>;
}

export async function POST(request: Request) {
  try {
    // Connect to database first
    await connectToDatabase();

    // Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

    // Verify Cloudinary configuration
    const config = cloudinary.config();
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      console.error("Invalid Cloudinary configuration:", {
        cloud_name: !!config.cloud_name,
        api_key: !!config.api_key,
        api_secret: !!config.api_secret,
      });
      return NextResponse.json(
        { error: "Invalid Cloudinary configuration" },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !["ADMIN", "VENDOR"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string || "products"; // Default to products if not specified

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileBase64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Set upload options based on type
    const uploadOptions: CloudinaryUploadOptions = {
      folder: type,
      resource_type: "auto",
      allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
    };

    // Add specific transformations based on type
    if (type === "products") {
      uploadOptions.transformation = [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ];
    } else if (type === "categories") {
      uploadOptions.transformation = [
        { width: 600, height: 400, crop: "fill" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ];
    }

    // Upload to Cloudinary
    let result;
    try {
      result = await cloudinary.uploader.upload(fileBase64, uploadOptions);
    } catch (cloudinaryError: unknown) {
      console.error("Cloudinary upload error:", {
        error: cloudinaryError,
        config: {
          cloud_name: !!config.cloud_name,
          api_key: !!config.api_key,
          api_secret: !!config.api_secret,
        }
      });
      const errorMessage = cloudinaryError instanceof Error 
        ? cloudinaryError.message 
        : typeof cloudinaryError === 'object' && cloudinaryError !== null && 'message' in cloudinaryError
          ? String(cloudinaryError.message)
          : "Failed to upload to Cloudinary";
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !["ADMIN", "VENDOR"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json(
        { error: "Public ID is required" },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== "ok") {
      throw new Error("Failed to delete image");
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
} 