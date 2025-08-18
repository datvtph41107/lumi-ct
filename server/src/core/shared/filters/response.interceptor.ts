import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiSuccessResponse, ApiErrorResponse } from '@/core/shared/types/common.types';

interface HttpExceptionResponse {
  message: string | string[];
  error?: string;
  statusCode: number;
  dataError?: unknown;
}

@Injectable()
export class ResponseInterceptor<T = unknown> implements NestInterceptor<T, ApiSuccessResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiSuccessResponse<T>> {
        return next.handle().pipe(
            map(
                (data: T): ApiSuccessResponse<T> => ({
                    success: true,
                    message: 'Request successful',
                    data,
                }),
            ),
            catchError((err: Error | HttpException): Observable<never> => {
                const statusCode = err instanceof HttpException ? err.getStatus() : 500;
                const response = err instanceof HttpException ? err.getResponse() : null;

                const errorName = err.name || 'UnknownError';
                let errorMessage: string | string[] = 'Internal Server Error';
                let errorDetail: unknown = null;

                if (response && typeof response === 'object') {
                    const resObj = response as HttpExceptionResponse;

                    if ('message' in resObj) {
                        const rawMessage = resObj.message;

                        if (Array.isArray(rawMessage)) {
                            errorMessage = 'Validation Failed';
                            errorDetail = rawMessage;
                        } else {
                            errorMessage = rawMessage;
                            errorDetail = resObj.dataError ?? '';
                        }
                    } else {
                        errorMessage = err.message;
                        errorDetail = response;
                    }
                } else {
                    errorMessage = err.message;
                    errorDetail = err.stack || err.message;
                }

                const errorResponse: ApiErrorResponse = {
                    success: false,
                    message: errorMessage,
                    error: {
                        name: errorName,
                        details: errorDetail,
                    },
                };

                return throwError(() => new HttpException(errorResponse, statusCode));
            }),
        );
    }
}
