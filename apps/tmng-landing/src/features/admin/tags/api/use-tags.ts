import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/endpoints";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
}

export function useTags() {
  return useQuery<{ data: Tag[] }>({
    queryKey: ["admin-tags"],
    queryFn: async () => {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.TAGS.LIST);
      return response.data;
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Tag>) => {
      const response = await axiosInstance.post(
        API_ENDPOINTS.ADMIN.TAGS.CREATE,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Tag> }) => {
      const response = await axiosInstance.put(
        API_ENDPOINTS.ADMIN.TAGS.UPDATE(id),
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(API_ENDPOINTS.ADMIN.TAGS.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
    },
  });
}
