import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
    ContractDraft,
    ContractFormData as ContractData,
    ContractTemplate,
    ContractCreationStage,
    ContractCreationMode,
    StageValidation,
    ContractStructure as ContractContent,
} from "~/types/contract/contract.types";
import { contractDraftService } from "~/services/api/contract-draft.service";
import { contractTemplateService } from "~/services/api/contract-template.service";
import { contractService } from "~/services/api/contract.service";
import { v4 as uuidv4 } from "uuid";
import { Logger } from "~/core/Logger";
import { getErrorMessage } from "~/utils/error-handler";

const logger = Logger.getInstance();

// Helper function to create initial stage validations
const createInitialStageValidations = (): Record<ContractCreationStage, StageValidation> => {
    return {
        template_selection: { stage: "template_selection", status: "incomplete", errors: [], warnings: [], isAccessible: true },
        basic_info: { stage: "basic_info", status: "locked", errors: [], warnings: [], isAccessible: false },
        content_draft: { stage: "content_draft", status: "locked", errors: [], warnings: [], isAccessible: false },
        milestones_tasks: { stage: "milestones_tasks", status: "locked", errors: [], warnings: [], isAccessible: false },
        review_preview: { stage: "review_preview", status: "locked", errors: [], warnings: [], isAccessible: false },
    };
};

interface ContractDraftStoreState {
    drafts: ContractDraft[];
    templates: ContractTemplate[];
    currentDraft: ContractDraft | null;
    loading: boolean;
    error: string | null;

    currentStage: ContractCreationStage;
    selectedMode: ContractCreationMode | null;
    selectedTemplate: ContractTemplate | null;
    stageValidations: Record<ContractCreationStage, StageValidation>;
    autoSaveEnabled: boolean;
    lastAutoSave: string | null;
    hasUnsavedChanges: boolean;

    loadDrafts: () => Promise<void>;
    loadTemplates: () => Promise<void>;
    loadDraft: (id: string) => Promise<void>;
    createDraft: (mode: ContractCreationMode, templateId?: string) => Promise<ContractDraft>;
    createFromTemplate: (templateId: string) => Promise<ContractDraft>;
    updateDraft: (id: string, updates: Partial<ContractDraft>) => Promise<void>;
    updateDraftData: (stage: ContractCreationStage, data: Partial<ContractData>) => Promise<void>;
    deleteDraft: (id: string) => Promise<void>;
    duplicateDraft: (id: string) => Promise<ContractDraft>;

    initializeFlow: (mode: ContractCreationMode, templateId?: string) => Promise<void>;
    setSelectedMode: (mode: ContractCreationMode) => void;
    setSelectedTemplate: (template: ContractTemplate | null) => void;
    setDirty: (dirty: boolean) => void;
    navigateToStage: (stage: ContractCreationStage) => Promise<void>;
    updateCurrentDraftStage: (stage: ContractCreationStage) => void;
    validateCurrentStage: () => Promise<boolean>;
    canNavigateToStage: (stage: ContractCreationStage) => boolean;
    getStageValidation: (stage: ContractCreationStage) => StageValidation;
    resetFlow: () => void;
    nextStage: () => Promise<void>;
    previousStage: () => void;

    validateStage: (stage: ContractCreationStage, data: unknown) => Promise<StageValidation>;
    getFieldsForTemplate: (templateId: string) => unknown[];
    generateContractFromTemplate: (templateId: string, data: Partial<ContractData>) => Promise<ContractData>;

    transformToContractData: (draft: ContractDraft) => ContractData;
    updateContractContent: (content: ContractContent) => void;

    clearCurrentDraft: () => void;
    resetCreationFlow: () => void;

    enableAutoSave: () => void;
    disableAutoSave: () => void;
    performAutoSave: () => Promise<void>;
}

export const useContractDraftStore = create<ContractDraftStoreState>()(
    persist(
        (set, get) => ({
            drafts: [],
            templates: [],
            currentDraft: null,
            loading: false,
            error: null,

            currentStage: "template_selection",
            selectedMode: null,
            selectedTemplate: null,
            stageValidations: createInitialStageValidations(),
            autoSaveEnabled: true,
            lastAutoSave: null,
            hasUnsavedChanges: false,

            loadDrafts: async () => {
                set({ loading: true, error: null });
                try {
                    const response = await contractDraftService.getAllDrafts<ContractDraft>();
                    set({ drafts: response.data || [], loading: false });
                } catch (error) {
                    logger.error("Failed to load drafts:", error);
                    set({ error: getErrorMessage(error), loading: false });
                }
            },

            loadTemplates: async () => {
                set({ loading: true, error: null });
                try {
                    const response = await contractTemplateService.getContractTemplates();
                    set({ templates: response.data || [], loading: false });
                } catch (error) {
                    logger.error("Failed to load templates:", error);
                    set({ error: getErrorMessage(error), loading: false });
                }
            },

            loadDraft: async (id: string) => {
                set({ loading: true, error: null });
                try {
                    const response = await contractDraftService.getDraftById<ContractDraft>(id);
                    const draft = response.data;
                    set({
                        currentDraft: draft,
                        currentStage: draft.flow.currentStage,
                        stageValidations: draft.flow.stageValidations,
                        selectedMode: draft.flow.selectedMode,
                        selectedTemplate: draft.flow.selectedTemplate || null,
                        loading: false,
                        hasUnsavedChanges: false,
                    });
                } catch (error) {
                    logger.error("Failed to load draft:", error);
                    set({ error: getErrorMessage(error), loading: false });
                }
            },

            createDraft: async (mode: ContractCreationMode, templateId?: string) => {
                set({ loading: true, error: null });
                try {
                    const template = templateId ? get().templates.find((t) => t.id === templateId) : undefined;
                    const newDraft: ContractDraft = {
                        id: uuidv4(),
                        contractData: {
                            name: "",
                            contractType: "service",
                            milestones: [],
                            tags: [],
                            attachments: [],
                            status: "draft",
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            structure: undefined,
                            ...(mode === "basic"
                                ? { mode: "basic", content: { mode: "basic", templateId, fieldValues: {}, description: "" } }
                                : mode === "editor"
                                  ? { mode: "editor", content: { mode: "editor", editorContent: { content: "", plainText: "", metadata: { wordCount: 0, characterCount: 0, lastEditedAt: new Date().toISOString(), version: 1 } } } }
                                  : { mode: "upload", content: { mode: "upload", uploadedFile: { fileId: "", fileName: "", fileUrl: "", fileSize: 0, mimeType: "", uploadedAt: new Date().toISOString() } } }),
                        },
                        flow: {
                            id: uuidv4(),
                            currentStage: "template_selection",
                            selectedMode: mode,
                            selectedTemplate: template || null,
                            stageValidations: createInitialStageValidations(),
                            canProceedToNext: false,
                            autoSaveEnabled: true,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        },
                        isDraft: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        createdBy: "current-user",
                    };

                    const response = await contractDraftService.createContractDraft<ContractDraft>(newDraft as unknown as Record<string, unknown>);
                    set((state) => ({
                        drafts: [...state.drafts, response.data!],
                        currentDraft: response.data!,
                        currentStage: "template_selection",
                        selectedMode: mode,
                        selectedTemplate: template || null,
                        stageValidations: createInitialStageValidations(),
                        loading: false,
                        hasUnsavedChanges: false,
                    }));
                    return response.data!;
                } catch (error) {
                    logger.error("Failed to create draft:", error);
                    set({ error: getErrorMessage(error), loading: false });
                    throw error;
                }
            },

            createFromTemplate: async (templateId: string) => {
                const template = get().templates.find((t) => t.id === templateId);
                if (!template) throw new Error("Template not found");
                return get().createDraft(template.mode, templateId);
            },

            updateDraft: async (id: string, updates: Partial<ContractDraft>) => {
                set({ loading: true, error: null });
                try {
                    const response = await contractDraftService.updateDraft<ContractDraft>(id, updates as unknown as Record<string, unknown>);
                    set((state) => ({
                        drafts: state.drafts.map((d) => (d.id === id ? response.data! : d)),
                        currentDraft: state.currentDraft?.id === id ? response.data! : state.currentDraft,
                        loading: false,
                        hasUnsavedChanges: false,
                        lastAutoSave: new Date().toISOString(),
                    }));
                } catch (error) {
                    logger.error("Failed to update draft:", error);
                    set({ error: getErrorMessage(error), loading: false });
                }
            },

            updateDraftData: async (stage: ContractCreationStage, data: Partial<ContractData>) => {
                const state = get();
                if (!state.currentDraft) {
                    logger.warn("No current draft to update");
                    return;
                }
                try {
                    const updatedDraft = {
                        ...state.currentDraft,
                        contractData: { ...state.currentDraft.contractData, ...data },
                        updatedAt: new Date().toISOString(),
                    };
                    set({ currentDraft: updatedDraft, hasUnsavedChanges: true });
                } catch (error) {
                    logger.error("Failed to update draft data:", error);
                    set({ error: getErrorMessage(error) });
                    throw error;
                }
            },

            deleteDraft: async (id: string) => {
                set({ loading: true, error: null });
                try {
                    await contractDraftService.deleteDraft(id);
                    set((state) => ({
                        drafts: state.drafts.filter((d) => d.id !== id),
                        currentDraft: state.currentDraft?.id === id ? null : state.currentDraft,
                        loading: false,
                    }));
                } catch (error) {
                    logger.error("Failed to delete draft:", error);
                    set({ error: getErrorMessage(error), loading: false });
                }
            },

            duplicateDraft: async (id: string) => {
                const state = get();
                const draft = state.drafts.find((d) => d.id === id);
                if (!draft) throw new Error("Draft not found");
                const newDraft: ContractDraft = { ...draft, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
                const response = await contractDraftService.createContractDraft<ContractDraft>(newDraft as unknown as Record<string, unknown>);
                set((s) => ({ drafts: [...s.drafts, response.data!] }));
                return response.data!;
            },

            initializeFlow: async (mode: ContractCreationMode, templateId?: string) => {
                const template = templateId ? get().templates.find((t) => t.id === templateId) : null;
                set({ selectedMode: mode, selectedTemplate: template || null, currentStage: "template_selection", stageValidations: createInitialStageValidations(), error: null, hasUnsavedChanges: false });
            },

            setSelectedMode: (mode: ContractCreationMode) => {
                set({ selectedMode: mode });
                logger.info("Selected contract mode", { mode });
            },

            setSelectedTemplate: (template: ContractTemplate | null) => {
                set({ selectedTemplate: template });
                if (template) logger.info("Template selected:", template.name);
            },

            setDirty: (dirty: boolean) => set({ hasUnsavedChanges: dirty }),

            navigateToStage: async (stage: ContractCreationStage) => {
                const state = get();
                if (!state.canNavigateToStage(stage)) {
                    logger.warn(`Cannot navigate to stage ${stage} - not accessible`);
                    return;
                }
                try {
                    set({ currentStage: stage });
                    if (state.currentDraft) state.updateCurrentDraftStage(stage);
                    logger.info(`Navigated to stage ${stage}`);
                } catch (error) {
                    logger.error(`Failed to navigate to stage ${stage}:`, error);
                    set({ error: getErrorMessage(error) });
                }
            },

            updateCurrentDraftStage: (stage: ContractCreationStage) => {
                set((state) => {
                    if (!state.currentDraft) return state;
                    return { currentDraft: { ...state.currentDraft, flow: { ...state.currentDraft.flow, currentStage: stage, updatedAt: new Date().toISOString() }, updatedAt: new Date().toISOString() }, currentStage: stage };
                });
            },

            validateCurrentStage: async () => {
                const { currentStage, currentDraft } = get();
                if (!currentDraft) return false;
                try {
                    const validation = await get().validateStage(currentStage, currentDraft.contractData);
                    set((state) => ({ stageValidations: { ...state.stageValidations, [currentStage]: validation } }));
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
                return stageValidations[stage] || { stage, status: "locked", errors: [], warnings: [], isAccessible: false };
            },

            resetFlow: () => {
                set({ currentStage: "template_selection", selectedMode: null, selectedTemplate: null, currentDraft: null, stageValidations: createInitialStageValidations(), hasUnsavedChanges: false });
            },

            nextStage: async () => {
                const { currentStage, currentDraft, hasUnsavedChanges } = get();
                const stages: ContractCreationStage[] = ["template_selection", "basic_info", "content_draft", "milestones_tasks", "review_preview"];
                const currentIndex = stages.indexOf(currentStage);
                if (currentIndex < stages.length - 1) {
                    const nextStage = stages[currentIndex + 1];
                    if (currentDraft) {
                        try {
                            if (hasUnsavedChanges) {
                                await get().performAutoSave();
                            }
                            await contractService.saveStage(currentDraft.id, currentStage, { data: currentDraft.contractData });
                            await contractService.transitionStage(currentDraft.id, currentStage, nextStage);
                        } catch (err) {
                            logger.error("Failed to save/transition stage", err);
                        }
                    }
                    await get().navigateToStage(nextStage);
                }
            },

            previousStage: () => {
                const { currentStage } = get();
                const stages: ContractCreationStage[] = ["template_selection", "basic_info", "content_draft", "milestones_tasks", "review_preview"];
                const currentIndex = stages.indexOf(currentStage);
                if (currentIndex > 0) {
                    const prevStage = stages[currentIndex - 1];
                    get().navigateToStage(prevStage);
                }
            },

            validateStage: async (stage: ContractCreationStage, data: any): Promise<StageValidation> => {
                return { stage, status: "valid", errors: [], warnings: [], isAccessible: true };
            },

            getFieldsForTemplate: (templateId: string) => {
                const template = get().templates.find((t) => t.id === templateId);
                return template?.fields || [];
            },

            generateContractFromTemplate: async (templateId: string, data: Partial<ContractData>): Promise<ContractData> => {
                return data as ContractData;
            },

            transformToContractData: (draft: ContractDraft): ContractData => {
                return draft.contractData;
            },

            updateContractContent: (content: ContractContent) => {
                set((state) => {
                    if (!state.currentDraft) return state;
                    return { currentDraft: { ...state.currentDraft, contractData: { ...state.currentDraft.contractData, structure: content, updatedAt: new Date().toISOString() }, updatedAt: new Date().toISOString() }, hasUnsavedChanges: true };
                });
            },

            clearCurrentDraft: () => {
                set({ currentDraft: null, currentStage: "template_selection", selectedMode: null, selectedTemplate: null, hasUnsavedChanges: false });
            },
            resetCreationFlow: () => {
                set({ currentStage: "template_selection", selectedMode: null, selectedTemplate: null, stageValidations: createInitialStageValidations(), hasUnsavedChanges: false });
            },

            enableAutoSave: () => set({ autoSaveEnabled: true }),
            disableAutoSave: () => set({ autoSaveEnabled: false }),
            performAutoSave: async () => {
                const { currentDraft, autoSaveEnabled } = get();
                if (!autoSaveEnabled || !currentDraft) return;
                try {
                    await get().updateDraft(currentDraft.id, currentDraft);
                } catch (error) {
                    logger.error("Auto-save failed:", error);
                }
            },
        }),
        { name: "contract-draft-store" },
    ),
);
