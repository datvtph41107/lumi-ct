import { BaseService } from './base.service';
import { authCoreService } from '~/core/auth/AuthCoreSerivce';
import type {
    Contract,
    CreateContractDto,
    UpdateContractDto,
    ContractFilters,
    ContractPagination,
    ContractListResponse,
    Milestone,
    Task,
    ContractFile,
    Collaborator,
    AuditLog,
} from '~/types/contract/contract.types';

class ContractService extends BaseService {
    constructor() {
        super('/contracts');
    }

    // ==================== CONTRACT CRUD OPERATIONS ====================

    async createContract(data: CreateContractDto): Promise<{ data: Contract }> {
        // Check permission
        if (!authCoreService.canCreateContract(data.type)) {
            throw new Error('Không có quyền tạo hợp đồng');
        }

        const response = await this.post<Contract>('/', data);
        return response;
    }

    async getContract(id: number): Promise<{ data: Contract }> {
        // Check permission
        if (!authCoreService.canReadContract(id)) {
            throw new Error('Không có quyền xem hợp đồng này');
        }

        const response = await this.get<Contract>(`/${id}`);
        return response;
    }

    async updateContract(id: number, data: UpdateContractDto): Promise<{ data: Contract }> {
        // Check permission
        if (!authCoreService.canUpdateContract(id)) {
            throw new Error('Không có quyền cập nhật hợp đồng này');
        }

        const response = await this.put<Contract>(`/${id}`, data);
        return response;
    }

    async deleteContract(id: number): Promise<{ data: { message: string } }> {
        // Check permission
        if (!authCoreService.canDeleteContract(id)) {
            throw new Error('Không có quyền xóa hợp đồng này');
        }

        const response = await this.delete<{ message: string }>(`/${id}`);
        return response;
    }

    async listContracts(
        filters: ContractFilters,
        pagination: ContractPagination,
    ): Promise<{ data: ContractListResponse }> {
        const params = new URLSearchParams();

        // Add filters
        if (filters.status) params.append('status', filters.status);
        if (filters.type) params.append('type', filters.type);
        if (filters.search) params.append('search', filters.search);

        // Add pagination
        params.append('page', pagination.page?.toString() || '1');
        params.append('limit', pagination.limit?.toString() || '10');

        const response = await this.get<ContractListResponse>(`/?${params.toString()}`);
        return response;
    }

    // ==================== CONTRACT WORKFLOW OPERATIONS ====================

    async submitForReview(id: number): Promise<{ data: Contract }> {
        // Check permission
        if (!authCoreService.canUpdateContract(id)) {
            throw new Error('Không có quyền submit hợp đồng này');
        }

        const response = await this.post<Contract>(`/${id}/submit`, {});
        return response;
    }

    async approveContract(id: number, comment?: string): Promise<{ data: Contract }> {
        // Check permission
        if (!authCoreService.canApproveContract(id)) {
            throw new Error('Không có quyền phê duyệt hợp đồng này');
        }

        const response = await this.post<Contract>(`/${id}/approve`, { comment });
        return response;
    }

    async rejectContract(id: number, reason: string): Promise<{ data: Contract }> {
        // Check permission
        if (!authCoreService.canRejectContract(id)) {
            throw new Error('Không có quyền từ chối hợp đồng này');
        }

        const response = await this.post<Contract>(`/${id}/reject`, { reason });
        return response;
    }

    async requestChanges(id: number, changes: string): Promise<{ data: Contract }> {
        // Check permission
        if (!authCoreService.canApproveContract(id)) {
            throw new Error('Không có quyền yêu cầu chỉnh sửa hợp đồng này');
        }

        const response = await this.post<Contract>(`/${id}/request-changes`, { changes });
        return response;
    }

    // ==================== MILESTONE MANAGEMENT ====================

    async createMilestone(contractId: number, data: any): Promise<{ data: Milestone }> {
        // Check permission
        if (!authCoreService.canUpdateContract(contractId)) {
            throw new Error('Không có quyền tạo milestone');
        }

        const response = await this.post<Milestone>(`/${contractId}/milestones`, data);
        return response;
    }

    async updateMilestone(contractId: number, milestoneId: number, data: any): Promise<{ data: Milestone }> {
        // Check permission
        if (!authCoreService.canUpdateContract(contractId)) {
            throw new Error('Không có quyền cập nhật milestone');
        }

        const response = await this.put<Milestone>(`/${contractId}/milestones/${milestoneId}`, data);
        return response;
    }

    async deleteMilestone(contractId: number, milestoneId: number): Promise<{ data: { message: string } }> {
        // Check permission
        if (!authCoreService.canUpdateContract(contractId)) {
            throw new Error('Không có quyền xóa milestone');
        }

        const response = await this.delete<{ message: string }>(`/${contractId}/milestones/${milestoneId}`);
        return response;
    }

    async listMilestones(contractId: number): Promise<{ data: Milestone[] }> {
        // Check permission
        if (!authCoreService.canReadContract(contractId)) {
            throw new Error('Không có quyền xem milestones');
        }

        const response = await this.get<Milestone[]>(`/${contractId}/milestones`);
        return response;
    }

    // ==================== TASK MANAGEMENT ====================

    async createTask(contractId: number, data: any): Promise<{ data: Task }> {
        // Check permission
        if (!authCoreService.canUpdateContract(contractId)) {
            throw new Error('Không có quyền tạo task');
        }

        const response = await this.post<Task>(`/${contractId}/tasks`, data);
        return response;
    }

    async updateTask(contractId: number, taskId: number, data: any): Promise<{ data: Task }> {
        // Check permission
        if (!authCoreService.canUpdateContract(contractId)) {
            throw new Error('Không có quyền cập nhật task');
        }

        const response = await this.put<Task>(`/${contractId}/tasks/${taskId}`, data);
        return response;
    }

    async deleteTask(contractId: number, taskId: number): Promise<{ data: { message: string } }> {
        // Check permission
        if (!authCoreService.canUpdateContract(contractId)) {
            throw new Error('Không có quyền xóa task');
        }

        const response = await this.delete<{ message: string }>(`/${contractId}/tasks/${taskId}`);
        return response;
    }

    async listTasks(contractId: number): Promise<{ data: Task[] }> {
        // Check permission
        if (!authCoreService.canReadContract(contractId)) {
            throw new Error('Không có quyền xem tasks');
        }

        const response = await this.get<Task[]>(`/${contractId}/tasks`);
        return response;
    }

    // ==================== FILE MANAGEMENT ====================

    async uploadFile(contractId: number, file: File): Promise<{ data: ContractFile }> {
        // Check permission
        if (!authCoreService.canUpdateContract(contractId)) {
            throw new Error('Không có quyền upload file');
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await this.post<ContractFile>(`/${contractId}/files`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    }

    async deleteFile(contractId: number, fileId: number): Promise<{ data: { message: string } }> {
        // Check permission
        if (!authCoreService.canUpdateContract(contractId)) {
            throw new Error('Không có quyền xóa file');
        }

        const response = await this.delete<{ message: string }>(`/${contractId}/files/${fileId}`);
        return response;
    }

    async listFiles(contractId: number): Promise<{ data: ContractFile[] }> {
        // Check permission
        if (!authCoreService.canReadContract(contractId)) {
            throw new Error('Không có quyền xem files');
        }

        const response = await this.get<ContractFile[]>(`/${contractId}/files`);
        return response;
    }

    // ==================== COLLABORATOR MANAGEMENT ====================

    async addCollaborator(contractId: number, data: any): Promise<{ data: Collaborator }> {
        // Check permission
        if (!authCoreService.canUpdateContract(contractId)) {
            throw new Error('Không có quyền thêm collaborator');
        }

        const response = await this.post<Collaborator>(`/${contractId}/collaborators`, data);
        return response;
    }

    async updateCollaborator(contractId: number, collaboratorId: number, data: any): Promise<{ data: Collaborator }> {
        // Check permission
        if (!authCoreService.canUpdateContract(contractId)) {
            throw new Error('Không có quyền cập nhật collaborator');
        }

        const response = await this.put<Collaborator>(`/${contractId}/collaborators/${collaboratorId}`, data);
        return response;
    }

    async removeCollaborator(contractId: number, collaboratorId: number): Promise<{ data: { message: string } }> {
        // Check permission
        if (!authCoreService.canUpdateContract(contractId)) {
            throw new Error('Không có quyền xóa collaborator');
        }

        const response = await this.delete<{ message: string }>(`/${contractId}/collaborators/${collaboratorId}`);
        return response;
    }

    async listCollaborators(contractId: number): Promise<{ data: Collaborator[] }> {
        // Check permission
        if (!authCoreService.canReadContract(contractId)) {
            throw new Error('Không có quyền xem collaborators');
        }

        const response = await this.get<Collaborator[]>(`/${contractId}/collaborators`);
        return response;
    }

    async transferOwnership(contractId: number, userId: number): Promise<{ data: { message: string } }> {
        // Check permission
        if (!authCoreService.canUpdateContract(contractId)) {
            throw new Error('Không có quyền chuyển quyền sở hữu');
        }

        const response = await this.post<{ message: string }>(`/${contractId}/transfer-ownership`, { userId });
        return response;
    }

    // ==================== AUDIT LOGS ====================

    async getAuditLogs(
        contractId: number,
        filters?: any,
        pagination?: any,
    ): Promise<{ data: { logs: AuditLog[]; total: number } }> {
        // Check permission
        if (!authCoreService.canReadContract(contractId)) {
            throw new Error('Không có quyền xem audit logs');
        }

        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value.toString());
            });
        }
        if (pagination) {
            params.append('page', pagination.page?.toString() || '1');
            params.append('limit', pagination.limit?.toString() || '10');
        }

        const response = await this.get<{ logs: AuditLog[]; total: number }>(
            `/${contractId}/audit?${params.toString()}`,
        );
        return response;
    }

    async getAuditSummary(contractId: number): Promise<{ data: any }> {
        // Check permission
        if (!authCoreService.canReadContract(contractId)) {
            throw new Error('Không có quyền xem audit summary');
        }

        const response = await this.get<any>(`/${contractId}/audit/summary`);
        return response;
    }

    // ==================== EXPORT & REPORTING ====================

    async exportContract(id: number, format: string): Promise<{ data: any }> {
        // Check permission
        if (!authCoreService.canExportContract(id)) {
            throw new Error('Không có quyền export hợp đồng');
        }

        const response = await this.get<any>(`/${id}/export?format=${format}`);
        return response;
    }

    async getContractStatistics(): Promise<{ data: any }> {
        // Check permission
        if (!authCoreService.canViewDashboard()) {
            throw new Error('Không có quyền xem thống kê');
        }

        const response = await this.get<any>('/statistics');
        return response;
    }

    // ==================== DRAFT MANAGEMENT ====================

    async saveDraft(contractId: number, stage: string, data: any): Promise<{ data: any }> {
        // Check permission
        if (!authCoreService.canUpdateContract(contractId)) {
            throw new Error('Không có quyền lưu draft');
        }

        const response = await this.post<any>(`/${contractId}/drafts`, { stage, data });
        return response;
    }

    async getDraft(contractId: number, stage: string): Promise<{ data: any }> {
        // Check permission
        if (!authCoreService.canReadContract(contractId)) {
            throw new Error('Không có quyền xem draft');
        }

        const response = await this.get<any>(`/${contractId}/drafts/${stage}`);
        return response;
    }

    async listDrafts(contractId: number): Promise<{ data: any[] }> {
        // Check permission
        if (!authCoreService.canReadContract(contractId)) {
            throw new Error('Không có quyền xem drafts');
        }

        const response = await this.get<any[]>(`/${contractId}/drafts`);
        return response;
    }

    // ==================== VERSION MANAGEMENT ====================

    async createVersion(contractId: number, data: { change_summary?: string }): Promise<{ data: any }> {
        if (!authCoreService.canUpdateContract(contractId)) throw new Error('Không có quyền tạo version');
        return this.post<any, { change_summary?: string }>(`/${contractId}/versions`, data);
    }

    async listVersions(contractId: number): Promise<{ data: any[] }> {
        if (!authCoreService.canReadContract(contractId)) throw new Error('Không có quyền xem versions');
        return this.get<any[]>(`/${contractId}/versions`);
    }

    async getVersion(contractId: number, versionId: string): Promise<{ data: any }> {
        if (!authCoreService.canReadContract(contractId)) throw new Error('Không có quyền xem version');
        return this.get<any>(`/${contractId}/versions/${versionId}`);
    }

    // ==================== TEMPLATE MANAGEMENT ====================

    async listTemplates(filters?: any): Promise<{ data: any[] }> {
        // Check permission
        if (!authCoreService.canManageTemplates()) {
            throw new Error('Không có quyền xem templates');
        }

        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value.toString());
            });
        }

        const response = await this.get<any[]>(`/templates?${params.toString()}`);
        return response;
    }

    async getTemplate(templateId: number): Promise<{ data: any }> {
        // Check permission
        if (!authCoreService.canManageTemplates()) {
            throw new Error('Không có quyền xem template');
        }

        const response = await this.get<any>(`/templates/${templateId}`);
        return response;
    }

    async createTemplate(data: any): Promise<{ data: any }> {
        // Check permission
        if (!authCoreService.canManageTemplates()) {
            throw new Error('Không có quyền tạo template');
        }

        const response = await this.post<any>('/templates', data);
        return response;
    }

    async updateTemplate(templateId: number, data: any): Promise<{ data: any }> {
        // Check permission
        if (!authCoreService.canManageTemplates()) {
            throw new Error('Không có quyền cập nhật template');
        }

        const response = await this.put<any>(`/templates/${templateId}`, data);
        return response;
    }

    async deleteTemplate(templateId: number): Promise<{ data: { message: string } }> {
        // Check permission
        if (!authCoreService.canManageTemplates()) {
            throw new Error('Không có quyền xóa template');
        }

        const response = await this.delete<{ message: string }>(`/templates/${templateId}`);
        return response;
    }

    // ==================== DRAFT & STAGE MANAGEMENT (helper methods used by store/editor) ====================

    async saveStage(contractId: string, stage: string, payload: { data: any }): Promise<{ data: any }> {
        return this.patch<any, { data: any }>(`/${contractId}/stage/${stage}/save`, payload);
    }

    async transitionStage(contractId: string, from: string, to: string): Promise<{ data: any }> {
        return this.post<any>(`/${contractId}/transition`, { from, to });
    }
}

export const contractService = new ContractService();
