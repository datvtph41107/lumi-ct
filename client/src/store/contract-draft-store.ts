import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
    ContractDraft,
    ContractData,
    ContractTemplate,
    ContractCreationStage,
    ContractCreationMode,
    StageValidation,
    ContractContent,
} from "~/types/contract/contract.types";
import { contractDraftService } from "~/services/api/contract-draft.service";
import { contractTemplateService } from "~/services/api/contract-template.service";
import { v4 as uuidv4 } from "uuid";
import { Logger } from "~/core/Logger";
import { getErrorMessage } from "~/utils/error-handler";

const logger = Logger.getInstance();

// Helper function to create initial stage validations
const createInitialStageValidations = (): Record<ContractCreationStage, StageValidation> => {
    return {
        template_selection: {
            stage: "template_selection",
            status: "incomplete",
            errors: [],
            warnings: [],
            isAccessible: true,
        },
        basic_info: {
            stage: "basic_info",
            status: "locked",
            errors: [],
            warnings: [],
            isAccessible: false,
        },
        content_draft: {
            stage: "content_draft",
            status: "locked",
            errors: [],
            warnings: [],
            isAccessible: false,
        },
        milestones_tasks: {
            stage: "milestones_tasks",
            status: "locked",
            errors: [],
            warnings: [],
            isAccessible: false,
        },
        review_preview: {
            stage: "review_preview",
            status: "locked",
            errors: [],
            warnings: [],
            isAccessible: false,
        },
    };
};

interface ContractDraftStoreState {
    // State
    drafts: ContractDraft[];
    templates: ContractTemplate[];
    currentDraft: ContractDraft | null;
    loading: boolean;
    error: string | null;

    // Current creation flow state
    currentStage: ContractCreationStage;
    selectedMode: ContractCreationMode | null;
    selectedTemplate: ContractTemplate | null;
    stageValidations: Record<ContractCreationStage, StageValidation>;
    autoSaveEnabled: boolean;
    lastAutoSave: string | null;

    // Actions
    loadDrafts: () => Promise<void>;
    loadTemplates: () => Promise<void>;
    loadDraft: (id: string) => Promise<void>;
    createDraft: (mode: ContractCreationMode, templateId?: string) => Promise<ContractDraft>;
    createFromTemplate: (templateId: string) => Promise<ContractDraft>;
    updateDraft: (id: string, updates: Partial<ContractDraft>) => Promise<void>;
    updateDraftData: (stage: ContractCreationStage, data: Partial<ContractData>) => Promise<void>;
    deleteDraft: (id: string) => Promise<void>;
    duplicateDraft: (id: string) => Promise<ContractDraft>;

    // Flow management methods
    initializeFlow: (mode: ContractCreationMode, templateId?: string) => Promise<void>;
    setSelectedMode: (mode: ContractCreationMode) => void;
    setSelectedTemplate: (template: ContractTemplate | null) => void;
    navigateToStage: (stage: ContractCreationStage) => Promise<void>;
    updateCurrentDraftStage: (stage: ContractCreationStage) => void;
    validateCurrentStage: () => Promise<boolean>;
    canNavigateToStage: (stage: ContractCreationStage) => boolean;
    getStageValidation: (stage: ContractCreationStage) => StageValidation;
    resetFlow: () => void;
    nextStage: () => Promise<void>;
    previousStage: () => void;

    // Validation and form helpers
    validateStage: (stage: ContractCreationStage, data: unknown) => Promise<StageValidation>;
    getFieldsForTemplate: (templateId: string) => unknown[];
    generateContractFromTemplate: (templateId: string, data: Partial<ContractData>) => Promise<ContractData>;

    // Data transformation helpers
    transformToContractData: (draft: ContractDraft) => ContractData;
    updateContractContent: (content: ContractContent) => void;

    // Reset methods
    clearCurrentDraft: () => void;
    resetCreationFlow: () => void;

    // Auto-save methods
    enableAutoSave: () => void;
    disableAutoSave: () => void;
    performAutoSave: () => Promise<void>;
}

export const useContractDraftStore = create<ContractDraftStoreState>()(
    persist(
        (set, get) => ({
            // Initial state
            drafts: [],
            templates: [],
            currentDraft: null,
            loading: false,
            error: null,

            // Flow state
            currentStage: "template_selection",
            selectedMode: null,
            selectedTemplate: null,
            stageValidations: createInitialStageValidations(),
            autoSaveEnabled: true,
            lastAutoSave: null,

            // Load drafts
            loadDrafts: async () => {
                set({ loading: true, error: null });
                try {
                    const response = await contractDraftService.getAllDrafts();
                    if (response.success && response.data) {
                        set({ drafts: response.data, loading: false });
                    } else {
                        set({ error: response.message || "Failed to load drafts", loading: false });
                    }
                } catch (error) {
                    logger.error("Failed to load drafts:", error);
                    set({ error: getErrorMessage(error), loading: false });
                }
            },

            // Load templates
            loadTemplates: async () => {
                set({ loading: true, error: null });
                try {
                    const response = await contractTemplateService.getAllTemplates();
                    if (response.success && response.data) {
                        set({ templates: response.data, loading: false });
                    } else {
                        set({ error: response.message || "Failed to load templates", loading: false });
                    }
                } catch (error) {
                    logger.error("Failed to load templates:", error);
                    set({ error: getErrorMessage(error), loading: false });
                }
            },

            // Load specific draft
            loadDraft: async (id: string) => {
                set({ loading: true, error: null });
                try {
                    const response = await contractDraftService.getDraftById(id);
                    if (response.success && response.data) {
                        const draft = response.data;
                        set({
                            currentDraft: draft,
                            currentStage: draft.flow.currentStage,
                            stageValidations: draft.flow.stageValidations,
                            selectedMode: draft.flow.selectedMode,
                            selectedTemplate: draft.flow.selectedTemplate,
                            loading: false,
                        });
                    } else {
                        set({ error: response.message || "Failed to load draft", loading: false });
                    }
                } catch (error) {
                    logger.error("Failed to load draft:", error);
                    set({ error: getErrorMessage(error), loading: false });
                }
            },

            // Create new draft
            createDraft: async (mode: ContractCreationMode, templateId?: string) => {
                set({ loading: true, error: null });
                try {
                    const template = templateId ? get().templates.find((t) => t.id === templateId) : undefined;

                    const newDraft: ContractDraft = {
                        id: uuidv4(),
                        contractData: {
                            name: "",
                            contractType: "service",
                            category: "business",
                            priority: "medium",
                            drafterId: "",
                            drafterName: "",
                            managerId: "",
                            managerName: "",
                            content: {
                                mode,
                                ...(mode === "basic" && templateId
                                    ? {
                                          templateId,
                                          fieldValues: {},
                                          description: "",
                                      }
                                    : {}),
                                ...(mode === "editor"
                                    ? {
                                          editorContent: {
                                              content: "",
                                              plainText: "",
                                              metadata: {
                                                  wordCount: 0,
                                                  characterCount: 0,
                                                  lastEditedAt: new Date().toISOString(),
                                                  version: 1,
                                              },
                                          },
                                      }
                                    : {}),
                                ...(mode === "upload"
                                    ? {
                                          uploadedFile: {
                                              fileId: "",
                                              fileName: "",
                                              fileUrl: "",
                                              fileSize: 0,
                                              mimeType: "",
                                              uploadedAt: new Date().toISOString(),
                                          },
                                      }
                                    : {}),
                            } as ContractContent,
                            dateRange: {
                                startDate: null,
                                endDate: null,
                            },
                            milestones: [],
                            tags: [],
                            attachments: [],
                            status: "draft",
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        },
                        flow: {
                            id: uuidv4(),
                            currentStage: "template_selection",
                            selectedMode: mode,
                            selectedTemplate: template,
                            stageValidations: createInitialStageValidations(),
                            canProceedToNext: false,
                            autoSaveEnabled: true,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        },
                        isDraft: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        createdBy: "current-user", // TODO: Get from auth context
                    };

                    const response = await contractDraftService.createContractDraft(newDraft);
                    if (response.success && response.data) {
                        set((state) => ({
                            drafts: [...state.drafts, response.data!],
                            currentDraft: response.data!,
                            currentStage: "template_selection",
                            selectedMode: mode,
                            selectedTemplate: template || null,
                            stageValidations: createInitialStageValidations(),
                            loading: false,
                        }));
                        return response.data!;
                    } else {
                        set({ error: response.message || "Failed to create draft", loading: false });
                        throw new Error(response.message || "Failed to create draft");
                    }
                } catch (error) {
                    logger.error("Failed to create draft:", error);
                    set({ error: getErrorMessage(error), loading: false });
                    throw error;
                }
            },

            // Create from template
            createFromTemplate: async (templateId: string) => {
                const template = get().templates.find((t) => t.id === templateId);
                if (!template) {
                    throw new Error("Template not found");
                }
                return get().createDraft(template.mode, templateId);
            },

            // Update draft
            updateDraft: async (id: string, updates: Partial<ContractDraft>) => {
                set({ loading: true, error: null });
                try {
                    const response = await contractDraftService.updateDraft(id, updates);
                    if (response.success && response.data) {
                        set((state) => ({
                            drafts: state.drafts.map((d) => (d.id === id ? response.data! : d)),
                            currentDraft: state.currentDraft?.id === id ? response.data! : state.currentDraft,
                            loading: false,
                        }));
                    } else {
                        set({ error: response.message || "Failed to update draft", loading: false });
                    }
                } catch (error) {
                    logger.error("Failed to update draft:", error);
                    set({ error: getErrorMessage(error), loading: false });
                }
            },

            // Update draft data
            updateDraftData: async (stage: ContractCreationStage, data: Partial<ContractData>) => {
                const state = get();
                if (!state.currentDraft) {
                    logger.warn("No current draft to update");
                    return;
                }

                try {
                    const updatedDraft = {
                        ...state.currentDraft,
                        contractData: {
                            ...state.currentDraft.contractData,
                            ...data,
                        },
                        updatedAt: new Date().toISOString(),
                    };

                    await get().updateDraft(state.currentDraft.id, updatedDraft);

                    set({
                        lastAutoSave: new Date().toISOString(),
                    });

                    logger.info("Draft data updated successfully", { stage });
                } catch (error) {
                    logger.error("Failed to update draft data:", error);
                    set({ error: getErrorMessage(error) });
                    throw error;
                }
            },

            // Delete draft
            deleteDraft: async (id: string) => {
                set({ loading: true, error: null });
                try {
                    const response = await contractDraftService.deleteDraft(id);
                    if (response.success) {
                        set((state) => ({
                            drafts: state.drafts.filter((d) => d.id !== id),
                            currentDraft: state.currentDraft?.id === id ? null : state.currentDraft,
                            loading: false,
                        }));
                    } else {
                        set({ error: response.message || "Failed to delete draft", loading: false });
                    }
                } catch (error) {
                    logger.error("Failed to delete draft:", error);
                    set({ error: getErrorMessage(error), loading: false });
                }
            },

            // Duplicate draft
            duplicateDraft: async (id: string) => {
                const draftToDuplicate = get().drafts.find((d) => d.id === id);
                if (!draftToDuplicate) {
                    throw new Error("Draft not found");
                }

                const duplicatedDraft: ContractDraft = {
                    ...draftToDuplicate,
                    id: uuidv4(),
                    contractData: {
                        ...draftToDuplicate.contractData,
                        name: `${draftToDuplicate.contractData.name} (Copy)`,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                    flow: {
                        ...draftToDuplicate.flow,
                        id: uuidv4(),
                        currentStage: "template_selection",
                        stageValidations: createInitialStageValidations(),
                        canProceedToNext: false,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: "current-user",
                };

                return get().createDraft(duplicatedDraft.flow.selectedMode, duplicatedDraft.flow.selectedTemplate?.id);
            },

            // Flow management methods
            initializeFlow: async (mode: ContractCreationMode, templateId?: string) => {
                logger.info("Initializing contract creation flow", { mode, templateId });

                const template = templateId ? get().templates.find((t) => t.id === templateId) : undefined;

                set({
                    selectedMode: mode,
                    selectedTemplate: template || null,
                    currentStage: "template_selection",
                    stageValidations: createInitialStageValidations(),
                    error: null,
                });
            },

            setSelectedMode: (mode: ContractCreationMode) => {
                set({ selectedMode: mode });
                logger.info("Selected contract mode", { mode });
            },

            setSelectedTemplate: (template: ContractTemplate | null) => {
                set({ selectedTemplate: template });
                if (template) {
                    logger.info("Template selected:", template.name);
                }
            },

            navigateToStage: async (stage: ContractCreationStage) => {
                const state = get();
                if (!state.canNavigateToStage(stage)) {
                    logger.warn(`Cannot navigate to stage ${stage} - not accessible`);
                    return;
                }

                try {
                    set({ currentStage: stage });

                    if (state.currentDraft) {
                        state.updateCurrentDraftStage(stage);
                    }

                    logger.info(`Navigated to stage ${stage}`);
                } catch (error) {
                    logger.error(`Failed to navigate to stage ${stage}:`, error);
                    set({ error: getErrorMessage(error) });
                }
            },

            updateCurrentDraftStage: (stage: ContractCreationStage) => {
                set((state) => {
                    if (!state.currentDraft) return state;

                    return {
                        currentDraft: {
                            ...state.currentDraft,
                            flow: {
                                ...state.currentDraft.flow,
                                currentStage: stage,
                                updatedAt: new Date().toISOString(),
                            },
                            updatedAt: new Date().toISOString(),
                        },
                        currentStage: stage,
                    };
                });
            },

            validateCurrentStage: async () => {
                const { currentStage, currentDraft } = get();
                if (!currentDraft) return false;

                try {
                    const validation = await get().validateStage(currentStage, currentDraft.contractData);

                    set((state) => ({
                        stageValidations: {
                            ...state.stageValidations,
                            [currentStage]: validation,
                        },
                    }));

                    return validation.status === "valid";
                } catch (error) {
                    logger.error(`Failed to validate stage ${currentStage}:`, error);
                    return false;
                }
            },

            canNavigateToStage: (stage: ContractCreationStage) => {
                const { stageValidations } = get();
                return stageValidations[stage]?.isAccessible || stage === "template_selection";
            },

            getStageValidation: (stage: ContractCreationStage) => {
                const { stageValidations } = get();
                return (
                    stageValidations[stage] || {
                        stage,
                        status: "locked",
                        errors: [],
                        warnings: [],
                        isAccessible: false,
                    }
                );
            },

            resetFlow: () => {
                set({
                    currentStage: "template_selection",
                    selectedMode: null,
                    selectedTemplate: null,
                    currentDraft: null,
                    stageValidations: createInitialStageValidations(),
                });
            },

            nextStage: async () => {
                const { currentStage } = get();
                const stages: ContractCreationStage[] = [
                    "template_selection",
                    "basic_info",
                    "content_draft",
                    "milestones_tasks",
                    "review_preview",
                ];
                const currentIndex = stages.indexOf(currentStage);

                if (currentIndex < stages.length - 1) {
                    const nextStage = stages[currentIndex + 1];
                    await get().navigateToStage(nextStage);
                }
            },

            previousStage: () => {
                const { currentStage } = get();
                const stages: ContractCreationStage[] = [
                    "template_selection",
                    "basic_info",
                    "content_draft",
                    "milestones_tasks",
                    "review_preview",
                ];
                const currentIndex = stages.indexOf(currentStage);

                if (currentIndex > 0) {
                    const prevStage = stages[currentIndex - 1];
                    get().navigateToStage(prevStage);
                }
            },

            // Validation and form helpers
            validateStage: async (stage: ContractCreationStage, data: any): Promise<StageValidation> => {
                // TODO: Implement actual validation logic
                return {
                    stage,
                    status: "valid",
                    errors: [],
                    warnings: [],
                    isAccessible: true,
                };
            },

            getFieldsForTemplate: (templateId: string) => {
                const template = get().templates.find((t) => t.id === templateId);
                return template?.fields || [];
            },

            generateContractFromTemplate: async (templateId: string, data: Partial<ContractData>): Promise<ContractData> => {
                // TODO: Implement template generation logic
                return data as ContractData;
            },

            transformToContractData: (draft: ContractDraft): ContractData => {
                return draft.contractData;
            },

            updateContractContent: (content: ContractContent) => {
                set((state) => {
                    if (!state.currentDraft) return state;

                    return {
                        currentDraft: {
                            ...state.currentDraft,
                            contractData: {
                                ...state.currentDraft.contractData,
                                content,
                                updatedAt: new Date().toISOString(),
                            },
                            updatedAt: new Date().toISOString(),
                        },
                    };
                });
            },

            // Reset methods
            clearCurrentDraft: () => {
                set({
                    currentDraft: null,
                    currentStage: "template_selection",
                    stageValidations: createInitialStageValidations(),
                });
            },

            resetCreationFlow: () => {
                set({
                    currentStage: "template_selection",
                    selectedMode: null,
                    selectedTemplate: null,
                    stageValidations: createInitialStageValidations(),
                    lastAutoSave: null,
                });
            },

            // Auto-save methods
            enableAutoSave: () => {
                set({ autoSaveEnabled: true });
            },

            disableAutoSave: () => {
                set({ autoSaveEnabled: false });
            },

            performAutoSave: async () => {
                const { currentDraft, autoSaveEnabled } = get();
                if (!autoSaveEnabled || !currentDraft) return;

                try {
                    await get().updateDraft(currentDraft.id, currentDraft);
                    set({ lastAutoSave: new Date().toISOString() });
                } catch (error) {
                    logger.error("Auto-save failed:", error);
                }
            },
        }),
        {
            name: "contract-draft-store",
            partialize: (state) => ({
                currentStage: state.currentStage,
                selectedMode: state.selectedMode,
                selectedTemplate: state.selectedTemplate,
                stageValidations: state.stageValidations,
                autoSaveEnabled: state.autoSaveEnabled,
            }),
        },
    ),
);
