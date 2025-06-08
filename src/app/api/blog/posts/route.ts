import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { z } from "zod";
import slugify from "slugify";
import { BlogPost, BlogPostCreate } from "@/types/blog";
import { Filter } from "mongodb";

// Validation schema for blog post
const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500, "Excerpt is too long").optional(),
  coverImage: z.string().url("Invalid cover image URL").optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
}) satisfies z.ZodType<BlogPostCreate>;

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !["ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to database
    const client = await connectToDatabase();
    const db = client.db();

    // Parse and validate request body
    const body = await request.json();
    const validationResult = blogPostSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(error => ({
        path: error.path.join('.'),
        message: error.message
      }));
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Generate slug from title
    const baseSlug = slugify(data.title, {
      lower: true,
      strict: true,
      trim: true
    });

    // Check for existing slugs to avoid duplicates
    let slug = baseSlug;
    let counter = 1;
    while (await db.collection("blog_posts").findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create post object
    const post: BlogPost = {
      ...data,
      slug,
      excerpt: data.excerpt || data.content.substring(0, 160) + "...", // Generate excerpt if not provided
      author: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      likes: 0,
      comments: []
    };

    // Insert into database
    const result = await db.collection("blog_posts").insertOne(post);

    if (!result.acknowledged) {
      throw new Error("Failed to create blog post");
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Blog post created successfully",
      data: {
        id: result.insertedId,
        slug: post.slug,
        ...post
      }
    });

  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create blog post" },
      { status: 500 }
    );
  }
}

// Get all blog posts
export async function GET(request: Request) {
  try {
    // Connect to database
    const client = await connectToDatabase();
    const db = client.db();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const published = searchParams.get("published") === "true";
    const featured = searchParams.get("featured") === "true";
    const tag = searchParams.get("tag");

    // Build query
    const query: Filter<BlogPost> = {};
    if (published !== undefined) query.isPublished = published;
    if (featured !== undefined) query.isFeatured = featured;
    if (tag) query.tags = tag;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get posts with pagination
    const posts = await db.collection<BlogPost>("blog_posts")
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const total = await db.collection("blog_posts").countDocuments(query);

    // Return success response
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