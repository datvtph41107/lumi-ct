export interface SuccessResponse<T = any> {
    success: true;
    message: string;
    data: T;
}

export interface ErrorInfo {
    name?: string;
    code?: string | number;
    details?: unknown;
}

export interface ErrorResponse {
    success: false;
    message: string | string[];
    statusCode: number;
    timestamp: string;
    path: string;
    error?: ErrorInfo;
}