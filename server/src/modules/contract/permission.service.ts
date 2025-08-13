import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { CollaboratorRole } from '@/core/domain/permission/collaborator-role.enum';
import { CollaboratorService } from './collaborator.service';

export interface PermissionMatrix {
    [key: string]: {
        [role: string]: string[];
    };
}

@Injectable()
export class PermissionService {
    private readonly permissionMatrix: PermissionMatrix = {
        // Contract operations
        'contract:read': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['*'],
            [CollaboratorRole.REVIEWER]: ['*'],
            [CollaboratorRole.VIEWER]: ['*'],
        },
        'contract:update': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['*'],
        },
        'contract:delete': {
            [CollaboratorRole.OWNER]: ['*'],
        },
        'contract:publish': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['*'],
        },

        // Stage operations
        'stage:read': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['*'],
            [CollaboratorRole.REVIEWER]: ['*'],
            [CollaboratorRole.VIEWER]: ['*'],
        },
        'stage:update': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['*'],
        },
        'stage:transition': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['*'],
        },

        // Collaborator operations
        'collaborator:read': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['*'],
            [CollaboratorRole.REVIEWER]: ['*'],
            [CollaboratorRole.VIEWER]: ['*'],
        },
        'collaborator:add': {
            [CollaboratorRole.OWNER]: ['*'],
        },
        'collaborator:update': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['viewer', 'reviewer'],
        },
        'collaborator:remove': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['viewer', 'reviewer'],
        },

        // File operations
        'file:read': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['*'],
            [CollaboratorRole.REVIEWER]: ['*'],
            [CollaboratorRole.VIEWER]: ['*'],
        },
        'file:upload': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['*'],
        },
        'file:delete': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['*'],
        },

        // Milestone operations
        'milestone:read': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['*'],
            [CollaboratorRole.REVIEWER]: ['*'],
            [CollaboratorRole.VIEWER]: ['*'],
        },
        'milestone:create': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['*'],
        },
        'milestone:update': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['*'],
        },
        'milestone:delete': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['*'],
        },

        // Task operations
        'task:read': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['*'],
            [CollaboratorRole.REVIEWER]: ['*'],
            [CollaboratorRole.VIEWER]: ['*'],
        },
        'task:create': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['*'],
        },
        'task:update': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['*'],
        },
        'task:delete': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['*'],
        },

        // Audit operations
        'audit:read': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['*'],
            [CollaboratorRole.REVIEWER]: ['*'],
            [CollaboratorRole.VIEWER]: ['*'],
        },

        // Export operations
        'export:pdf': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['*'],
            [CollaboratorRole.REVIEWER]: ['*'],
            [CollaboratorRole.VIEWER]: ['*'],
        },
        'export:docx': {
            [CollaboratorRole.OWNER]: ['*'],
            [CollaboratorRole.EDITOR]: ['*'],
            [CollaboratorRole.REVIEWER]: ['*'],
            [CollaboratorRole.VIEWER]: ['*'],
        },
    };

    constructor(
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        private readonly collaboratorService: CollaboratorService,
    ) {}

    async hasPermission(
        contractId: string,
        userId: number,
        permission: string,
        targetRole?: CollaboratorRole,
    ): Promise<boolean> {
        try {
            // Get user's role
            const userRole = await this.collaboratorService.getUserRole(contractId, userId);
            if (!userRole) {
                return false;
            }

            // Check if permission exists
            if (!this.permissionMatrix[permission]) {
                this.logger.APP.warn(`Permission ${permission} not defined in matrix`);
                return false;
            }

            // Check if user's role has permission
            const rolePermissions = this.permissionMatrix[permission][userRole];
            if (!rolePermissions) {
                return false;
            }

            // If no target role specified, check if user has any permission
            if (!targetRole) {
                return rolePermissions.length > 0;
            }

            // Check if user can perform action on target role
            return rolePermissions.includes('*') || rolePermissions.includes(targetRole);
        } catch (error) {
            this.logger.APP.error('PermissionService.hasPermission error', error);
            return false;
        }
    }

    async canModifyCollaborator(
        contractId: string,
        userId: number,
        targetUserId: number,
    ): Promise<boolean> {
        try {
            const userRole = await this.collaboratorService.getUserRole(contractId, userId);
            const targetRole = await this.collaboratorService.getUserRole(contractId, targetUserId);

            if (!userRole || !targetRole) {
                return false;
            }

            // Owner can modify anyone except themselves (to prevent removing last owner)
            if (userRole === CollaboratorRole.OWNER) {
                return userId !== targetUserId;
            }

            // Editor can modify viewers and reviewers
            if (userRole === CollaboratorRole.EDITOR) {
                return targetRole === CollaboratorRole.VIEWER || targetRole === CollaboratorRole.REVIEWER;
            }

            // Reviewer and Viewer cannot modify anyone
            return false;
        } catch (error) {
            this.logger.APP.error('PermissionService.canModifyCollaborator error', error);
            return false;
        }
    }

    getRoleHierarchy(): Record<CollaboratorRole, number> {
        return {
            [CollaboratorRole.OWNER]: 4,
            [CollaboratorRole.EDITOR]: 3,
            [CollaboratorRole.REVIEWER]: 2,
            [CollaboratorRole.VIEWER]: 1,
        };
    }

    isHigherRole(role1: CollaboratorRole, role2: CollaboratorRole): boolean {
        const hierarchy = this.getRoleHierarchy();
        return hierarchy[role1] > hierarchy[role2];
    }

    getAvailablePermissions(role: CollaboratorRole): string[] {
        const permissions: string[] = [];
        
        for (const [permission, rolePermissions] of Object.entries(this.permissionMatrix)) {
            if (rolePermissions[role]) {
                permissions.push(permission);
            }
        }
        
        return permissions;
    }

    async getUserPermissions(contractId: string, userId: number): Promise<string[]> {
        try {
            const userRole = await this.collaboratorService.getUserRole(contractId, userId);
            if (!userRole) {
                return [];
            }

            return this.getAvailablePermissions(userRole);
        } catch (error) {
            this.logger.APP.error('PermissionService.getUserPermissions error', error);
            return [];
        }
    }

    validateRoleTransition(fromRole: CollaboratorRole, toRole: CollaboratorRole): boolean {
        // Prevent downgrading owner to prevent losing access
        if (fromRole === CollaboratorRole.OWNER && toRole !== CollaboratorRole.OWNER) {
            return false;
        }

        return true;
    }
}