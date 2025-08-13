import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./ContractCollection.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileContract,
    faPlus,
    faSearch,
    faEllipsisV,
    faEdit,
    faTrash,
    faCopy,
    faList,
    faThLarge,
    faSortAlphaDown,
    faSortAlphaUp,
} from "@fortawesome/free-solid-svg-icons";
import { useContractDraftStore } from "~/store/contract-draft-store";
import { useContractTemplateStore } from "~/store/contract-template-store";
import type { ContractDraft, ContractTemplate, ContractCreationMode } from "~/types/contract/contract.types";
import { Logger } from "~/core/Logger";
import { routePrivate } from "~/config/routes.config";
import Dropdown from "./components/Dropdown/Dropdown";

const cx = classNames.bind(styles);
const logger = Logger.getInstance();

interface FilterOptions {
    search: string;
    contractType: ContractCreationMode | "all";
    sortBy: "name" | "createdAt" | "updatedAt";
    sortOrder: "asc" | "desc";
    showDrafts: boolean;
    showTemplates: boolean;
}

const ContractCollection: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const {
        drafts,
        loading: draftsLoading,
        selectedMode,
        loadDrafts,
        deleteDraft,
        duplicateDraft,
        createFromTemplate,
        createDraft,
        // setSelectedMode - removed unused variable
    } = useContractDraftStore();

    const { templates, loading: templatesLoading, fetchTemplates } = useContractTemplateStore();

    // Check if user has selected a mode, if not redirect back to create
    useEffect(() => {
        if (!selectedMode) {
            navigate(routePrivate.createContract);
            return;
        }
    }, [selectedMode, navigate]);

    const [filters, setFilters] = useState<FilterOptions>({
        search: searchParams.get("search") || "",
        contractType: selectedMode || "all",
        sortBy: (searchParams.get("sortBy") as "name" | "createdAt" | "updatedAt") || "updatedAt",
        sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
        showDrafts: searchParams.get("showDrafts") !== "false",
        showTemplates: searchParams.get("showTemplates") !== "false",
    });

    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Mock data for development - Remove when connecting to real API
    const mockTemplates: ContractTemplate[] = [
        // {
        //     id: "template-basic-1",
        //     name: "Hợp đồng dịch vụ cơ bản",
        //     description: "Template cho hợp đồng cung cấp dịch vụ",
        //     contractType: "service",
        //     category: "business",
        //     mode: "basic",
        //     thumbnail: "",
        //     fields: [],
        //     editorContent: "",
        //     isActive: true,
        //     isPublic: true,
        //     version: "1.0",
        //     tags: ["dịch vụ"],
        //     createdAt: "2024-01-15T10:00:00Z",
        //     updatedAt: "2024-01-15T10:00:00Z",
        //     createdBy: "admin",
        // },
        // {
        //     id: "template-basic-2",
        //     name: "Hợp đồng mua bán",
        //     description: "Template cho hợp đồng mua bán hàng hóa",
        //     contractType: "purchase",
        //     category: "business",
        //     mode: "basic",
        //     thumbnail: "",
        //     fields: [],
        //     editorContent: "",
        //     isActive: true,
        //     isPublic: true,
        //     version: "1.0",
        //     tags: ["mua bán"],
        //     createdAt: "2024-01-16T10:00:00Z",
        //     updatedAt: "2024-01-16T10:00:00Z",
        //     createdBy: "admin",
        // },
        // {
        //     id: "template-editor-1",
        //     name: "Hợp đồng lao động chi tiết",
        //     description: "Template soạn thảo cho hợp đồng lao động",
        //     contractType: "employment",
        //     category: "hr",
        //     mode: "editor",
        //     thumbnail: "",
        //     fields: [],
        //     editorContent: "<h1>HỢP ĐỒNG LAO ĐỘNG</h1><p>Nội dung hợp đồng...</p>",
        //     isActive: true,
        //     isPublic: true,
        //     version: "1.0",
        //     tags: ["lao động"],
        //     createdAt: "2024-01-17T10:00:00Z",
        //     updatedAt: "2024-01-17T10:00:00Z",
        //     createdBy: "admin",
        // },
        // {
        //     id: "template-editor-2",
        //     name: "Hợp đồng hợp tác kinh doanh",
        //     description: "Template soạn thảo cho hợp đồng hợp tác",
        //     contractType: "partnership",
        //     category: "partnership",
        //     mode: "editor",
        //     thumbnail: "",
        //     fields: [],
        //     editorContent: "<h1>HỢP ĐỒNG HỢP TÁC</h1><p>Điều khoản hợp tác...</p>",
        //     isActive: true,
        //     isPublic: true,
        //     version: "1.0",
        //     tags: ["hợp tác"],
        //     createdAt: "2024-01-18T10:00:00Z",
        //     updatedAt: "2024-01-18T10:00:00Z",
        //     createdBy: "admin",
        // },
    ];

    const mockDrafts: ContractDraft[] = [
        {
            id: "draft-1",
            contractData: {
                name: "Hợp đồng dịch vụ ABC Company",
                contractCode: "HD-001",
                contractType: "service",
                category: "business",
                priority: "medium",
                drafterId: "user-1",
                drafterName: "Nguyễn Văn A",
                managerId: "user-2",
                managerName: "Trần Thị B",
                content: {
                    mode: "basic",
                    templateId: "template-basic-1",
                    fieldValues: {
                        contractType: "service",
                        clientName: "ABC Company",
                        serviceName: "Tư vấn IT",
                    },
                    description: "Hợp đồng cung cấp dịch vụ tư vấn IT",
                    terms: "Điều khoản thanh toán theo tháng",
                    conditions: "Bảo mật thông tin khách hàng",
                },
                dateRange: {
                    startDate: "2024-02-01",
                    endDate: "2024-12-31",
                },
                milestones: [],
                tags: ["dịch vụ", "thương mại"],
                attachments: [],
                status: "draft",
                createdAt: "2024-01-20T10:00:00Z",
                updatedAt: "2024-01-22T15:30:00Z",
            },
            flow: {
                id: "flow-1",
                currentStage: "basic_info",
                selectedMode: "basic",
                stageValidations: {
                    template_selection: {
                        stage: "template_selection",
                        status: "valid",
                        errors: [],
                        warnings: [],
                        isAccessible: true,
                    },
                    basic_info: {
                        stage: "basic_info",
                        status: "incomplete",
                        errors: [],
                        warnings: [],
                        isAccessible: true,
                    },
                    content_draft: {
                        stage: "content_draft",
                        status: "locked",
                        errors: [],
                        warnings: [],
                        isAccessible: false,
                    },
                    milestones_tasks: {
                        stage: "milestones_tasks",
                        status: "locked",
                        errors: [],
                        warnings: [],
                        isAccessible: false,
                    },
                    review_preview: {
                        stage: "review_preview",
                        status: "locked",
                        errors: [],
                        warnings: [],
                        isAccessible: false,
                    },
                },
                canProceedToNext: false,
                autoSaveEnabled: true,
                createdAt: "2024-01-20T10:00:00Z",
                updatedAt: "2024-01-22T15:30:00Z",
            },
            isDraft: true,
            createdAt: "2024-01-20T10:00:00Z",
            updatedAt: "2024-01-22T15:30:00Z",
            createdBy: "user-1",
        },
        {
            id: "draft-2",
            contractData: {
                name: "Hợp đồng soạn thảo XYZ",
                contractCode: "HD-002",
                contractType: "employment",
                category: "hr",
                priority: "high",
                drafterId: "user-1",
                drafterName: "Nguyễn Văn A",
                managerId: "user-2",
                managerName: "Trần Thị B",
                content: {
                    mode: "editor",
                    templateId: "template-editor-1",
                    editorContent: {
                        content: "<h1>HỢP ĐỒNG LAO ĐỘNG</h1><p>Nội dung đang soạn thảo...</p>",
                        plainText: "HỢP ĐỒNG LAO ĐỘNG\nNội dung đang soạn thảo...",
                        metadata: {
                            wordCount: 150,
                            characterCount: 850,
                            lastEditedAt: "2024-01-23T14:20:00Z",
                            version: 1,
                        },
                    },
                },
                dateRange: {
                    startDate: "2024-03-01",
                    endDate: "2024-12-31",
                },
                milestones: [],
                tags: ["lao động", "nhân sự"],
                attachments: [],
                status: "draft",
                createdAt: "2024-01-21T10:00:00Z",
                updatedAt: "2024-01-23T14:20:00Z",
            },
            flow: {
                id: "flow-2",
                currentStage: "content_draft",
                selectedMode: "editor",
                stageValidations: {
                    template_selection: {
                        stage: "template_selection",
                        status: "valid",
                        errors: [],
                        warnings: [],
                        isAccessible: true,
                    },
                    basic_info: {
                        stage: "basic_info",
                        status: "valid",
                        errors: [],
                        warnings: [],
                        isAccessible: true,
                    },
                    content_draft: {
                        stage: "content_draft",
                        status: "incomplete",
                        errors: [],
                        warnings: [],
                        isAccessible: true,
                    },
                    milestones_tasks: {
                        stage: "milestones_tasks",
                        status: "locked",
                        errors: [],
                        warnings: [],
                        isAccessible: false,
                    },
                    review_preview: {
                        stage: "review_preview",
                        status: "locked",
                        errors: [],
                        warnings: [],
                        isAccessible: false,
                    },
                },
                canProceedToNext: false,
                autoSaveEnabled: true,
                createdAt: "2024-01-21T10:00:00Z",
                updatedAt: "2024-01-23T14:20:00Z",
            },
            isDraft: true,
            createdAt: "2024-01-21T10:00:00Z",
            updatedAt: "2024-01-23T14:20:00Z",
            createdBy: "user-1",
        },
    ];

    // Load data on mount
    useEffect(() => {
        loadDrafts();
        fetchTemplates();
    }, [loadDrafts, fetchTemplates]);

    // Update URL params when filters change
    useEffect(() => {
        const newSearchParams = new URLSearchParams();

        if (filters.search) newSearchParams.set("search", filters.search);
        if (filters.sortBy !== "updatedAt") newSearchParams.set("sortBy", filters.sortBy);
        if (filters.sortOrder !== "desc") newSearchParams.set("sortOrder", filters.sortOrder);
        if (!filters.showDrafts) newSearchParams.set("showDrafts", "false");
        if (!filters.showTemplates) newSearchParams.set("showTemplates", "false");

        setSearchParams(newSearchParams, { replace: true });
    }, [filters, setSearchParams]);

    // Filter and sort templates based on current filters and selected mode
    const filteredTemplates = useMemo(() => {
        // Use mock data for development, fallback to real templates
        let items = templates.length > 0 ? templates : mockTemplates;

        // Filter by selected mode first
        if (selectedMode) {
            items = items.filter((template) => {
                // Match template with selected creation mode
                return template.mode === selectedMode;
            });
        }

        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            items = items.filter(
                (template) =>
                    template.name.toLowerCase().includes(searchLower) || template.description?.toLowerCase().includes(searchLower),
            );
        }

        // Apply sorting
        items.sort((a, b) => {
            let aValue, bValue;

            switch (filters.sortBy) {
                case "name":
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case "createdAt":
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
                    break;
                case "updatedAt":
                    aValue = new Date(a.updatedAt);
                    bValue = new Date(b.updatedAt);
                    break;
                default:
                    return 0;
            }

            if (filters.sortOrder === "asc") {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        return items;
    }, [templates, mockTemplates, filters, selectedMode]);

    // Filter and sort recent documents (drafts) based on selected mode
    const recentDocuments = useMemo(() => {
        // Use mock data for development, fallback to real drafts
        let items = drafts.length > 0 ? drafts : mockDrafts;

        // Filter by selected mode first
        if (selectedMode) {
            items = items.filter((item) => item.contractData.content.mode === selectedMode);
        }

        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            items = items.filter(
                (item) =>
                    item.contractData.name.toLowerCase().includes(searchLower) ||
                    item.contractData.notes?.toLowerCase().includes(searchLower),
            );
        }

        // Apply sorting
        items.sort((a, b) => {
            let aValue, bValue;

            switch (filters.sortBy) {
                case "name":
                    aValue = a.contractData.name;
                    bValue = b.contractData.name;
                    break;
                case "createdAt":
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
                    break;
                case "updatedAt":
                    aValue = new Date(a.updatedAt);
                    bValue = new Date(b.updatedAt);
                    break;
                default:
                    return 0;
            }

            if (filters.sortOrder === "asc") {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        return items;
    }, [drafts, mockDrafts, filters, selectedMode]);

    // Handle create new contract based on selected mode
    const handleCreateNew = async () => {
        if (!selectedMode) {
            logger.error("No mode selected");
            return;
        }

        try {
            const draft = await createDraft(selectedMode);
            const targetStage = selectedMode === "basic" ? "1" : "2";
            navigate(`${routePrivate.contract}?draftId=${draft.id}&stage=${targetStage}&mode=${selectedMode}`);

            logger.info("Created new draft", { mode: selectedMode, draftId: draft.id });
        } catch (error) {
            logger.error("Failed to create new draft:", error);
        }
    };

    // Handle use template based on selected mode
    const handleUseTemplate = async (template: ContractTemplate) => {
        if (!selectedMode) {
            logger.error("No mode selected");
            return;
        }

        try {
            const draft = await createFromTemplate(template.id);

            // Navigate to appropriate stage based on mode and template
            const targetStage = selectedMode === "basic" ? "1" : "2";
            navigate(`${routePrivate.contract}?draftId=${draft.id}&stage=${targetStage}&mode=${selectedMode}`);

            logger.info("Created draft from template", {
                templateId: template.id,
                draftId: draft.id,
                mode: selectedMode,
            });
        } catch (error) {
            logger.error("Failed to create draft from template:", error);
        }
    };

    // Handle edit existing draft
    const handleEditDraft = (draft: ContractDraft) => {
        // Navigate to the current stage of the draft
        const currentStage = draft.flow?.currentStage || "basic_info";
        const stageMap: Record<string, string> = {
            template_selection: "0",
            basic_info: "1",
            content_draft: "2",
            milestones_tasks: "3",
            review_preview: "4",
        };
        const stageParam = stageMap[currentStage] || "1";
        const mode = draft.flow?.selectedMode || draft.contractData.content.mode;
        navigate(`${routePrivate.contract}?draftId=${draft.id}&stage=${stageParam}&mode=${mode}`);
        logger.info("Editing existing draft", { draftId: draft.id, stage: currentStage });
    };

    // Handle duplicate draft
    const handleDuplicateDraft = async (draft: ContractDraft) => {
        try {
            const newDraft = await duplicateDraft(draft.id);
            logger.info("Duplicated draft", { originalId: draft.id, newId: newDraft.id });
        } catch (error) {
            logger.error("Failed to duplicate draft:", error);
        }
    };

    // Handle delete draft
    const handleDeleteDraft = async (draft: ContractDraft) => {
        try {
            await deleteDraft(draft.id);
            logger.info("Deleted draft", { draftId: draft.id });
        } catch (error) {
            logger.error("Failed to delete draft:", error);
        }
    };

    // Get contract mode display name
    const getModeDisplay = (mode: ContractCreationMode) => {
        const modeMap: Record<ContractCreationMode, string> = {
            basic: "Biểu mẫu cơ bản",
            editor: "Soạn thảo nâng cao",
            upload: "Tải file lên",
        };
        return modeMap[mode] || mode;
    };

    // Remove unused handleBack function
    // const handleBack = () => {
    //     navigate("/contract/create");
    // };

    // Get contract type display name for templates
    const getContractTypeDisplay = (type: string) => {
        const typeMap: Record<string, string> = {
            service: "Dịch vụ",
            purchase: "Mua bán",
            employment: "Lao động",
            nda: "Bảo mật",
            partnership: "Hợp tác",
            rental: "Thuê",
            custom: "Tùy chỉnh",
        };
        return typeMap[type] || type;
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    // Get progress for draft
    const getDraftProgress = (draft: ContractDraft) => {
        const stages = ["template_selection", "basic_info", "content_draft", "milestones_tasks", "review_preview"];
        const currentStageIndex = stages.indexOf(draft.flow?.currentStage || "basic_info");
        const totalStages = stages.length;
        return Math.round(((currentStageIndex + 1) / totalStages) * 100);
    };

    const isLoading = draftsLoading || templatesLoading;

    const sortOptions = [
        { value: "updatedAt", label: "Thời gian sửa đổi" },
        { value: "createdAt", label: "Thời gian tạo" },
        { value: "name", label: "Tên" },
    ];

    const contractTypeOptions = [
        { value: "all", label: "Tất cả loại" },
        { value: "basic", label: "Biểu mẫu" },
        { value: "editor", label: "Soạn thảo" },
        { value: "upload", label: "Tải lên" },
        { value: "service", label: "Dịch vụ" },
        { value: "purchase", label: "Mua bán" },
        { value: "employment", label: "Lao động" },
    ];

    return (
        <div className={cx("contract-collection")}>
            {/* Header */}
            <div className={cx("header")}>
                <div className={cx("header-left")}>
                    <button className={cx("menu-button")}>
                        <FontAwesomeIcon icon={faList} />
                    </button>
                    <div className={cx("logo")}>
                        <FontAwesomeIcon icon={faFileContract} />
                        <span>Hợp đồng</span>
                    </div>
                    {selectedMode && (
                        <div className={cx("mode-indicator")}>
                            <span className={cx("mode-label")}>Chế độ: </span>
                            <span className={cx("mode-value")}>{getModeDisplay(selectedMode)}</span>
                        </div>
                    )}
                </div>

                <div className={cx("search-container")}>
                    <div className={cx("search-box")}>
                        <FontAwesomeIcon icon={faSearch} className={cx("search-icon")} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm"
                            value={filters.search}
                            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                            className={cx("search-input")}
                        />
                    </div>
                </div>

                <div className={cx("header-right")}>
                    <div className={cx("view-controls")}>
                        <Dropdown
                            value={filters.sortBy}
                            onChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value as "name" }))}
                            options={sortOptions}
                            placeholder="Sắp xếp theo"
                            disabled={false}
                            className={cx("sort-select")}
                            error={false}
                        />

                        <button
                            onClick={() =>
                                setFilters((prev) => ({
                                    ...prev,
                                    sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
                                }))
                            }
                            className={cx("sort-button")}
                        >
                            <FontAwesomeIcon icon={filters.sortOrder === "asc" ? faSortAlphaUp : faSortAlphaDown} />
                        </button>

                        <button className={cx("view-button", { active: viewMode === "grid" })} onClick={() => setViewMode("grid")}>
                            <FontAwesomeIcon icon={faThLarge} />
                        </button>

                        <button className={cx("view-button", { active: viewMode === "list" })} onClick={() => setViewMode("list")}>
                            <FontAwesomeIcon icon={faList} />
                        </button>
                    </div>

                    <button className={cx("more-button")}>
                        <FontAwesomeIcon icon={faEllipsisV} />
                    </button>
                </div>
            </div>

            {/* Main Content Wrapper */}
            <div className={cx("main-content")}>
                {/* Templates Section */}
                <div className={cx("templates-section")}>
                    <h2 className={cx("section-title")}>Bắt đầu một hợp đồng mới</h2>

                    {isLoading ? (
                        <div className={cx("templates-loading")}>
                            <div className={cx("template-skeleton")} />
                            <div className={cx("template-skeleton")} />
                            <div className={cx("template-skeleton")} />
                        </div>
                    ) : (
                        <div className={cx("templates-grid")}>
                            {/* Blank Template */}
                            <div className={cx("template-card", "blank-template")} onClick={handleCreateNew}>
                                <div className={cx("template-preview")}>
                                    <FontAwesomeIcon icon={faPlus} className={cx("plus-icon")} />
                                </div>
                                <div className={cx("template-title")}>Hợp đồng trống</div>
                            </div>

                            {/* Template Cards */}
                            {filteredTemplates.slice(0, 6).map((template) => (
                                <div key={template.id} className={cx("template-card")} onClick={() => handleUseTemplate(template)}>
                                    <div className={cx("template-preview")}>
                                        <img
                                            src={`/placeholder_svg.png?height=120&width=90&text=${encodeURIComponent(template.name)}`}
                                            alt={template.name}
                                            className={cx("template-image")}
                                        />
                                    </div>
                                    <div className={cx("template-title")}>{template.name}</div>
                                    <div className={cx("template-subtitle")}>{getContractTypeDisplay(template.contractType)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Documents Section */}
                <div className={cx("recent-section")}>
                    <div className={cx("section-header")}>
                        <h2 className={cx("section-title")}>Hợp đồng gần đây</h2>

                        <div className={cx("section-filters")}>
                            <Dropdown
                                value={filters.contractType}
                                onChange={(value) => setFilters((prev) => ({ ...prev, contractType: value as ContractCreationMode }))}
                                options={contractTypeOptions}
                                placeholder="Loại hợp đồng"
                                className={cx("filter-select")}
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className={cx("documents-loading")}>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className={cx("document-skeleton")} />
                            ))}
                        </div>
                    ) : recentDocuments.length === 0 ? (
                        <div className={cx("empty-state")}>
                            <FontAwesomeIcon icon={faFileContract} className={cx("empty-icon")} />
                            <h3>Chưa có hợp đồng nào</h3>
                            <p>Bắt đầu tạo hợp đồng đầu tiên của bạn</p>
                            <button onClick={handleCreateNew} className={cx("create-button")}>
                                Tạo hợp đồng mới
                            </button>
                        </div>
                    ) : (
                        <div className={cx("documents-grid", viewMode)}>
                            {recentDocuments.map((draft) => (
                                <div key={draft.id} className={cx("document-card")}>
                                    <div className={cx("document-preview")}>
                                        <img
                                            src={`/placeholder_image.png?height=160&width=120&text=${encodeURIComponent(
                                                draft.contractData.name,
                                            )}`}
                                            alt={draft.contractData.name}
                                            className={cx("document-image")}
                                        />

                                        <div className={cx("document-overlay")}>
                                            <button className={cx("overlay-button")} onClick={() => handleEditDraft(draft)}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button className={cx("overlay-button")} onClick={() => handleDuplicateDraft(draft)}>
                                                <FontAwesomeIcon icon={faCopy} />
                                            </button>
                                            <button className={cx("overlay-button", "delete")} onClick={() => handleDeleteDraft(draft)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>

                                        {getDraftProgress(draft) < 100 && (
                                            <div className={cx("progress-indicator")}>
                                                <div className={cx("progress-bar")} style={{ width: `${getDraftProgress(draft)}%` }} />
                                            </div>
                                        )}
                                    </div>

                                    <div className={cx("document-info")}>
                                        <div className={cx("document-header")}>
                                            <div className={cx("document-icon")}>
                                                <FontAwesomeIcon icon={faFileContract} />
                                            </div>
                                            <div className={cx("document-meta")}>
                                                <h3 className={cx("document-title")}>{draft.contractData.name}</h3>
                                                <p className={cx("document-date")}>Đã mở {formatDate(draft.updatedAt)}</p>
                                            </div>
                                            <button className={cx("document-menu")}>
                                                <FontAwesomeIcon icon={faEllipsisV} />
                                            </button>
                                        </div>

                                        <div className={cx("document-details")}>
                                            <span className={cx("document-type")}>{getModeDisplay(draft.contractData.content.mode)}</span>
                                            {getDraftProgress(draft) < 100 && (
                                                <span className={cx("document-status")}>{getDraftProgress(draft)}% hoàn thành</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContractCollection;
