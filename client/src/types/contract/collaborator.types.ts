import type { CollaboratorRole } from './contract.types';

export interface Collaborator {
    id: string;
    contract_id: string;
    user_id: number;
    role: CollaboratorRole;
    active: boolean;
    user_name?: string;
    user_email?: string;
    user_avatar?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateCollaboratorDto {
    user_id: number;
    role: CollaboratorRole;
    user_email?: string;
    user_name?: string;
}

export interface UpdateCollaboratorDto {
    role: CollaboratorRole;
}

export interface CollaboratorPermissions {
    role: CollaboratorRole;
    permissions: {
        can_view: boolean;
        can_edit: boolean;
        can_review: boolean;
        is_owner: boolean;
    };
}

export interface TransferOwnershipDto {
    to_user_id: number;
}

export interface CollaboratorFilters {
    role?: CollaboratorRole;
    search?: string;
    active?: boolean;
}

export interface CollaboratorPagination {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}

export interface CollaboratorListResponse {
    data: Collaborator[];
    pagination: CollaboratorPagination;
}

// Role-based permission checks
export const ROLE_PERMISSIONS = {
    owner: {
        can_view: true,
        can_edit: true,
        can_review: true,
        can_manage_collaborators: true,
        can_transfer_ownership: true,
        can_delete: true,
        can_approve: true,
        can_reject: true,
    },
    editor: {
        can_view: true,
        can_edit: true,
        can_review: true,
        can_manage_collaborators: false,
        can_transfer_ownership: false,
        can_delete: false,
        can_approve: false,
        can_reject: false,
    },
    reviewer: {
        can_view: true,
        can_edit: false,
        can_review: true,
        can_manage_collaborators: false,
        can_transfer_ownership: false,
        can_delete: false,
        can_approve: true,
        can_reject: true,
    },
    viewer: {
        can_view: true,
        can_edit: false,
        can_review: false,
        can_manage_collaborators: false,
        can_transfer_ownership: false,
        can_delete: false,
        can_approve: false,
        can_reject: false,
    },
} as const;

export type RolePermissionKey = keyof typeof ROLE_PERMISSIONS.owner;
