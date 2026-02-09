// API types for blog posts
export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: {
    name: string;
    avatar?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  publishedAt: string;
  updatedAt: string;
  readingTime?: number;
  views?: number;
}

export interface PostsListParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
}

export interface PostsListResponse {
  success: boolean;
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
