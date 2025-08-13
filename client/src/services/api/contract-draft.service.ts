import { BaseService } from "./base.service";
import type { ContractDraft } from "~/types/contract/contract.types";
import type { ApiResponse } from "~/core/types/api.types";

export class ContractDraftService extends BaseService {
    constructor() {
        super();
    }

    async getContractDrafts(): Promise<ApiResponse<ContractDraft[]>> {
        return this.request.private.get<ContractDraft[]>("contract-drafts");
    }

    async getContractDraftById(id: string): Promise<ApiResponse<ContractDraft>> {
        return this.request.private.get<ContractDraft>(`contract-drafts/${id}`);
    }

    async createContractDraft(draft: Omit<ContractDraft, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<ContractDraft>> {
        return this.request.private.post<ContractDraft, Omit<ContractDraft, "id" | "createdAt" | "updatedAt">>("contract-drafts", draft);
    }

    async updateContractDraft(id: string, updates: Partial<ContractDraft>): Promise<ApiResponse<ContractDraft>> {
        return this.request.private.patch<ContractDraft, Partial<ContractDraft>>(`contract-drafts/${id}`, updates);
    }

    async deleteContractDraft(id: string): Promise<ApiResponse<void>> {
        return this.request.private.delete<void>(`contract-drafts/${id}`);
    }
}

export const contractDraftService = new ContractDraftService();
