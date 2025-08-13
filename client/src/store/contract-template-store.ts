import { create } from "zustand";
import type { ContractTemplate } from "~/types/contract/contract.types";
import { contractTemplateService } from "~/services/api/contract-template.service";
import { Logger } from "~/core/Logger";
import { getErrorMessage } from "~/utils/error-handler";

interface ContractTemplateStoreState {
    templates: ContractTemplate[];
    loading: boolean;
    error: string | null;
    fetchTemplates: () => Promise<void>;
    createTemplate: (template: Omit<ContractTemplate, "id" | "createdAt" | "updatedAt" | "isActive">) => Promise<void>;
    updateTemplate: (id: string, updates: Partial<ContractTemplate>) => Promise<void>;
    deleteTemplate: (id: string) => Promise<void>;
}

const logger = Logger.getInstance();

export const useContractTemplateStore = create<ContractTemplateStoreState>((set, get) => ({
    templates: [],
    loading: false,
    error: null,

    fetchTemplates: async () => {
        set({ loading: true, error: null });
        try {
            const response = await contractTemplateService.getContractTemplates();
            if (response.success) {
                set({ templates: response.data || [], loading: false });
            } else {
                set({ error: response.message || "Failed to fetch templates", loading: false });
                logger.error("Failed to fetch templates:", response.message);
            }
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err);
            set({ error: errorMessage, loading: false });
            logger.error("Error fetching templates:", err);
        }
    },

    createTemplate: async (templateData: Omit<ContractTemplate, "id" | "createdAt" | "updatedAt" | "isActive">) => {
        set({ loading: true, error: null });
        try {
            const newTemplate: Omit<ContractTemplate, "id" | "createdAt" | "updatedAt"> = {
                ...templateData,
                isActive: true, // New templates are active by default
            };
            const response = await contractTemplateService.createContractTemplate(newTemplate);
            if (response.success) {
                const createdTemplate = response.data!;
                set((state) => ({
                    templates: [...state.templates, createdTemplate],
                    loading: false,
                }));
            } else {
                set({ error: response.message || "Failed to create template", loading: false });
                logger.error("Failed to create template:", response.message);
            }
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err);
            set({ error: errorMessage, loading: false });
            logger.error("Error creating template:", err);
        }
    },

    updateTemplate: async (id: string, updates: Partial<ContractTemplate>) => {
        set({ loading: true, error: null });
        try {
            const response = await contractTemplateService.updateContractTemplate(id, updates);
            if (response.success) {
                const updatedTemplate = response.data!;
                set((state) => ({
                    templates: state.templates.map((template) => (template.id === id ? updatedTemplate : template)),
                    loading: false,
                }));
            } else {
                set({ error: response.message || `Failed to update template ${id}`, loading: false });
                logger.error(`Failed to update template ${id}:`, response.message);
            }
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err);
            set({ error: errorMessage, loading: false });
            logger.error(`Error updating template ${id}:`, err);
        }
    },

    deleteTemplate: async (id: string) => {
        set({ loading: true, error: null });
        try {
            const response = await contractTemplateService.deleteContractTemplate(id);
            if (response.success) {
                set((state) => ({
                    templates: state.templates.filter((template) => template.id !== id),
                    loading: false,
                }));
            } else {
                set({ error: response.message || `Failed to delete template ${id}`, loading: false });
                logger.error(`Failed to delete template ${id}:`, response.message);
            }
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err);
            set({ error: errorMessage, loading: false });
            logger.error(`Error deleting template ${id}:`, err);
        }
    },
}));
