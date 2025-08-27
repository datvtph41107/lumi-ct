import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface NumberedItem {
  id: string;
  type: 'clause' | 'subclause' | 'table' | 'section';
  number: string;
  title: string;
  level: number;
  parentId?: string;
  position: number;
}

export interface CrossReference {
  id: string;
  sourceId: string;
  targetId: string;
  text: string;
  type: 'clause' | 'table' | 'section';
}

interface NumberingStore {
  numberedItems: NumberedItem[];
  crossReferences: CrossReference[];
  addNumberedItem: (item: Omit<NumberedItem, 'number'>) => void;
  updateNumberedItem: (id: string, updates: Partial<NumberedItem>) => void;
  removeNumberedItem: (id: string) => void;
  reorderItems: (itemIds: string[]) => void;
  generateNumbers: () => void;
  addCrossReference: (ref: Omit<CrossReference, 'id'>) => void;
  updateCrossReference: (id: string, updates: Partial<CrossReference>) => void;
  removeCrossReference: (id: string) => void;
  getItemByNumber: (number: string) => NumberedItem | undefined;
  getItemById: (id: string) => NumberedItem | undefined;
  getCrossReferencesByTarget: (targetId: string) => CrossReference[];
  getCrossReferencesBySource: (sourceId: string) => CrossReference[];
}

export const useNumberingStore = create<NumberingStore>()(
  devtools(
    (set, get) => ({
      numberedItems: [],
      crossReferences: [],

      addNumberedItem: (item) => {
        const { numberedItems } = get();
        const newItem: NumberedItem = {
          ...item,
          number: '', // Will be generated
        };
        
        set((state) => ({
          numberedItems: [...state.numberedItems, newItem],
        }));

        // Regenerate numbers after adding
        get().generateNumbers();
      },

      updateNumberedItem: (id, updates) => {
        set((state) => ({
          numberedItems: state.numberedItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));

        // Regenerate numbers if position or level changed
        if (updates.position !== undefined || updates.level !== undefined) {
          get().generateNumbers();
        }
      },

      removeNumberedItem: (id) => {
        set((state) => ({
          numberedItems: state.numberedItems.filter((item) => item.id !== id),
          crossReferences: state.crossReferences.filter(
            (ref) => ref.sourceId !== id && ref.targetId !== id
          ),
        }));

        get().generateNumbers();
      },

      reorderItems: (itemIds) => {
        const { numberedItems } = get();
        const reorderedItems = itemIds.map((id, index) => {
          const item = numberedItems.find((item) => item.id === id);
          return item ? { ...item, position: index } : null;
        }).filter(Boolean) as NumberedItem[];

        set({ numberedItems: reorderedItems });
        get().generateNumbers();
      },

      generateNumbers: () => {
        const { numberedItems } = get();
        const updatedItems = [...numberedItems].sort((a, b) => a.position - b.position);
        
        const numberMap = new Map<string, number>();
        const updatedItemsWithNumbers = updatedItems.map((item) => {
          let number = '';

          if (item.type === 'clause') {
            const clauseNumber = (numberMap.get('clause') || 0) + 1;
            numberMap.set('clause', clauseNumber);
            number = clauseNumber.toString();
          } else if (item.type === 'subclause') {
            const parentNumber = item.parentId ? 
              updatedItems.find(i => i.id === item.parentId)?.number : '';
            const subclauseNumber = (numberMap.get(`subclause_${item.parentId}`) || 0) + 1;
            numberMap.set(`subclause_${item.parentId}`, subclauseNumber);
            number = parentNumber ? `${parentNumber}.${subclauseNumber}` : subclauseNumber.toString();
          } else if (item.type === 'table') {
            const tableNumber = (numberMap.get('table') || 0) + 1;
            numberMap.set('table', tableNumber);
            number = `Bảng ${tableNumber}`;
          } else if (item.type === 'section') {
            const sectionNumber = (numberMap.get('section') || 0) + 1;
            numberMap.set('section', sectionNumber);
            number = `Phần ${sectionNumber}`;
          }

          return { ...item, number };
        });

        set({ numberedItems: updatedItemsWithNumbers });
      },

      addCrossReference: (ref) => {
        const id = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newRef: CrossReference = { ...ref, id };
        
        set((state) => ({
          crossReferences: [...state.crossReferences, newRef],
        }));
      },

      updateCrossReference: (id, updates) => {
        set((state) => ({
          crossReferences: state.crossReferences.map((ref) =>
            ref.id === id ? { ...ref, ...updates } : ref
          ),
        }));
      },

      removeCrossReference: (id) => {
        set((state) => ({
          crossReferences: state.crossReferences.filter((ref) => ref.id !== id),
        }));
      },

      getItemByNumber: (number) => {
        const { numberedItems } = get();
        return numberedItems.find((item) => item.number === number);
      },

      getItemById: (id) => {
        const { numberedItems } = get();
        return numberedItems.find((item) => item.id === id);
      },

      getCrossReferencesByTarget: (targetId) => {
        const { crossReferences } = get();
        return crossReferences.filter((ref) => ref.targetId === targetId);
      },

      getCrossReferencesBySource: (sourceId) => {
        const { crossReferences } = get();
        return crossReferences.filter((ref) => ref.sourceId === sourceId);
      },
    }),
    {
      name: 'numbering-store',
    }
  )
);