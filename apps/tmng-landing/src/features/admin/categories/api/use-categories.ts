import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/endpoints";

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
  postCount?: number;
}

export function useCategories() {
  return useQuery<{ data: Category[] }>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        API_ENDPOINTS.ADMIN.CATEGORIES.LIST,
      );
      return response.data;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Category>) => {
      const response = await axiosInstance.post(
        API_ENDPOINTS.ADMIN.CATEGORIES.CREATE,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Category>;
    }) => {
      const response = await axiosInstance.put(
        API_ENDPOINTS.ADMIN.CATEGORIES.UPDATE(id),
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(API_ENDPOINTS.ADMIN.CATEGORIES.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
  });
}
