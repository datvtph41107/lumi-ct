import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import type { SuccessResponse, ErrorResponse } from './response.types';

@Injectable()
export class ResponseInterceptor<T = any> implements NestInterceptor<T, SuccessResponse<T>> {
	intercept(context: ExecutionContext, next: CallHandler<T>): Observable<SuccessResponse<T>> {
		const httpCtx = context.switchToHttp();
		const request = httpCtx.getRequest<Request & { url?: string }>();
		const path = (request as any)?.url || '';

		return next.handle().pipe(
			map(
				(data: T): SuccessResponse<T> => ({
					success: true,
					message: 'OK',
					data,
				}),
			),
			catchError((err: any): Observable<never> => {
				const statusCode = err instanceof HttpException ? err.getStatus() : 500;
				const response = err instanceof HttpException ? err.getResponse() : null;
				const errorName = err?.name;

				let message: string | string[] = 'Internal Server Error';
				let details: unknown = undefined;

				if (response && typeof response === 'object') {
					const resObj = response as Record<string, any>;
					if ('message' in resObj) {
						const raw = resObj.message;
						if (Array.isArray(raw)) {
							message = 'Validation Failed';
							details = raw;
						} else {
							message = raw;
							details = resObj.dataError ?? resObj.details ?? undefined;
						}
					} else {
						message = err.message;
						details = response;
					}
				} else {
					message = err.message || message;
					details = err.stack || err.message;
				}

				const errorResponse: ErrorResponse = {
					success: false,
					message,
					statusCode,
					timestamp: new Date().toISOString(),
					path,
					error: {
						name: errorName,
						details,
					},
				};

				return throwError(() => new HttpException(errorResponse as any, statusCode));
			}),
		);
	}
}