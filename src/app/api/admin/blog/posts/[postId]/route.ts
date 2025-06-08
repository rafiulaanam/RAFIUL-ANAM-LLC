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
      .populate("author", "name email image")
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
    const { 
      title, 
      content, 
      excerpt, 
      status, 
      categories, 
      tags, 
      seo,
      coverImage,
      isPublished,
      isFeatured 
    } = body;

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
    const updateData = {
      ...(title && { title }),
      ...(content && { content }),
      ...(excerpt && { excerpt }),
      ...(status && { status }),
      ...(categories && { categories }),
      ...(tags && { tags }),
      ...(seo && { seo }),
      ...(coverImage && { coverImage }),
      ...(typeof isPublished === 'boolean' && { isPublished }),
      ...(typeof isFeatured === 'boolean' && { isFeatured })
    };

    // Update the post with the new data
    const updatedPost = await BlogPost.findByIdAndUpdate(
      params.postId,
      updateData,
      { new: true, runValidators: true }
    ).populate("author", "name email image")
     .populate("categories", "name");

    return NextResponse.json(updatedPost);
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