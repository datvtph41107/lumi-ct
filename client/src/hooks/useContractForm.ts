import { useState, useEffect, useCallback } from "react";
import { useContractDraftStore } from "~/store/contract-draft-store";
import { type ContractData, type ContractMilestone } from "~/types/contract/contract.types";
import { Logger } from "~/core/Logger";

interface MilestoneValidationErrors {
    [milestoneId: string]: {
        name?: string;
        dueDate?: string;
        tasks?: string;
    };
}

const logger = Logger.getInstance();

export const useContractForm = () => {
    const { currentDraft, updateDraft, loading, error } = useContractDraftStore();
    const [formData, setFormData] = useState<ContractData | null>(null);
    const [milestones, setMilestones] = useState<ContractMilestone[]>([]);
    const [milestoneValidationErrors, setMilestoneValidationErrors] = useState<MilestoneValidationErrors>({});

    useEffect(() => {
        if (currentDraft) {
            setFormData(currentDraft.contractData);
            setMilestones(currentDraft.contractData.milestones || []);
        }
    }, [currentDraft]);

    const updateFormData = useCallback(
        (updates: Partial<ContractData>) => {
            setFormData((prev) => {
                if (!prev) return null;
                const newFormData = { ...prev, ...updates };
                // Ensure milestones are always updated from the dedicated state
                if (updates.milestones === undefined) {
                    // Only update if not explicitly passed
                    newFormData.milestones = milestones;
                }
                return newFormData;
            });
        },
        [milestones],
    );

    const addMilestone = useCallback((newMilestone: ContractMilestone) => {
        setMilestones((prev) => [...prev, newMilestone]);
    }, []);

    const updateMilestone = useCallback((id: string, updates: Partial<ContractMilestone>) => {
        setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    }, []);

    const deleteMilestone = useCallback((id: string) => {
        setMilestones((prev) => prev.filter((m) => m.id !== id));
    }, []);

    const validateCurrentStep = useCallback((): boolean => {
        if (!formData) return false;

        let isValid = true;
        const newErrors: MilestoneValidationErrors = {};

        // Example validation for milestones stage (Stage 1)
        if (currentDraft?.flow.currentStage === "milestones_tasks") {
            if (milestones.length === 0) {
                isValid = false;
                // This error might be handled by an alert in StageMilestones, not per-milestone
            } else {
                milestones.forEach((m) => {
                    const milestoneErrors: { [key: string]: string } = {};
                    if (!m.name.trim()) {
                        milestoneErrors.name = "Milestone name is required.";
                        isValid = false;
                    }
                    if (!m.dateRange?.startDate || !m.dateRange?.endDate) {
                        milestoneErrors.dueDate = "Date range is required.";
                        isValid = false;
                    }
                    if (!m.tasks || m.tasks.length === 0) {
                        milestoneErrors.tasks = "At least one task is required for this milestone.";
                        isValid = false;
                    } else {
                        m.tasks.forEach((task) => {
                            const hasName = typeof task.name === "string" && task.name.trim().length > 0;
                            const hasAssignee = typeof task.assigneeId === "string" && task.assigneeId.trim().length > 0;
                            if (!hasName || !hasAssignee) {
                                milestoneErrors.tasks = "All tasks must have a name and assignee.";
                                isValid = false;
                            }
                        });
                    }

                    if (Object.keys(milestoneErrors).length > 0) {
                        newErrors[m.id] = milestoneErrors;
                    }
                });
            }
        }

        setMilestoneValidationErrors(newErrors);
        return isValid;
    }, [formData, currentDraft?.flow.currentStage, milestones]);

    const getMilestoneValidationErrors = useCallback(() => milestoneValidationErrors, [milestoneValidationErrors]);

    const getMilestoneStats = useCallback(() => {
        const totalMilestones = milestones.length;
        const completedMilestones = 0; // placeholder until status is implemented in ContractMilestone
        const totalTasks = milestones.reduce((acc, m) => acc + (m.tasks?.length || 0), 0);
        const completedTasks = 0; // placeholder until task status is implemented

        return {
            totalMilestones,
            completedMilestones,
            totalTasks,
            completedTasks,
        };
    }, [milestones]);

    // Effect to sync milestones from local state to formData when milestones change
    useEffect(() => {
        if (formData && JSON.stringify(formData.milestones) !== JSON.stringify(milestones)) {
            updateFormData({ milestones });
        }
    }, [milestones, formData, updateFormData]);

    return {
        formData,
        milestones,
        setMilestones, // Allow StageMilestones to directly set milestones
        updateFormData,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        validateCurrentStep,
        getMilestoneValidationErrors,
        getMilestoneStats,
        loading,
        error,
    };
};
