import type React from "react";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "../../../../../../../components/DateRangePicker/DatePicker/DatePicker";
import Dropdown from "../../../../Dropdown/Dropdown";
import { PRIORITY_OPTIONS, EMPLOYEES, TASK_TAGS } from "~/constants/milestone.constants";
import type { Task, Milestone } from "~/types/milestone.types";
import classNames from "classnames/bind";
import styles from "./edit-task-modal.module.scss";

const cx = classNames.bind(styles);

interface EditTaskModalProps {
    task: Task;
    milestones: Milestone[];
    onSave: (updatedTask: Task) => void;
    onClose: () => void;
}

export const EditTaskModal = ({ task, milestones, onSave, onClose }: EditTaskModalProps) => {
    const [formData, setFormData] = useState({
        title: task.title,
        description: task.description,
        assignee: task.assignee,
        dueDate: task.dueDate,
        priority: task.priority,
        estimatedHours: task.estimatedHours,
        milestoneId: task.milestoneId,
        tags: task.tags || [],
    });

    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (startDate: Date | null, endDate: Date | null) => {
        if (startDate) {
            setFormData((prev) => ({ ...prev, dueDate: startDate }));
        }
        setShowDatePicker(false);
    };

    const handleTagToggle = (tagValue: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.includes(tagValue) ? prev.tags.filter((t) => t !== tagValue) : [...prev.tags, tagValue],
        }));
    };

    const handleSave = () => {
        const updatedTask: Task = {
            ...task,
            title: formData.title,
            description: formData.description,
            assignee: formData.assignee,
            dueDate: formData.dueDate,
            priority: formData.priority,
            estimatedHours: formData.estimatedHours,
            milestoneId: formData.milestoneId,
            tags: formData.tags,
        };
        onSave(updatedTask);
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const milestoneOptions = milestones.map((m) => ({
        value: m.id.toString(),
        label: m.title,
        icon: "📋",
    }));

    return (
        <div className={cx("modal-overlay")} onClick={handleOverlayClick}>
            <div className={cx("modal-content")}>
                <div className={cx("modal-header")}>
                    <div className={cx("header-info")}>
                        <span className={cx("task-icon")}>📝</span>
                        <div>
                            <h3>Chỉnh sửa công việc</h3>
                            <p>Cập nhật thông tin công việc trong mốc thời gian</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={cx("close-btn")}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className={cx("modal-body")}>
                    <div className={cx("form-section")}>
                        <h4>📋 Thông tin cơ bản</h4>

                        <div className={cx("form-group")}>
                            <label>Tên công việc *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange("title", e.target.value)}
                                placeholder="VD: Chuẩn bị hồ sơ pháp lý"
                                className={cx("form-input")}
                            />
                        </div>

                        <div className={cx("form-group")}>
                            <label>Mô tả công việc</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                placeholder="Mô tả chi tiết về công việc cần thực hiện..."
                                rows={3}
                                className={cx("form-textarea")}
                            />
                        </div>

                        <div className={cx("form-group")}>
                            <label>Thuộc mốc thời gian *</label>
                            <Dropdown
                                options={milestoneOptions}
                                value={formData.milestoneId.toString()}
                                onChange={(value) => handleInputChange("milestoneId", Number(value))}
                                placeholder="Chọn mốc thời gian"
                            />
                        </div>
                    </div>

                    <div className={cx("form-section")}>
                        <h4>⏰ Thời gian & Nguồn lực</h4>

                        <div className={cx("form-group")}>
                            <label>Thời hạn hoàn thành *</label>
                            <div className={cx("date-input-wrapper")}>
                                <button type="button" onClick={() => setShowDatePicker(true)} className={cx("date-input-btn")}>
                                    <FontAwesomeIcon icon={faCalendarAlt} />
                                    {/* <span>{formData.dueDate.toLocaleDateString("vi-VN")}</span> */}
                                    <span>123</span>
                                </button>
                            </div>
                        </div>

                        <div className={cx("form-row")}>
                            <div className={cx("form-group")}>
                                <label>Người phụ trách *</label>
                                <Dropdown
                                    options={EMPLOYEES}
                                    value={formData.assignee}
                                    onChange={(value) => handleInputChange("assignee", value)}
                                    placeholder="Chọn người phụ trách"
                                />
                            </div>

                            <div className={cx("form-group")}>
                                <label>Độ ưu tiên *</label>
                                <Dropdown
                                    options={PRIORITY_OPTIONS}
                                    value={formData.priority}
                                    onChange={(value) => handleInputChange("priority", value)}
                                    placeholder="Chọn độ ưu tiên"
                                />
                            </div>
                        </div>

                        <div className={cx("form-group")}>
                            <label>Ước tính thời gian (giờ)</label>
                            <input
                                type="number"
                                value={formData.estimatedHours}
                                onChange={(e) => handleInputChange("estimatedHours", Number(e.target.value))}
                                min="0.5"
                                step="0.5"
                                className={cx("form-input")}
                            />
                        </div>
                    </div>

                    <div className={cx("form-section")}>
                        <h4>🏷️ Nhãn công việc</h4>
                        <div className={cx("tags-grid")}>
                            {TASK_TAGS.map((tag) => (
                                <button
                                    key={tag.value}
                                    type="button"
                                    onClick={() => handleTagToggle(tag.value)}
                                    className={cx("tag-btn", { active: formData.tags.includes(tag.value) })}
                                    style={{
                                        backgroundColor: formData.tags.includes(tag.value) ? tag.color : "transparent",
                                        borderColor: tag.color,
                                        color: formData.tags.includes(tag.value) ? "white" : tag.color,
                                    }}
                                >
                                    {tag.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={cx("modal-footer")}>
                    <button type="button" onClick={onClose} className={cx("cancel-btn")}>
                        Hủy
                    </button>
                    <button type="button" onClick={handleSave} className={cx("save-btn")} disabled={!formData.title.trim()}>
                        <FontAwesomeIcon icon={faCheck} />
                        Lưu thay đổi
                    </button>
                </div>

                {showDatePicker && (
                    <DatePicker startDate={formData.dueDate} onDateChange={handleDateChange} onClose={() => setShowDatePicker(false)} />
                )}
            </div>
        </div>
    );
};
