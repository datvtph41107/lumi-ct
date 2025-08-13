import { ApiClient } from "~/core/http/api/ApiClient";
import type { ApiResponse } from "~/core/types/api.types";

// Define a type for the request methods exposed by ApiClient's public/private properties
type ApiClientRequestMethods = {
    get: <TResponse, TParams = unknown>(url: string, params?: TParams) => Promise<ApiResponse<TResponse>>;
    post: <TResponse, TBody = unknown>(url: string, data?: TBody) => Promise<ApiResponse<TResponse>>;
    put: <TResponse, TBody = unknown>(url: string, data?: TBody) => Promise<ApiResponse<TResponse>>;
    patch: <TResponse, TBody = unknown>(url: string, data?: TBody) => Promise<ApiResponse<TResponse>>;
    delete: <TResponse>(url: string) => Promise<ApiResponse<TResponse>>;
};

export abstract class BaseService {
    protected request: {
        public: ApiClientRequestMethods;
        private: ApiClientRequestMethods;
    };

    constructor() {
        const apiClientInstance = ApiClient.getInstance();
        this.request = {
            public: apiClientInstance.public as ApiClientRequestMethods,
            private: apiClientInstance.private as ApiClientRequestMethods,
        };
    }

    /**
     * Builds a URL with query parameters from an object.
     * Handles arrays, booleans, numbers, and strings. Filters out undefined/null values.
     * @param path The base URL path.
     * @param params An object containing query parameters.
     * @returns The constructed URL string.
     */
    protected buildUrl(path: string, params?: Record<string, string | number | boolean | Array<string | number | boolean>>): string {
        let url = path;
        if (params) {
            const queryString = this.buildQueryString(params);
            if (queryString) {
                url += `?${queryString}`;
            }
        }
        return url;
    }

    /**
     * Builds a query string from an object.
     * Handles arrays, booleans, numbers, and strings. Filters out undefined/null values.
     * @param params An object containing query parameters.
     * @returns The constructed query string.
     */
    protected buildQueryString(params: Record<string, string | number | boolean | Array<string | number | boolean>>): string {
        return Object.entries(params)
            .flatMap(([key, value]) => {
                if (value === undefined || value === null) return [];
                if (Array.isArray(value)) {
                    return value.map((item) => `${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
                }
                return [`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`];
            })
            .join("&");
    }

    /**
     * Constructs a URL with path parameters.
     * @param template The URL template with placeholders (e.g., "/users/:id").
     * @param pathParams An object mapping placeholder names to their values.
     * @returns The URL with path parameters replaced.
     */
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
        sortOrder?: "asc" | "desc",
    ): {
        page: number;
        limit: number;
        sortField?: string;
        sortOrder?: "asc" | "desc";
    } {
        return {
            page,
            limit,
            ...(sortField ? { sortField } : {}),
            ...(sortOrder ? { sortOrder } : {}),
        };
    }
}
