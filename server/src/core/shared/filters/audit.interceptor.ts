// src/modules/contracts/interceptors/audit.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Request } from 'express';
import { AuditLogService } from '@/modules/contract/audit-log.service';
import type { HeaderRequest, HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(@Inject(AuditLogService) private readonly audit: AuditLogService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest<Request & HeaderRequest>();
        const method = req.method;
        const path = req.path;
        const user = (req as HeaderRequest).user as HeaderUserPayload | undefined;

        if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
            return next.handle();
        }

        const start = Date.now();
        return next.handle().pipe(
            tap({
                next: (res: unknown) => {
                    const duration = Date.now() - start;
                    // create audit log (non-blocking)
                    void this.audit.create({
                        contract_id: req.params?.id,
                        user_id: user?.sub ? Number(user.sub) : undefined,
                        action: `${method} ${path}`,
                        meta: {
                            body: req.body as unknown,
                            params: req.params as unknown,
                            query: req.query as unknown,
                            result: res,
                            duration,
                        },
                    });
                },
            }),
        );
    }
}
