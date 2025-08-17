import { ApiClient } from '~/core/http/api/ApiClient';
import type { ApiResponse } from '~/core/types/api.types';

// Define a type for the request methods exposed by ApiClient's public/private properties
type ApiClientRequestMethods = {
    get: <TResponse, TParams = unknown>(url: string, params?: TParams) => Promise<ApiResponse<TResponse>>;
    post: <TResponse, TBody = unknown>(
        url: string,
        data?: TBody,
        options?: { headers?: Record<string, string> },
    ) => Promise<ApiResponse<TResponse>>;
    put: <TResponse, TBody = unknown>(
        url: string,
        data?: TBody,
        options?: { headers?: Record<string, string> },
    ) => Promise<ApiResponse<TResponse>>;
    patch: <TResponse, TBody = unknown>(
        url: string,
        data?: TBody,
        options?: { headers?: Record<string, string> },
    ) => Promise<ApiResponse<TResponse>>;
    delete: <TResponse>(url: string) => Promise<ApiResponse<TResponse>>;
};

export abstract class BaseService {
    protected request: {
        public: ApiClientRequestMethods;
        private: ApiClientRequestMethods;
    };

    protected basePath: string;

    constructor(basePath: string = '') {
        const apiClientInstance = ApiClient.getInstance();
        this.request = {
            public: apiClientInstance.public as ApiClientRequestMethods,
            private: apiClientInstance.private as ApiClientRequestMethods,
        };
        this.basePath = basePath;
    }

    // Unified HTTP helpers (default to private client)
    protected async get<TResponse, TParams = unknown>(
        path: string,
        params?: TParams,
        client: 'public' | 'private' = 'private',
    ): Promise<ApiResponse<TResponse>> {
        const url = this.joinPath(path);
        return this.request[client].get<TResponse, TParams>(url, params);
    }

    protected async post<TResponse, TBody = unknown>(
        path: string,
        data?: TBody,
        options?: { headers?: Record<string, string>; client?: 'public' | 'private' },
    ): Promise<ApiResponse<TResponse>> {
        const url = this.joinPath(path);
        const client = options?.client ?? 'private';
        const headers = options?.headers;
        return this.request[client].post<TResponse, TBody>(url, data, headers ? { headers } : undefined);
    }

    protected async put<TResponse, TBody = unknown>(
        path: string,
        data?: TBody,
        options?: { headers?: Record<string, string>; client?: 'public' | 'private' },
    ): Promise<ApiResponse<TResponse>> {
        const url = this.joinPath(path);
        const client = options?.client ?? 'private';
        const headers = options?.headers;
        return this.request[client].put<TResponse, TBody>(url, data, headers ? { headers } : undefined);
    }

    protected async patch<TResponse, TBody = unknown>(
        path: string,
        data?: TBody,
        options?: { headers?: Record<string, string>; client?: 'public' | 'private' },
    ): Promise<ApiResponse<TResponse>> {
        const url = this.joinPath(path);
        const client = options?.client ?? 'private';
        const headers = options?.headers;
        return this.request[client].patch<TResponse, TBody>(url, data, headers ? { headers } : undefined);
    }

    protected async delete<TResponse>(
        path: string,
        client: 'public' | 'private' = 'private',
    ): Promise<ApiResponse<TResponse>> {
        const url = this.joinPath(path);
        return this.request[client].delete<TResponse>(url);
    }

    // Helpers
    protected buildUrl(
        path: string,
        params?: Record<string, string | number | boolean | Array<string | number | boolean>>,
    ): string {
        let url = path;
        if (params) {
            const queryString = this.buildQueryString(params);
            if (queryString) {
                url += `?${queryString}`;
            }
        }
        return url;
    }

    protected buildQueryString(
        params: Record<string, string | number | boolean | Array<string | number | boolean>>,
    ): string {
        return Object.entries(params)
            .flatMap(([key, value]) => {
                if (value === undefined || value === null) return [];
                if (Array.isArray(value)) {
                    return value.map((item) => `${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
                }
                return [`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`];
            })
            .join('&');
    }

    protected buildUrlWithParams(template: string, pathParams: Record<string, string | number>): string {
        let url = template;
        for (const key in pathParams) {
            url = url.replace(`:${key}`, encodeURIComponent(String(pathParams[key])));
        }
        return url;
    }

    /**
     * Helper for common pagination parameters.
     * @param page The current page number (1-indexed).
     * @param limit The number of items per page.
     * @param sortField The field to sort by.
     * @param sortOrder The sort order ('asc' or 'desc').
     * @returns An object with pagination query parameters.
     */
    protected getPaginationParams(
        page: number,
        limit: number,
        sortField?: string,
        sortOrder?: 'asc' | 'desc',
    ): {
        page: number;
        limit: number;
        sortField?: string;
        sortOrder?: 'asc' | 'desc';
    } {
        return {
            page,
            limit,
            ...(sortField ? { sortField } : {}),
            ...(sortOrder ? { sortOrder } : {}),
        };
    }

    private joinPath(path: string): string {
        if (!this.basePath) return path.startsWith('/') ? path : `/${path}`;
        const left = this.basePath.endsWith('/') ? this.basePath.slice(0, -1) : this.basePath;
        const right = path.startsWith('/') ? path : `/${path}`;
        return `${left}${right}`;
    }
}
