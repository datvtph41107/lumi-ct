"use client";

import type React from "react";
import { useState } from "react";
import classNames from "classnames/bind";
import styles from "../SidebarRight.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTasks, faChevronUp, faChevronDown, faPlus, faCheck, faTrash, faClock, faUser, faFlag } from "@fortawesome/free-solid-svg-icons";
import type { Task, Milestone } from "~/types/milestones";
import { priorityOptions, defaultNotificationDays } from "~/types/milestones";
import SidebarDropdown from "../../../Dropdown/Dropdown";

const cx = classNames.bind(styles);

interface TasksSectionProps {
    isExpanded: boolean;
    onToggle: () => void;
    tasks: Task[];
    milestones: Milestone[];
    addTask: (task: Omit<Task, "id">) => void;
    updateTask: (id: number, updates: Partial<Task>) => void;
    removeTask: (id: number) => void;
    getIndependentTasks: () => Task[];
    currentUser: string;
}

const TasksSection: React.FC<TasksSectionProps> = ({
    isExpanded,
    onToggle,
    tasks,
    milestones,
    addTask,
    updateTask,
    removeTask,
    getIndependentTasks,
    currentUser,
}) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        assignee: currentUser,
        dueDate: "",
        priority: "medium" as Task["priority"],
        milestoneId: undefined as number | undefined,
        estimatedHours: "",
        notificationDays: defaultNotificationDays.task,
    });

    const handleAddTask = () => {
        if (newTask.title.trim() && newTask.dueDate) {
            addTask({
                ...newTask,
                dueDate: new Date(newTask.dueDate),
                status: "pending",
                estimatedHours: newTask.estimatedHours ? Number(newTask.estimatedHours) : undefined,
            });
            setNewTask({
                title: "",
                description: "",
                assignee: currentUser,
                dueDate: "",
                priority: "medium",
                milestoneId: undefined,
                estimatedHours: "",
                notificationDays: defaultNotificationDays.task,
            });
            setShowAddForm(false);
        }
    };

    const toggleTaskStatus = (id: number) => {
        const task = tasks.find((t) => t.id === id);
        if (task) {
            const newStatus = task.status === "completed" ? "pending" : "completed";
            updateTask(id, {
                status: newStatus,
                completedAt: newStatus === "completed" ? new Date() : undefined,
            });
        }
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

    const getMilestoneTitle = (milestoneId?: number) => {
        if (!milestoneId) return null;
        const milestone = milestones.find((m) => m.id === milestoneId);
        return milestone?.title;
    };

    const independentTasks = getIndependentTasks();

    // Milestone options for dropdown
    const milestoneOptions = [
        { value: "", label: "Không thuộc mốc nào", icon: "📋" },
        ...milestones.map((milestone) => ({
            value: milestone.id.toString(),
            label: milestone.title,
            icon: "🎯",
        })),
    ];

    return (
        <div className={cx("section")}>
            <div className={cx("header_right")} onClick={onToggle}>
                <div className={cx("header_right-layer")}>
                    <h4>
                        <FontAwesomeIcon icon={faTasks} /> Công việc
                    </h4>
                    <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                </div>
                <p className={cx("subtext")}>Quản lý công việc cụ thể và theo dõi tiến độ</p>
            </div>

            {isExpanded && (
                <div className={cx("section-content")}>
                    <div className={cx("section-actions")}>
                        <button className={cx("add-task-btn")} onClick={() => setShowAddForm(!showAddForm)}>
                            <FontAwesomeIcon icon={faPlus} />
                            Thêm công việc
                        </button>
                    </div>

                    {showAddForm && (
                        <div className={cx("task-form")}>
                            <div className={cx("field")}>
                                <label>Tên công việc</label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    placeholder="Ví dụ: Chuẩn bị hồ sơ pháp lý, Lên lịch họp..."
                                />
                            </div>

                            <div className={cx("field")}>
                                <label>Mô tả công việc</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    rows={2}
                                    placeholder="Mô tả chi tiết về công việc cần thực hiện..."
                                />
                            </div>

                            <div className={cx("field")}>
                                <label>Thuộc mốc thời gian</label>
                                <SidebarDropdown
                                    options={milestoneOptions}
                                    value={newTask.milestoneId?.toString() || ""}
                                    onChange={(value) =>
                                        setNewTask({
                                            ...newTask,
                                            milestoneId: value ? Number(value) : undefined,
                                        })
                                    }
                                />
                            </div>

                            <div className={cx("field-row")}>
                                <div className={cx("field")}>
                                    <label>Người thực hiện</label>
                                    <input
                                        type="text"
                                        value={newTask.assignee}
                                        onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
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
                                        value={newTask.priority}
                                        onChange={(value) => setNewTask({ ...newTask, priority: value as Task["priority"] })}
                                    />
                                </div>
                            </div>

                            <div className={cx("field-row")}>
                                <div className={cx("field")}>
                                    <label>Ngày đến hạn</label>
                                    <input
                                        type="date"
                                        value={newTask.dueDate}
                                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                    />
                                </div>
                                <div className={cx("field")}>
                                    <label>Ước tính (giờ)</label>
                                    <input
                                        type="number"
                                        value={newTask.estimatedHours}
                                        onChange={(e) => setNewTask({ ...newTask, estimatedHours: e.target.value })}
                                        placeholder="8"
                                        min="0"
                                        step="0.5"
                                    />
                                </div>
                            </div>

                            <div className={cx("form-actions")}>
                                <button className={cx("save-btn")} onClick={handleAddTask}>
                                    <FontAwesomeIcon icon={faCheck} />
                                    Lưu công việc
                                </button>
                                <button className={cx("cancel-btn")} onClick={() => setShowAddForm(false)}>
                                    Hủy
                                </button>
                            </div>
                        </div>
                    )}

                    {independentTasks.length > 0 && (
                        <div className={cx("tasks-list")}>
                            <p className={cx("label")}>Công việc độc lập ({independentTasks.length})</p>

                            {independentTasks.map((task) => {
                                const priorityInfo = getPriorityInfo(task.priority);
                                const daysUntilDue = getDaysUntilDue(task.dueDate);
                                const isOverdue = daysUntilDue < 0 && task.status !== "completed";
                                const milestoneTitle = getMilestoneTitle(task.milestoneId);

                                return (
                                    <div
                                        key={task.id}
                                        className={cx("task-item", {
                                            completed: task.status === "completed",
                                            overdue: isOverdue,
                                        })}
                                    >
                                        <div className={cx("task-header")}>
                                            <span className={cx("task-checkbox")} onClick={() => toggleTaskStatus(task.id)}>
                                                {task.status === "completed" && <FontAwesomeIcon icon={faCheck} />}
                                            </span>

                                            <div className={cx("task-info")}>
                                                <div className={cx("task-title")}>
                                                    <span className={cx("title-text")}>{task.title}</span>
                                                    <span className={cx("priority-badge")} style={{ backgroundColor: priorityInfo.color }}>
                                                        {priorityInfo.label}
                                                    </span>
                                                    {milestoneTitle && (
                                                        <span className={cx("milestone-badge")}>
                                                            <FontAwesomeIcon icon={faFlag} />
                                                            {milestoneTitle}
                                                        </span>
                                                    )}
                                                </div>

                                                {task.description && <div className={cx("task-description")}>{task.description}</div>}

                                                <div className={cx("task-meta")}>
                                                    <span className={cx("assignee")}>
                                                        <FontAwesomeIcon icon={faUser} />
                                                        {task.assignee.split(" - ")[0]}
                                                    </span>

                                                    <span className={cx("due-date")}>
                                                        <FontAwesomeIcon icon={faClock} />
                                                        {formatDate(task.dueDate)}
                                                        {daysUntilDue >= 0 ? (
                                                            <span className={cx("days-left", { urgent: daysUntilDue <= 1 })}>
                                                                (còn {daysUntilDue} ngày)
                                                            </span>
                                                        ) : (
                                                            <span className={cx("overdue-text")}>
                                                                (quá hạn {Math.abs(daysUntilDue)} ngày)
                                                            </span>
                                                        )}
                                                    </span>

                                                    {task.estimatedHours && (
                                                        <span className={cx("estimated-hours")}>⏱️ {task.estimatedHours}h</span>
                                                    )}
                                                </div>
                                            </div>

                                            <FontAwesomeIcon icon={faTrash} className={cx("trash")} onClick={() => removeTask(task.id)} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {tasks.length === 0 && (
                        <div className={cx("empty-state")}>
                            <p>Chưa có công việc nào được tạo</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TasksSection;
