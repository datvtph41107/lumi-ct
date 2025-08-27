import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type UIMode = 'edit' | 'fill' | 'preview';

interface UIModeStore {
  mode: UIMode;
  setMode: (mode: UIMode) => void;
  isEditMode: () => boolean;
  isFillMode: () => boolean;
  isPreviewMode: () => boolean;
}

export const useUIModeStore = create<UIModeStore>()(
  devtools(
    (set, get) => ({
      mode: 'edit',

      setMode: (mode) => {
        set({ mode });
      },

      isEditMode: () => {
        return get().mode === 'edit';
      },

      isFillMode: () => {
        return get().mode === 'fill';
      },

      isPreviewMode: () => {
        return get().mode === 'preview';
      },
    }),
    {
      name: 'ui-mode-store',
    }
  )
);