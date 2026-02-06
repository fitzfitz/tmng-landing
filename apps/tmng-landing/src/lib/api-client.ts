import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { BASE_URL } from '@/config/endpoints';
import { getCookie } from './cookies';

// Create axios instance
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // We're using cookies for auth but not credentials mode
});

// Request interceptor - Auto-inject auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Only try to get cookie in browser environment
    if (typeof document !== 'undefined') {
        const token = getCookie('auth_token');
        if (token) {
           config.headers.Authorization = `Bearer ${token}`;
        }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      console.warn('Unauthorized request, redirecting to login');
      
      // Only redirect if not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
