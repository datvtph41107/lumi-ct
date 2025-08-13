import { BaseService } from "./base.service";
import type { ApiResponse } from "~/core/types/api.types";
import type { 
    Collaborator, 
    CreateCollaboratorDto, 
    UpdateCollaboratorDto, 
    CollaboratorPermissions,
    TransferOwnershipDto,
    CollaboratorListResponse,
    CollaboratorFilters,
    CollaboratorPagination
} from "~/types/contract/collaborator.types";

export class CollaboratorService extends BaseService {
    private readonly baseUrl = "/contracts";

    // ===== COLLABORATOR MANAGEMENT =====
    async addCollaborator(contractId: string, data: CreateCollaboratorDto): Promise<ApiResponse<Collaborator>> {
        return this.request.private.post<Collaborator, CreateCollaboratorDto>(
            `${this.baseUrl}/${contractId}/collaborators`,
            data
        );
    }

    async listCollaborators(contractId: string, filters?: CollaboratorFilters, pagination?: { page: number; limit: number }): Promise<ApiResponse<CollaboratorListResponse>> {
        const params = new URLSearchParams();
        
        if (filters?.role) params.append('role', filters.role);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.active !== undefined) params.append('active', filters.active.toString());
        
        if (pagination?.page) params.append('page', pagination.page.toString());
        if (pagination?.limit) params.append('limit', pagination.limit.toString());
        
        const url = `${this.baseUrl}/${contractId}/collaborators${params.toString() ? `?${params.toString()}` : ''}`;
        return this.request.private.get<CollaboratorListResponse>(url);
    }

    async updateCollaborator(collaboratorId: string, data: UpdateCollaboratorDto): Promise<ApiResponse<Collaborator>> {
        return this.request.private.patch<Collaborator, UpdateCollaboratorDto>(
            `${this.baseUrl}/collaborators/${collaboratorId}`,
            data
        );
    }

    async removeCollaborator(collaboratorId: string): Promise<ApiResponse<{ message: string }>> {
        return this.request.private.delete<{ message: string }>(
            `${this.baseUrl}/collaborators/${collaboratorId}`
        );
    }

    async transferOwnership(contractId: string, data: TransferOwnershipDto): Promise<ApiResponse<{ success: boolean; message: string }>> {
        return this.request.private.post<{ success: boolean; message: string }, TransferOwnershipDto>(
            `${this.baseUrl}/${contractId}/transfer-ownership`,
            data
        );
    }

    async getPermissions(contractId: string): Promise<ApiResponse<CollaboratorPermissions>> {
        return this.request.private.get<CollaboratorPermissions>(
            `${this.baseUrl}/${contractId}/permissions`
        );
    }

    // ===== HELPER METHODS =====
    async checkPermission(contractId: string, permission: string): Promise<boolean> {
        try {
            const response = await this.getPermissions(contractId);
            const permissions = response.data?.permissions;
            
            switch (permission) {
                case 'view':
                    return permissions?.can_view || false;
                case 'edit':
                    return permissions?.can_edit || false;
                case 'review':
                    return permissions?.can_review || false;
                case 'owner':
                    return permissions?.is_owner || false;
                default:
                    return false;
            }
        } catch (error) {
            console.error('Error checking permission:', error);
            return false;
        }
    }

    async isOwner(contractId: string): Promise<boolean> {
        return this.checkPermission(contractId, 'owner');
    }

    async canEdit(contractId: string): Promise<boolean> {
        return this.checkPermission(contractId, 'edit');
    }

    async canReview(contractId: string): Promise<boolean> {
        return this.checkPermission(contractId, 'review');
    }

    async canView(contractId: string): Promise<boolean> {
        return this.checkPermission(contractId, 'view');
    }
}

export const collaboratorService = new CollaboratorService();