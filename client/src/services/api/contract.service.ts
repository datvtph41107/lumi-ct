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
	// Base path for all contract APIs
	private readonly baseUrl = '/contracts';

	// ==================== CONTRACT CRUD OPERATIONS ====================

	async createContract(data: CreateContractDto): Promise<{ data: Contract }> {
		if (!authCoreService.canCreateContract((data as any).type)) {
			throw new Error('Không có quyền tạo hợp đồng');
		}
		return this.request.private.post<Contract, CreateContractDto>(`${this.baseUrl}`, data);
	}

	async getContract(id: number): Promise<{ data: Contract }> {
		if (!authCoreService.canReadContract(id)) {
			throw new Error('Không có quyền xem hợp đồng này');
		}
		return this.request.private.get<Contract>(`${this.baseUrl}/${id}`);
	}

	async updateContract(id: number, data: UpdateContractDto): Promise<{ data: Contract }> {
		if (!authCoreService.canUpdateContract(id)) {
			throw new Error('Không có quyền cập nhật hợp đồng này');
		}
		return this.request.private.put<Contract, UpdateContractDto>(`${this.baseUrl}/${id}`, data);
	}

	async deleteContract(id: number): Promise<{ data: { message: string } }> {
		if (!authCoreService.canDeleteContract(id)) {
			throw new Error('Không có quyền xóa hợp đồng này');
		}
		return this.request.private.delete<{ message: string }>(`${this.baseUrl}/${id}`);
	}

	async listContracts(
		filters: ContractFilters,
		pagination: ContractPagination,
	): Promise<{ data: ContractListResponse }> {
		const params = new URLSearchParams();
		if ((filters as any)?.status) params.append('status', (filters as any).status);
		if ((filters as any)?.type) params.append('type', (filters as any).type);
		if ((filters as any)?.search) params.append('search', (filters as any).search);
		params.append('page', pagination.page?.toString() || '1');
		params.append('limit', pagination.limit?.toString() || '10');
		return this.request.private.get<ContractListResponse>(`${this.baseUrl}?${params.toString()}`);
	}

	// ==================== CONTRACT WORKFLOW OPERATIONS ====================

	async submitForReview(id: number): Promise<{ data: Contract }> {
		if (!authCoreService.canUpdateContract(id)) {
			throw new Error('Không có quyền submit hợp đồng này');
		}
		return this.request.private.post<Contract, {}>(`${this.baseUrl}/${id}/submit`, {});
	}

	async approveContract(id: number, comment?: string): Promise<{ data: Contract }> {
		if (!authCoreService.canApproveContract(id)) {
			throw new Error('Không có quyền phê duyệt hợp đồng này');
		}
		return this.request.private.post<Contract, { comment?: string }>(`${this.baseUrl}/${id}/approve`, { comment });
	}

	async rejectContract(id: number, reason: string): Promise<{ data: Contract }> {
		if (!authCoreService.canRejectContract(id)) {
			throw new Error('Không có quyền từ chối hợp đồng này');
		}
		return this.request.private.post<Contract, { reason: string }>(`${this.baseUrl}/${id}/reject`, { reason });
	}

	async requestChanges(id: number, changes: string): Promise<{ data: Contract }> {
		if (!authCoreService.canApproveContract(id)) {
			throw new Error('Không có quyền yêu cầu chỉnh sửa hợp đồng này');
		}
		return this.request.private.post<Contract, { changes: string }>(`${this.baseUrl}/${id}/request-changes`, { changes });
	}

	// ==================== MILESTONE MANAGEMENT ====================

	async createMilestone(contractId: number, data: any): Promise<{ data: Milestone }> {
		if (!authCoreService.canUpdateContract(contractId)) {
			throw new Error('Không có quyền tạo milestone');
		}
		return this.request.private.post<Milestone, any>(`${this.baseUrl}/${contractId}/milestones`, data);
	}

	async updateMilestone(contractId: number, milestoneId: number, data: any): Promise<{ data: Milestone }> {
		if (!authCoreService.canUpdateContract(contractId)) {
			throw new Error('Không có quyền cập nhật milestone');
		}
		return this.request.private.put<Milestone, any>(`${this.baseUrl}/${contractId}/milestones/${milestoneId}`, data);
	}

	async deleteMilestone(contractId: number, milestoneId: number): Promise<{ data: { message: string } }> {
		if (!authCoreService.canUpdateContract(contractId)) {
			throw new Error('Không có quyền xóa milestone');
		}
		return this.request.private.delete<{ message: string }>(`${this.baseUrl}/${contractId}/milestones/${milestoneId}`);
	}

	async listMilestones(contractId: number): Promise<{ data: Milestone[] }> {
		if (!authCoreService.canReadContract(contractId)) {
			throw new Error('Không có quyền xem milestones');
		}
		return this.request.private.get<Milestone[]>(`${this.baseUrl}/${contractId}/milestones`);
	}

	// ==================== TASK MANAGEMENT ====================

	async createTask(contractId: number, data: any): Promise<{ data: Task }> {
		if (!authCoreService.canUpdateContract(contractId)) {
			throw new Error('Không có quyền tạo task');
		}
		return this.request.private.post<Task, any>(`${this.baseUrl}/${contractId}/tasks`, data);
	}

	async updateTask(contractId: number, taskId: number, data: any): Promise<{ data: Task }> {
		if (!authCoreService.canUpdateContract(contractId)) {
			throw new Error('Không có quyền cập nhật task');
		}
		return this.request.private.put<Task, any>(`${this.baseUrl}/${contractId}/tasks/${taskId}`, data);
	}

	async deleteTask(contractId: number, taskId: number): Promise<{ data: { message: string } }> {
		if (!authCoreService.canUpdateContract(contractId)) {
			throw new Error('Không có quyền xóa task');
		}
		return this.request.private.delete<{ message: string }>(`${this.baseUrl}/${contractId}/tasks/${taskId}`);
	}

	async listTasks(contractId: number): Promise<{ data: Task[] }> {
		if (!authCoreService.canReadContract(contractId)) {
			throw new Error('Không có quyền xem tasks');
		}
		return this.request.private.get<Task[]>(`${this.baseUrl}/${contractId}/tasks`);
	}

	// ==================== FILE MANAGEMENT ====================

	async uploadFile(contractId: number, file: File): Promise<{ data: ContractFile }> {
		if (!authCoreService.canUpdateContract(contractId)) {
			throw new Error('Không có quyền upload file');
		}
		const formData = new FormData();
		formData.append('file', file);
		return this.request.private.post<ContractFile, FormData>(`${this.baseUrl}/${contractId}/files`, formData);
	}

	async deleteFile(contractId: number, fileId: number): Promise<{ data: { message: string } }> {
		if (!authCoreService.canUpdateContract(contractId)) {
			throw new Error('Không có quyền xóa file');
		}
		return this.request.private.delete<{ message: string }>(`${this.baseUrl}/${contractId}/files/${fileId}`);
	}

	async listFiles(contractId: number): Promise<{ data: ContractFile[] }> {
		if (!authCoreService.canReadContract(contractId)) {
			throw new Error('Không có quyền xem files');
		}
		return this.request.private.get<ContractFile[]>(`${this.baseUrl}/${contractId}/files`);
	}

	// ==================== COLLABORATOR MANAGEMENT ====================

	async addCollaborator(contractId: number, data: any): Promise<{ data: Collaborator }> {
		if (!authCoreService.canUpdateContract(contractId)) {
			throw new Error('Không có quyền thêm collaborator');
		}
		return this.request.private.post<Collaborator, any>(`${this.baseUrl}/${contractId}/collaborators`, data);
	}

	async updateCollaborator(contractId: number, collaboratorId: number, data: any): Promise<{ data: Collaborator }> {
		if (!authCoreService.canUpdateContract(contractId)) {
			throw new Error('Không có quyền cập nhật collaborator');
		}
		return this.request.private.put<Collaborator, any>(
			`${this.baseUrl}/${contractId}/collaborators/${collaboratorId}`,
			data,
		);
	}

	async removeCollaborator(contractId: number, collaboratorId: number): Promise<{ data: { message: string } }> {
		if (!authCoreService.canUpdateContract(contractId)) {
			throw new Error('Không có quyền xóa collaborator');
		}
		return this.request.private.delete<{ message: string }>(`${this.baseUrl}/${contractId}/collaborators/${collaboratorId}`);
	}

	async listCollaborators(contractId: number): Promise<{ data: Collaborator[] }> {
		if (!authCoreService.canReadContract(contractId)) {
			throw new Error('Không có quyền xem collaborators');
		}
		return this.request.private.get<Collaborator[]>(`${this.baseUrl}/${contractId}/collaborators`);
	}

	async transferOwnership(contractId: number, userId: number): Promise<{ data: { message: string } }> {
		if (!authCoreService.canUpdateContract(contractId)) {
			throw new Error('Không có quyền chuyển quyền sở hữu');
		}
		return this.request.private.post<{ message: string }, { userId: number }>(
			`${this.baseUrl}/${contractId}/transfer-ownership`,
			{ userId },
		);
	}

	// ==================== AUDIT LOGS ====================

	async getAuditLogs(
		contractId: number,
		filters?: any,
		pagination?: any,
	): Promise<{ data: { logs: AuditLog[]; total: number } }> {
		if (!authCoreService.canReadContract(contractId)) {
			throw new Error('Không có quyền xem audit logs');
		}
		const params = new URLSearchParams();
		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value) params.append(key, String(value));
			});
		}
		if (pagination) {
			params.append('page', pagination.page?.toString() || '1');
			params.append('limit', pagination.limit?.toString() || '10');
		}
		return this.request.private.get<{ logs: AuditLog[]; total: number }>(
			`${this.baseUrl}/${contractId}/audit?${params.toString()}`,
		);
	}

	async getAuditSummary(contractId: number): Promise<{ data: any }> {
		if (!authCoreService.canReadContract(contractId)) {
			throw new Error('Không có quyền xem audit summary');
		}
		return this.request.private.get<any>(`${this.baseUrl}/${contractId}/audit/summary`);
	}

	// ==================== EXPORT & REPORTING ====================

	async exportContract(id: number, format: string): Promise<{ data: any }> {
		if (!authCoreService.canExportContract(id)) {
			throw new Error('Không có quyền export hợp đồng');
		}
		return this.request.private.get<any>(`${this.baseUrl}/${id}/export?format=${encodeURIComponent(format)}`);
	}

	async getContractStatistics(): Promise<{ data: any }> {
		if (!authCoreService.canViewDashboard()) {
			throw new Error('Không có quyền xem thống kê');
		}
		return this.request.private.get<any>(`${this.baseUrl}/statistics`);
	}

	// ==================== DRAFT MANAGEMENT ====================

	async saveDraft(contractId: number, stage: string, data: any): Promise<{ data: any }> {
		if (!authCoreService.canUpdateContract(contractId)) {
			throw new Error('Không có quyền lưu draft');
		}
		return this.request.private.post<any, { stage: string; data: any }>(`${this.baseUrl}/${contractId}/drafts`, {
			stage,
			data,
		});
	}

	async getDraft(contractId: number, stage: string): Promise<{ data: any }> {
		if (!authCoreService.canReadContract(contractId)) {
			throw new Error('Không có quyền xem draft');
		}
		return this.request.private.get<any>(`${this.baseUrl}/${contractId}/drafts/${stage}`);
	}

	async listDrafts(contractId: number): Promise<{ data: any[] }> {
		if (!authCoreService.canReadContract(contractId)) {
			throw new Error('Không có quyền xem drafts');
		}
		return this.request.private.get<any[]>(`${this.baseUrl}/${contractId}/drafts`);
	}

	// ==================== VERSION MANAGEMENT ====================

	async createVersion(contractId: number, data: any): Promise<{ data: any }> {
		if (!authCoreService.canUpdateContract(contractId)) {
			throw new Error('Không có quyền tạo version');
		}
		return this.request.private.post<any, any>(`${this.baseUrl}/${contractId}/versions`, data);
	}

	async listVersions(contractId: number): Promise<{ data: any[] }> {
		if (!authCoreService.canReadContract(contractId)) {
			throw new Error('Không có quyền xem versions');
		}
		return this.request.private.get<any[]>(`${this.baseUrl}/${contractId}/versions`);
	}

	async getVersion(contractId: number, versionId: number): Promise<{ data: any }> {
		if (!authCoreService.canReadContract(contractId)) {
			throw new Error('Không có quyền xem version');
		}
		return this.request.private.get<any>(`${this.baseUrl}/${contractId}/versions/${versionId}`);
	}

	// ==================== TEMPLATE MANAGEMENT ====================

	async listTemplates(filters?: any): Promise<{ data: any[] }> {
		if (!authCoreService.canManageTemplates()) {
			throw new Error('Không có quyền xem templates');
		}
		const params = new URLSearchParams();
		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value) params.append(key, String(value));
			});
		}
		return this.request.private.get<any[]>(`${this.baseUrl}/templates?${params.toString()}`);
	}

	async getTemplate(templateId: number): Promise<{ data: any }> {
		if (!authCoreService.canManageTemplates()) {
			throw new Error('Không có quyền xem template');
		}
		return this.request.private.get<any>(`${this.baseUrl}/templates/${templateId}`);
	}

	async createTemplate(data: any): Promise<{ data: any }> {
		if (!authCoreService.canManageTemplates()) {
			throw new Error('Không có quyền tạo template');
		}
		return this.request.private.post<any, any>(`${this.baseUrl}/templates`, data);
	}

	async updateTemplate(templateId: number, data: any): Promise<{ data: any }> {
		if (!authCoreService.canManageTemplates()) {
			throw new Error('Không có quyền cập nhật template');
		}
		return this.request.private.put<any, any>(`${this.baseUrl}/templates/${templateId}`, data);
	}

	async deleteTemplate(templateId: number): Promise<{ data: { message: string } }> {
		if (!authCoreService.canManageTemplates()) {
			throw new Error('Không có quyền xóa template');
		}
		return this.request.private.delete<{ message: string }>(`${this.baseUrl}/templates/${templateId}`);
	}

	// ==================== DRAFT & STAGE MANAGEMENT (helper methods used by store/editor) ====================

	async saveStage(contractId: string, stage: string, payload: { data: any }): Promise<{ data: any }> {
		return this.request.private.patch<any, { data: any }>(`${this.baseUrl}/${contractId}/stage/${stage}/save`, payload);
	}

	async transitionStage(contractId: string, from: string, to: string): Promise<{ data: any }> {
		return this.request.private.post<any, { from: string; to: string }>(`${this.baseUrl}/${contractId}/transition`, {
			from,
			to,
		});
	}
}

export const contractService = new ContractService();
