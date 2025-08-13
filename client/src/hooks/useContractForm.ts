import { useState, useEffect, useCallback } from "react";
import { useContractDraftStore } from "~/store/contract-draft-store";
import { type ContractFormData, type Milestone } from "~/types/contract/contract.types";
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
    const [formData, setFormData] = useState<ContractFormData | null>(null);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [milestoneValidationErrors, setMilestoneValidationErrors] = useState<MilestoneValidationErrors>({});

    useEffect(() => {
        if (currentDraft) {
            setFormData(currentDraft.formData);
            setMilestones(currentDraft.formData.milestones || []);
        }
    }, [currentDraft]);

    const updateFormData = useCallback(
        (updates: Partial<ContractFormData>) => {
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

    const addMilestone = useCallback((newMilestone: Milestone) => {
        setMilestones((prev) => [...prev, newMilestone]);
    }, []);

    const updateMilestone = useCallback((id: string, updates: Partial<Milestone>) => {
        setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m)));
    }, []);

    const deleteMilestone = useCallback((id: string) => {
        setMilestones((prev) => prev.filter((m) => m.id !== id));
    }, []);

    const validateCurrentStep = useCallback((): boolean => {
        if (!formData) return false;

        let isValid = true;
        const newErrors: MilestoneValidationErrors = {};

        // Example validation for milestones stage (Stage 1)
        if (currentDraft?.currentStage === 1) {
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
                    if (!m.dueDate) {
                        milestoneErrors.dueDate = "Due date is required.";
                        isValid = false;
                    }
                    if (m.tasks.length === 0) {
                        milestoneErrors.tasks = "At least one task is required for this milestone.";
                        isValid = false;
                    } else {
                        m.tasks.forEach((task) => {
                            if (!task.name.trim() || !task.assignee.trim()) {
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
    }, [formData, currentDraft?.currentStage, milestones]);

    const getMilestoneValidationErrors = useCallback(() => milestoneValidationErrors, [milestoneValidationErrors]);

    const getMilestoneStats = useCallback(() => {
        const totalMilestones = milestones.length;
        const completedMilestones = milestones.filter((m) => m.status === "completed").length;
        const totalTasks = milestones.reduce((acc, m) => acc + (m.tasks?.length || 0), 0);
        const completedTasks = milestones.reduce((acc, m) => acc + (m.tasks?.filter((t) => t.completed).length || 0), 0);

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
