import { BaseService } from "./base.service";
import type { ApiResponse } from "~/core/types/api.types";

export class ContractService extends BaseService {
    private readonly baseUrl = "/contracts";

    // ===== CONTRACT CRUD =====
    async createContract<TContract>(data: Record<string, unknown>): Promise<ApiResponse<TContract>> {
        return this.request.private.post<TContract>(`${this.baseUrl}`, data);
    }

    async listContracts<TContract>(params?: Record<string, string | number | boolean | Array<string | number | boolean>>): Promise<ApiResponse<{ data: TContract[]; pagination: any }>> {
        const url = this.buildUrl(`${this.baseUrl}`, params || {});
        return this.request.private.get<{ data: TContract[]; pagination: any }>(url);
    }

    async getContract<TContract>(id: string): Promise<ApiResponse<TContract>> {
        return this.request.private.get<TContract>(`${this.baseUrl}/${id}`);
    }

    async updateContract<TContract>(id: string, data: Record<string, unknown>): Promise<ApiResponse<TContract>> {
        return this.request.private.patch<TContract>(`${this.baseUrl}/${id}`, data);
    }

    async deleteContract(id: string): Promise<ApiResponse<{ message: string }>> {
        return this.request.private.delete<{ message: string }>(`${this.baseUrl}/${id}`);
    }

    // ===== DRAFT & STAGE MANAGEMENT =====
    async autoSaveStage(id: string, data: { data: any; autoSave?: boolean; clientVersionToken?: string }): Promise<ApiResponse<{ stageDataId: string; savedAt: string; version: number }>> {
        return this.request.private.patch<{ stageDataId: string; savedAt: string; version: number }, typeof data>(
            `${this.baseUrl}/${id}/autosave`,
            data,
        );
    }

    async saveStage(id: string, stage: string, data: { data: any }): Promise<ApiResponse<{ ok: boolean; savedAt: string }>> {
        return this.request.private.patch<{ ok: boolean; savedAt: string }, { data: any }>(`${this.baseUrl}/${id}/stage/${stage}/save`, data);
    }

    async getStageData<TStage>(id: string, stage: string): Promise<ApiResponse<TStage>> {
        return this.request.private.get<TStage>(`${this.baseUrl}/${id}/stage/${stage}`);
    }

    async transitionStage(id: string, from: string, to: string): Promise<ApiResponse<{ ok: boolean; current_stage: string }>> {
        return this.request.private.post<{ ok: boolean; current_stage: string }, { from: string; to: string }>(
            `${this.baseUrl}/${id}/transition`,
            { from, to },
        );
    }

    async preview<TPreview>(id: string): Promise<ApiResponse<TPreview>> {
        return this.request.private.get<TPreview>(`${this.baseUrl}/${id}/preview`);
    }

    // ===== VERSIONING =====
    async createVersion<TVersion>(id: string, data: Record<string, unknown>): Promise<ApiResponse<TVersion>> {
        return this.request.private.post<TVersion, Record<string, unknown>>(`${this.baseUrl}/${id}/versions`, data);
    }

    async listVersions<TVersion>(id: string): Promise<ApiResponse<TVersion[]>> {
        return this.request.private.get<TVersion[]>(`${this.baseUrl}/${id}/versions`);
    }

    async getVersion<TVersion>(id: string, vid: string): Promise<ApiResponse<TVersion>> {
        return this.request.private.get<TVersion>(`${this.baseUrl}/${id}/versions/${vid}`);
    }

    async publishVersion(id: string, vid: string): Promise<ApiResponse<{ ok: boolean }>> {
        return this.request.private.post<{ ok: boolean }>(`${this.baseUrl}/${id}/versions/${vid}/publish`);
    }

    async rollbackVersion(id: string, vid: string): Promise<ApiResponse<{ ok: boolean }>> {
        return this.request.private.post<{ ok: boolean }>(`${this.baseUrl}/${id}/versions/${vid}/rollback`);
    }

    // ===== MILESTONES & TASKS =====
    async createMilestone<TMilestone>(id: string, data: Record<string, unknown>): Promise<ApiResponse<TMilestone>> {
        return this.request.private.post<TMilestone, Record<string, unknown>>(`${this.baseUrl}/${id}/milestones`, data);
    }

    async listMilestones<TMilestone>(id: string): Promise<ApiResponse<TMilestone[]>> {
        return this.request.private.get<TMilestone[]>(`${this.baseUrl}/${id}/milestones`);
    }

    async updateMilestone<TMilestone>(mid: string, data: Record<string, unknown>): Promise<ApiResponse<TMilestone>> {
        return this.request.private.patch<TMilestone, Record<string, unknown>>(`${this.baseUrl}/milestones/${mid}`, data);
        }

    async deleteMilestone(mid: string): Promise<ApiResponse<{ message: string }>> {
        return this.request.private.delete<{ message: string }>(`${this.baseUrl}/milestones/${mid}`);
    }

    async createTask<TTask>(mid: string, data: Record<string, unknown>): Promise<ApiResponse<TTask>> {
        return this.request.private.post<TTask, Record<string, unknown>>(`${this.baseUrl}/milestones/${mid}/tasks`, data);
    }

    async listTasks<TTask>(mid: string): Promise<ApiResponse<TTask[]>> {
        return this.request.private.get<TTask[]>(`${this.baseUrl}/milestones/${mid}/tasks`);
    }

    async updateTask<TTask>(tid: string, data: Record<string, unknown>): Promise<ApiResponse<TTask>> {
        return this.request.private.patch<TTask, Record<string, unknown>>(`${this.baseUrl}/tasks/${tid}`, data);
    }

    async deleteTask(tid: string): Promise<ApiResponse<{ message: string }>> {
        return this.request.private.delete<{ message: string }>(`${this.baseUrl}/tasks/${tid}`);
    }

    // ===== COLLABORATORS =====
    async addCollaborator<TCollaborator>(id: string, data: Record<string, unknown>): Promise<ApiResponse<TCollaborator>> {
        return this.request.private.post<TCollaborator, Record<string, unknown>>(`${this.baseUrl}/${id}/collaborators`, data);
    }

    async listCollaborators<TCollaborator>(id: string): Promise<ApiResponse<TCollaborator[]>> {
        return this.request.private.get<TCollaborator[]>(`${this.baseUrl}/${id}/collaborators`);
    }

    async updateCollaborator<TCollaborator>(cid: string, data: Record<string, unknown>): Promise<ApiResponse<TCollaborator>> {
        return this.request.private.patch<TCollaborator, Record<string, unknown>>(`${this.baseUrl}/collaborators/${cid}`, data);
    }

    async removeCollaborator(cid: string): Promise<ApiResponse<{ message: string }>> {
        return this.request.private.delete<{ message: string }>(`${this.baseUrl}/collaborators/${cid}`);
    }

    // ===== FILES =====
    async uploadFile<TFile>(id: string, data: FormData): Promise<ApiResponse<TFile>> {
        return this.request.private.post<TFile, FormData>(`${this.baseUrl}/${id}/files`, data);
    }

    async listFiles<TFile>(id: string): Promise<ApiResponse<TFile[]>> {
        return this.request.private.get<TFile[]>(`${this.baseUrl}/${id}/files`);
    }

    async deleteFile(fid: string): Promise<ApiResponse<{ message: string }>> {
        return this.request.private.delete<{ message: string }>(`${this.baseUrl}/files/${fid}`);
    }

    // ===== APPROVAL =====
    async approveContract(id: string): Promise<ApiResponse<{ ok: boolean }>> {
        return this.request.private.post<{ ok: boolean }>(`${this.baseUrl}/${id}/approve`);
    }

    async rejectContract(id: string, reason: string): Promise<ApiResponse<{ ok: boolean }>> {
        return this.request.private.post<{ ok: boolean }, { reason: string }>(`${this.baseUrl}/${id}/reject`, { reason });
    }

    async requestChanges(id: string, changes: string[]): Promise<ApiResponse<{ ok: boolean }>> {
        return this.request.private.post<{ ok: boolean }, { changes: string[] }>(`${this.baseUrl}/${id}/request-changes`, { changes });
    }

    // ===== EXPORT/PRINT =====
    async exportPdf(id: string): Promise<ApiResponse<Blob>> {
        return this.request.private.get<Blob>(`${this.baseUrl}/${id}/export/pdf`);
    }

    async exportDocx(id: string): Promise<ApiResponse<Blob>> {
        return this.request.private.get<Blob>(`${this.baseUrl}/${id}/export/docx`);
    }

    async printContract<TPrint>(id: string): Promise<ApiResponse<TPrint>> {
        return this.request.private.get<TPrint>(`${this.baseUrl}/${id}/print`);
    }

    // ===== AUDIT/ANALYTICS =====
    async getAuditLogs<TAudit>(id: string): Promise<ApiResponse<TAudit[]>> {
        return this.request.private.get<TAudit[]>(`${this.baseUrl}/${id}/audit`);
    }

    async getAnalytics<TAnalytics>(id: string): Promise<ApiResponse<TAnalytics>> {
        return this.request.private.get<TAnalytics>(`${this.baseUrl}/${id}/analytics`);
    }

    async getDashboardStats<TStats>(): Promise<ApiResponse<TStats>> {
        return this.request.private.get<TStats>(`${this.baseUrl}/dashboard/stats`);
    }

    // ===== TEMPLATES =====
    async listTemplates<TTemplate>(params?: Record<string, string | number | boolean>): Promise<ApiResponse<TTemplate[]>> {
        const url = this.buildUrl(`${this.baseUrl}/templates`, params || {});
        return this.request.private.get<TTemplate[]>(url);
    }

    async getTemplate<TTemplate>(tid: string): Promise<ApiResponse<TTemplate>> {
        return this.request.private.get<TTemplate>(`${this.baseUrl}/templates/${tid}`);
    }

    async createTemplate<TTemplate>(data: Record<string, unknown>): Promise<ApiResponse<TTemplate>> {
        return this.request.private.post<TTemplate, Record<string, unknown>>(`${this.baseUrl}/templates`, data);
    }

    async updateTemplate<TTemplate>(tid: string, data: Record<string, unknown>): Promise<ApiResponse<TTemplate>> {
        return this.request.private.patch<TTemplate, Record<string, unknown>>(`${this.baseUrl}/templates/${tid}`, data);
    }

    async deleteTemplate(tid: string): Promise<ApiResponse<{ ok: boolean }>> {
        return this.request.private.delete<{ ok: boolean }>(`${this.baseUrl}/templates/${tid}`);
    }

    // ===== NOTIFICATIONS & REMINDERS =====
    async createNotification<TNotification>(id: string, data: Record<string, unknown>): Promise<ApiResponse<TNotification>> {
        return this.request.private.post<TNotification, Record<string, unknown>>(`${this.baseUrl}/${id}/notifications`, data);
    }

    async listNotifications<TNotification>(id: string): Promise<ApiResponse<TNotification[]>> {
        return this.request.private.get<TNotification[]>(`${this.baseUrl}/${id}/notifications`);
    }

    async createReminder<TReminder>(id: string, data: Record<string, unknown>): Promise<ApiResponse<TReminder>> {
        return this.request.private.post<TReminder, Record<string, unknown>>(`${this.baseUrl}/${id}/reminders`, data);
    }

    async listReminders<TReminder>(id: string): Promise<ApiResponse<TReminder[]>> {
        return this.request.private.get<TReminder[]>(`${this.baseUrl}/${id}/reminders`);
    }
}

export const contractService = new ContractService();
