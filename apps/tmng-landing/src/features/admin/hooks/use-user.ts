import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { ENDPOINTS } from '@/config/endpoints';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "author" | string;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserResponse {
  success: boolean;
  user: User;
}

export function useUser() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const { data } = await apiClient.get<UserResponse>(ENDPOINTS.AUTH.ME);
      return data.user;
    },
    retry: false,
    gcTime: 5 * 60 * 1000, // 5 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
