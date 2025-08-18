// src/core/shared/decorators/setmeta.decorator.ts
import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { AdminRole, Department, Permission, Role } from '../enums/base.enums';
import { CollaboratorRole } from '@/core/domain/permission/collaborator-role.enum';
import { HeaderRequest } from '../interface/header-payload-req.interface';

export const PERMISSIONS_METADATA_KEY = 'permissions';
export const ROLES_METADATA_KEY = 'roles';
export const COLLAB_ROLES_METADATA_KEY = 'collab_roles';

export interface PermissionMetadata {
    permissions?: Permission[];
    departments?: Department[];
}

export const Permissions = (...configs: PermissionMetadata[]) => SetMetadata(PERMISSIONS_METADATA_KEY, configs);

export const Roles = (...roles: (Role | AdminRole)[]) => SetMetadata(ROLES_METADATA_KEY, roles);

export const CollaboratorRoles = (...roles: CollaboratorRole[]) =>
    SetMetadata(COLLAB_ROLES_METADATA_KEY, roles);

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<HeaderRequest>();
    return request.user;
});
