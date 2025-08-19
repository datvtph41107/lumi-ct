// src/core/shared/decorators/setmeta.decorator.ts
import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { AdminRole, Department, Permission, Role } from '../enums/base.enums';
import { HeaderRequest } from '../interface/header-payload-req.interface';
import { CollaboratorRole } from '@/core/domain/permission';

export const ROLES_METADATA_KEY = 'roles';
export const COLLAB_ROLES_METADATA_KEY = 'collab_roles';

// System Role based guard metadata
export const Roles = (...roles: (Role | AdminRole)[]) => SetMetadata(ROLES_METADATA_KEY, roles);

export const CollaboratorRoles = (...roles: CollaboratorRole[]) => SetMetadata(COLLAB_ROLES_METADATA_KEY, roles);

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<HeaderRequest>();
    return request.user;
});
