import { BaseService } from './base.service';
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

        const response = await this.post<Contract>('/', data);
        return response;
    }

    async getContract(id: number): Promise<{ data: Contract }> {
        // Check permission

        const response = await this.get<Contract>(`/${id}`);
        return response;
    }

    async updateContract(id: number, data: UpdateContractDto): Promise<{ data: Contract }> {
        // Check permission

        const response = await this.put<Contract>(`/${id}`, data);
        return response;
    }

    async deleteContract(id: number): Promise<{ data: { message: string } }> {
        // Check permission

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

        const response = await this.post<Contract>(`/${id}/submit`, {});
        return response;
    }

    async approveContract(id: number, comment?: string): Promise<{ data: Contract }> {
        // Check permission

        const response = await this.post<Contract>(`/${id}/approve`, { comment });
        return response;
    }

    async rejectContract(id: number, reason: string): Promise<{ data: Contract }> {
        // Check permission

        const response = await this.post<Contract>(`/${id}/reject`, { reason });
        return response;
    }

    async requestChanges(id: number, changes: string): Promise<{ data: Contract }> {
        // Check permission

        const response = await this.post<Contract>(`/${id}/request-changes`, { changes });
        return response;
    }

    // ==================== MILESTONE MANAGEMENT ====================

    async createMilestone(contractId: number, data: any): Promise<{ data: Milestone }> {
        // Check permission

        const response = await this.post<Milestone>(`/${contractId}/milestones`, data);
        return response;
    }

    async updateMilestone(contractId: number, milestoneId: number, data: any): Promise<{ data: Milestone }> {
        const response = await this.put<Milestone>(`/${contractId}/milestones/${milestoneId}`, data);
        return response;
    }

    async deleteMilestone(contractId: number, milestoneId: number): Promise<{ data: { message: string } }> {
        // Check permission

        const response = await this.delete<{ message: string }>(`/${contractId}/milestones/${milestoneId}`);
        return response;
    }

    async listMilestones(contractId: number): Promise<{ data: Milestone[] }> {
        // Check permission

        const response = await this.get<Milestone[]>(`/${contractId}/milestones`);
        return response;
    }

    // ==================== TASK MANAGEMENT ====================

    async createTask(contractId: number, data: any): Promise<{ data: Task }> {
        // Check permission

        const response = await this.post<Task>(`/${contractId}/tasks`, data);
        return response;
    }

    async updateTask(contractId: number, taskId: number, data: any): Promise<{ data: Task }> {
        // Check permission

        const response = await this.put<Task>(`/${contractId}/tasks/${taskId}`, data);
        return response;
    }

    async deleteTask(contractId: number, taskId: number): Promise<{ data: { message: string } }> {
        // Check permission

        const response = await this.delete<{ message: string }>(`/${contractId}/tasks/${taskId}`);
        return response;
    }

    async listTasks(contractId: number): Promise<{ data: Task[] }> {
        const response = await this.get<Task[]>(`/${contractId}/tasks`);
        return response;
    }

    // ==================== FILE MANAGEMENT ====================

    async uploadFile(contractId: number, file: File): Promise<{ data: ContractFile }> {
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

        const response = await this.delete<{ message: string }>(`/${contractId}/files/${fileId}`);
        return response;
    }

    async listFiles(contractId: number): Promise<{ data: ContractFile[] }> {
        // Check permission

        const response = await this.get<ContractFile[]>(`/${contractId}/files`);
        return response;
    }

    // ==================== COLLABORATOR MANAGEMENT ====================

    async addCollaborator(contractId: number, data: any): Promise<{ data: Collaborator }> {
        // Check permission

        const response = await this.post<Collaborator>(`/${contractId}/collaborators`, data);
        return response;
    }

    async updateCollaborator(contractId: number, collaboratorId: number, data: any): Promise<{ data: Collaborator }> {
        // Check permission

        const response = await this.put<Collaborator>(`/${contractId}/collaborators/${collaboratorId}`, data);
        return response;
    }

    async removeCollaborator(contractId: number, collaboratorId: number): Promise<{ data: { message: string } }> {
        const response = await this.delete<{ message: string }>(`/${contractId}/collaborators/${collaboratorId}`);
        return response;
    }

    async listCollaborators(contractId: number): Promise<{ data: Collaborator[] }> {
        const response = await this.get<Collaborator[]>(`/${contractId}/collaborators`);
        return response;
    }

    async transferOwnership(contractId: number, userId: number): Promise<{ data: { message: string } }> {
        const response = await this.post<{ message: string }>(`/${contractId}/transfer-ownership`, { userId });
        return response;
    }

    // ==================== AUDIT LOGS ====================

    async getAuditLogs(
        contractId: number,
        filters?: any,
        pagination?: any,
    ): Promise<{ data: { logs: AuditLog[]; total: number } }> {
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
        const response = await this.get<any>(`/${contractId}/audit/summary`);
        return response;
    }

    // ==================== EXPORT & REPORTING ====================

    async exportContract(id: number, format: string): Promise<{ data: any }> {
        const response = await this.get<any>(`/${id}/export?format=${format}`);
        return response;
    }

    async getContractStatistics(): Promise<{ data: any }> {
        const response = await this.get<any>('/statistics');
        return response;
    }

    // ==================== DRAFT MANAGEMENT ====================

    async saveDraft(contractId: number, stage: string, data: any): Promise<{ data: any }> {
        const response = await this.post<any>(`/${contractId}/drafts`, { stage, data });
        return response;
    }

    async getDraft(contractId: number, stage: string): Promise<{ data: any }> {
        const response = await this.get<any>(`/${contractId}/drafts/${stage}`);
        return response;
    }

    async listDrafts(contractId: number): Promise<{ data: any[] }> {
        const response = await this.get<any[]>(`/${contractId}/drafts`);
        return response;
    }

    // ==================== VERSION MANAGEMENT ====================

    async createVersion(contractId: number, data: any): Promise<{ data: any }> {
        const response = await this.post<any>(`/${contractId}/versions`, data);
        return response;
    }

    async listVersions(contractId: number): Promise<{ data: any[] }> {
        const response = await this.get<any[]>(`/${contractId}/versions`);
        return response;
    }

    async getVersion(contractId: number, versionId: number): Promise<{ data: any }> {
        const response = await this.get<any>(`/${contractId}/versions/${versionId}`);
        return response;
    }

    // ==================== TEMPLATE MANAGEMENT ====================

    async listTemplates(filters?: any): Promise<{ data: any[] }> {
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
        const response = await this.get<any>(`/templates/${templateId}`);
        return response;
    }

    async createTemplate(data: any): Promise<{ data: any }> {
        const response = await this.post<any>('/templates', data);
        return response;
    }

    async updateTemplate(templateId: number, data: any): Promise<{ data: any }> {
        const response = await this.put<any>(`/templates/${templateId}`, data);
        return response;
    }

    async deleteTemplate(templateId: number): Promise<{ data: { message: string } }> {
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
