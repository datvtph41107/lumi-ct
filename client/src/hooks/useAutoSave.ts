import { useEffect, useCallback, useRef, useState } from "react";
import { useContractDraftStore } from "~/store/contract-draft-store";
import type { ContractFormData } from "~/types/contract/contract.types";
import { Logger } from "~/core/Logger";

const logger = Logger.getInstance();

interface UseAutoSaveOptions {
    enabled?: boolean;
    onSave?: (success: boolean, error?: string) => void;
    onError?: (error: string) => void;
}

interface UseAutoSaveReturn {
    isSaving: boolean;
    lastSaved: Date | null;
    saveNow: () => Promise<void>;
    error: string | null;
    saveCount: number;
    setDirty: (dirty: boolean) => void;
    dirty: boolean;
}

export const useAutoSave = (
    draftId: string | null,
    formData: ContractFormData | null,
    options: UseAutoSaveOptions = {},
): UseAutoSaveReturn => {
    const { enabled = true, onSave, onError } = options;

    const { updateDraft, isAutoSaving, setAutoSaving, setLastAutoSave, setAutoSaveError } = useContractDraftStore();

    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saveCount, setSaveCount] = useState(0);
    const [dirty, setDirty] = useState(false);

    const isMountedRef = useRef(true);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Hàm lưu thủ công
    const saveNow = useCallback(async (): Promise<void> => {
        if (!draftId || !formData || !enabled) {
            return;
        }

        if (!dirty) {
            // Nếu không có thay đổi thì không cần lưu
            return;
        }

        try {
            setAutoSaving(true);
            setError(null);
            setAutoSaveError(null);

            const updates = {
                formData: {
                    ...formData,
                    updatedAt: new Date().toISOString(),
                },
                lastAutoSave: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await updateDraft(draftId, updates);

            if (isMountedRef.current) {
                const now = new Date();
                setLastSaved(now);
                setLastAutoSave(now.toISOString());
                setSaveCount((prev) => prev + 1);
                setDirty(false);

                onSave?.(true);
                logger.debug("Save successful", { draftId, saveCount: saveCount + 1 });
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Save failed";

            if (isMountedRef.current) {
                setError(errorMessage);
                setAutoSaveError(errorMessage);
                onSave?.(false, errorMessage);
                onError?.(errorMessage);
                logger.error("Save failed", { draftId, error: errorMessage });
            }
        } finally {
            if (isMountedRef.current) {
                setAutoSaving(false);
            }
        }
    }, [draftId, formData, enabled, updateDraft, setAutoSaving, setLastAutoSave, setAutoSaveError, onSave, onError, saveCount, dirty]);

    // Hiển thị cảnh báo khi đóng tab/refresh nếu còn dữ liệu chưa lưu
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (dirty) {
                const message = "Bạn có dữ liệu chưa lưu. Bạn có chắc chắn muốn rời trang?";
                event.returnValue = message; // Chuẩn cho một số trình duyệt
                return message;
            }
            return undefined;
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [dirty]);

    return {
        isSaving: isAutoSaving,
        lastSaved,
        saveNow,
        error,
        saveCount,
        setDirty,
        dirty,
    };
};
