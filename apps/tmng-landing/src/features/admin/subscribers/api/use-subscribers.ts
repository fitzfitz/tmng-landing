import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/endpoints";

export interface Subscriber {
  id: string;
  email: string;
  status: "pending" | "active" | "unsubscribed";
  createdAt: string;
}

export function useSubscribers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery<{
    data: Subscriber[];
    pagination: {
      totalPages: number;
      total: number;
      page: number;
      limit: number;
    };
  }>({
    queryKey: ["admin-subscribers", params],
    queryFn: async () => {
      const response = await axiosInstance.get(
        API_ENDPOINTS.ADMIN.SUBSCRIBERS.LIST,
        { params },
      );
      return response.data;
    },
  });
}

export function useDeleteSubscriber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(API_ENDPOINTS.ADMIN.SUBSCRIBERS.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscribers"] });
    },
  });
}
