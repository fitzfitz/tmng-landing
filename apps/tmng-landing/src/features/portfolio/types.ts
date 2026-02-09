// API types for portfolio/work projects
export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImage?: string;
  images?: string[];
  client?: string;
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
  technologies?: string[];
  projectUrl?: string;
  githubUrl?: string;
  completedAt: string;
  createdAt: string;
  featured?: boolean;
}

export interface ProjectsListParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  featured?: boolean;
}

export interface ProjectsListResponse {
  success: boolean;
  data: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
