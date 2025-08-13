"use client";

import type React from "react";
import { useState } from "react";
import classNames from "classnames/bind";
import styles from "../SidebarRight.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlag, faChevronUp, faChevronDown, faPlus, faCheck, faTrash, faClock, faUser, faEdit } from "@fortawesome/free-solid-svg-icons";
import type { Milestone, Task } from "~/types/milestones";
import { milestoneTypes, priorityOptions, defaultNotificationDays } from "~/types/milestones";
import SidebarDropdown from "../../../Dropdown/Dropdown";

const cx = classNames.bind(styles);

interface MilestonesSectionProps {
    isExpanded: boolean;
    onToggle: () => void;
    milestones: Milestone[];
    tasks: Task[];
    addMilestone: (milestone: Omit<Milestone, "id">) => void;
    updateMilestone: (id: number, updates: Partial<Milestone>) => void;
    removeMilestone: (id: number) => void;
    getTasksForMilestone: (milestoneId: number) => Task[];
    currentUser: string;
}

const MilestonesSection: React.FC<MilestonesSectionProps> = ({
    isExpanded,
    onToggle,
    milestones,
    addMilestone,
    updateMilestone,
    removeMilestone,
    getTasksForMilestone,
    currentUser,
}) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState<number | null>(null);
    const [newMilestone, setNewMilestone] = useState({
        title: "",
        description: "",
        type: "custom" as Milestone["type"],
        dueDate: "",
        priority: "medium" as Milestone["priority"],
        assignee: currentUser,
        notificationDays: defaultNotificationDays.milestone,
    });

    const handleAddMilestone = () => {
        if (newMilestone.title.trim() && newMilestone.dueDate) {
            addMilestone({
                ...newMilestone,
                dueDate: new Date(newMilestone.dueDate),
                status: "pending",
                tasks: [],
            });
            setNewMilestone({
                title: "",
                description: "",
                type: "custom",
                dueDate: "",
                priority: "medium",
                assignee: currentUser,
                notificationDays: defaultNotificationDays.milestone,
            });
            setShowAddForm(false);
        }
    };

    const toggleMilestoneStatus = (id: number) => {
        const milestone = milestones.find((m) => m.id === id);
        if (milestone) {
            const newStatus = milestone.status === "completed" ? "pending" : "completed";
            updateMilestone(id, {
                status: newStatus,
                completedAt: newStatus === "completed" ? new Date() : undefined,
            });
        }
    };

    const getMilestoneTypeInfo = (type: string) => {
        return milestoneTypes.find((t) => t.value === type) || milestoneTypes[milestoneTypes.length - 1];
    };

    const getPriorityInfo = (priority: string) => {
        return priorityOptions.find((p) => p.value === priority) || priorityOptions[1];
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("vi-VN");
    };

    const getDaysUntilDue = (dueDate: Date) => {
        const now = new Date();
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "#27ae60";
            case "in_progress":
                return "#f39c12";
            case "overdue":
                return "#e74c3c";
            default:
                return "#95a5a6";
        }
    };

    return (
        <div className={cx("section")}>
            <div className={cx("header_right")} onClick={onToggle}>
                <div className={cx("header_right-layer")}>
                    <h4>
                        <FontAwesomeIcon icon={faFlag} /> Mốc thời gian
                    </h4>
                    <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                </div>
                <p className={cx("subtext")}>Quản lý các mốc quan trọng trong hợp đồng</p>
            </div>

            {isExpanded && (
                <div className={cx("section-content")}>
                    <div className={cx("section-actions")}>
                        <button className={cx("add-milestone-btn")} onClick={() => setShowAddForm(!showAddForm)}>
                            <FontAwesomeIcon icon={faPlus} />
                            Thêm mốc thời gian
                        </button>
                    </div>

                    {showAddForm && (
                        <div className={cx("milestone-form")}>
                            <div className={cx("field")}>
                                <label>Tên mốc thời gian</label>
                                <input
                                    type="text"
                                    value={newMilestone.title}
                                    onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                                    placeholder="Ví dụ: Thanh toán đợt 1, Nghiệm thu sản phẩm..."
                                />
                            </div>

                            <div className={cx("field")}>
                                <label>Mô tả</label>
                                <textarea
                                    value={newMilestone.description}
                                    onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                                    rows={2}
                                    placeholder="Mô tả chi tiết về mốc thời gian này..."
                                />
                            </div>

                            <div className={cx("field-row")}>
                                <div className={cx("field")}>
                                    <label>Loại mốc</label>
                                    <SidebarDropdown
                                        options={milestoneTypes.map((type) => ({
                                            value: type.value,
                                            label: type.label,
                                            icon: type.icon,
                                        }))}
                                        value={newMilestone.type}
                                        onChange={(value) => setNewMilestone({ ...newMilestone, type: value as Milestone["type"] })}
                                    />
                                </div>
                                <div className={cx("field")}>
                                    <label>Độ ưu tiên</label>
                                    <SidebarDropdown
                                        options={priorityOptions.map((priority) => ({
                                            value: priority.value,
                                            label: priority.label,
                                            icon: "🔥",
                                        }))}
                                        value={newMilestone.priority}
                                        onChange={(value) => setNewMilestone({ ...newMilestone, priority: value as Milestone["priority"] })}
                                    />
                                </div>
                            </div>

                            <div className={cx("field-row")}>
                                <div className={cx("field")}>
                                    <label>Ngày đến hạn</label>
                                    <input
                                        type="date"
                                        value={newMilestone.dueDate}
                                        onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                                    />
                                </div>
                                <div className={cx("field")}>
                                    <label>Người phụ trách</label>
                                    <input
                                        type="text"
                                        value={newMilestone.assignee}
                                        onChange={(e) => setNewMilestone({ ...newMilestone, assignee: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className={cx("form-actions")}>
                                <button className={cx("save-btn")} onClick={handleAddMilestone}>
                                    <FontAwesomeIcon icon={faCheck} />
                                    Lưu mốc thời gian
                                </button>
                                <button className={cx("cancel-btn")} onClick={() => setShowAddForm(false)}>
                                    Hủy
                                </button>
                            </div>
                        </div>
                    )}

                    {milestones.length > 0 && (
                        <div className={cx("milestones-list")}>
                            <p className={cx("label")}>Danh sách mốc thời gian ({milestones.length})</p>

                            {milestones.map((milestone) => {
                                const typeInfo = getMilestoneTypeInfo(milestone.type);
                                const priorityInfo = getPriorityInfo(milestone.priority);
                                const tasksForMilestone = getTasksForMilestone(milestone.id);
                                const daysUntilDue = getDaysUntilDue(milestone.dueDate);
                                const isOverdue = daysUntilDue < 0 && milestone.status !== "completed";

                                return (
                                    <div
                                        key={milestone.id}
                                        className={cx("milestone-item", {
                                            completed: milestone.status === "completed",
                                            overdue: isOverdue,
                                        })}
                                    >
                                        <div className={cx("milestone-header")}>
                                            <div className={cx("milestone-main")}>
                                                <span
                                                    className={cx("milestone-checkbox")}
                                                    onClick={() => toggleMilestoneStatus(milestone.id)}
                                                >
                                                    {milestone.status === "completed" && <FontAwesomeIcon icon={faCheck} />}
                                                </span>

                                                <div className={cx("milestone-info")}>
                                                    <div className={cx("milestone-title")}>
                                                        <span className={cx("milestone-icon")} style={{ color: typeInfo.color }}>
                                                            {typeInfo.icon}
                                                        </span>
                                                        <span className={cx("title-text")}>{milestone.title}</span>
                                                        <span
                                                            className={cx("priority-badge")}
                                                            style={{ backgroundColor: priorityInfo.color }}
                                                        >
                                                            {priorityInfo.label}
                                                        </span>
                                                    </div>

                                                    {milestone.description && (
                                                        <div className={cx("milestone-description")}>{milestone.description}</div>
                                                    )}

                                                    <div className={cx("milestone-meta")}>
                                                        <span className={cx("due-date")}>
                                                            <FontAwesomeIcon icon={faClock} />
                                                            {formatDate(milestone.dueDate)}
                                                            {daysUntilDue >= 0 ? (
                                                                <span className={cx("days-left", { urgent: daysUntilDue <= 3 })}>
                                                                    (còn {daysUntilDue} ngày)
                                                                </span>
                                                            ) : (
                                                                <span className={cx("overdue-text")}>
                                                                    (quá hạn {Math.abs(daysUntilDue)} ngày)
                                                                </span>
                                                            )}
                                                        </span>

                                                        <span className={cx("assignee")}>
                                                            <FontAwesomeIcon icon={faUser} />
                                                            {milestone.assignee.split(" - ")[0]}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={cx("milestone-actions")}>
                                                <FontAwesomeIcon
                                                    icon={faEdit}
                                                    className={cx("edit-icon")}
                                                    onClick={() => setEditingMilestone(milestone.id)}
                                                />
                                                <FontAwesomeIcon
                                                    icon={faTrash}
                                                    className={cx("trash")}
                                                    onClick={() => removeMilestone(milestone.id)}
                                                />
                                            </div>
                                        </div>

                                        {tasksForMilestone.length > 0 && (
                                            <div className={cx("milestone-tasks")}>
                                                <p className={cx("tasks-label")}>Công việc liên quan ({tasksForMilestone.length})</p>
                                                <ul className={cx("tasks-list")}>
                                                    {tasksForMilestone.map((task) => (
                                                        <li
                                                            key={task.id}
                                                            className={cx("task-item-mini", { completed: task.status === "completed" })}
                                                        >
                                                            <span className={cx("task-title")}>{task.title}</span>
                                                            <span className={cx("task-assignee")}>{task.assignee.split(" - ")[0]}</span>
                                                            <span className={cx("task-due")}>{formatDate(task.dueDate)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MilestonesSection;
