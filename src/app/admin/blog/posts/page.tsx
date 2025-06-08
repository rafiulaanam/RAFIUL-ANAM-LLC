"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";
import { BlogPost } from "@/types/blog";

interface BlogPostColumn {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
}

const columns = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.original.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {row.original.isPublished ? 'Published' : 'Draft'}
        </span>
      </div>
    )
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => format(new Date(row.original.createdAt), 'MMMM do, yyyy')
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        <Link href={`/admin/blog/posts/${row.original._id}/edit`}>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </Link>
      </div>
    )
  }
];

export default function BlogPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog/posts?page=${page}&limit=10`);
      const data: {
        success: boolean;
        data: {
          posts: BlogPost[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        };
        error?: string;
      } = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch posts');
      }

      setPosts(data.data.posts);
      setTotalPages(data.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage, fetchPosts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formattedPosts: BlogPostColumn[] = posts.map(post => ({
    id: post._id?.toString() || '',
    title: post.title,
    slug: post.slug,
    status: post.isPublished ? 'Published' : 'Draft',
    createdAt: post.createdAt.toString()
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title={`Blog Posts (${posts.length})`}
            description="Manage your blog posts"
          />
          <Link href="/admin/blog/posts/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </Link>
        </div>
        <Separator />
        <DataTable
          columns={columns}
          data={formattedPosts}
          searchKey="title"
          loading={loading}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: handlePageChange
          }}
        />
        <Heading title="API" description="API Endpoints for blog posts" />
        <Separator />
        <ApiList entityName="blog" entityIdName="postId" />
      </div>
    </div>
  );
} 