export interface SuccessResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
}

export interface ErrorResponse<T = any> {
    success: boolean;
    message: string | string[];
    error: T;
}
