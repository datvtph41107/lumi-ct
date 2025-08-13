import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';
export const RequirePermission = (permission: string) => SetMetadata(PERMISSION_KEY, permission);

export const PERMISSIONS = {
    // Contract permissions
    CONTRACT_READ: 'contract:read',
    CONTRACT_UPDATE: 'contract:update',
    CONTRACT_DELETE: 'contract:delete',
    CONTRACT_PUBLISH: 'contract:publish',

    // Stage permissions
    STAGE_READ: 'stage:read',
    STAGE_UPDATE: 'stage:update',
    STAGE_TRANSITION: 'stage:transition',

    // Collaborator permissions
    COLLABORATOR_READ: 'collaborator:read',
    COLLABORATOR_ADD: 'collaborator:add',
    COLLABORATOR_UPDATE: 'collaborator:update',
    COLLABORATOR_REMOVE: 'collaborator:remove',

    // File permissions
    FILE_READ: 'file:read',
    FILE_UPLOAD: 'file:upload',
    FILE_DELETE: 'file:delete',

    // Milestone permissions
    MILESTONE_READ: 'milestone:read',
    MILESTONE_CREATE: 'milestone:create',
    MILESTONE_UPDATE: 'milestone:update',
    MILESTONE_DELETE: 'milestone:delete',

    // Task permissions
    TASK_READ: 'task:read',
    TASK_CREATE: 'task:create',
    TASK_UPDATE: 'task:update',
    TASK_DELETE: 'task:delete',

    // Audit permissions
    AUDIT_READ: 'audit:read',

    // Export permissions
    EXPORT_PDF: 'export:pdf',
    EXPORT_DOCX: 'export:docx',
} as const;