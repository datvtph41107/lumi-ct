import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { AuditLogService } from '@/modules/contract/audit-log.service';
import { UserJwtPayload } from '../interface/jwt-payload.interface';

interface RequestWithUser extends Request {
    user?: UserJwtPayload;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(@Inject(AuditLogService) private readonly audit: AuditLogService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const req = context.switchToHttp().getRequest<RequestWithUser>();
        const method = req.method;
        const path = req.path;
        const user = req.user as UserJwtPayload;

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
                            body: req.body || {},
                            params: req.params,
                            query: req.query,
                            result: res,
                            duration,
                        },
                    });
                },
            }),
        );
    }
}
