import { create } from "zustand";
import type { Editor } from "@tiptap/react";

interface EditorStore {
    editor: Editor | null;
    isToolbarVisible: boolean;
    isInteractingWithToolbar: boolean;
    autoToggleEnabled: boolean;
    interactionTimeoutId: NodeJS.Timeout | null;
    manualToggleOnly: boolean;
    setManualToggleOnly: (value: boolean) => void;
    setEditor: (editor: Editor | null) => void;
    setToolbarVisible: (visible: boolean) => void;
    setInteractingWithToolbar: (interacting: boolean) => void;
    setAutoToggleEnabled: (enabled: boolean) => void;
    setInteractionTimeoutId: (id: NodeJS.Timeout | null) => void;
    clearInteractionTimeout: () => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
    editor: null,
    isToolbarVisible: false,
    autoToggleEnabled: true,
    isInteractingWithToolbar: false,
    interactionTimeoutId: null,
    manualToggleOnly: false,
    setManualToggleOnly: (value) => set({ manualToggleOnly: value }),
    setEditor: (editor) => set({ editor }),
    setToolbarVisible: (visible) => set({ isToolbarVisible: visible }),
    setInteractingWithToolbar: (interacting) => {
        const state = get();
        // Clear existing timeout when setting interaction state
        if (state.interactionTimeoutId) {
            clearTimeout(state.interactionTimeoutId);
            set({ interactionTimeoutId: null });
        }
        set({ isInteractingWithToolbar: interacting });
    },
    setAutoToggleEnabled: (enabled) => set({ autoToggleEnabled: enabled }),
    setInteractionTimeoutId: (id) => set({ interactionTimeoutId: id }),
    clearInteractionTimeout: () => {
        const state = get();
        if (state.interactionTimeoutId) {
            clearTimeout(state.interactionTimeoutId);
            set({ interactionTimeoutId: null });
        }
    },
}));
