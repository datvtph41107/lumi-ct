import { BaseService } from "./base.service";
import type { ContractTemplate } from "~/types/contract/contract.types";
import type { ApiResponse } from "~/core/types/api.types";

export class ContractTemplateService extends BaseService {
    async getContractTemplates(): Promise<ApiResponse<ContractTemplate[]>> {
        return this.request.private.get<ContractTemplate[]>("/contracts/templates");
    }

    async getContractTemplateById(id: string): Promise<ApiResponse<ContractTemplate>> {
        return this.request.private.get<ContractTemplate>(`/contracts/templates/${id}`);
    }

    async createContractTemplate(
        template: Omit<ContractTemplate, "id" | "createdAt" | "updatedAt">,
    ): Promise<ApiResponse<ContractTemplate>> {
        return this.request.private.post<ContractTemplate, Omit<ContractTemplate, "id" | "createdAt" | "updatedAt">>(
            "/contracts/templates",
            template,
        );
    }

    async updateContractTemplate(id: string, updates: Partial<ContractTemplate>): Promise<ApiResponse<ContractTemplate>> {
        return this.request.private.patch<ContractTemplate, Partial<ContractTemplate>>(`/contracts/templates/${id}`, updates);
    }

    async deleteContractTemplate(id: string): Promise<ApiResponse<{ ok: boolean }>> {
        return this.request.private.delete<{ ok: boolean }>(`/contracts/templates/${id}`);
    }
}

export const contractTemplateService = new ContractTemplateService();
