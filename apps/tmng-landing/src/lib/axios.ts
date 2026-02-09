import axios from "axios";
import { env } from "@/config/env";
import { APP_CONSTANTS } from "@/config/constants";

// Create axios instance with base configuration
export const axiosInstance = axios.create({
  baseURL: env.VITE_API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle auth errors (expired/invalid token)
    if (error.response?.status === 401) {
      localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER);
      window.location.href = "/admin/login";
    }

    return Promise.reject(error);
  },
);
