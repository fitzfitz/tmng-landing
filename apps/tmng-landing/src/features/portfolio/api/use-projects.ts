import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import type {
  Project,
  ProjectsListParams,
  ProjectsListResponse,
} from "../types";

// API endpoints for projects
const PROJECTS_ENDPOINTS = {
  LIST: "/api/projects",
  DETAIL: (slug: string) => `/api/projects/${slug}`,
} as const;

// Query keys
export const projectsKeys = {
  all: ["projects"] as const,
  lists: () => [...projectsKeys.all, "list"] as const,
  list: (params: ProjectsListParams) =>
    [...projectsKeys.lists(), params] as const,
  details: () => [...projectsKeys.all, "detail"] as const,
  detail: (slug: string) => [...projectsKeys.details(), slug] as const,
};

// Fetch projects list
export function useProjects(params: ProjectsListParams = {}) {
  return useQuery({
    queryKey: projectsKeys.list(params),
    queryFn: async (): Promise<ProjectsListResponse> => {
      const response = await axiosInstance.get(PROJECTS_ENDPOINTS.LIST, {
        params,
      });
      return response.data;
    },
  });
}

// Fetch single project by slug
export function useProject(slug: string) {
  return useQuery({
    queryKey: projectsKeys.detail(slug),
    queryFn: async (): Promise<Project> => {
      const response = await axiosInstance.get(PROJECTS_ENDPOINTS.DETAIL(slug));
      // API returns {success, data: {...}}, extract the data
      return response.data.data || response.data;
    },
    enabled: !!slug,
  });
}
