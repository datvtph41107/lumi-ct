import { useState, useEffect, useCallback } from "react";
import { useContractDraftStore } from "~/store/contract-draft-store";
import { type ContractFormData, type Milestone } from "~/types/contract/contract.types";
import { Logger } from "~/core/Logger";

interface MilestoneValidationErrors {
    [milestoneId: string]: {
        name?: string;
        dateRange?: string;
        tasks?: string;
    };
}

const logger = Logger.getInstance();

export const useContractForm = () => {
    const { currentDraft, updateDraftData, loading, error } = useContractDraftStore();
    const [formData, setFormData] = useState<ContractFormData | null>(null);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [milestoneValidationErrors, setMilestoneValidationErrors] = useState<MilestoneValidationErrors>({});

    useEffect(() => {
        if (currentDraft) {
            setFormData(currentDraft.contractData as ContractFormData);
            setMilestones((currentDraft.contractData as ContractFormData).milestones || []);
        }
    }, [currentDraft]);

    const updateFormData = useCallback(
        (updates: Partial<ContractFormData>) => {
            setFormData((prev) => {
                if (!prev) return null;
                const newFormData = { ...prev, ...updates } as ContractFormData;
                if (updates.milestones === undefined) {
                    newFormData.milestones = milestones;
                }
                return newFormData;
            });
        },
        [milestones],
    );

    const addMilestone = useCallback((newMilestone: Milestone) => {
        setMilestones((prev) => {
            const updated = [...prev, newMilestone];
            updateDraftData("milestones_tasks", { milestones: updated } as Partial<ContractFormData>);
            return updated;
        });
    }, [updateDraftData]);

    const updateMilestone = useCallback((id: string, updates: Partial<Milestone>) => {
        setMilestones((prev) => {
            const updated = prev.map((m) => (m.id === id ? { ...m, ...updates } : m));
            updateDraftData("milestones_tasks", { milestones: updated } as Partial<ContractFormData>);
            return updated;
        });
    }, [updateDraftData]);

    const deleteMilestone = useCallback((id: string) => {
        setMilestones((prev) => {
            const updated = prev.filter((m) => m.id !== id);
            updateDraftData("milestones_tasks", { milestones: updated } as Partial<ContractFormData>);
            return updated;
        });
    }, [updateDraftData]);

    const validateCurrentStep = useCallback((): boolean => {
        if (!formData) return false;

        let isValid = true;
        const newErrors: MilestoneValidationErrors = {};

        // Validate Milestones stage shape
        if ((currentDraft?.flow.currentStage || "") === "milestones_tasks") {
            if (milestones.length === 0) {
                isValid = false;
            } else {
                milestones.forEach((m) => {
                    const milestoneErrors: { [key: string]: string } = {};
                    if (!m.name?.trim()) {
                        milestoneErrors.name = "Tên mốc thời gian là bắt buộc";
                        isValid = false;
                    }
                    if (!m.dateRange?.startDate || !m.dateRange?.endDate) {
                        milestoneErrors.dateRange = "Phải chọn khoảng thời gian";
                        isValid = false;
                    }
                    if (!m.tasks || m.tasks.length === 0) {
                        milestoneErrors.tasks = "Cần ít nhất 1 công việc";
                        isValid = false;
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
        const completedMilestones = milestones.filter((m) => (m as any).status === "completed").length;
        const totalTasks = milestones.reduce((acc, m) => acc + (m.tasks?.length || 0), 0);
        const completedTasks = milestones.reduce(
            (acc, m) => acc + (m.tasks?.filter((t: any) => t.completed).length || 0),
            0,
        );

        return {
            totalMilestones,
            completedMilestones,
            totalTasks,
            completedTasks,
        };
    }, [milestones]);

    // Sync milestones to current draft when local changes
    useEffect(() => {
        if (currentDraft && formData) {
            updateDraftData("milestones_tasks", { milestones } as Partial<ContractFormData>);
        }
    }, [milestones, formData, currentDraft, updateDraftData]);

    return {
        formData,
        milestones,
        setMilestones: (updated: Milestone[]) => {
            setMilestones(updated);
            updateDraftData("milestones_tasks", { milestones: updated } as Partial<ContractFormData>);
        },
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
