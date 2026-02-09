import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/endpoints";

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
}

export function useContacts(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery<{
    data: ContactSubmission[];
    pagination: {
      totalPages: number;
      total: number;
      page: number;
      limit: number;
    };
  }>({
    queryKey: ["admin-contacts", params],
    queryFn: async () => {
      const response = await axiosInstance.get(
        API_ENDPOINTS.ADMIN.CONTACTS.LIST,
        { params },
      );
      return response.data;
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(API_ENDPOINTS.ADMIN.CONTACTS.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
    },
  });
}

export function useUpdateContactStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: ContactSubmission["status"];
    }) => {
      await axiosInstance.patch(API_ENDPOINTS.ADMIN.CONTACTS.UPDATE(id), {
        status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
    },
  });
}
