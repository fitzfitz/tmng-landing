import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/endpoints";

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  client?: string;
  category?: string;
  tags?: string[];
  coverImage?: string;
  gallery?: string[];
  liveUrl?: string;
  repoUrl?: string;
  status: "published" | "draft";
  isFeatured: boolean;
  completedAt?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
}

export interface CreateProjectInput {
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  client?: string;
  category?: string;
  tags?: string[];
  coverImage?: string;
  gallery?: string[];
  liveUrl?: string;
  repoUrl?: string;
  status?: "published" | "draft";
  isFeatured?: boolean;
  completedAt?: string;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {}

export function usePortfolio() {
  return useQuery<Project[]>({
    queryKey: ["admin-portfolio"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        API_ENDPOINTS.ADMIN.PORTFOLIO.LIST,
      );
      // NOTE: API returns { success: true, data: Project[] }
      return response.data.data;
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectInput) => {
      const response = await axiosInstance.post(
        API_ENDPOINTS.ADMIN.PORTFOLIO.CREATE,
        data,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProjectInput;
    }) => {
      const response = await axiosInstance.put(
        API_ENDPOINTS.ADMIN.PORTFOLIO.UPDATE(id),
        data,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(API_ENDPOINTS.ADMIN.PORTFOLIO.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
    },
  });
}
