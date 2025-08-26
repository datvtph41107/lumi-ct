import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface ContractElement {
    id: string;
    type: string;
    content: string;
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    style: {
        fontSize: number;
        fontWeight: string;
        textAlign: string;
        fontFamily: string;
        lineHeight: number;
        color: string;
        backgroundColor?: string;
        padding?: number;
        margin?: number;
    };
    properties: {
        placeholder?: string;
        required?: boolean;
        validation?: string;
        errorMessage?: string;
    };
    isSelected: boolean;
    order: number;
}

export interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    status: 'draft' | 'published' | 'archived';
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    version: string;
    elements: ContractElement[];
    isDefault?: boolean;
}

interface ContractStore {
    // Current contract state
    elements: ContractElement[];
    selectedElementId: string | null;
    isDragging: boolean;
    draggedElementType: string | null;

    // Template management
    templates: Template[];
    currentTemplate: Template | null;

    // UI state
    activeTab: 'components' | 'layout' | 'properties';
    isPreviewMode: boolean;
    zoom: number;

    // Actions
    addElement: (element: Omit<ContractElement, 'id' | 'order'>) => void;
    updateElement: (id: string, updates: Partial<ContractElement>) => void;
    deleteElement: (id: string) => void;
    selectElement: (id: string | null) => void;
    reorderElements: (startIndex: number, endIndex: number) => void;
    duplicateElement: (id: string) => void;

    // Drag and drop
    setDragging: (isDragging: boolean, elementType?: string) => void;

    // Template actions
    loadTemplate: (template: Template) => void;
    saveTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => void;
    deleteTemplate: (id: string) => void;

    // UI actions
    setActiveTab: (tab: 'components' | 'layout' | 'properties') => void;
    setPreviewMode: (isPreview: boolean) => void;
    setZoom: (zoom: number) => void;

    // Utility actions
    clearContract: () => void;
    exportContract: () => string;
}

export const useContractStore = create<ContractStore>()(
    devtools(
        (set, get) => ({
            // Initial state
            elements: [],
            selectedElementId: null,
            isDragging: false,
            draggedElementType: null,
            templates: [],
            currentTemplate: null,
            activeTab: 'components',
            isPreviewMode: false,
            zoom: 100,

            // Element actions
            addElement: (elementData) => {
                const newElement: ContractElement = {
                    ...elementData,
                    id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    order: get().elements.length,
                    isSelected: false,
                };

                set((state) => ({
                    elements: [...state.elements, newElement],
                    selectedElementId: newElement.id,
                }));
            },

            updateElement: (id, updates) => {
                set((state) => ({
                    elements: state.elements.map((element) =>
                        element.id === id ? { ...element, ...updates } : element,
                    ),
                }));
            },

            deleteElement: (id) => {
                set((state) => ({
                    elements: state.elements.filter((element) => element.id !== id),
                    selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
                }));
            },

            selectElement: (id) => {
                set((state) => ({
                    selectedElementId: id,
                    elements: state.elements.map((element) => ({
                        ...element,
                        isSelected: element.id === id,
                    })),
                }));
            },

            reorderElements: (startIndex, endIndex) => {
                set((state) => {
                    const newElements = [...state.elements];
                    const [reorderedItem] = newElements.splice(startIndex, 1);
                    newElements.splice(endIndex, 0, reorderedItem);

                    // Update order property
                    return {
                        elements: newElements.map((element, index) => ({
                            ...element,
                            order: index,
                        })),
                    };
                });
            },

            duplicateElement: (id) => {
                const element = get().elements.find((el) => el.id === id);
                if (element) {
                    const duplicatedElement: ContractElement = {
                        ...element,
                        id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        position: {
                            x: element.position.x + 20,
                            y: element.position.y + 20,
                        },
                        order: get().elements.length,
                        isSelected: false,
                    };

                    set((state) => ({
                        elements: [...state.elements, duplicatedElement],
                    }));
                }
            },

            // Drag and drop
            setDragging: (isDragging, elementType) => {
                set({ isDragging, draggedElementType: elementType || null });
            },

            // Template actions
            loadTemplate: (template) => {
                set({
                    currentTemplate: template,
                    elements: template.elements.map((element) => ({
                        ...element,
                        isSelected: false,
                    })),
                    selectedElementId: null,
                });
            },

            saveTemplate: (templateData) => {
                const newTemplate: Template = {
                    ...templateData,
                    id: `template-${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    elements: get().elements,
                };

                set((state) => ({
                    templates: [...state.templates, newTemplate],
                    currentTemplate: newTemplate,
                }));
            },

            deleteTemplate: (id) => {
                set((state) => ({
                    templates: state.templates.filter((template) => template.id !== id),
                    currentTemplate: state.currentTemplate?.id === id ? null : state.currentTemplate,
                }));
            },

            // UI actions
            setActiveTab: (tab) => set({ activeTab: tab }),
            setPreviewMode: (isPreview) => set({ isPreviewMode: isPreview }),
            setZoom: (zoom) => set({ zoom }),

            // Utility actions
            clearContract: () => {
                set({
                    elements: [],
                    selectedElementId: null,
                    currentTemplate: null,
                });
            },

            exportContract: () => {
                const { elements } = get();
                const sortedElements = [...elements].sort((a, b) => a.order - b.order);
                return sortedElements.map((element) => element.content).join('\n');
            },
        }),
        {
            name: 'contract-store',
        },
    ),
);
