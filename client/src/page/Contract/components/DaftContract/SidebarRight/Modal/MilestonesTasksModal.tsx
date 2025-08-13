"use client";

import type React from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faProjectDiagram,
    faPlus,
    faCheck,
    faTrash,
    faClock,
    faUser,
    faEdit,
    faChevronDown,
    faChevronRight,
    faFlag,
    faTasks,
    faCalendarAlt,
    faChartLine,
    faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import BaseModal from "./BaseModal";
import SidebarDropdown from "../../../Dropdown/Dropdown";
import DatePicker from "../../../../../../components/DateRangePicker/DatePicker/DatePicker";
import classNames from "classnames/bind";
import styles from "./MilestonesTasksModal.module.scss";
import type { Milestone, Task } from "~/types/contract/contract.types";

const cx = classNames.bind(styles);

interface MilestonesTasksModalProps {
    isOpen: boolean;
    onClose: () => void;
    milestones: Milestone[];
    tasks: Task[];
    addMilestone: (milestone: Omit<Milestone, "id">) => void;
    updateMilestone: (id: number, updates: Partial<Milestone>) => void;
    removeMilestone: (id: number) => void;
    addTask: (task: Omit<Task, "id"> & { milestoneId: number }) => void;
    updateTask: (id: number, updates: Partial<Task>) => void;
    removeTask: (id: number) => void;
    getTasksForMilestone: (milestoneId: number) => Task[];
    currentUser: string;
}

const MilestonesTasksModal: React.FC<MilestonesTasksModalProps> = ({
    isOpen,
    onClose,
    milestones,
    tasks,
    addMilestone,
    updateMilestone,
    removeMilestone,
    addTask,
    updateTask,
    removeTask,
    getTasksForMilestone,
    currentUser,
}) => {
    const [activeTab, setActiveTab] = useState<"milestone" | "task">("milestone");
    const [expandedMilestones, setExpandedMilestones] = useState<Set<number>>(new Set(milestones.map((m) => m.id)));

    // DatePicker states
    const [showMilestoneDatePicker, setShowMilestoneDatePicker] = useState(false);
    const [showTaskDatePicker, setShowTaskDatePicker] = useState(false);

    // Get today's date as default start date
    const getTodayStart = () => {
        const today = new Date();
        today.setHours(9, 0, 0, 0); // Default start time 9:00 AM
        return today;
    };

    const [newMilestone, setNewMilestone] = useState({
        title: "",
        description: "",
        type: "custom" as Milestone["type"],
        startDate: new Date(), // Mặc định hôm nay
        endDate: null as Date | null, // Chỉ chọn ngày kết thúc
        priority: "medium" as Milestone["priority"],
        assignee: currentUser,
        notificationDays: defaultNotificationDays.milestone,
    });

    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        assignee: currentUser,
        startDate: new Date(), // Mặc định hôm nay
        endDate: null as Date | null, // Chỉ chọn ngày kết thúc
        priority: "medium" as Task["priority"],
        milestoneId: milestones[0]?.id || 0,
        estimatedHours: "",
        notificationDays: defaultNotificationDays.task,
    });

    const handleAddMilestone = () => {
        if (newMilestone.title.trim() && newMilestone.endDate) {
            addMilestone({
                ...newMilestone,
                dueDate: newMilestone.endDate, // Sử dụng endDate làm dueDate
                status: "pending",
                tasks: [],
            });
            setNewMilestone({
                title: "",
                description: "",
                type: "custom",
                startDate: new Date(), // Reset về hôm nay
                endDate: null,
                priority: "medium",
                assignee: currentUser,
                notificationDays: defaultNotificationDays.milestone,
            });
        }
    };

    const handleAddTask = () => {
        if (newTask.title.trim() && newTask.endDate && newTask.milestoneId) {
            addTask({
                ...newTask,
                milestoneId: newTask.milestoneId,
                dueDate: newTask.endDate, // Sử dụng endDate làm dueDate
                status: "pending",
                estimatedHours: newTask.estimatedHours ? Number(newTask.estimatedHours) : undefined,
            });
            setNewTask({
                title: "",
                description: "",
                assignee: currentUser,
                startDate: new Date(), // Reset về hôm nay
                endDate: null,
                priority: "medium",
                milestoneId: milestones[0]?.id || 0,
                estimatedHours: "",
                notificationDays: defaultNotificationDays.task,
            });
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

    const toggleMilestoneExpansion = (milestoneId: number) => {
        setExpandedMilestones((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(milestoneId)) {
                newSet.delete(milestoneId);
            } else {
                newSet.add(milestoneId);
            }
            return newSet;
        });
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

    const formatDateTime = (date: Date | null) => {
        if (!date) return "";
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        const hour = date.getHours().toString().padStart(2, "0");
        const minute = date.getMinutes().toString().padStart(2, "0");

        // Nếu có thời gian cụ thể (không phải 00:00)
        if (date.getHours() !== 0 || date.getMinutes() !== 0) {
            return `${day}.${month}.${year} ${hour}:${minute}`;
        }
        return `${day}.${month}.${year}`;
    };

    const formatDateTimeRange = (startDate: Date | null, endDate: Date | null) => {
        if (!startDate || !endDate) return "Chọn ngày";

        const formatSingle = (date: Date) => {
            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const year = date.getFullYear();
            return `${day}.${month}.${year}`;
        };

        return `${formatSingle(startDate)} - ${formatSingle(endDate)}`;
    };

    const getDaysUntilDue = (dueDate: Date) => {
        const now = new Date();
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getMilestoneProgress = (milestoneId: number) => {
        const milestoneTasks = getTasksForMilestone(milestoneId);
        if (milestoneTasks.length === 0) return 0;
        const completedTasks = milestoneTasks.filter((task) => task.status === "completed").length;
        return Math.round((completedTasks / milestoneTasks.length) * 100);
    };

    const getTotalProgress = () => {
        const totalTasks = tasks.length;
        if (totalTasks === 0) return 0;
        const completedTasks = tasks.filter((task) => task.status === "completed").length;
        return Math.round((completedTasks / totalTasks) * 100);
    };

    const getOverallStats = () => {
        const totalMilestones = milestones.length;
        const completedMilestones = milestones.filter((m) => m.status === "completed").length;
        const overdueMilestones = milestones.filter((m) => {
            const now = new Date();
            return m.dueDate < now && m.status !== "completed";
        }).length;

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.status === "completed").length;
        const overdueTasks = tasks.filter((t) => {
            const now = new Date();
            return t.dueDate < now && t.status !== "completed";
        }).length;

        return {
            milestones: { total: totalMilestones, completed: completedMilestones, overdue: overdueMilestones },
            tasks: { total: totalTasks, completed: completedTasks, overdue: overdueTasks },
        };
    };

    const stats = getOverallStats();

    // Milestone options for task dropdown
    const milestoneOptions = milestones.map((milestone) => ({
        value: milestone.id.toString(),
        label: milestone.title,
        icon: getMilestoneTypeInfo(milestone.type).icon,
    }));

    // Handle milestone date selection - DatePicker will be used to select end date only
    const handleMilestoneDateChange = (startDate: Date | null, endDate: Date | null) => {
        setNewMilestone({ ...newMilestone, endDate: startDate }); // Sử dụng startDate từ picker làm endDate
    };

    // Handle task date selection - DatePicker will be used to select end date only
    const handleTaskDateChange = (startDate: Date | null, endDate: Date | null) => {
        setNewTask({ ...newTask, endDate: startDate }); // Sử dụng startDate từ picker làm endDate
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Quản lý mốc thời gian & công việc"
            icon={<FontAwesomeIcon icon={faProjectDiagram} />}
            size="full-screen"
        >
            <div className={cx("modal-layout")}>
                {/* Left Panel - Overview */}
                <div className={cx("left-panel")}>
                    <div className={cx("panel-header")}>
                        <h3>
                            <FontAwesomeIcon icon={faChartLine} />
                            Tổng quan tiến độ
                        </h3>

                        {/* Stats Cards */}
                        <div className={cx("stats-grid")}>
                            <div className={cx("stat-card", "milestones")}>
                                <div className={cx("stat-icon")}>
                                    <FontAwesomeIcon icon={faFlag} />
                                </div>
                                <div className={cx("stat-content")}>
                                    <div className={cx("stat-number")}>{stats.milestones.total}</div>
                                    <div className={cx("stat-label")}>Mốc thời gian</div>
                                    <div className={cx("stat-detail")}>
                                        {stats.milestones.completed} hoàn thành
                                        {stats.milestones.overdue > 0 && (
                                            <span className={cx("overdue")}> • {stats.milestones.overdue} quá hạn</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={cx("stat-card", "tasks")}>
                                <div className={cx("stat-icon")}>
                                    <FontAwesomeIcon icon={faTasks} />
                                </div>
                                <div className={cx("stat-content")}>
                                    <div className={cx("stat-number")}>{stats.tasks.total}</div>
                                    <div className={cx("stat-label")}>Công việc</div>
                                    <div className={cx("stat-detail")}>
                                        {stats.tasks.completed} hoàn thành
                                        {stats.tasks.overdue > 0 && <span className={cx("overdue")}> • {stats.tasks.overdue} quá hạn</span>}
                                    </div>
                                </div>
                            </div>

                            <div className={cx("stat-card", "progress")}>
                                <div className={cx("stat-icon")}>
                                    <FontAwesomeIcon icon={faCheck} />
                                </div>
                                <div className={cx("stat-content")}>
                                    <div className={cx("stat-number")}>{getTotalProgress()}%</div>
                                    <div className={cx("stat-label")}>Tiến độ tổng</div>
                                    <div className={cx("progress-bar")}>
                                        <div className={cx("progress-fill")} style={{ width: `${getTotalProgress()}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Milestones Timeline */}
                    <div className={cx("timeline-section")}>
                        <h4>
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            Timeline các giai đoạn
                        </h4>

                        <div className={cx("timeline-container")}>
                            {milestones.length > 0 ? (
                                milestones
                                    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                                    .map((milestone) => {
                                        const typeInfo = getMilestoneTypeInfo(milestone.type);
                                        const priorityInfo = getPriorityInfo(milestone.priority);
                                        const milestoneTasks = getTasksForMilestone(milestone.id);
                                        const daysUntilDue = getDaysUntilDue(milestone.dueDate);
                                        const isOverdue = daysUntilDue < 0 && milestone.status !== "completed";
                                        const isExpanded = expandedMilestones.has(milestone.id);
                                        const progress = getMilestoneProgress(milestone.id);

                                        return (
                                            <div
                                                key={milestone.id}
                                                className={cx("timeline-item", {
                                                    completed: milestone.status === "completed",
                                                    overdue: isOverdue,
                                                })}
                                            >
                                                <div className={cx("timeline-marker")} style={{ backgroundColor: typeInfo.color }}>
                                                    <span>{typeInfo.icon}</span>
                                                </div>

                                                <div className={cx("timeline-content")}>
                                                    <div className={cx("milestone-header")}>
                                                        <div className={cx("milestone-main")}>
                                                            <div className={cx("milestone-controls")}>
                                                                <span
                                                                    className={cx("milestone-checkbox")}
                                                                    onClick={() => toggleMilestoneStatus(milestone.id)}
                                                                >
                                                                    {milestone.status === "completed" && <FontAwesomeIcon icon={faCheck} />}
                                                                </span>
                                                                <button
                                                                    className={cx("expand-btn")}
                                                                    onClick={() => toggleMilestoneExpansion(milestone.id)}
                                                                >
                                                                    <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} />
                                                                </button>
                                                            </div>

                                                            <div className={cx("milestone-info")}>
                                                                <div className={cx("milestone-title")}>
                                                                    <span className={cx("title-text")}>{milestone.title}</span>
                                                                    <span
                                                                        className={cx("priority-badge")}
                                                                        style={{ backgroundColor: priorityInfo.color }}
                                                                    >
                                                                        {priorityInfo.label}
                                                                    </span>
                                                                    {milestoneTasks.length > 0 && (
                                                                        <span className={cx("task-count")}>
                                                                            {milestoneTasks.filter((t) => t.status === "completed").length}/
                                                                            {milestoneTasks.length} công việc
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {milestone.description && (
                                                                    <div className={cx("milestone-description")}>
                                                                        {milestone.description}
                                                                    </div>
                                                                )}

                                                                <div className={cx("milestone-meta")}>
                                                                    <span className={cx("due-date")}>
                                                                        <FontAwesomeIcon icon={faClock} />
                                                                        {formatDate(milestone.dueDate)}
                                                                        {daysUntilDue >= 0 ? (
                                                                            <span
                                                                                className={cx("days-left", { urgent: daysUntilDue <= 3 })}
                                                                            >
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

                                                                {/* Progress Bar */}
                                                                {milestoneTasks.length > 0 && (
                                                                    <div className={cx("progress-container")}>
                                                                        <div className={cx("progress-bar")}>
                                                                            <div
                                                                                className={cx("progress-fill")}
                                                                                style={{
                                                                                    width: `${progress}%`,
                                                                                    backgroundColor: typeInfo.color,
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <span className={cx("progress-text")}>{progress}%</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className={cx("milestone-actions")}>
                                                            <FontAwesomeIcon icon={faEdit} className={cx("edit-icon")} title="Chỉnh sửa" />
                                                            <FontAwesomeIcon
                                                                icon={faTrash}
                                                                className={cx("trash")}
                                                                onClick={() => removeMilestone(milestone.id)}
                                                                title="Xóa"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Tasks in Milestone */}
                                                    {isExpanded && milestoneTasks.length > 0 && (
                                                        <div className={cx("milestone-tasks")}>
                                                            <h5>Công việc trong giai đoạn này</h5>
                                                            <div className={cx("tasks-list")}>
                                                                {milestoneTasks.map((task) => {
                                                                    const taskPriorityInfo = getPriorityInfo(task.priority);
                                                                    const taskDaysUntilDue = getDaysUntilDue(task.dueDate);
                                                                    const isTaskOverdue =
                                                                        taskDaysUntilDue < 0 && task.status !== "completed";

                                                                    return (
                                                                        <div
                                                                            key={task.id}
                                                                            className={cx("task-item-mini", {
                                                                                completed: task.status === "completed",
                                                                                overdue: isTaskOverdue,
                                                                            })}
                                                                        >
                                                                            <span
                                                                                className={cx("task-checkbox")}
                                                                                onClick={() => toggleTaskStatus(task.id)}
                                                                            >
                                                                                {task.status === "completed" && (
                                                                                    <FontAwesomeIcon icon={faCheck} />
                                                                                )}
                                                                            </span>

                                                                            <div className={cx("task-info")}>
                                                                                <div className={cx("task-title")}>
                                                                                    <span className={cx("title-text")}>{task.title}</span>
                                                                                    <span
                                                                                        className={cx("priority-badge")}
                                                                                        style={{ backgroundColor: taskPriorityInfo.color }}
                                                                                    >
                                                                                        {taskPriorityInfo.label}
                                                                                    </span>
                                                                                </div>

                                                                                <div className={cx("task-meta")}>
                                                                                    <span className={cx("assignee")}>
                                                                                        <FontAwesomeIcon icon={faUser} />
                                                                                        {task.assignee.split(" - ")[0]}
                                                                                    </span>

                                                                                    <span className={cx("due-date")}>
                                                                                        <FontAwesomeIcon icon={faClock} />
                                                                                        {formatDate(task.dueDate)}
                                                                                        {taskDaysUntilDue >= 0 ? (
                                                                                            <span
                                                                                                className={cx("days-left", {
                                                                                                    urgent: taskDaysUntilDue <= 1,
                                                                                                })}
                                                                                            >
                                                                                                (còn {taskDaysUntilDue} ngày)
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span className={cx("overdue-text")}>
                                                                                                (quá hạn {Math.abs(taskDaysUntilDue)} ngày)
                                                                                            </span>
                                                                                        )}
                                                                                    </span>

                                                                                    {task.estimatedHours && (
                                                                                        <span className={cx("estimated-hours")}>
                                                                                            ⏱️ {task.estimatedHours}h
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            <FontAwesomeIcon
                                                                                icon={faTrash}
                                                                                className={cx("trash")}
                                                                                onClick={() => removeTask(task.id)}
                                                                                title="Xóa"
                                                                            />
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                            ) : (
                                <div className={cx("empty-timeline")}>
                                    <FontAwesomeIcon icon={faCalendarAlt} />
                                    <p>Chưa có mốc thời gian nào được thiết lập</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Creation Forms */}
                <div className={cx("right-panel")}>
                    <div className={cx("panel-header")}>
                        <h3>
                            <FontAwesomeIcon icon={faPlus} />
                            Tạo mới
                        </h3>

                        {/* Tab Navigation */}
                        <div className={cx("tab-navigation")}>
                            <button
                                className={cx("tab-btn", { active: activeTab === "milestone" })}
                                onClick={() => setActiveTab("milestone")}
                            >
                                <FontAwesomeIcon icon={faFlag} />
                                Mốc thời gian
                            </button>
                            <button className={cx("tab-btn", { active: activeTab === "task" })} onClick={() => setActiveTab("task")}>
                                <FontAwesomeIcon icon={faTasks} />
                                Công việc
                            </button>
                        </div>
                    </div>

                    <div className={cx("form-container")}>
                        {activeTab === "milestone" ? (
                            /* Milestone Form */
                            <div className={cx("milestone-form")}>
                                <h4>
                                    <FontAwesomeIcon icon={faFlag} />
                                    Thêm mốc thời gian mới
                                </h4>

                                <div className={cx("form-grid")}>
                                    <div className={cx("field", "full-width")}>
                                        <label>Tên mốc thời gian</label>
                                        <input
                                            type="text"
                                            value={newMilestone.title}
                                            onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                                            placeholder="Ví dụ: Giai đoạn 1 - Ký kết hợp đồng"
                                        />
                                    </div>

                                    <div className={cx("field", "full-width")}>
                                        <label>Mô tả giai đoạn</label>
                                        <textarea
                                            value={newMilestone.description}
                                            onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                                            rows={3}
                                            placeholder="Mô tả chi tiết về giai đoạn này..."
                                        />
                                    </div>

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
                                            onChange={(value) =>
                                                setNewMilestone({ ...newMilestone, priority: value as Milestone["priority"] })
                                            }
                                        />
                                    </div>

                                    <div className={cx("field", "full-width")}>
                                        <label>Thời hạn hoàn thành</label>
                                        <div className={cx("date-picker-trigger")} onClick={() => setShowMilestoneDatePicker(true)}>
                                            <FontAwesomeIcon icon={faCalendar} />
                                            <span>{formatDateTimeRange(newMilestone.startDate, newMilestone.endDate)}</span>
                                        </div>
                                    </div>

                                    <div className={cx("field", "full-width")}>
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
                                        Tạo mốc thời gian
                                    </button>
                                    <button
                                        className={cx("reset-btn")}
                                        onClick={() =>
                                            setNewMilestone({
                                                title: "",
                                                description: "",
                                                type: "custom",
                                                startDate: new Date(),
                                                endDate: null,
                                                priority: "medium",
                                                assignee: currentUser,
                                                notificationDays: defaultNotificationDays.milestone,
                                            })
                                        }
                                    >
                                        Đặt lại
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Task Form */
                            <div className={cx("task-form")}>
                                <h4>
                                    <FontAwesomeIcon icon={faTasks} />
                                    Thêm công việc mới
                                </h4>

                                <div className={cx("form-grid")}>
                                    <div className={cx("field", "full-width")}>
                                        <label>Tên công việc</label>
                                        <input
                                            type="text"
                                            value={newTask.title}
                                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                            placeholder="Ví dụ: Chuẩn bị hồ sơ pháp lý"
                                        />
                                    </div>

                                    <div className={cx("field", "full-width")}>
                                        <label>Mô tả công việc</label>
                                        <textarea
                                            value={newTask.description}
                                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                            rows={3}
                                            placeholder="Mô tả chi tiết về công việc cần thực hiện..."
                                        />
                                    </div>

                                    <div className={cx("field", "full-width")}>
                                        <label>Thuộc mốc thời gian</label>
                                        <SidebarDropdown
                                            options={milestoneOptions}
                                            value={newTask.milestoneId.toString()}
                                            onChange={(value) => setNewTask({ ...newTask, milestoneId: Number(value) })}
                                            placeholder="Chọn mốc thời gian"
                                        />
                                    </div>

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

                                    <div className={cx("field", "full-width")}>
                                        <label>Thời hạn hoàn thành</label>
                                        <div className={cx("date-picker-trigger")} onClick={() => setShowTaskDatePicker(true)}>
                                            <FontAwesomeIcon icon={faCalendar} />
                                            <span>{formatDateTimeRange(newTask.startDate, newTask.endDate)}</span>
                                        </div>
                                    </div>

                                    <div className={cx("field")}>
                                        <label>Ước tính thời gian (giờ)</label>
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
                                        Tạo công việc
                                    </button>
                                    <button
                                        className={cx("reset-btn")}
                                        onClick={() =>
                                            setNewTask({
                                                title: "",
                                                description: "",
                                                assignee: currentUser,
                                                startDate: new Date(),
                                                endDate: null,
                                                priority: "medium",
                                                milestoneId: milestones[0]?.id || 0,
                                                estimatedHours: "",
                                                notificationDays: defaultNotificationDays.task,
                                            })
                                        }
                                    >
                                        Đặt lại
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* DatePicker Modals - For selecting end date only */}
            {showMilestoneDatePicker && (
                <DatePicker
                    startDate={newMilestone.endDate}
                    onDateChange={handleMilestoneDateChange}
                    onClose={() => setShowMilestoneDatePicker(false)}
                />
            )}

            {showTaskDatePicker && (
                <DatePicker startDate={newTask.endDate} onDateChange={handleTaskDateChange} onClose={() => setShowTaskDatePicker(false)} />
            )}
        </BaseModal>
    );
};

export default MilestonesTasksModal;
