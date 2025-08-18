export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:3001/api/v1',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
} as const;

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh-token',
        PROFILE: '/auth/me',
    },
    USERS: {
        LIST: '/users',
        CREATE: '/users',
        UPDATE: (id: string) => `/users/${id}`,
        DELETE: (id: string) => `/users/${id}`,
        GET_BY_ID: (id: string) => `/users/${id}`,
    },
} as const;
