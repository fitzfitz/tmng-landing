import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/endpoints";
import { Post, PostsResponse } from "../types";

export function usePosts(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery<PostsResponse>({
    queryKey: ["admin-posts", params],
    queryFn: async () => {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.POSTS.LIST, {
        params,
      });
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function usePost(id?: string) {
  return useQuery<Post>({
    queryKey: ["admin-post", id],
    queryFn: async () => {
      if (!id) throw new Error("Post ID is required");
      const response = await axiosInstance.get(
        API_ENDPOINTS.ADMIN.POSTS.GET(id),
      );
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axiosInstance.post(
        API_ENDPOINTS.ADMIN.POSTS.CREATE,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await axiosInstance.put(
        API_ENDPOINTS.ADMIN.POSTS.UPDATE(id),
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-post", id] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(
        API_ENDPOINTS.ADMIN.POSTS.DELETE(id),
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    },
  });
}
