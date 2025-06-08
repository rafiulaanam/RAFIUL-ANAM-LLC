import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BlogPost } from "@/models/blog-post.model";
import { connectToDatabase } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDatabase();

    const post = await BlogPost.findById(params.postId)
      .populate("author", "name email")
      .populate("categories", "name");

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("[BLOG_POST_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, content, excerpt, status, categories, tags, seo } = body;

    await connectToDatabase();

    const post = await BlogPost.findById(params.postId);
    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    // Only update slug if title has changed
    if (title && title !== post.title) {
      post.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }

    // Update fields
    Object.assign(post, {
      ...(title && { title }),
      ...(content && { content }),
      ...(excerpt && { excerpt }),
      ...(status && { status }),
      ...(categories && { categories }),
      ...(tags && { tags }),
      ...(seo && { seo }),
    });

    await post.save();

    return NextResponse.json(post);
  } catch (error) {
    console.error("[BLOG_POST_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDatabase();

    const post = await BlogPost.findByIdAndDelete(params.postId);
    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("[BLOG_POST_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 