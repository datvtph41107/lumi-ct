import { BaseService } from './base.service';
import type { ApiResponse } from '~/core/types/api.types';

export class ContractDraftService extends BaseService {
    private readonly baseUrl = '/contract-drafts';

    async getAllDrafts<TDraft>(): Promise<ApiResponse<TDraft[]>> {
        return this.request.private.get<TDraft[]>(`${this.baseUrl}`);
    }

    async getDraftById<TDraft>(id: string): Promise<ApiResponse<TDraft>> {
        return this.request.private.get<TDraft>(`${this.baseUrl}/${id}`);
    }

    async createContractDraft<TDraft>(draft: Record<string, unknown>): Promise<ApiResponse<TDraft>> {
        return this.request.private.post<TDraft, Record<string, unknown>>(`${this.baseUrl}`, draft);
    }

    async updateDraft<TDraft>(id: string, updates: Record<string, unknown>): Promise<ApiResponse<TDraft>> {
        return this.request.private.patch<TDraft, Record<string, unknown>>(`${this.baseUrl}/${id}`, updates);
    }

    async deleteDraft(id: string): Promise<ApiResponse<{ ok: boolean }>> {
        return this.request.private.delete<{ ok: boolean }>(`${this.baseUrl}/${id}`);
    }
}

export const contractDraftService = new ContractDraftService();
