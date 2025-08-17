"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlag, faClock, faUser, faEdit, faTrash, faTasks, faChartLine, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { MILESTONE_TYPES, PRIORITY_OPTIONS, STATUS_OPTIONS } from "~/constants/milestone.constants";
import { formatDateTime, getDaysUntilDue, calculateMilestoneProgress } from "~/utils/milestone.utils";
import type { Milestone } from "~/types/milestones";
import classNames from "classnames/bind";
import styles from "./milestone-timeline.module.scss";

const cx = classNames.bind(styles);

interface MilestoneTimelineProps {
    milestones: Milestone[];
    onEditMilestone: (milestone: Milestone) => void;
    onDeleteMilestone: (id: number) => void;
    onUpdateStatus: (id: number, status: string) => void;
}

export const MilestoneTimeline = ({ milestones, onEditMilestone, onDeleteMilestone, onUpdateStatus }: MilestoneTimelineProps) => {
    if (milestones.length === 0) {
        return (
            <div className={cx("empty-timeline")}>
                <FontAwesomeIcon icon={faFlag} />
                <h3>Chưa có mốc thời gian nào</h3>
                <p>Hãy tạo mốc thời gian đầu tiên để bắt đầu quản lý tiến độ hợp đồng</p>
            </div>
        );
    }

    const sortedMilestones = [...milestones].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    return (
        <div className={cx("timeline-container")}>
            <div className={cx("timeline-header")}>
                <FontAwesomeIcon icon={faFlag} />
                <h3>Timeline các mốc thời gian</h3>
                <span className={cx("milestone-count")}>{milestones.length} mốc</span>
            </div>

            <div className={cx("timeline-content")}>
                {sortedMilestones.map((milestone, index) => {
                    const daysUntilDue = getDaysUntilDue(milestone.dueDate);
                    const typeInfo = MILESTONE_TYPES.find((t) => t.value === milestone.type);
                    const priorityInfo = PRIORITY_OPTIONS.find((p) => p.value === milestone.priority);
                    const statusInfo = STATUS_OPTIONS.find((s) => s.value === milestone.status);
                    const progress = calculateMilestoneProgress(milestone);
                    const isOverdue = daysUntilDue < 0 && milestone.status !== "completed";
                    const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0;

                    return (
                        <div key={milestone.id} className={cx("timeline-item")}>
                            <div
                                className={cx("timeline-marker", {
                                    completed: milestone.status === "completed",
                                    overdue: isOverdue,
                                    urgent: isUrgent,
                                })}
                            >
                                <span className={cx("marker-number")}>{index + 1}</span>
                                <span className={cx("marker-icon")}>{typeInfo?.icon}</span>
                            </div>

                            <div className={cx("timeline-content-item")}>
                                <div className={cx("milestone-header")}>
                                    <div className={cx("milestone-title-section")}>
                                        <h4 className={cx("milestone-title")}>{milestone.title}</h4>
                                        <div className={cx("milestone-badges")}>
                                            <span className={cx("priority-badge")} style={{ backgroundColor: priorityInfo?.color }}>
                                                {priorityInfo?.icon} {priorityInfo?.label}
                                            </span>
                                            <span className={cx("status-badge")} style={{ backgroundColor: statusInfo?.color }}>
                                                {statusInfo?.label}
                                            </span>
                                            <span className={cx("type-badge")}>
                                                {typeInfo?.icon} {typeInfo?.label}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={cx("milestone-actions")}>
                                        <button
                                            onClick={() => onEditMilestone(milestone)}
                                            className={cx("action-btn", "edit")}
                                            title="Chỉnh sửa"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            onClick={() => onDeleteMilestone(milestone.id)}
                                            className={cx("action-btn", "delete")}
                                            title="Xóa"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </div>

                                {milestone.description && <p className={cx("milestone-description")}>{milestone.description}</p>}

                                <div className={cx("milestone-meta")}>
                                    <div className={cx("meta-item")}>
                                        <FontAwesomeIcon icon={faClock} />
                                        <span>Hạn: {formatDateTime(milestone.dueDate)}</span>
                                        <span
                                            className={cx("days-left", {
                                                urgent: isUrgent,
                                                overdue: isOverdue,
                                            })}
                                        >
                                            {isOverdue ? (
                                                <>
                                                    <FontAwesomeIcon icon={faExclamationTriangle} />
                                                    Quá hạn {Math.abs(daysUntilDue)} ngày
                                                </>
                                            ) : (
                                                `Còn ${daysUntilDue} ngày`
                                            )}
                                        </span>
                                    </div>

                                    <div className={cx("meta-item")}>
                                        <FontAwesomeIcon icon={faUser} />
                                        <span>Phụ trách: {milestone.assignee}</span>
                                    </div>

                                    {milestone.estimatedHours && (
                                        <div className={cx("meta-item")}>
                                            <FontAwesomeIcon icon={faClock} />
                                            <span>Ước tính: {milestone.estimatedHours}h</span>
                                            {milestone.actualHours && <span>/ Thực tế: {milestone.actualHours}h</span>}
                                        </div>
                                    )}
                                </div>

                                {milestone.deliverables && milestone.deliverables.length > 0 && (
                                    <div className={cx("deliverables-section")}>
                                        <h5>📦 Sản phẩm bàn giao:</h5>
                                        <ul className={cx("deliverables-list")}>
                                            {milestone.deliverables.map((deliverable, idx) => (
                                                <li key={idx}>{deliverable}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {milestone.tasks.length > 0 && (
                                    <div className={cx("tasks-section")}>
                                        <div className={cx("tasks-header")}>
                                            <FontAwesomeIcon icon={faTasks} />
                                            <h5>Công việc trong giai đoạn ({milestone.tasks.length})</h5>
                                        </div>
                                        <div className={cx("tasks-list")}>
                                            {milestone.tasks.slice(0, 3).map((task) => (
                                                <div key={task.id} className={cx("task-item-mini")}>
                                                    <span className={cx("task-title")}>{task.title}</span>
                                                    <span className={cx("task-assignee")}>- {task.assignee}</span>
                                                    <span className={cx("task-due")}>{formatDateTime(task.dueDate)}</span>
                                                </div>
                                            ))}
                                            {milestone.tasks.length > 3 && (
                                                <div className={cx("more-tasks")}>+{milestone.tasks.length - 3} công việc khác</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className={cx("progress-section")}>
                                    <div className={cx("progress-header")}>
                                        <FontAwesomeIcon icon={faChartLine} />
                                        <span>Tiến độ hoàn thành</span>
                                        <span className={cx("progress-percentage")}>{progress}%</span>
                                    </div>
                                    <div className={cx("progress-bar")}>
                                        <div
                                            className={cx("progress-fill", {
                                                completed: progress === 100,
                                                warning: progress < 50 && isUrgent,
                                                danger: progress < 30 && isOverdue,
                                            })}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className={cx("progress-details")}>
                                        <span>
                                            {milestone.tasks.filter((t) => t.status === "completed").length} / {milestone.tasks.length} công
                                            việc
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
