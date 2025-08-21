import { BaseService } from '~/services/api/base.service';
import type { ContractTemplate } from '~/types/contract/contract.types';
import type { ApiResponse } from '~/core/types/api.types';

class TemplateService extends BaseService {
    async listTemplates(params?: {
        type?: 'basic' | 'editor';
        search?: string;
        category?: string;
        page?: number;
        size?: number;
    }): Promise<ApiResponse<{ data: ContractTemplate[]; pagination?: unknown }>> {
        return this.get<{ data: ContractTemplate[]; pagination?: unknown }>(
            this.buildUrl('/contracts/templates', params),
        );
    }

    async createTemplate(payload: Partial<ContractTemplate>): Promise<ApiResponse<ContractTemplate>> {
        return this.post<ContractTemplate>('/contracts/templates', payload);
    }

    async updateTemplate(id: string, payload: Partial<ContractTemplate>): Promise<ApiResponse<ContractTemplate>> {
        return this.patch<ContractTemplate>(`/contracts/templates/${id}`, payload);
    }

    async deleteTemplate(id: string): Promise<ApiResponse<{ ok: boolean }>> {
        return this.delete<{ ok: boolean }>(`/contracts/templates/${id}`);
    }

    async listVersions(id: string): Promise<ApiResponse<any[]>> {
        return this.get<any[]>(`/contracts/templates/${id}/versions`);
    }

    async createVersion(
        id: string,
        payload: { content?: any; placeholders?: any; changelog?: string; draft?: boolean },
    ): Promise<ApiResponse<any>> {
        return this.post<any>(`/contracts/templates/${id}/versions`, payload);
    }

    // generic passthrough
    async get<T = unknown>(path: string): Promise<ApiResponse<T>> {
        return super.get<T>(path);
    }

    // new methods
    async publish(id: string, payload?: { versionId?: string }): Promise<ApiResponse<{ success: boolean }>> {
        return this.post<{ success: boolean }>(`/contracts/templates/${id}/publish`, payload || {});
    }

    async preview(
        id: string,
        payload: { content?: any; versionId?: string; mockData?: Record<string, any> },
    ): Promise<ApiResponse<{ html: string }>> {
        return this.post<{ html: string }>(`/contracts/templates/${id}/preview`, payload);
    }

    async diff(
        id: string,
        versionId: string,
        targetVersionId: string,
    ): Promise<ApiResponse<{ changes: any[] }>> {
        return this.post<{ changes: any[] }>(`/contracts/templates/${id}/versions/${versionId}/diff`, { targetVersionId } as any);
    }

    async rollback(id: string, versionId: string): Promise<ApiResponse<{ version_id: string }>> {
        return this.post<{ version_id: string }>(`/contracts/templates/${id}/versions/${versionId}/rollback`, {} as any);
    }

    async clone(id: string, name: string): Promise<ApiResponse<ContractTemplate>> {
        return this.post<ContractTemplate>(`/contracts/templates/${id}/clone`, { name } as any);
    }
}

export const templateService = new TemplateService();