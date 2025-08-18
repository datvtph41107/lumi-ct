import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ErrorResponse, SuccessResponse } from './response.interface';

@Injectable()
export class ResponseInterceptor<T = any> implements NestInterceptor<T, SuccessResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<SuccessResponse<T>> {
        return next.handle().pipe(
            map(
                (data: T): SuccessResponse<T> => ({
                    success: true,
                    message: 'Request successful',
                    data,
                }),
            ),
            catchError((err: unknown): Observable<never> => {
                const isHttp = err instanceof HttpException;
                const statusCode = isHttp ? err.getStatus() : 500;
                const responsePayload = isHttp ? err.getResponse() : null;

                const errorName = isHttp ? err.name : err instanceof Error ? err.name : 'Error';
                let errorMessage: string | string[] = 'Internal Server Error';
                let errorDetail: unknown = null;

                if (responsePayload && typeof responsePayload === 'object') {
                    const resObj = responsePayload as Record<string, unknown>;
                    if ('message' in resObj) {
                        const rawMessage = resObj.message;
                        if (Array.isArray(rawMessage)) {
                            errorMessage = 'Validation Failed';
                            errorDetail = rawMessage as string[];
                        } else if (typeof rawMessage === 'string') {
                            errorMessage = rawMessage;
                            errorDetail = resObj.dataError ?? '';
                        } else {
                            errorMessage = 'Request failed';
                            errorDetail = resObj;
                        }
                    } else if (err instanceof Error) {
                        errorMessage = err.message;
                        errorDetail = resObj;
                    }
                } else if (err instanceof Error) {
                    errorMessage = err.message;
                    errorDetail = err.stack || err.message;
                }

                const errorResponse: ErrorResponse & { error: { name?: string; details?: unknown } } = {
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
