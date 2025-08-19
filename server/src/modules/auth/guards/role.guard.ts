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
        const has = requiredRoles.some((r) => (user.roles as unknown[]).includes(r as unknown));
        if (!has) throw new ForbiddenException('Insufficient role');
        return true;
    }
}
