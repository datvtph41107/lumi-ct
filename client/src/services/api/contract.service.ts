// import { BaseService } from "./base.service";
// import type { ApiResponse } from "../../core/types/api.types";
// import type {
//     Contract,
//     ContractDraft,
//     ContractTemplate,
//     ContractMilestone,
//     ContractTask,
//     ContractFile,
//     ContractVersion,
//     ContractCollaborator,
//     CreateContractRequest,
//     StageData,
//     ContractQueryParams,
//     ContractAnalytics,
//     DashboardStats,
//     Notification,
//     PaginatedResponse,
//     ExportOptions,
//     FileUploadRequest,
//     FileUploadResponse,
//     ApprovalRequest,
//     RejectionRequest,
//     ChangesRequest,
// } from "../../types/contract.types";

// export class ContractService extends BaseService {
//     private readonly baseUrl = "/api/contracts";

//     // ===== CONTRACT CRUD OPERATIONS =====

//     async createContract(data: CreateContractRequest): Promise<ApiResponse<Contract>> {
//         return this.request.private.post<Contract>(`${this.baseUrl}`, data);
//     }

//     async getContracts(params?: ContractQueryParams): Promise<ApiResponse<PaginatedResponse<Contract>>> {
//         const url = this.buildUrl(
//             `${this.baseUrl}`,
//             params as Record<string, string | number | boolean | Array<string | number | boolean>>,
//         );
//         return this.request.private.get<PaginatedResponse<Contract>>(url);
//     }

//     async getContract(id: string): Promise<ApiResponse<Contract>> {
//         return this.request.private.get<Contract>(`${this.baseUrl}/${id}`);
//     }

//     async updateContract(id: string, data: Partial<CreateContractRequest>): Promise<ApiResponse<Contract>> {
//         return this.request.private.put<Contract>(`${this.baseUrl}/${id}`, data);
//     }

//     async deleteContract(id: string): Promise<ApiResponse<void>> {
//         return this.request.private.delete<void>(`${this.baseUrl}/${id}`);
//     }

//     // ===== CONTRACT DRAFT & STAGE MANAGEMENT =====

//     async autoSaveStage(id: string, stageData: StageData): Promise<ApiResponse<ContractDraft>> {
//         return this.request.private.post<ContractDraft>(`${this.baseUrl}/${id}/auto-save`, stageData);
//     }

//     async saveStage(id: string, stage: string, stageData: StageData): Promise<ApiResponse<ContractDraft>> {
//         return this.request.private.post<ContractDraft>(`${this.baseUrl}/${id}/stages/${stage}`, stageData);
//     }

//     async transitionStage(id: string, from: string, to: string): Promise<ApiResponse<ContractDraft>> {
//         return this.request.private.post<ContractDraft>(`${this.baseUrl}/${id}/transition`, { from, to });
//     }

//     async getContractDraft(id: string): Promise<ApiResponse<ContractDraft>> {
//         return this.request.private.get<ContractDraft>(`${this.baseUrl}/${id}/draft`);
//     }

//     // ===== TEMPLATE MANAGEMENT =====

//     async listTemplates(params?: {
//         search?: string;
//         type?: string;
//         category?: string;
//         is_active?: boolean;
//         mode?: string;
//     }): Promise<ApiResponse<ContractTemplate[]>> {
//         const url = this.buildUrl(`${this.baseUrl}/templates`, params);
//         return this.request.private.get<ContractTemplate[]>(url);
//     }

//     async getTemplate(id: string): Promise<ApiResponse<ContractTemplate>> {
//         return this.request.private.get<ContractTemplate>(`${this.baseUrl}/templates/${id}`);
//     }

//     async createTemplate(data: {
//         name: string;
//         description: string;
//         type: string;
//         category: string;
//         structure: any;
//         tags?: string[];
//         mode?: string;
//     }): Promise<ApiResponse<ContractTemplate>> {
//         return this.request.private.post<ContractTemplate>(`${this.baseUrl}/templates`, data);
//     }

//     async updateTemplate(id: string, data: Partial<ContractTemplate>): Promise<ApiResponse<ContractTemplate>> {
//         return this.request.private.put<ContractTemplate>(`${this.baseUrl}/templates/${id}`, data);
//     }

//     async deleteTemplate(id: string): Promise<ApiResponse<void>> {
//         return this.request.private.delete<void>(`${this.baseUrl}/templates/${id}`);
//     }

//     // ===== MILESTONE MANAGEMENT =====

//     async createMilestone(
//         contractId: string,
//         data: {
//             name: string;
//             description: string;
//             due_date: string;
//             priority: string;
//             assignee: string;
//         },
//     ): Promise<ApiResponse<ContractMilestone>> {
//         return this.request.private.post<ContractMilestone>(`${this.baseUrl}/${contractId}/milestones`, data);
//     }

//     async getMilestones(contractId: string): Promise<ApiResponse<ContractMilestone[]>> {
//         return this.request.private.get<ContractMilestone[]>(`${this.baseUrl}/${contractId}/milestones`);
//     }

//     async updateMilestone(
//         contractId: string,
//         milestoneId: string,
//         data: Partial<ContractMilestone>,
//     ): Promise<ApiResponse<ContractMilestone>> {
//         return this.request.private.put<ContractMilestone>(`${this.baseUrl}/${contractId}/milestones/${milestoneId}`, data);
//     }

//     async deleteMilestone(contractId: string, milestoneId: string): Promise<ApiResponse<void>> {
//         return this.request.private.delete<void>(`${this.baseUrl}/${contractId}/milestones/${milestoneId}`);
//     }

//     // ===== TASK MANAGEMENT =====

//     async createTask(
//         contractId: string,
//         milestoneId: string,
//         data: {
//             name: string;
//             description: string;
//             assigned_to: string;
//             due_date: string;
//             priority: string;
//         },
//     ): Promise<ApiResponse<ContractTask>> {
//         return this.request.private.post<ContractTask>(`${this.baseUrl}/${contractId}/milestones/${milestoneId}/tasks`, data);
//     }

//     async getTasks(contractId: string, milestoneId?: string): Promise<ApiResponse<ContractTask[]>> {
//         const url = milestoneId ? `${this.baseUrl}/${contractId}/milestones/${milestoneId}/tasks` : `${this.baseUrl}/${contractId}/tasks`;
//         return this.request.private.get<ContractTask[]>(url);
//     }

//     async updateTask(contractId: string, taskId: string, data: Partial<ContractTask>): Promise<ApiResponse<ContractTask>> {
//         return this.request.private.put<ContractTask>(`${this.baseUrl}/${contractId}/tasks/${taskId}`, data);
//     }

//     async deleteTask(contractId: string, taskId: string): Promise<ApiResponse<void>> {
//         return this.request.private.delete<void>(`${this.baseUrl}/${contractId}/tasks/${taskId}`);
//     }

//     // ===== FILE MANAGEMENT =====

//     async uploadFile(contractId: string, fileData: FileUploadRequest): Promise<ApiResponse<FileUploadResponse>> {
//         const formData = new FormData();
//         formData.append("file", fileData.file);
//         formData.append("description", fileData.description || "");
//         formData.append("file_type", fileData.file_type);
//         if (fileData.milestone_id) formData.append("milestone_id", fileData.milestone_id);
//         if (fileData.task_id) formData.append("task_id", fileData.task_id);

//         return this.request.private.post<FileUploadResponse>(`${this.baseUrl}/${contractId}/files`, formData);
//     }

//     async listFiles(
//         contractId: string,
//         params?: {
//             file_type?: string;
//             milestone_id?: string;
//             task_id?: string;
//         },
//     ): Promise<ApiResponse<ContractFile[]>> {
//         const url = this.buildUrl(`${this.baseUrl}/${contractId}/files`, params);
//         return this.request.private.get<ContractFile[]>(url);
//     }

//     async deleteFile(contractId: string, fileId: string): Promise<ApiResponse<void>> {
//         return this.request.private.delete<void>(`${this.baseUrl}/${contractId}/files/${fileId}`);
//     }

//     // ===== COLLABORATOR MANAGEMENT =====

//     async addCollaborator(
//         contractId: string,
//         data: {
//             user_id: string;
//             role: string;
//             permissions: string[];
//         },
//     ): Promise<ApiResponse<ContractCollaborator>> {
//         return this.request.private.post<ContractCollaborator>(`${this.baseUrl}/${contractId}/collaborators`, data);
//     }

//     async getCollaborators(contractId: string): Promise<ApiResponse<ContractCollaborator[]>> {
//         return this.request.private.get<ContractCollaborator[]>(`${this.baseUrl}/${contractId}/collaborators`);
//     }

//     async updateCollaborator(
//         contractId: string,
//         collaboratorId: string,
//         data: Partial<ContractCollaborator>,
//     ): Promise<ApiResponse<ContractCollaborator>> {
//         return this.request.private.put<ContractCollaborator>(`${this.baseUrl}/${contractId}/collaborators/${collaboratorId}`, data);
//     }

//     async removeCollaborator(contractId: string, collaboratorId: string): Promise<ApiResponse<void>> {
//         return this.request.private.delete<void>(`${this.baseUrl}/${contractId}/collaborators/${collaboratorId}`);
//     }

//     // ===== VERSION MANAGEMENT =====

//     async createVersion(
//         contractId: string,
//         data: {
//             version_name: string;
//             description: string;
//             content: any;
//         },
//     ): Promise<ApiResponse<ContractVersion>> {
//         return this.request.private.post<ContractVersion>(`${this.baseUrl}/${contractId}/versions`, data);
//     }

//     async getVersions(contractId: string): Promise<ApiResponse<ContractVersion[]>> {
//         return this.request.private.get<ContractVersion[]>(`${this.baseUrl}/${contractId}/versions`);
//     }

//     async publishVersion(contractId: string, versionId: string): Promise<ApiResponse<ContractVersion>> {
//         return this.request.private.post<ContractVersion>(`${this.baseUrl}/${contractId}/versions/${versionId}/publish`);
//     }

//     // ===== APPROVAL WORKFLOW =====

//     async submitForApproval(contractId: string, data?: ApprovalRequest): Promise<ApiResponse<Contract>> {
//         return this.request.private.post<Contract>(`${this.baseUrl}/${contractId}/approve`, data);
//     }

//     async approveContract(contractId: string, data?: ApprovalRequest): Promise<ApiResponse<Contract>> {
//         return this.request.private.post<Contract>(`${this.baseUrl}/${contractId}/approve`, data);
//     }

//     async rejectContract(contractId: string, data: RejectionRequest): Promise<ApiResponse<Contract>> {
//         return this.request.private.post<Contract>(`${this.baseUrl}/${contractId}/reject`, data);
//     }

//     async requestChanges(contractId: string, data: ChangesRequest): Promise<ApiResponse<Contract>> {
//         return this.request.private.post<Contract>(`${this.baseUrl}/${contractId}/request-changes`, data);
//     }

//     // ===== EXPORT & PRINT =====

//     async exportPdf(contractId: string, options?: ExportOptions): Promise<Blob> {
//         const response = await this.request.private.post<Blob>(`${this.baseUrl}/${contractId}/export/pdf`, options);
//         return response.data;
//     }

//     async exportDocx(contractId: string, options?: ExportOptions): Promise<Blob> {
//         const response = await this.request.private.post<Blob>(`${this.baseUrl}/${contractId}/export/docx`, options);
//         return response.data;
//     }

//     async generatePrintView(contractId: string): Promise<ApiResponse<string>> {
//         return this.request.private.get<string>(`${this.baseUrl}/${contractId}/print-view`);
//     }

//     // ===== ANALYTICS & DASHBOARD =====

//     async getContractAnalytics(contractId: string): Promise<ApiResponse<ContractAnalytics>> {
//         return this.request.private.get<ContractAnalytics>(`${this.baseUrl}/${contractId}/analytics`);
//     }

//     async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
//         return this.request.private.get<DashboardStats>(`${this.baseUrl}/dashboard/stats`);
//     }

//     // ===== NOTIFICATIONS =====

//     async createNotification(data: {
//         title: string;
//         message: string;
//         type: string;
//         priority: string;
//         recipient_ids: string[];
//         action_url?: string;
//         scheduled_at?: string;
//     }): Promise<ApiResponse<Notification>> {
//         return this.request.private.post<Notification>(`${this.baseUrl}/notifications`, data);
//     }

//     async listNotifications(params?: {
//         type?: string;
//         priority?: string;
//         is_read?: boolean;
//         page?: number;
//         limit?: number;
//     }): Promise<ApiResponse<PaginatedResponse<Notification>>> {
//         const url = this.buildUrl(
//             `${this.baseUrl}/notifications`,
//             params as Record<string, string | number | boolean | Array<string | number | boolean>>,
//         );
//         return this.request.private.get<PaginatedResponse<Notification>>(url);
//     }

//     async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
//         return this.request.private.patch<void>(`${this.baseUrl}/notifications/${notificationId}/read`);
//     }

//     // ===== REMINDERS =====

//     async createReminder(data: {
//         title: string;
//         message: string;
//         reminder_date: string;
//         recipient_ids: string[];
//         contract_id?: string;
//         milestone_id?: string;
//         task_id?: string;
//     }): Promise<ApiResponse<any>> {
//         return this.request.private.post<any>(`${this.baseUrl}/reminders`, data);
//     }

//     async listReminders(params?: {
//         contract_id?: string;
//         milestone_id?: string;
//         task_id?: string;
//         is_sent?: boolean;
//         page?: number;
//         limit?: number;
//     }): Promise<ApiResponse<PaginatedResponse<any>>> {
//         const url = this.buildUrl(
//             `${this.baseUrl}/reminders`,
//             params as Record<string, string | number | boolean | Array<string | number | boolean>>,
//         );
//         return this.request.private.get<PaginatedResponse<any>>(url);
//     }

//     // ===== UTILITY METHODS =====

//     async duplicateContract(
//         contractId: string,
//         data?: {
//             name?: string;
//             contract_code?: string;
//         },
//     ): Promise<ApiResponse<Contract>> {
//         return this.request.private.post<Contract>(`${this.baseUrl}/${contractId}/duplicate`, data);
//     }

//     async archiveContract(contractId: string): Promise<ApiResponse<Contract>> {
//         return this.request.private.post<Contract>(`${this.baseUrl}/${contractId}/archive`);
//     }

//     async restoreContract(contractId: string): Promise<ApiResponse<Contract>> {
//         return this.request.private.post<Contract>(`${this.baseUrl}/${contractId}/restore`);
//     }

//     // ===== BULK OPERATIONS =====

//     async bulkUpdateStatus(contractIds: string[], status: string): Promise<ApiResponse<Contract[]>> {
//         return this.request.private.post<Contract[]>(`${this.baseUrl}/bulk/status`, {
//             contract_ids: contractIds,
//             status,
//         });
//     }

//     async bulkDelete(contractIds: string[]): Promise<ApiResponse<void>> {
//         return this.request.private.post<void>(`${this.baseUrl}/bulk/delete`, {
//             contract_ids: contractIds,
//         });
//     }

//     async bulkExport(contractIds: string[], format: "pdf" | "docx"): Promise<Blob> {
//         const response = await this.request.private.post<Blob>(
//             `${this.baseUrl}/bulk/export`,
//             {
//                 contract_ids: contractIds,
//                 format,
//             },
//             {
//                 responseType: "blob",
//             },
//         );
//         return response.data;
//     }
// }

// // Export singleton instance
// export const contractService = new ContractService();
