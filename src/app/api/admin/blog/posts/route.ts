import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { BlogPost } from "@/types/blog";
import { Filter } from "mongodb";

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to database
    const client = await connectToDatabase();
    const db = client.db();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    // Build query
    const query: Filter<BlogPost> = {};
    if (status) {
      query.isPublished = status === "published";
    }

    // Get posts with pagination
    const posts = await db.collection<BlogPost>("blog_posts")
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Get total count
    const total = await db.collection("blog_posts").countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, content, excerpt, status, categories, tags, seo } = body;

    if (!title || !content || !excerpt) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    await connectToDatabase();

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const post = await BlogPost.create({
      title,
      slug,
      content,
      excerpt,
      status: status || "draft",
      author: session.user.id,
      categories,
      tags,
      seo,
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("[BLOG_POSTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 