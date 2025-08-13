import { create } from "zustand";
import type { Contract, ContractFormData } from "~/types/contract/contract.types";
import { Logger } from "~/core/Logger";
import { getErrorMessage } from "~/utils/error-handler";

interface ContractState {
    contracts: Contract[];
    currentContract: Contract | null;
    currentStep: number;
    formData: ContractFormData | null;
    loading: boolean;
    error: string | null;
    // In a real app, these would call a contractService
    fetchContracts: () => Promise<void>;
    fetchContractById: (id: string) => Promise<void>;
    createContract: (contract: Omit<Contract, "id" | "createdAt" | "updatedAt">) => Promise<void>;
    updateContract: (id: string, updates: Partial<Contract>) => Promise<void>;
    deleteContract: (id: string) => Promise<void>;
    setCurrentContract: (contract: Contract | null) => void;
    setFormData: (data: ContractFormData) => void;
    goToStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    clearError: () => void;
}

const logger = Logger.getInstance();

export const useContractStore = create<ContractState>((set, get) => ({
    contracts: [],
    currentContract: null,
    currentStep: 1,
    formData: null,
    loading: false,
    error: null,

    fetchContracts: async () => {
        set({ loading: true, error: null });
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500));
            const dummyContracts: Contract[] = [
                {
                    id: "1",
                    title: "Software Development Agreement",
                    contractType: "service",
                    customFields: { clientName: "Acme Corp", projectScope: "Develop a new e-commerce platform" },
                    milestones: [],
                    status: "draft",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: "2",
                    title: "NDA with Partner X",
                    contractType: "nda",
                    customFields: { counterparty: "Partner X", effectiveDate: "2023-01-15" },
                    milestones: [],
                    status: "draft",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ];
            set({ contracts: dummyContracts, loading: false });
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err);
            set({ error: errorMessage, loading: false });
            logger.error("Error fetching contracts:", err);
        }
    },

    fetchContractById: async (id: string) => {
        set({ loading: true, error: null });
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 300));
            const contract = get().contracts.find((c) => c.id === id);
            if (contract) {
                set({ currentContract: contract, loading: false });
            } else {
                set({ error: `Contract with ID ${id} not found`, loading: false });
                logger.warn(`Contract with ID ${id} not found`);
            }
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err);
            set({ error: errorMessage, loading: false });
            logger.error(`Error fetching contract ${id}:`, err);
        }
    },

    createContract: async (contract: Omit<Contract, "id" | "createdAt" | "updatedAt">) => {
        set({ loading: true, error: null });
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500));
            const newContract: Contract = {
                ...contract,
                id: `contract-${Date.now()}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            set((state) => ({
                contracts: [...state.contracts, newContract],
                currentContract: newContract,
                loading: false,
            }));
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err);
            set({ error: errorMessage, loading: false });
            logger.error("Error creating contract:", err);
        }
    },

    updateContract: async (id: string, updates: Partial<Contract>) => {
        set({ loading: true, error: null });
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500));
            set((state) => ({
                contracts: state.contracts.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)),
                currentContract:
                    state.currentContract?.id === id
                        ? { ...state.currentContract, ...updates, updatedAt: new Date().toISOString() }
                        : state.currentContract,
                loading: false,
            }));
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err);
            set({ error: errorMessage, loading: false });
            logger.error(`Error updating contract ${id}:`, err);
        }
    },

    deleteContract: async (id: string) => {
        set({ loading: true, error: null });
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500));
            set((state) => ({
                contracts: state.contracts.filter((c) => c.id !== id),
                currentContract: state.currentContract?.id === id ? null : state.currentContract,
                loading: false,
            }));
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err);
            set({ error: errorMessage, loading: false });
            logger.error(`Error deleting contract ${id}:`, err);
        }
    },

    setCurrentContract: (contract: Contract | null) => {
        set({ currentContract: contract });
    },

    setFormData: (data) => set({ formData: data }),

    goToStep: (step) => {
        logger.info(`Navigating to step: ${step}`);
        set({ currentStep: step });
    },

    nextStep: () => {
        set((state) => {
            const next = state.currentStep + 1;
            logger.info(`Moving to next step: ${next}`);
            return { currentStep: next };
        });
    },

    prevStep: () => {
        set((state) => {
            const prev = Math.max(1, state.currentStep - 1);
            logger.info(`Moving to previous step: ${prev}`);
            return { currentStep: prev };
        });
    },

    clearError: () => {
        set({ error: null });
    },
}));
