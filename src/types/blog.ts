export interface BlogAuthor {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export interface BlogComment {
  id: string;
  content: string;
  author: BlogAuthor;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPost {
  _id?: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  coverImage?: string;
  tags?: string[];
  author: BlogAuthor;
  isPublished: boolean;
  isFeatured: boolean;
  views: number;
  likes: number;
  comments: BlogComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPostCreate {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
} 