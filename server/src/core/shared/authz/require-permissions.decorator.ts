import { SetMetadata } from '@nestjs/common';
import type { Permission } from './permissions';

export const REQUIRE_PERMISSIONS_KEY = 'require_permissions';
export const RequirePermissions = (...perms: Permission[]) => SetMetadata(REQUIRE_PERMISSIONS_KEY, perms);