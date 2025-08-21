import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HeaderRequest } from '../../../core/shared/interface/header-payload-req.interface';
import { Role, AdminRole } from '@/core/shared/enums/base.enums';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<(Role | AdminRole)[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) return true;

        const request = context.switchToHttp().getRequest<HeaderRequest>();
        const user = request.user;
        if (!user || !Array.isArray(user.roles)) {
            throw new ForbiddenException('Forbidden');
        }
        const normalized = (user.roles as unknown[]).map((r) => String(r).toUpperCase());
        const has = requiredRoles.some((r) => normalized.includes(String(r).toUpperCase()));
        if (!has) throw new ForbiddenException('Insufficient role');
        return true;
    }
}
