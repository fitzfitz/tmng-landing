export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  viewCount: number;
  readTime: number;
  seoTitle?: string;
  seoDescription?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  categories?: {
    id: string;
    name: string;
    slug: string;
    color: string;
  }[];
  tags?: {
    id: string;
    name: string;
    slug: string;
  }[];
}

export interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: File | string | null;
  status: "draft" | "published" | "archived";
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  categoryIds: string[];
  tagIds: string[];
}

export interface PostsResponse {
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
