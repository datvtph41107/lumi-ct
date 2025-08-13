import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useContractDraftStore } from "~/store/contract-draft-store";
import { useAutoSave } from "./useAutoSave";
import { Logger } from "~/core/Logger";
import type { ContractData, ContractCreationStage, ContractCreationMode } from "~/types/contract/contract.types";

const logger = Logger.getInstance();

export const useContractDraft = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const {
        currentDraft,
        currentStage,
        stageValidations,
        loading,
        error,
        selectedMode,
        selectedTemplate,
        loadDraft,
        createDraft,
        updateDraftData,
        navigateToStage,
        validateCurrentStage,
        canNavigateToStage,
        nextStage,
        previousStage,
        clearCurrentDraft,
        resetFlow,
        getStageValidation,
    } = useContractDraftStore();

    // Get URL parameters
    const draftId = searchParams.get("draftId");
    const urlStage = searchParams.get("stage");
    const contractType = searchParams.get("type");

    // Auto-save functionality
    const { saveNow, isSaving } = useAutoSave(currentDraft?.id || null, currentDraft?.contractData || null, { enabled: !!currentDraft });

    // Stage mapping for URL compatibility
    const stageMap: Record<string, ContractCreationStage> = {
        "0": "template_selection",
        "1": "basic_info",
        "2": "content_draft",
        "3": "milestones_tasks",
        "4": "review_preview",
    };

    const reverseStageMap: Record<ContractCreationStage, string> = {
        template_selection: "0",
        basic_info: "1",
        content_draft: "2",
        milestones_tasks: "3",
        review_preview: "4",
    };

    // Load draft on mount or when draftId changes
    useEffect(() => {
        if (draftId && draftId !== currentDraft?.id) {
            logger.info("Loading draft from URL", { draftId });
            loadDraft(draftId);
        }
    }, [draftId, currentDraft?.id, loadDraft]);

    // Sync URL stage with store stage
    useEffect(() => {
        if (urlStage && currentDraft) {
            const stage = stageMap[urlStage] || "template_selection";
            if (stage !== currentStage && canNavigateToStage(stage)) {
                logger.info("Syncing stage from URL", { urlStage: stage, currentStage });
                navigateToStage(stage);
            }
        }
    }, [urlStage, currentDraft, currentStage, canNavigateToStage, navigateToStage]);

    // Update URL when stage changes
    useEffect(() => {
        if (currentDraft && currentStage) {
            const stageParam = reverseStageMap[currentStage];
            const newParams = new URLSearchParams(searchParams);
            newParams.set("stage", stageParam);
            if (currentDraft.id) {
                newParams.set("draftId", currentDraft.id);
            }
            setSearchParams(newParams, { replace: true });
        }
    }, [currentStage, currentDraft, searchParams, setSearchParams]);

    // Computed values
    const progress = useMemo(() => {
        const stages: ContractCreationStage[] = ["template_selection", "basic_info", "content_draft", "milestones_tasks", "review_preview"];
        const currentIndex = stages.indexOf(currentStage);
        const validStages = stages.filter((stage) => stageValidations[stage]?.status === "valid").length;

        return {
            currentIndex,
            totalStages: stages.length,
            validStages,
            percentage: Math.round((validStages / stages.length) * 100),
        };
    }, [currentStage, stageValidations]);

    const isStageAccessible = useCallback(
        (stage: ContractCreationStage) => {
            return canNavigateToStage(stage);
        },
        [canNavigateToStage],
    );

    const isStageValid = useCallback(
        (stage: ContractCreationStage) => {
            return stageValidations[stage]?.status === "valid";
        },
        [stageValidations],
    );

    const isStageComplete = useCallback(
        (stage: ContractCreationStage) => {
            return stageValidations[stage]?.completedAt != null;
        },
        [stageValidations],
    );

    // Navigation helpers
    const goToStage = useCallback(
        async (stage: ContractCreationStage) => {
            if (canNavigateToStage(stage)) {
                await navigateToStage(stage);
            } else {
                logger.warn(`Cannot navigate to stage ${stage} - not accessible`);
            }
        },
        [canNavigateToStage, navigateToStage],
    );

    const canGoNext = useMemo(() => {
        const stages: ContractCreationStage[] = ["template_selection", "basic_info", "content_draft", "milestones_tasks", "review_preview"];
        const currentIndex = stages.indexOf(currentStage);
        return currentIndex < stages.length - 1 && isStageValid(currentStage);
    }, [currentStage, isStageValid]);

    const canGoPrevious = useMemo(() => {
        const stages: ContractCreationStage[] = ["template_selection", "basic_info", "content_draft", "milestones_tasks", "review_preview"];
        const currentIndex = stages.indexOf(currentStage);
        return currentIndex > 0;
    }, [currentStage]);

    const goNext = useCallback(async () => {
        if (canGoNext) {
            await nextStage();
        }
    }, [canGoNext, nextStage]);

    const goPrevious = useCallback(() => {
        if (canGoPrevious) {
            previousStage();
        }
    }, [canGoPrevious, previousStage]);

    // Draft management
    const createNewDraft = useCallback(
        async (mode: ContractCreationMode, templateId?: string) => {
            try {
                const draft = await createDraft(mode, templateId);
                logger.info("New draft created", { draftId: draft.id, mode });
                return draft;
            } catch (error) {
                logger.error("Failed to create new draft", error);
                throw error;
            }
        },
        [createDraft],
    );

    const updateCurrentDraft = useCallback(
        async (stage: ContractCreationStage, data: Partial<ContractData>) => {
            if (!currentDraft) {
                logger.warn("No current draft to update");
                return;
            }

            try {
                await updateDraftData(stage, data);
                logger.info("Draft updated", { stage, draftId: currentDraft.id });
            } catch (error) {
                logger.error("Failed to update draft", error);
                throw error;
            }
        },
        [currentDraft, updateDraftData],
    );

    const validateAndProceed = useCallback(async () => {
        try {
            const isValid = await validateCurrentStage();
            if (isValid && canGoNext) {
                await goNext();
            }
            return isValid;
        } catch (error) {
            logger.error("Failed to validate and proceed", error);
            return false;
        }
    }, [validateCurrentStage, canGoNext, goNext]);

    // Auto-save wrapper
    const saveCurrentDraft = useCallback(async () => {
        if (currentDraft) {
            await saveNow();
        }
    }, [currentDraft, saveNow]);

    // Reset and cleanup
    const resetDraftFlow = useCallback(() => {
        resetFlow();
        clearCurrentDraft();
        navigate("/contract/create", { replace: true });
    }, [resetFlow, clearCurrentDraft, navigate]);

    // Stage validation helpers
    const getStageErrors = useCallback(
        (stage: ContractCreationStage) => {
            return stageValidations[stage]?.errors || [];
        },
        [stageValidations],
    );

    const getStageWarnings = useCallback(
        (stage: ContractCreationStage) => {
            return stageValidations[stage]?.warnings || [];
        },
        [stageValidations],
    );

    return {
        // Current state
        currentDraft,
        currentStage,
        selectedMode,
        selectedTemplate,
        loading,
        error,
        isSaving,

        // Progress and validation
        progress,
        stageValidations,
        isStageAccessible,
        isStageValid,
        isStageComplete,
        getStageErrors,
        getStageWarnings,
        getStageValidation,

        // Navigation
        goToStage,
        goNext,
        goPrevious,
        canGoNext,
        canGoPrevious,

        // Draft management
        createNewDraft,
        updateCurrentDraft,
        saveCurrentDraft,
        validateAndProceed,

        // Flow control
        resetDraftFlow,

        // URL parameters
        draftId,
        urlStage,
        contractType,
    };
};
