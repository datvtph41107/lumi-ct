import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class PermissionGuard implements CanActivate {
	async canActivate(_context: ExecutionContext): Promise<boolean> {
		return true;
	}
}

export { PermissionGuard as PermissionsGuard };
