import type React from "react";
import { useState } from "react";
import styles from "./SidebarLeft.module.scss";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faChevronDown,
    faChevronUp,
    faArrowRightArrowLeft,
    faFileText,
    faTasks,
    faMoneyBill,
    faGavel,
    faStop,
    faSignature,
    faEye,
    faEyeSlash,
    faGripVertical,
    faTrash,
    faCopy,
    faSearch,
    faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { FaEllipsisH } from "react-icons/fa";
import { CONTRACT_TEMPLATES } from "~/types/contract/contract-blocks.types";
import { useContractEditorStore } from "~/store/contract-editor-store";
import { useEditorStore } from "~/store/editor-store";

const cx = classNames.bind(styles);

const BLOCK_ICONS = {
    faFileText: faFileText,
    faTasks: faTasks,
    faMoneyBill: faMoneyBill,
    faGavel: faGavel,
    faStop: faStop,
    faSignature: faSignature,
};

const SidebarLeft: React.FC = () => {
    const { editor } = useEditorStore();
    const {
        pages,
        activePageId,
        availableBlocks,
        setActivePage,
        addPage,
        duplicatePage,
        deletePage,
        togglePageVisibility,
        insertBlock,
        updateBlock,
    } = useContractEditorStore();

    const [expandedSections, setExpandedSections] = useState({
        blocks: true,
        navigator: true,
        styling: false,
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedTemplate, setSelectedTemplate] = useState(CONTRACT_TEMPLATES[0]);

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    // Lọc khối dựa trên tìm kiếm và danh mục
    const filteredBlocks = availableBlocks.filter((block) => {
        const matchesSearch =
            block.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            block.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || block.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleInsertBlock = (blockType: string) => {
        if (!editor) {
            console.warn("Trình chỉnh sửa không khả dụng");
            return;
        }

        console.log("Đang chèn khối:", blockType);
        insertBlock(blockType);

        // Hiển thị thông báo thành công
        const blockName = availableBlocks.find((b) => b.type === blockType)?.title || "Khối";

        // Thông báo đơn giản
        alert(`${blockName} đã được chèn thành công!`);
    };

    const handleBlockToggle = (blockId: string) => {
        const block = availableBlocks.find((b) => b.id === blockId);
        if (block) {
            updateBlock(blockId, { isActive: !block.isActive });
        }
    };

    const categories = [
        { value: "all", label: "Tất Cả Khối" },
        { value: "header", label: "Tiêu Đề" },
        { value: "content", label: "Nội Dung" },
        { value: "legal", label: "Pháp Lý" },
        { value: "signature", label: "Chữ Ký" },
        { value: "custom", label: "Tùy Chỉnh" },
    ];

    return (
        <div className={cx("wrapper")}>
            {/* Phần Khối Hợp Đồng */}
            <div className={cx("section")}>
                <div className={cx("header_left")} onClick={() => toggleSection("blocks")}>
                    <h4>Khối Hợp Đồng</h4>
                    <div className={cx("header_layer")}>
                        <button
                            className={cx("add-btn")}
                            onClick={(e) => {
                                e.stopPropagation();
                                // Hiển thị modal hoặc dropdown chọn khối
                            }}
                            title="Thêm khối mới"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </button>
                        <div>
                            <FontAwesomeIcon icon={expandedSections.blocks ? faChevronUp : faChevronDown} />
                        </div>
                    </div>
                </div>

                {expandedSections.blocks && (
                    <>
                        {/* Bộ Chọn Mẫu */}
                        <div className={cx("template-box")}>
                            <div className={cx("template-box_group")}>
                                <div className={cx("template-box_preview")}></div>
                                <div className={cx("template-box_title")}>
                                    <p className={cx("template-label")}>Mẫu</p>
                                    <p className={cx("template-label-title")}>{selectedTemplate.name}</p>
                                </div>
                            </div>
                            <button className={cx("change-btn")} title="Thay đổi mẫu">
                                <FontAwesomeIcon className={cx("change-btn-ic")} icon={faArrowRightArrowLeft} />
                            </button>
                        </div>

                        {/* Tìm Kiếm và Lọc */}
                        <div className={cx("block-controls")}>
                            <div className={cx("search-box")}>
                                <FontAwesomeIcon icon={faSearch} className={cx("search-icon")} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm khối..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={cx("search-input")}
                                />
                            </div>

                            <div className={cx("filter-box")}>
                                <FontAwesomeIcon icon={faFilter} className={cx("filter-icon")} />
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className={cx("filter-select")}
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Danh Sách Khối */}
                        <div className={cx("blocks-container")}>
                            {filteredBlocks.length > 0 ? (
                                filteredBlocks
                                    .sort((a, b) => a.order - b.order)
                                    .map((block) => (
                                        <div
                                            key={block.id}
                                            className={cx("block-item", {
                                                inactive: !block.isActive,
                                                required: block.required,
                                            })}
                                        >
                                            <div className={cx("block-content")}>
                                                <div className={cx("block-main")}>
                                                    <div className={cx("drag-handle")}>
                                                        <FontAwesomeIcon icon={faGripVertical} />
                                                    </div>

                                                    <span className={cx("block-icon")}>
                                                        <FontAwesomeIcon
                                                            icon={BLOCK_ICONS[block.icon as keyof typeof BLOCK_ICONS] || faFileText}
                                                        />
                                                    </span>

                                                    <div className={cx("block-info")}>
                                                        <span className={cx("block-title")}>{block.title}</span>
                                                        <span className={cx("block-description")}>{block.description}</span>
                                                        <div className={cx("block-meta")}>
                                                            <span className={cx("block-category")}>{block.category}</span>
                                                            {block.required && <span className={cx("required-tag")}>Bắt Buộc</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={cx("block-actions")}>
                                                    <button
                                                        className={cx("action-btn", "insert-btn")}
                                                        onClick={() => handleInsertBlock(block.type)}
                                                        title="Chèn khối vào trình chỉnh sửa"
                                                    >
                                                        <FontAwesomeIcon icon={faPlus} />
                                                    </button>

                                                    <button
                                                        className={cx("action-btn")}
                                                        onClick={() => handleBlockToggle(block.id)}
                                                        title={block.isActive ? "Ẩn khối" : "Hiện khối"}
                                                    >
                                                        <FontAwesomeIcon icon={block.isActive ? faEye : faEyeSlash} />
                                                    </button>

                                                    <button
                                                        className={cx("action-btn")}
                                                        onClick={() => {
                                                            const newBlock = { ...block, id: `${block.id}-copy-${Date.now()}` };
                                                            // Thêm logic sao chép
                                                        }}
                                                        title="Sao chép khối"
                                                    >
                                                        <FontAwesomeIcon icon={faCopy} />
                                                    </button>

                                                    {!block.required && (
                                                        <button
                                                            className={cx("action-btn", "danger")}
                                                            onClick={() => {
                                                                if (window.confirm("Xóa khối này?")) {
                                                                    // Thêm logic xóa
                                                                }
                                                            }}
                                                            title="Xóa khối"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    )}

                                                    <FaEllipsisH className={cx("more-options")} />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className={cx("empty-blocks")}>
                                    <p>Không tìm thấy khối nào</p>
                                    <button className={cx("create-block-btn")} onClick={() => setSearchTerm("")}>
                                        Xóa tìm kiếm
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Phần Điều Hướng */}
            <div className={cx("section")}>
                <div className={cx("navigator")}>
                    <div className={cx("header_left")} onClick={() => toggleSection("navigator")}>
                        <span className={cx("header_left-navigator")}>Trang</span>
                        <div className={cx("header_layer")}>
                            <button
                                className={cx("add-btn_navigator")}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addPage();
                                }}
                                title="Thêm trang mới"
                            >
                                <FontAwesomeIcon icon={faPlus} /> Trang
                            </button>
                            <div>
                                <FontAwesomeIcon icon={expandedSections.navigator ? faChevronUp : faChevronDown} />
                            </div>
                        </div>
                    </div>

                    {expandedSections.navigator && (
                        <ul className={cx("page-list")}>
                            {pages
                                .sort((a, b) => a.order - b.order)
                                .map((page) => (
                                    <li
                                        key={page.id}
                                        className={cx("page-item", {
                                            active: page.id === activePageId,
                                            hidden: page.isHidden,
                                        })}
                                        onClick={() => setActivePage(page.id)}
                                    >
                                        <div className={cx("left")}>
                                            <span className={cx("drag-icon")}>
                                                <FontAwesomeIcon icon={faGripVertical} />
                                            </span>
                                            <div className={cx("thumbnail")}>
                                                <div className={cx("page-preview")}>
                                                    <div className={cx("preview-lines")}>
                                                        <div className={cx("preview-line", "title")}></div>
                                                        <div className={cx("preview-line")}></div>
                                                        <div className={cx("preview-line")}></div>
                                                        <div className={cx("preview-line", "short")}></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={cx("page-info")}>
                                                <span className={cx("page-name")}>{page.name}</span>
                                                <span className={cx("page-stats")}>
                                                    {page.wordCount} từ • {page.blocks.length} khối
                                                </span>
                                            </div>
                                        </div>
                                        <div className={cx("right")}>
                                            <button
                                                className={cx("page-action")}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    togglePageVisibility(page.id);
                                                }}
                                                title={page.isHidden ? "Hiện trang" : "Ẩn trang"}
                                            >
                                                <FontAwesomeIcon icon={page.isHidden ? faEyeSlash : faEye} />
                                            </button>

                                            <button
                                                className={cx("page-action")}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    duplicatePage(page.id);
                                                }}
                                                title="Sao chép trang"
                                            >
                                                <FontAwesomeIcon icon={faCopy} />
                                            </button>

                                            {pages.length > 1 && (
                                                <button
                                                    className={cx("page-action", "danger")}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm("Xóa trang này?")) {
                                                            deletePage(page.id);
                                                        }
                                                    }}
                                                    title="Xóa trang"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            )}

                                            <FaEllipsisH className={cx("more-options")} />
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Phần Định Dạng */}
            <div className={cx("section")}>
                <div className={cx("styling-section")}>
                    <div className={cx("header_left")} onClick={() => toggleSection("styling")}>
                        <span className={cx("header_left-navigator")}>Kiểu Tài Liệu</span>
                        <div className={cx("header_layer")}>
                            <FontAwesomeIcon icon={expandedSections.styling ? faChevronUp : faChevronDown} />
                        </div>
                    </div>

                    {expandedSections.styling && (
                        <>
                            <div className={cx("branding")}>
                                <div className={cx("logo-placeholder")}>Logo Công Ty</div>
                                <button className={cx("change-btn")} title="Tải lên logo">
                                    <FontAwesomeIcon className={cx("change-btn-ic")} icon={faArrowRightArrowLeft} />
                                </button>
                            </div>

                            <div className={cx("styling-options")}>
                                <div className={cx("row")}>
                                    <label>Kích Thước Trang</label>
                                    <div className={cx("input-box")}>A4 Dọc</div>
                                </div>
                                <div className={cx("row")}>
                                    <label>Lề Trang</label>
                                    <div className={cx("input-box")}>Bình Thường</div>
                                </div>
                                <div className={cx("row")}>
                                    <label>Phông Chữ</label>
                                    <div className={cx("input-box")}>Times New Roman</div>
                                </div>
                                <div className={cx("row")}>
                                    <label>Cỡ Chữ</label>
                                    <div className={cx("input-box")}>12pt</div>
                                </div>
                                <div className={cx("row")}>
                                    <label>Giãn Dòng</label>
                                    <div className={cx("input-box")}>1.5</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SidebarLeft;
