export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
  },
  ADMIN: {
    STATS: "/api/admin/stats",
    POSTS: {
      LIST: "/api/admin/posts",
      CREATE: "/api/admin/posts",
      GET: (id: string) => `/api/admin/posts/${id}`,
      UPDATE: (id: string) => `/api/admin/posts/${id}`,
      DELETE: (id: string) => `/api/admin/posts/${id}`,
    },
    CATEGORIES: {
      LIST: "/api/admin/categories",
      CREATE: "/api/admin/categories",
      UPDATE: (id: string) => `/api/admin/categories/${id}`,
      DELETE: (id: string) => `/api/admin/categories/${id}`,
    },
    TAGS: {
      LIST: "/api/admin/tags",
      CREATE: "/api/admin/tags",
      UPDATE: (id: string) => `/api/admin/tags/${id}`,
      DELETE: (id: string) => `/api/admin/tags/${id}`,
    },
    CONTACTS: {
      LIST: "/api/admin/contacts",
      GET: (id: string) => `/api/admin/contacts/${id}`,
      UPDATE: (id: string) => `/api/admin/contacts/${id}`,
      DELETE: (id: string) => `/api/admin/contacts/${id}`,
    },
    SUBSCRIBERS: {
      LIST: "/api/admin/subscribers",
      DELETE: (id: string) => `/api/admin/subscribers/${id}`,
    },
    USERS: {
      LIST: "/api/admin/users",
      CREATE: "/api/admin/users",
      GET: (id: string) => `/api/admin/users/${id}`,
      UPDATE: (id: string) => `/api/admin/users/${id}`,
      DELETE: (id: string) => `/api/admin/users/${id}`,
    },
    PORTFOLIO: {
      LIST: "/api/admin/portfolio",
      CREATE: "/api/admin/portfolio",
      GET: (id: string) => `/api/admin/portfolio/${id}`,
      UPDATE: (id: string) => `/api/admin/portfolio/${id}`,
      DELETE: (id: string) => `/api/admin/portfolio/${id}`,
    },
  },
  POSTS: {
    LIST: "/api/posts",
    DETAIL: (slug: string) => `/api/posts/${slug}`,
    CREATE: "/api/posts",
    GET: (id: string) => `/api/posts/${id}`,
    UPDATE: (id: string) => `/api/posts/${id}`,
    DELETE: (id: string) => `/api/posts/${id}`,
  } as const,
  CONTACTS: {
    LIST: "/api/contacts",
    CREATE: "/api/contacts",
    GET: (id: string) => `/api/contacts/${id}`,
    DELETE: (id: string) => `/api/contacts/${id}`,
  },
  USERS: {
    LIST: "/api/users",
    GET: (id: string) => `/api/users/${id}`,
    UPDATE: (id: string) => `/api/users/${id}`,
  },
  CATEGORIES: {
    LIST: "/api/categories",
    CREATE: "/api/categories",
    UPDATE: (id: string) => `/api/categories/${id}`,
    DELETE: (id: string) => `/api/categories/${id}`,
  },
  TAGS: {
    LIST: "/api/tags",
    CREATE: "/api/tags",
    UPDATE: (id: string) => `/api/tags/${id}`,
    DELETE: (id: string) => `/api/tags/${id}`,
  },
  SUBSCRIBERS: {
    LIST: "/api/subscribers",
    CREATE: "/api/subscribers",
  },
} as const;
