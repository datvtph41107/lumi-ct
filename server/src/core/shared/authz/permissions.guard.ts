import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_PERMISSIONS_KEY } from './require-permissions.decorator';
import { Permission } from './permissions';
import { PermissionService } from './permission.service';
import type { HeaderRequest } from '@/core/shared/interface/header-payload-req.interface';
import { hasPermission } from './permission-matrix';

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(private readonly reflector: Reflector, private readonly permService: PermissionService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const required = this.reflector.getAllAndOverride<Permission[]>(REQUIRE_PERMISSIONS_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (!required || required.length === 0) return true;

		const request = context.switchToHttp().getRequest<HeaderRequest>();
		const user = request.user as any;
		if (!user) throw new ForbiddenException('Forbidden');

		const grants = this.permService.getGlobalGrants(user.roles || []);
		const allOk = required.every((p) => hasPermission(grants, p));
		if (!allOk) throw new ForbiddenException('Insufficient permissions');
		return true;
	}
}