import { Injectable } from '@nestjs/common';
import { Role } from '@/core/shared/enums/base.enums';

export interface UserRoleContext {
    roles?: Role[] | string[];
    role?: Role | string;
}

@Injectable()
export class RoleService {
    /**
     * Check if user has manager role
     */
    isManager(user: UserRoleContext): boolean {
        if (Array.isArray(user?.roles)) {
            return user.roles.some(role => 
                role === Role.MANAGER || 
                (typeof role === 'string' && role.toUpperCase() === 'MANAGER')
            );
        }
        
        if (user?.role) {
            return user.role === Role.MANAGER || 
                   (typeof user.role === 'string' && user.role.toUpperCase() === 'MANAGER');
        }
        
        return false;
    }

    /**
     * Check if user has staff role
     */
    isStaff(user: UserRoleContext): boolean {
        if (Array.isArray(user?.roles)) {
            return user.roles.some(role => 
                role === Role.STAFF || 
                (typeof role === 'string' && role.toUpperCase() === 'STAFF')
            );
        }
        
        if (user?.role) {
            return user.role === Role.STAFF || 
                   (typeof user.role === 'string' && user.role.toUpperCase() === 'STAFF');
        }
        
        return false;
    }

    /**
     * Get user's primary role as string
     */
    getPrimaryRole(user: UserRoleContext): string {
        if (this.isManager(user)) return 'MANAGER';
        if (this.isStaff(user)) return 'STAFF';
        return 'UNKNOWN';
    }

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole(user: UserRoleContext, roles: (Role | string)[]): boolean {
        return roles.some(role => {
            if (role === Role.MANAGER || role === 'MANAGER') return this.isManager(user);
            if (role === Role.STAFF || role === 'STAFF') return this.isStaff(user);
            return false;
        });
    }
}