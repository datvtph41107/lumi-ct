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
            catchError((err: Error): Observable<never> => {
                const statusCode = err instanceof HttpException ? err.getStatus() : 500;
                const response = err instanceof HttpException ? err.getResponse() : null;

                const errorName = err?.name;
                let errorMessage: string | string[] = 'Internal Server Error';
                let errorDetail: any = null;

                if (response && typeof response === 'object') {
                    const resObj = response as Record<string, any>;

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

                const errorResponse: ErrorResponse & { data_error?: any } = {
                    success: false,
                    message: errorMessage,
                    error: {
                        name: errorName,
                        details: errorDetail as string[],
                    },
                };

                return throwError(() => new HttpException(errorResponse, statusCode));
            }),
        );
    }
}
