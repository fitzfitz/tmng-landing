// API Endpoint Configuration
// All API endpoints are defined here as constants for easy management and type safety

const BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8787';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
    LOGOUT: '/api/auth/logout',
  },
  ADMIN: {
    STATS: '/api/admin/stats',
    // Future endpoints
    POSTS: '/api/admin/posts',
    CATEGORIES: '/api/admin/categories',
    TAGS: '/api/admin/tags',
    SUBSCRIBERS: '/api/admin/subscribers',
    CONTACTS: '/api/admin/contacts',
    USERS: '/api/admin/users',
  },
  PUBLIC: {
    POSTS: '/api/posts',
  },
} as const;

export { BASE_URL };
