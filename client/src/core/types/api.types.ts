import type { AppDispatch, RootState } from '~/redux';
import type { User } from '~/types/auth/auth.types';

export interface ApiConfig {
    baseURL: string;
    timeout: number;
    enableLogging: boolean;
}

export interface RequestParams {
    [key: string]: string | number | boolean | undefined;
}

export type ApiMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface ApiResponse<T> {
    // Compatible with server ResponseInterceptor
    success?: boolean;
    status?: number;
    message?: string | string[];
    data: T;
}

export interface ApiEndpoint<TParams = unknown, TBody = unknown> {
    method: ApiMethod;
    url: string | ((params: TParams) => string);
    clientType?: 'public' | 'private';
    transformParams?: (params?: TParams) => unknown;
    transformBody?: (body?: TBody) => unknown;
}

export interface ApiError {
    message: string;
    statusCode: number;
    code?: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
}

export interface AuthConfig {
    loginEndpoint: string;
    refreshEndpoint: string;
    logoutEndpoint: string;
}

export interface ReduxStore {
    getState: () => RootState;
    dispatch: AppDispatch;
}

// ✅ API Response Types for Auth
export interface LoginResponse {
    accessToken: string;
    sessionId: string;
    tokenExpiry: number;
    user?: User;
}

export interface UserResponse {
    userData: User;
}

export interface SessionData {
    isValid: boolean;
    sessionId?: string;
    lastActivity?: string;
}

// ✅ API Response Types for User Management
export interface UsersListResponse {
    data: User[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
}

export interface UserDetailResponse {
    data: User;
}

// ✅ API Response Types for Contracts
export interface Contract {
    id: number;
    title: string;
    description: string;
    status: 'active' | 'expired' | 'pending' | 'cancelled';
    type: string;
    value: number;
    startDate: string;
    endDate: string;
    clientName: string;
    assignedTo: User;
    createdAt: string;
    updatedAt: string;
}

export interface ContractType {
    id: number;
    name: string;
    code: string;
    description?: string;
}

export interface ContractsListResponse {
    data: Contract[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
}

export interface ContractDetailResponse {
    data: Contract;
}

export interface ContractTypesResponse {
    data: ContractType[];
}

export interface ContractStatistics {
    totalActive: number;
    totalExpired: number;
    totalPending: number;
    totalValue: number;
    monthlyGrowth: number;
}

export interface ContractStatisticsResponse {
    data: ContractStatistics;
}
