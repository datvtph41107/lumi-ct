import { BaseService } from "./base.service";
import type { CustomTemplate, ContractType } from "~/types/contract/contract.types"; // Corrected import path
import type { ApiResponse } from "~/core/types/api.types";

export class ContractTemplateService extends BaseService {
    constructor() {
        super();
    }

    async getContractTemplates(): Promise<ApiResponse<CustomTemplate[]>> {
        return this.request.private.get<CustomTemplate[]>("contract-templates");
    }

    async getContractTemplateById(id: string): Promise<ApiResponse<CustomTemplate>> {
        return this.request.private.get<CustomTemplate>(`contract-templates/${id}`);
    }

    async createContractTemplate(template: Omit<CustomTemplate, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<CustomTemplate>> {
        return this.request.private.post<CustomTemplate, Omit<CustomTemplate, "id" | "createdAt" | "updatedAt">>(
            "contract-templates",
            template,
        );
    }

    async updateContractTemplate(id: string, updates: Partial<CustomTemplate>): Promise<ApiResponse<CustomTemplate>> {
        return this.request.private.patch<CustomTemplate, Partial<CustomTemplate>>(`contract-templates/${id}`, updates);
    }

    async deleteContractTemplate(id: string): Promise<ApiResponse<void>> {
        return this.request.private.delete<void>(`contract-templates/${id}`);
    }

    async createDraftFromTemplate(templateId: string, contractType: ContractType): Promise<ApiResponse<CustomTemplate>> {
        // This endpoint is likely on the contract-drafts controller, but exposed via template service for convenience
        return this.request.private.post<CustomTemplate, { contractType: ContractType }>(`contract-drafts/from-template/${templateId}`, {
            contractType,
        });
    }
}

export const contractTemplateService = new ContractTemplateService();
