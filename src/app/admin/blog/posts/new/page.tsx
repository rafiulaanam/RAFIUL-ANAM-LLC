"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Editor } from "@/components/editor";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { BlogPostCreate } from "@/types/blog";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().optional(),
  coverImage: z.string().url("Invalid image URL").optional(),
  tags: z.string().optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewBlogPostPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [editorContent, setEditorContent] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      coverImage: '',
      tags: '',
      isPublished: false,
      isFeatured: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);

      // Convert tags string to array
      const tagsArray = data.tags
        ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];

      const postData: BlogPostCreate = {
        title: data.title,
        content: editorContent,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        tags: tagsArray,
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
      };

      const response = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create post');
      }

      toast.success('Blog post created successfully');
      router.push('/admin/blog/posts');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="Create Blog Post"
            description="Create a new blog post"
          />
        </div>
        <Separator />
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  disabled={isLoading}
                  placeholder="Post title"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Excerpt</label>
                <Input
                  disabled={isLoading}
                  placeholder="Brief description"
                  {...form.register("excerpt")}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cover Image URL</label>
                <Input
                  disabled={isLoading}
                  placeholder="Image URL"
                  {...form.register("coverImage")}
                />
                {form.formState.errors.coverImage && (
                  <p className="text-sm text-red-500">{form.formState.errors.coverImage.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Tags</label>
                <Input
                  disabled={isLoading}
                  placeholder="Enter tags separated by commas"
                  {...form.register("tags")}
                />
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...form.register("isPublished")}
                    disabled={isLoading}
                  />
                  <span>Published</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...form.register("isFeatured")}
                    disabled={isLoading}
                  />
                  <span>Featured</span>
                </label>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Content</label>
                <Editor
                  value={editorContent}
                  onChange={setEditorContent}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <Button
              disabled={isLoading}
              type="submit"
            >
              Create Post
            </Button>
            <Button
              disabled={isLoading}
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/blog/posts')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 