"use client";

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./ContractDetail.module.scss";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronDown,
    faChevronUp,
    faUser,
    faCalendarAlt,
    faDollarSign,
    faFileContract,
    faCloudUploadAlt,
    faDownload,
    faEye,
    faEdit,
    faTrash,
    faPlus,
    faCheck,
    faClock,
    faExclamationTriangle,
    faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useContract } from "~/contexts/ContractContext";

const cx = classNames.bind(styles);

interface Milestone {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: "completed" | "in-progress" | "pending" | "overdue";
    progress: number;
    tasks: Task[];
    paymentAmount?: string;
}

interface Task {
    id: string;
    title: string;
    description: string;
    assignee: string;
    dueDate: string;
    status: "completed" | "in-progress" | "pending" | "overdue";
    priority: "high" | "medium" | "low";
}

interface Partner {
    id: string;
    name: string;
    role: string;
    contact: string;
    email: string;
}

interface Attachment {
    id: string;
    name: string;
    type: string;
    size: string;
    uploadDate: string;
    url: string;
}

const ContractDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        overview: true,
        milestones: true,
        partners: false,
        attachments: false,
    });

    const [newComment, setNewComment] = useState("");
    const { getContractById, addComment, loading, error } = useContract();
    const contract = getContractById(id || "");

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "var(--green-block)";
            case "in-progress":
                return "var(--text-active)";
            case "pending":
                return "#bf8700";
            case "overdue":
                return "#d72c0d";
            default:
                return "var(--text-op)";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "completed":
                return "Hoàn thành";
            case "in-progress":
                return "Đang thực hiện";
            case "pending":
                return "Chờ thực hiện";
            case "overdue":
                return "Quá hạn";
            default:
                return "Không xác định";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return faCheck;
            case "in-progress":
                return faClock;
            case "pending":
                return faClock;
            case "overdue":
                return faExclamationTriangle;
            default:
                return faClock;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "#d72c0d";
            case "medium":
                return "#bf8700";
            case "low":
                return "var(--green-block)";
            default:
                return "var(--text-op)";
        }
    };

    const handleSubmitComment = () => {
        if (newComment.trim()) {
            addComment(contract.id, newComment.trim());
            setNewComment("");
        }
    };

    if (loading) {
        return (
            <div className={cx("loading-container")}>
                <div className={cx("loading-spinner")}></div>
                <p>Đang tải thông tin hợp đồng...</p>
            </div>
        );
    }

    if (error || !contract) {
        return (
            <div className={cx("error-container")}>
                <h2>Không tìm thấy hợp đồng</h2>
                <p>{error || "Hợp đồng không tồn tại hoặc đã bị xóa"}</p>
                <button onClick={() => navigate("/contract")}>Quay lại danh sách</button>
            </div>
        );
    }

    const { milestones, partners, attachments, activities } = contract;

    return (
        <div className={cx("contract-detail")}>
            <div className={cx("header")}>
                <button className={cx("back-button")} onClick={() => navigate(-1)}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Quay lại
                </button>
                <div className={cx("header-content")}>
                    <h1 className={cx("title")}>{contract.title}</h1>
                    <div className={cx("header-actions")}>
                        <button className={cx("action-button", "edit")}>
                            <FontAwesomeIcon icon={faEdit} />
                            Chỉnh sửa
                        </button>
                        <button className={cx("action-button", "delete")}>
                            <FontAwesomeIcon icon={faTrash} />
                            Xóa
                        </button>
                    </div>
                </div>
            </div>

            <div className={cx("content")}>
                <div className={cx("main-content")}>
                    {/* Contract Overview */}
                    <div className={cx("section")}>
                        <div className={cx("section-header")} onClick={() => toggleSection("overview")}>
                            <h3>Thông tin tổng quan</h3>
                            <FontAwesomeIcon icon={expandedSections.overview ? faChevronUp : faChevronDown} />
                        </div>
                        {expandedSections.overview && (
                            <div className={cx("section-content")}>
                                <p className={cx("description")}>{contract.description}</p>
                                <div className={cx("overview-details")}>
                                    <div className={cx("detail-item")}>
                                        <strong>Loại hợp đồng:</strong> {contract.category}
                                    </div>
                                    <div className={cx("detail-item")}>
                                        <strong>Thời gian thực hiện:</strong> {contract.startDate} - {contract.endDate}
                                    </div>
                                    <div className={cx("detail-item")}>
                                        <strong>Giá trị hợp đồng:</strong> {contract.value}
                                    </div>
                                    <div className={cx("detail-item")}>
                                        <strong>Tiến độ tổng thể:</strong>
                                        <div className={cx("progress-container")}>
                                            <div className={cx("progress-bar")}>
                                                <div className={cx("progress-fill")} style={{ width: `${contract.progress}%` }} />
                                            </div>
                                            <span className={cx("progress-text")}>{contract.progress}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Milestones & Tasks */}
                    <div className={cx("section")}>
                        <div className={cx("section-header")} onClick={() => toggleSection("milestones")}>
                            <h3>Giai đoạn và công việc</h3>
                            <FontAwesomeIcon icon={expandedSections.milestones ? faChevronUp : faChevronDown} />
                        </div>
                        {expandedSections.milestones && (
                            <div className={cx("section-content")}>
                                {milestones.map((milestone) => (
                                    <div key={milestone.id} className={cx("milestone")}>
                                        <div className={cx("milestone-header")}>
                                            <div className={cx("milestone-info")}>
                                                <h4>{milestone.title}</h4>
                                                <p>{milestone.description}</p>
                                                <div className={cx("milestone-meta")}>
                                                    <span>
                                                        <FontAwesomeIcon icon={faCalendarAlt} /> {milestone.startDate} - {milestone.endDate}
                                                    </span>
                                                    {milestone.paymentAmount && (
                                                        <span>
                                                            <FontAwesomeIcon icon={faDollarSign} /> {milestone.paymentAmount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={cx("milestone-status")}>
                                                <div
                                                    className={cx("status-badge")}
                                                    style={{ backgroundColor: getStatusColor(milestone.status) }}
                                                >
                                                    <FontAwesomeIcon icon={getStatusIcon(milestone.status)} />
                                                    {getStatusText(milestone.status)}
                                                </div>
                                                <div className={cx("progress-container")}>
                                                    <div className={cx("progress-bar")}>
                                                        <div className={cx("progress-fill")} style={{ width: `${milestone.progress}%` }} />
                                                    </div>
                                                    <span className={cx("progress-text")}>{milestone.progress}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={cx("tasks")}>
                                            <h5>Công việc:</h5>
                                            {milestone.tasks.map((task) => (
                                                <div key={task.id} className={cx("task")}>
                                                    <div className={cx("task-info")}>
                                                        <h6>{task.title}</h6>
                                                        <p>{task.description}</p>
                                                        <div className={cx("task-meta")}>
                                                            <span>
                                                                <FontAwesomeIcon icon={faUser} /> {task.assignee}
                                                            </span>
                                                            <span>
                                                                <FontAwesomeIcon icon={faCalendarAlt} /> {task.dueDate}
                                                            </span>
                                                            <span
                                                                className={cx("priority")}
                                                                style={{ color: getPriorityColor(task.priority) }}
                                                            >
                                                                Ưu tiên:{" "}
                                                                {task.priority === "high"
                                                                    ? "Cao"
                                                                    : task.priority === "medium"
                                                                    ? "Trung bình"
                                                                    : "Thấp"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={cx("task-status")}
                                                        style={{ backgroundColor: getStatusColor(task.status) }}
                                                    >
                                                        <FontAwesomeIcon icon={getStatusIcon(task.status)} />
                                                        {getStatusText(task.status)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Partners */}
                    <div className={cx("section")}>
                        <div className={cx("section-header")} onClick={() => toggleSection("partners")}>
                            <h3>Thông tin đối tác</h3>
                            <FontAwesomeIcon icon={expandedSections.partners ? faChevronUp : faChevronDown} />
                        </div>
                        {expandedSections.partners && (
                            <div className={cx("section-content")}>
                                {partners.map((partner) => (
                                    <div key={partner.id} className={cx("partner")}>
                                        <div className={cx("partner-info")}>
                                            <h4>{partner.name}</h4>
                                            <p>{partner.role}</p>
                                            <div className={cx("partner-contact")}>
                                                <span>📞 {partner.contact}</span>
                                                <span>✉️ {partner.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Attachments */}
                    <div className={cx("section")}>
                        <div className={cx("section-header")} onClick={() => toggleSection("attachments")}>
                            <h3>Tài liệu đính kèm</h3>
                            <FontAwesomeIcon icon={expandedSections.attachments ? faChevronUp : faChevronDown} />
                        </div>
                        {expandedSections.attachments && (
                            <div className={cx("section-content")}>
                                <div className={cx("upload-area")}>
                                    <FontAwesomeIcon icon={faCloudUploadAlt} />
                                    <p>Kéo thả file vào đây hoặc click để chọn file</p>
                                    <span>Tối đa 20 MB</span>
                                </div>
                                <div className={cx("attachments-list")}>
                                    {attachments.map((attachment) => (
                                        <div key={attachment.id} className={cx("attachment")}>
                                            <div className={cx("attachment-info")}>
                                                <FontAwesomeIcon icon={faFileContract} />
                                                <div>
                                                    <h5>{attachment.name}</h5>
                                                    <p>
                                                        {attachment.type} • {attachment.size} • {attachment.uploadDate}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={cx("attachment-actions")}>
                                                <button className={cx("action-btn")}>
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>
                                                <button className={cx("action-btn")}>
                                                    <FontAwesomeIcon icon={faDownload} />
                                                </button>
                                                <button className={cx("action-btn", "delete")}>
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Activity */}
                    <div className={cx("section")}>
                        <div className={cx("section-header")}>
                            <h3>Hoạt động</h3>
                        </div>
                        <div className={cx("section-content")}>
                            <div className={cx("activity-input")}>
                                <textarea
                                    placeholder="Thêm bình luận..."
                                    rows={3}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <button className={cx("submit-comment")} onClick={handleSubmitComment}>
                                    Gửi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={cx("sidebar")}>
                    {/* Details */}
                    <div className={cx("sidebar-section")}>
                        <h4>Chi tiết</h4>
                        <div className={cx("detail-list")}>
                            <div className={cx("detail-row")}>
                                <span>Trạng thái</span>
                                <div className={cx("status-badge", "small")} style={{ backgroundColor: getStatusColor(contract.status) }}>
                                    {getStatusText(contract.status)}
                                </div>
                            </div>
                            <div className={cx("detail-row")}>
                                <span>Người phụ trách</span>
                                <span className={cx("assignee")}>{contract.owner}</span>
                            </div>
                            <div className={cx("detail-row")}>
                                <span>Khách hàng</span>
                                <span>{contract.client}</span>
                            </div>
                            <div className={cx("detail-row")}>
                                <span>Giai đoạn</span>
                                <span>
                                    {milestones.filter((m) => m.status === "completed").length} / {milestones.length} hoàn thành
                                </span>
                            </div>
                            <div className={cx("detail-row")}>
                                <span>Tài liệu</span>
                                <span>{attachments.length} files</span>
                            </div>
                        </div>
                    </div>

                    {/* Contract Review */}
                    <div className={cx("sidebar-section")}>
                        <h4>Đánh giá hợp đồng</h4>
                        <p className={cx("review-text")}>
                            Đảm bảo tất cả giai đoạn được hoàn thành đúng tiến độ và chất lượng trước khi submit để review.
                        </p>
                        <button className={cx("submit-review")}>Submit để đánh giá</button>
                    </div>

                    {/* Quick Actions */}
                    <div className={cx("sidebar-section")}>
                        <h4>Hành động nhanh</h4>
                        <div className={cx("quick-actions")}>
                            <button className={cx("quick-action")}>
                                <FontAwesomeIcon icon={faPlus} />
                                Thêm giai đoạn
                            </button>
                            <button className={cx("quick-action")}>
                                <FontAwesomeIcon icon={faCloudUploadAlt} />
                                Upload tài liệu
                            </button>
                            <button className={cx("quick-action")}>
                                <FontAwesomeIcon icon={faUser} />
                                Thêm đối tác
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractDetail;
