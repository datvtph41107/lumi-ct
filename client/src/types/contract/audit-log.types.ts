export interface AuditLog {
    id: string;
    contract_id?: string;
    user_id?: number;
    action: string;
    meta?: Record<string, any>;
    description?: string;
    created_at: string;
    user_name?: string;
    user_email?: string;
    user_avatar?: string;
}

export interface AuditLogFilters {
    action?: string;
    user_id?: number;
    date_from?: string;
    date_to?: string;
    search?: string;
}

export interface AuditLogPagination {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}

export interface AuditLogListResponse {
    data: AuditLog[];
    pagination: AuditLogPagination;
}

export interface AuditLogSummary {
    total_actions: number;
    actions_by_type: Record<string, number>;
    recent_activity: AuditLog[];
    top_users: Array<{
        user_id: number;
        action_count: number;
        user_name: string;
    }>;
}

// Common audit actions
export const AUDIT_ACTIONS = {
    // Contract actions
    CREATE_CONTRACT: 'CREATE_CONTRACT',
    UPDATE_CONTRACT: 'UPDATE_CONTRACT',
    DELETE_CONTRACT: 'DELETE_CONTRACT',
    PUBLISH_CONTRACT: 'PUBLISH_CONTRACT',

    // Stage actions
    SAVE_STAGE: 'SAVE_STAGE',
    TRANSITION_STAGE: 'TRANSITION_STAGE',
    AUTO_SAVE: 'AUTO_SAVE',

    // Collaborator actions
    ADD_COLLABORATOR: 'ADD_COLLABORATOR',
    UPDATE_COLLABORATOR_ROLE: 'UPDATE_COLLABORATOR_ROLE',
    REMOVE_COLLABORATOR: 'REMOVE_COLLABORATOR',
    REACTIVATE_COLLABORATOR: 'REACTIVATE_COLLABORATOR',
    TRANSFER_OWNERSHIP: 'TRANSFER_OWNERSHIP',

    // Version actions
    CREATE_VERSION: 'CREATE_VERSION',
    PUBLISH_VERSION: 'PUBLISH_VERSION',
    ROLLBACK_VERSION: 'ROLLBACK_VERSION',

    // Milestone & Task actions
    CREATE_MILESTONE: 'CREATE_MILESTONE',
    UPDATE_MILESTONE: 'UPDATE_MILESTONE',
    DELETE_MILESTONE: 'DELETE_MILESTONE',
    CREATE_TASK: 'CREATE_TASK',
    UPDATE_TASK: 'UPDATE_TASK',
    DELETE_TASK: 'DELETE_TASK',

    // File actions
    UPLOAD_FILE: 'UPLOAD_FILE',
    DELETE_FILE: 'DELETE_FILE',

    // Approval actions
    APPROVE_CONTRACT: 'APPROVE_CONTRACT',
    REJECT_CONTRACT: 'REJECT_CONTRACT',
    REQUEST_CHANGES: 'REQUEST_CHANGES',

    // Template actions
    CREATE_TEMPLATE: 'CREATE_TEMPLATE',
    UPDATE_TEMPLATE: 'UPDATE_TEMPLATE',
    DELETE_TEMPLATE: 'DELETE_TEMPLATE',

    // Notification actions
    CREATE_NOTIFICATION: 'CREATE_NOTIFICATION',
    CREATE_REMINDER: 'CREATE_REMINDER',

    // Export actions
    EXPORT_PDF: 'EXPORT_PDF',
    EXPORT_DOCX: 'EXPORT_DOCX',
    PRINT_CONTRACT: 'PRINT_CONTRACT',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

// Action categories for filtering
export const AUDIT_ACTION_CATEGORIES = {
    CONTRACT_MANAGEMENT: [
        AUDIT_ACTIONS.CREATE_CONTRACT,
        AUDIT_ACTIONS.UPDATE_CONTRACT,
        AUDIT_ACTIONS.DELETE_CONTRACT,
        AUDIT_ACTIONS.PUBLISH_CONTRACT,
    ],
    STAGE_MANAGEMENT: [AUDIT_ACTIONS.SAVE_STAGE, AUDIT_ACTIONS.TRANSITION_STAGE, AUDIT_ACTIONS.AUTO_SAVE],
    COLLABORATOR_MANAGEMENT: [
        AUDIT_ACTIONS.ADD_COLLABORATOR,
        AUDIT_ACTIONS.UPDATE_COLLABORATOR_ROLE,
        AUDIT_ACTIONS.REMOVE_COLLABORATOR,
        AUDIT_ACTIONS.REACTIVATE_COLLABORATOR,
        AUDIT_ACTIONS.TRANSFER_OWNERSHIP,
    ],
    VERSION_MANAGEMENT: [AUDIT_ACTIONS.CREATE_VERSION, AUDIT_ACTIONS.PUBLISH_VERSION, AUDIT_ACTIONS.ROLLBACK_VERSION],
    MILESTONE_TASK_MANAGEMENT: [
        AUDIT_ACTIONS.CREATE_MILESTONE,
        AUDIT_ACTIONS.UPDATE_MILESTONE,
        AUDIT_ACTIONS.DELETE_MILESTONE,
        AUDIT_ACTIONS.CREATE_TASK,
        AUDIT_ACTIONS.UPDATE_TASK,
        AUDIT_ACTIONS.DELETE_TASK,
    ],
    FILE_MANAGEMENT: [AUDIT_ACTIONS.UPLOAD_FILE, AUDIT_ACTIONS.DELETE_FILE],
    APPROVAL_WORKFLOW: [AUDIT_ACTIONS.APPROVE_CONTRACT, AUDIT_ACTIONS.REJECT_CONTRACT, AUDIT_ACTIONS.REQUEST_CHANGES],
    TEMPLATE_MANAGEMENT: [AUDIT_ACTIONS.CREATE_TEMPLATE, AUDIT_ACTIONS.UPDATE_TEMPLATE, AUDIT_ACTIONS.DELETE_TEMPLATE],
    NOTIFICATION_MANAGEMENT: [AUDIT_ACTIONS.CREATE_NOTIFICATION, AUDIT_ACTIONS.CREATE_REMINDER],
    EXPORT_ACTIONS: [AUDIT_ACTIONS.EXPORT_PDF, AUDIT_ACTIONS.EXPORT_DOCX, AUDIT_ACTIONS.PRINT_CONTRACT],
} as const;

export type AuditActionCategory = keyof typeof AUDIT_ACTION_CATEGORIES;
