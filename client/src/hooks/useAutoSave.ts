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

    const { updateDraft, performAutoSave, hasUnsavedChanges, setDirty } = useContractDraftStore();

    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saveCount, setSaveCount] = useState(0);
    const [dirty, setLocalDirty] = useState(false);

    const isMountedRef = useRef(true);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Manual save (Ctrl+S / Cmd+S or save button)
    const saveNow = useCallback(async (): Promise<void> => {
        if (!draftId || !formData || !enabled) return;
        try {
            await performAutoSave();
            const now = new Date();
            setLastSaved(now);
            setSaveCount((prev) => prev + 1);
            setLocalDirty(false);
            setDirty(false);
            onSave?.(true);
            logger.debug("Manual save successful", { draftId, saveCount: saveCount + 1 });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Save failed";
            setError(errorMessage);
            onSave?.(false, errorMessage);
            onError?.(errorMessage);
            logger.error("Manual save failed", { draftId, error: errorMessage });
        }
    }, [draftId, formData, enabled, performAutoSave, onSave, onError, saveCount, setDirty]);

    // Before unload prompt if dirty
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (dirty || hasUnsavedChanges) {
                const message = "Bạn có dữ liệu chưa lưu. Bạn có chắc chắn muốn rời trang?";
                event.returnValue = message;
                return message;
            }
            return undefined;
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [dirty, hasUnsavedChanges]);

    // Keyboard shortcut: Ctrl+S / Cmd+S
    useEffect(() => {
        const onKeyDown = async (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
            const isSave = (isMac && e.metaKey && e.key.toLowerCase() === "s") || (!isMac && e.ctrlKey && e.key.toLowerCase() === "s");
            if (isSave) {
                e.preventDefault();
                await saveNow();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [saveNow]);

    return { isSaving: false, lastSaved, saveNow, error, saveCount, setDirty: (d) => { setLocalDirty(d); setDirty(d); }, dirty };
};
