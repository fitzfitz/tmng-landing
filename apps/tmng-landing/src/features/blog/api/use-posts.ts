import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/endpoints";
import type { Post, PostsListParams, PostsListResponse } from "../types";

// Query keys
export const postsKeys = {
  all: ["posts"] as const,
  lists: () => [...postsKeys.all, "list"] as const,
  list: (params: PostsListParams) => [...postsKeys.lists(), params] as const,
  details: () => [...postsKeys.all, "detail"] as const,
  detail: (slug: string) => [...postsKeys.details(), slug] as const,
};

// Fetch posts list
export function usePosts(params: PostsListParams = {}) {
  return useQuery({
    queryKey: postsKeys.list(params),
    queryFn: async (): Promise<PostsListResponse> => {
      const response = await axiosInstance.get(API_ENDPOINTS.POSTS.LIST, {
        params,
      });
      return response.data;
    },
  });
}

// Fetch single post by slug
export function usePost(slug: string) {
  return useQuery({
    queryKey: postsKeys.detail(slug),
    queryFn: async (): Promise<Post> => {
      const response = await axiosInstance.get(
        API_ENDPOINTS.POSTS.DETAIL(slug),
      );
      // API returns {success, data: {...}}, extract the data
      return response.data.data || response.data;
    },
    enabled: !!slug,
  });
}

// Increment post views (optional - fire and forget)
export function useIncrementPostViews() {
  const incrementView = async (slug: string) => {
    try {
      await axiosInstance.post(`/api/posts/${slug}/view`);
    } catch (error) {
      // Silently fail - not critical
      console.error("Failed to increment post views:", error);
    }
  };

  return { mutate: incrementView };
}
