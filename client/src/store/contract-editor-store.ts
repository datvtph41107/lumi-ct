import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ContractBlock {
    id: string;
    type: string;
    title: string;
    description: string;
    category: string;
    icon: string;
    required: boolean;
    isActive: boolean;
    order: number;
    template: string;
}

export interface EditorPage {
    id: string;
    name: string;
    content: string;
    blocks: ContractBlock[];
    isActive: boolean;
    isHidden: boolean;
    createdAt: Date;
    updatedAt: Date;
    wordCount: number;
    order: number;
}

interface ContractEditorState {
    // Quản lý trang
    pages: EditorPage[];
    activePageId: string;

    // Quản lý khối
    availableBlocks: ContractBlock[];

    // Trạng thái UI
    isFullscreen: boolean;
    viewMode: "edit" | "preview" | "code";
    sidebarCollapsed: boolean;

    // Cài đặt trình chỉnh sửa
    editorWidth: number;
    editorScale: number;
    showRuler: boolean;
    showPageBreaks: boolean;

    // Tự động lưu
    lastSaved: Date | null;
    hasUnsavedChanges: boolean;

    // Kéo và thả
    draggedBlock: ContractBlock | null;
    isDragging: boolean;

    // Hành động
    initializeEditor: () => void;
    addPage: (afterPageId?: string) => void;
    duplicatePage: (pageId: string) => void;
    deletePage: (pageId: string) => void;
    setActivePage: (pageId: string) => void;
    updatePageContent: (pageId: string, content: string) => void;
    reorderPages: (pageIds: string[]) => void;
    togglePageVisibility: (pageId: string) => void;
    movePageOrder: (fromIndex: number, toIndex: number) => void;

    // Hành động khối
    insertBlock: (blockType: string, position?: number) => void;
    updateBlock: (blockId: string, updates: Partial<ContractBlock>) => void;
    removeBlock: (blockId: string) => void;
    reorderBlocks: (blockIds: string[]) => void;
    insertBlockAtPosition: (blockType: string, position: number) => void;

    // Hành động UI
    toggleFullscreen: () => void;
    setViewMode: (mode: "edit" | "preview" | "code") => void;
    toggleSidebar: () => void;
    setEditorWidth: (width: number) => void;
    setEditorScale: (scale: number) => void;

    // Hành động tiện ích
    saveContent: () => void;
    resetEditor: () => void;

    // Hành động kéo và thả
    setDraggedBlock: (block: ContractBlock | null) => void;
    setIsDragging: (isDragging: boolean) => void;
}

const DEFAULT_CONTRACT_BLOCKS: ContractBlock[] = [
    {
        id: "intro",
        type: "introductory",
        title: "Phần Giới Thiệu",
        description: "Giới thiệu hợp đồng và các bên tham gia",
        category: "header",
        icon: "FileText",
        required: true,
        isActive: true,
        order: 1,
        template: `<div class="contract-section">
            <h2>Phần Giới Thiệu</h2>
            <p>Hợp đồng này được ký kết giữa các bên...</p>
        </div>`,
    },
    {
        id: "scope",
        type: "scope-of-work",
        title: "Phạm Vi Công Việc",
        description: "Xác định công việc cần thực hiện",
        category: "content",
        icon: "Users",
        required: true,
        isActive: true,
        order: 2,
        template: `<div class="contract-section">
            <h2>Phạm Vi Công Việc</h2>
            <p>Nhà thầu sẽ cung cấp các dịch vụ sau:</p>
            <ul>
                <li>Dịch vụ 1</li>
                <li>Dịch vụ 2</li>
            </ul>
        </div>`,
    },
    {
        id: "payment",
        type: "payment-terms",
        title: "Điều Khoản Thanh Toán",
        description: "Xác định giá cả, lịch thanh toán và phương thức",
        category: "content",
        icon: "DollarSign",
        required: true,
        isActive: true,
        order: 3,
        template: `<div class="contract-section">
            <h2>Điều Khoản Thanh Toán</h2>
            <p>Lịch trình và điều khoản thanh toán...</p>
        </div>`,
    },
    {
        id: "legal",
        type: "legal-terms",
        title: "Điều Khoản Pháp Lý",
        description: "Nghĩa vụ pháp lý, sở hữu trí tuệ và điều khoản bảo mật",
        category: "legal",
        icon: "Scale",
        required: false,
        isActive: true,
        order: 4,
        template: `<div class="contract-section">
            <h2>Điều Khoản Pháp Lý</h2>
            <p>Nghĩa vụ pháp lý và điều khoản...</p>
        </div>`,
    },
    {
        id: "termination",
        type: "termination",
        title: "Chấm Dứt Hợp Đồng",
        description: "Điều kiện và thủ tục chấm dứt hợp đồng",
        category: "legal",
        icon: "StopCircle",
        required: false,
        isActive: true,
        order: 5,
        template: `<div class="contract-section">
            <h2>Chấm Dứt Hợp Đồng</h2>
            <p>Hợp đồng này có thể được chấm dứt trong các điều kiện sau...</p>
        </div>`,
    },
    {
        id: "signature",
        type: "signature",
        title: "Chữ Ký",
        description: "Phần chữ ký cho tất cả các bên",
        category: "signature",
        icon: "PenTool",
        required: true,
        isActive: true,
        order: 6,
        template: `<div class="contract-section">
            <h2>Chữ Ký</h2>
            <div class="signature-block">
                <p><strong>Bên A:</strong> ___________________________ Ngày: ___________</p>
                <p><strong>Bên B:</strong> ___________________________ Ngày: ___________</p>
            </div>
        </div>`,
    },
];

const createInitialPage = (order = 1): EditorPage => {
    const pageId = `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
        id: pageId,
        name: `Trang ${order}`,
        content: `<h1>Hợp Đồng Dịch Vụ Thiết Kế</h1>
        <p>Hợp đồng Dịch vụ Thiết kế này ("Hợp đồng") được lập và ký kết vào ngày ${new Date().toLocaleDateString(
            "vi-VN",
        )} giữa <strong>Bên A</strong> ("Khách hàng") và <strong>Bên B</strong> ("Nhà thầu").</p>`,
        blocks: [],
        isActive: order === 1,
        isHidden: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        wordCount: 0,
        order,
    };
};

export const useContractEditorStore = create<ContractEditorState>()(
    persist(
        (set, get) => {
            const initialPage = createInitialPage();

            return {
                pages: [initialPage],
                activePageId: initialPage.id,
                availableBlocks: DEFAULT_CONTRACT_BLOCKS,
                isFullscreen: false,
                viewMode: "edit",
                sidebarCollapsed: false,
                editorWidth: 816,
                editorScale: 1,
                showRuler: true,
                showPageBreaks: true,
                lastSaved: null,
                hasUnsavedChanges: false,

                draggedBlock: null,
                isDragging: false,

                initializeEditor: () => {
                    const state = get();
                    if (!state.activePageId && state.pages.length > 0) {
                        const firstPage = state.pages[0];
                        set({
                            activePageId: firstPage.id,
                            pages: state.pages.map((page) => ({
                                ...page,
                                isActive: page.id === firstPage.id,
                            })),
                        });
                    }
                },

                addPage: (afterPageId) => {
                    const state = get();
                    const afterIndex = afterPageId ? state.pages.findIndex((p) => p.id === afterPageId) : state.pages.length - 1;
                    const newOrder = afterIndex + 2;
                    const newPage = createInitialPage(newOrder);

                    const updatedPages = state.pages.map((page) => (page.order >= newOrder ? { ...page, order: page.order + 1 } : page));

                    const newPages = [...updatedPages];
                    newPages.splice(afterIndex + 1, 0, newPage);

                    set({
                        pages: newPages,
                        activePageId: newPage.id,
                        hasUnsavedChanges: true,
                    });
                },

                duplicatePage: (pageId) => {
                    const state = get();
                    const pageToDuplicate = state.pages.find((p) => p.id === pageId);
                    if (!pageToDuplicate) return;

                    const duplicatedPage: EditorPage = {
                        ...pageToDuplicate,
                        id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        name: `${pageToDuplicate.name} (Bản sao)`,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        order: pageToDuplicate.order + 1,
                        isActive: false,
                    };

                    const updatedPages = state.pages.map((page) =>
                        page.order > pageToDuplicate.order ? { ...page, order: page.order + 1 } : page,
                    );

                    const pageIndex = updatedPages.findIndex((p) => p.id === pageId);
                    updatedPages.splice(pageIndex + 1, 0, duplicatedPage);

                    set({
                        pages: updatedPages,
                        activePageId: duplicatedPage.id,
                        hasUnsavedChanges: true,
                    });
                },

                deletePage: (pageId) => {
                    const state = get();
                    if (state.pages.length <= 1) return;

                    const pageToDelete = state.pages.find((p) => p.id === pageId);
                    if (!pageToDelete) return;

                    const updatedPages = state.pages
                        .filter((p) => p.id !== pageId)
                        .map((page) => (page.order > pageToDelete.order ? { ...page, order: page.order - 1 } : page));

                    let newActivePageId = state.activePageId;
                    if (state.activePageId === pageId) {
                        const nextPage = updatedPages.find((p) => p.order >= pageToDelete.order) || updatedPages[updatedPages.length - 1];
                        newActivePageId = nextPage.id;
                    }

                    set({
                        pages: updatedPages,
                        activePageId: newActivePageId,
                        hasUnsavedChanges: true,
                    });
                },

                setActivePage: (pageId) => {
                    const state = get();
                    const updatedPages = state.pages.map((page) => ({
                        ...page,
                        isActive: page.id === pageId,
                    }));

                    set({
                        pages: updatedPages,
                        activePageId: pageId,
                    });
                },

                updatePageContent: (pageId, content) => {
                    const state = get();
                    const wordCount = content
                        .replace(/<[^>]*>/g, "")
                        .split(/\s+/)
                        .filter((word) => word.length > 0).length;

                    const updatedPages = state.pages.map((page) =>
                        page.id === pageId
                            ? {
                                  ...page,
                                  content,
                                  wordCount,
                                  updatedAt: new Date(),
                              }
                            : page,
                    );

                    set({
                        pages: updatedPages,
                        hasUnsavedChanges: true,
                    });
                },

                reorderPages: (pageIds) => {
                    const state = get();
                    const reorderedPages = pageIds.map((id, index) => {
                        const page = state.pages.find((p) => p.id === id)!;
                        return { ...page, order: index + 1 };
                    });

                    set({
                        pages: reorderedPages,
                        hasUnsavedChanges: true,
                    });
                },

                togglePageVisibility: (pageId) => {
                    const state = get();
                    const updatedPages = state.pages.map((page) => (page.id === pageId ? { ...page, isHidden: !page.isHidden } : page));

                    set({
                        pages: updatedPages,
                        hasUnsavedChanges: true,
                    });
                },

                movePageOrder: (fromIndex, toIndex) => {
                    const state = get();
                    const newPages = [...state.pages];
                    const [movedPage] = newPages.splice(fromIndex, 1);
                    newPages.splice(toIndex, 0, movedPage);

                    const reorderedPages = newPages.map((page, index) => ({
                        ...page,
                        order: index + 1,
                    }));

                    set({
                        pages: reorderedPages,
                        hasUnsavedChanges: true,
                    });
                },

                insertBlock: (blockType, position) => {
                    const state = get();
                    const blockTemplate = state.availableBlocks.find((b) => b.type === blockType);
                    if (!blockTemplate) return;

                    const activePage = state.pages.find((p) => p.id === state.activePageId);
                    if (activePage) {
                        const newBlock: ContractBlock = {
                            ...blockTemplate,
                            id: `${blockTemplate.id}-${Date.now()}`,
                            order: activePage.blocks.length + 1,
                        };

                        const updatedContent = activePage.content + blockTemplate.template;

                        const updatedPages = state.pages.map((page) =>
                            page.id === state.activePageId
                                ? {
                                      ...page,
                                      blocks: [...page.blocks, newBlock],
                                      content: updatedContent,
                                      updatedAt: new Date(),
                                  }
                                : page,
                        );

                        set({
                            pages: updatedPages,
                            hasUnsavedChanges: true,
                        });
                    }
                },

                updateBlock: (blockId, updates) => {
                    const state = get();
                    const updatedBlocks = state.availableBlocks.map((block) => (block.id === blockId ? { ...block, ...updates } : block));

                    set({
                        availableBlocks: updatedBlocks,
                        hasUnsavedChanges: true,
                    });
                },

                removeBlock: (blockId) => {
                    const state = get();
                    const activePage = state.pages.find((p) => p.id === state.activePageId);
                    if (!activePage) return;

                    const updatedPages = state.pages.map((page) =>
                        page.id === state.activePageId
                            ? {
                                  ...page,
                                  blocks: page.blocks.filter((b) => b.id !== blockId),
                                  updatedAt: new Date(),
                              }
                            : page,
                    );

                    set({
                        pages: updatedPages,
                        hasUnsavedChanges: true,
                    });
                },

                reorderBlocks: (blockIds) => {
                    const state = get();
                    const activePage = state.pages.find((p) => p.id === state.activePageId);
                    if (!activePage) return;

                    const reorderedBlocks = blockIds.map((id, index) => {
                        const block = activePage.blocks.find((b) => b.id === id)!;
                        return { ...block, order: index + 1 };
                    });

                    const updatedPages = state.pages.map((page) =>
                        page.id === state.activePageId ? { ...page, blocks: reorderedBlocks } : page,
                    );

                    set({
                        pages: updatedPages,
                        hasUnsavedChanges: true,
                    });
                },

                insertBlockAtPosition: (blockType, position) => {
                    const state = get();
                    const blockTemplate = state.availableBlocks.find((b) => b.type === blockType);
                    if (!blockTemplate) return;

                    const activePage = state.pages.find((p) => p.id === state.activePageId);
                    if (!activePage) return;

                    const content = blockTemplate.template;
                    const currentContent = activePage.content;

                    const beforeContent = currentContent.substring(0, position);
                    const afterContent = currentContent.substring(position);
                    const newContent = beforeContent + content + afterContent;

                    const updatedPages = state.pages.map((page) =>
                        page.id === state.activePageId
                            ? {
                                  ...page,
                                  content: newContent,
                                  updatedAt: new Date(),
                                  wordCount: newContent
                                      .replace(/<[^>]*>/g, "")
                                      .split(/\s+/)
                                      .filter((word) => word.length > 0).length,
                              }
                            : page,
                    );

                    set({
                        pages: updatedPages,
                        hasUnsavedChanges: true,
                    });
                },

                toggleFullscreen: () => {
                    set((state) => ({ isFullscreen: !state.isFullscreen }));
                },

                setViewMode: (mode) => {
                    set({ viewMode: mode });
                },

                toggleSidebar: () => {
                    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
                },

                setEditorWidth: (width) => {
                    set({ editorWidth: Math.max(400, Math.min(1200, width)) });
                },

                setEditorScale: (scale) => {
                    set({ editorScale: Math.max(0.5, Math.min(2, scale)) });
                },

                saveContent: () => {
                    set({
                        lastSaved: new Date(),
                        hasUnsavedChanges: false,
                    });
                },

                resetEditor: () => {
                    const newPage = createInitialPage();
                    set({
                        pages: [newPage],
                        activePageId: newPage.id,
                        isFullscreen: false,
                        viewMode: "edit",
                        hasUnsavedChanges: false,
                    });
                },

                setDraggedBlock: (block) => set({ draggedBlock: block }),
                setIsDragging: (isDragging) => set({ isDragging }),
            };
        },
        {
            name: "contract-editor-storage",
            partialize: (state) => ({
                pages: state.pages,
                activePageId: state.activePageId,
                availableBlocks: state.availableBlocks,
                editorWidth: state.editorWidth,
                editorScale: state.editorScale,
                showRuler: state.showRuler,
                showPageBreaks: state.showPageBreaks,
            }),
        },
    ),
);
