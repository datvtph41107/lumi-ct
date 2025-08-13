import axios, { type AxiosInstance, AxiosError } from "axios";
import type { ApiConfig, ApiResponse } from "~/core/types/api.types";
import { ConfigManager } from "../settings/ConfigManager";
import { Logger } from "../../Logger";

export abstract class BaseApiClient {
    protected instance: AxiosInstance;
    protected config: ApiConfig;
    protected logger: Logger;

    constructor() {
        this.config = ConfigManager.getInstance().getApiConfig();
        this.logger = Logger.getInstance();
        this.instance = axios.create({
            baseURL: this.config.baseURL,
            timeout: this.config.timeout,
            withCredentials: true,
        });
        this.setupInterceptors();
    }

    protected abstract setupInterceptors(): void;

    protected error(error: AxiosError): {
        message: string;
        statusCode: number;
        details?: unknown;
    } {
        return {
            message: error.message || "Network Error",
            statusCode: error.response?.status || 0,
            details: error.response?.data || null,
        };
    }

    public async get<TResponse, TParams = unknown>(url: string, params?: TParams): Promise<ApiResponse<TResponse>> {
        try {
            const response = await this.instance.get<ApiResponse<TResponse>>(url, { params });
            return response.data;
        } catch (error) {
            throw this.error(error as AxiosError);
        }
    }

    public async post<TResponse, TBody = Record<string, unknown>>(url: string, data?: TBody): Promise<ApiResponse<TResponse>> {
        try {
            const response = await this.instance.post<ApiResponse<TResponse>>(url, data);
            return response.data;
        } catch (error) {
            throw this.error(error as AxiosError);
        }
    }

    public async put<TResponse, TBody = Record<string, unknown>>(url: string, data?: TBody): Promise<ApiResponse<TResponse>> {
        try {
            const response = await this.instance.put<ApiResponse<TResponse>>(url, data);
            return response.data;
        } catch (error) {
            throw this.error(error as AxiosError);
        }
    }

    public async patch<TResponse, TBody = Record<string, unknown>>(url: string, data?: TBody): Promise<ApiResponse<TResponse>> {
        try {
            const response = await this.instance.patch<ApiResponse<TResponse>>(url, data);
            return response.data;
        } catch (error) {
            throw this.error(error as AxiosError);
        }
    }

    public async delete<TResponse>(url: string): Promise<ApiResponse<TResponse>> {
        try {
            const response = await this.instance.delete<ApiResponse<TResponse>>(url);
            return response.data;
        } catch (error) {
            throw this.error(error as AxiosError);
        }
    }
}
