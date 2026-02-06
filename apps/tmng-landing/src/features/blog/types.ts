export type Author = {
  name: string;
  role?: string;
  avatar?: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
};

export type Category = {
  name: string;
  slug: string;
  color?: string;
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  publishedAt: string;
  readTimeMinutes?: number;
  categories?: Category[];
  author?: Author;
  content?: string;
  contentHtml?: string;
  viewCount?: number;
  relatedPosts?: Post[]; 
};
