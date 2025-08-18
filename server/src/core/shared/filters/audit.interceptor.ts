// src/modules/contracts/interceptors/audit.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Request } from 'express';
import { AuditLogService } from '@/modules/contract/audit-log.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(@Inject(AuditLogService) private readonly audit: AuditLogService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const req = context.switchToHttp().getRequest<Request>();
        const method = req.method;
        const path = req.path;
        const user = (req as unknown as { user?: { sub?: string | number } }).user;

        if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
            return next.handle();
        }

        const start = Date.now();
        return next.handle().pipe(
            tap((res: unknown) => {
                const duration = Date.now() - start;
                void this.audit.create({
                    contract_id: req.params?.id,
                    user_id: user?.sub ? Number(user.sub) : undefined,
                    action: `${method} ${path}`,
                    meta: { body: req.body, params: req.params, query: req.query, result: res, duration } as unknown as any,
                });
            }),
        );
    }
}
