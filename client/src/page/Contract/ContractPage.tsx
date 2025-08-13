"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ContractPage.module.scss";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch, faFileContract, faCalendarAlt, faUser, faDollarSign, faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import DateRangePicker from "~/components/DateRangePicker/DateRangePicker";
import { useContract } from "~/contexts/ContractContext";
import { routePrivate, routes } from "~/config/routes.config";

const cx = classNames.bind(styles);

interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
}

const ContractPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<"active" | "all">("active");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });
    const { contracts, loading, error } = useContract();

    const handleContractClick = (contractId: string) => {
        navigate(`/contract-detail/${contractId}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "var(--green-block)";
            case "active":
                return "var(--text-active)";
            case "pending":
                return "#bf8700";
            case "expired":
                return "#d72c0d";
            case "draft":
                return "var(--text-op)";
            default:
                return "var(--text-op)";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "completed":
                return "Hoàn thành";
            case "active":
                return "Đang thực hiện";
            case "pending":
                return "Chờ xử lý";
            case "expired":
                return "Hết hạn";
            case "draft":
                return "Bản nháp";
            default:
                return "Không xác định";
        }
    };

    const getCategoryText = (type: string) => {
        switch (type) {
            case "commercial":
                return "Thương mại";
            case "service":
                return "Dịch vụ";
            case "rental":
                return "Thuê mặt bằng";
            case "partnership":
                return "Hợp tác";
            case "legal":
                return "Pháp lý";
            case "software":
                return "Phần mềm";
            case "marketing":
                return "Marketing";
            case "maintenance":
                return "Bảo trì";
            case "training":
                return "Đào tạo";
            default:
                return "Khác";
        }
    };

    const isDateInRange = (contractDate: Date, startDate: Date | null, endDate: Date | null) => {
        if (!startDate && !endDate) return true;
        if (startDate && !endDate) return contractDate >= startDate;
        if (!startDate && endDate) return contractDate <= endDate;
        if (startDate && endDate) return contractDate >= startDate && contractDate <= endDate;
        return true;
    };

    const filteredContracts = contracts.filter((contract) => {
        const matchesTab =
            activeTab === "all" || (activeTab === "active" && (contract.status === "active" || contract.status === "pending"));
        const matchesCategory = selectedCategory === "all" || contract.type === selectedCategory;
        const matchesSearch =
            contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contract.client.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = isDateInRange(contract.createdDate, dateRange.startDate, dateRange.endDate);

        return matchesTab && matchesCategory && matchesSearch && matchesDate;
    });

    return (
        <div className={cx("contract-page")}>
            {/* Header */}
            <div className={cx("page-header")}>
                <div className={cx("header-content")}>
                    <div className={cx("header-info")}>
                        <p className={cx("subtitle")}>Quản lý và theo dõi tất cả hợp đồng của bạn</p>
                    </div>
                    <button className={cx("add-button")} onClick={() => navigate(routePrivate.createContract)}>
                        <FontAwesomeIcon icon={faPlus} />
                        Tạo hợp đồng mới
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className={cx("tabs")}>
                <button className={cx("tab", { active: activeTab === "active" })} onClick={() => setActiveTab("active")}>
                    Đang hoạt động
                </button>
                <button className={cx("tab", { active: activeTab === "all" })} onClick={() => setActiveTab("all")}>
                    Tất cả hợp đồng
                </button>
            </div>

            {/* Filters */}
            <div className={cx("filters")}>
                <div className={cx("filters-left")}>
                    <h3>Danh sách hợp đồng</h3>
                </div>
                <div className={cx("filters-right")}>
                    <div className={cx("search-box")}>
                        <FontAwesomeIcon icon={faSearch} className={cx("search-icon")} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm hợp đồng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={cx("search-input")}
                        />
                    </div>
                    <DateRangePicker value={dateRange} onChange={setDateRange} placeholder="Chọn khoảng thời gian" />
                    <select
                        className={cx("category-select")}
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">Tất cả loại hợp đồng</option>
                        <option value="commercial">Thương mại</option>
                        <option value="service">Dịch vụ</option>
                        <option value="rental">Thuê mặt bằng</option>
                        <option value="partnership">Hợp tác</option>
                        <option value="legal">Pháp lý</option>
                        <option value="software">Phần mềm</option>
                        <option value="marketing">Marketing</option>
                        <option value="maintenance">Bảo trì</option>
                        <option value="training">Đào tạo</option>
                    </select>
                </div>
            </div>

            {loading && (
                <div className={cx("loading-state")}>
                    <div className={cx("loading-spinner")}></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            )}

            {error && (
                <div className={cx("error-state")}>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Thử lại</button>
                </div>
            )}

            {/* Contract Grid */}
            <div className={cx("contracts-grid")}>
                {filteredContracts.map((contract) => (
                    <div key={contract.id} className={cx("contract-card")} onClick={() => handleContractClick(contract.id)}>
                        <div className={cx("card-header")}>
                            <div className={cx("contract-info")}>
                                <div className={cx("contract-icon")}>
                                    <FontAwesomeIcon icon={faFileContract} />
                                </div>
                                <div className={cx("contract-details")}>
                                    <h4 className={cx("contract-title")}>{contract.title}</h4>
                                    <p className={cx("contract-type")}>{getCategoryText(contract.type)}</p>
                                </div>
                            </div>
                            <div className={cx("card-actions")}>
                                <div className={cx("status-badge")} style={{ backgroundColor: getStatusColor(contract.status) }}>
                                    {getStatusText(contract.status)}
                                </div>
                                <button className={cx("menu-button")} onClick={(e) => e.stopPropagation()}>
                                    <FontAwesomeIcon icon={faEllipsisV} />
                                </button>
                            </div>
                        </div>

                        <div className={cx("card-content")}>
                            <p className={cx("contract-description")}>{contract.description}</p>

                            <div className={cx("contract-meta")}>
                                <div className={cx("meta-item")}>
                                    <FontAwesomeIcon icon={faUser} className={cx("meta-icon")} />
                                    <span>{contract.client}</span>
                                </div>
                                <div className={cx("meta-item")}>
                                    <FontAwesomeIcon icon={faCalendarAlt} className={cx("meta-icon")} />
                                    <span>
                                        {contract.startDate} - {contract.endDate}
                                    </span>
                                </div>
                                <div className={cx("meta-item")}>
                                    <FontAwesomeIcon icon={faDollarSign} className={cx("meta-icon")} />
                                    <span>{contract.value}</span>
                                </div>
                            </div>

                            {contract.status !== "draft" && (
                                <div className={cx("progress-section")}>
                                    <div className={cx("progress-header")}>
                                        <span>Tiến độ</span>
                                        <span className={cx("progress-percent")}>{contract.progress}%</span>
                                    </div>
                                    <div className={cx("progress-bar")}>
                                        <div className={cx("progress-fill")} style={{ width: `${contract.progress}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredContracts.length === 0 && (
                <div className={cx("empty-state")}>
                    <FontAwesomeIcon icon={faFileContract} className={cx("empty-icon")} />
                    <h3>Không tìm thấy hợp đồng</h3>
                    <p>Thử thay đổi bộ lọc hoặc tạo hợp đồng mới</p>
                </div>
            )}
        </div>
    );
};

export default ContractPage;
