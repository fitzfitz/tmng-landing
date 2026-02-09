import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/endpoints";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  bio?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role?: string;
  password?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: string;
  password?: string;
  bio?: string;
  image?: string;
}

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.USERS.LIST);
      return response.data.data;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const response = await axiosInstance.post(
        API_ENDPOINTS.ADMIN.USERS.CREATE,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserInput }) => {
      const response = await axiosInstance.put(
        API_ENDPOINTS.ADMIN.USERS.UPDATE(id),
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(API_ENDPOINTS.ADMIN.USERS.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}
