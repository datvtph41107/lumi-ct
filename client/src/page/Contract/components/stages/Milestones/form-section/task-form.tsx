"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faPlus, faCheck } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "../../../Dropdown/Dropdown";
import SidebarDropdown from "../../../Dropdown/Dropdown";
import { PRIORITY_OPTIONS, EMPLOYEES, TASK_TAGS } from "~/constants/milestone.constants";
import type { TaskFormData, Milestone } from "~/types/milestone.types";
import classNames from "classnames/bind";
import styles from "./task-form.module.scss";

const cx = classNames.bind(styles);

interface TaskFormProps {
    milestones: Milestone[];
    onSubmit: (data: TaskFormData) => void;
    onReset: () => void;
}

export const TaskForm = ({ milestones, onSubmit, onReset }: TaskFormProps) => {
    const [formData, setFormData] = useState<TaskFormData>({
        title: "",
        description: "",
        assignee: "",
        dueDate: null,
        priority: "medium",
        estimatedHours: 4,
        milestoneId: milestones[0]?.id || 0,
        tags: [],
    });

    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleInputChange = (field: keyof TaskFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (startDate: Date | null, endDate: Date | null) => {
        setFormData((prev) => ({ ...prev, dueDate: startDate }));
        setShowDatePicker(false);
    };

    const handleTagToggle = (tagValue: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.includes(tagValue) ? prev.tags.filter((t) => t !== tagValue) : [...prev.tags, tagValue],
        }));
    };

    const handleSubmit = () => {
        if (formData.title && formData.dueDate && formData.milestoneId) {
            onSubmit(formData);
            setFormData({
                title: "",
                description: "",
                assignee: "",
                dueDate: null,
                priority: "medium",
                estimatedHours: 4,
                milestoneId: milestones[0]?.id || 0,
                tags: [],
            });
        }
    };

    const milestoneOptions = milestones.map((m) => ({
        value: m.id.toString(),
        label: m.title,
        icon: "📋",
    }));

    return (
        <div className={cx("task-form")}>
            <div className={cx("form-header")}>
                <div className={cx("form-title")}>
                    <FontAwesomeIcon icon={faPlus} />
                    <h3>Thêm công việc mới</h3>
                </div>
                <p>Tạo công việc cụ thể trong các mốc thời gian</p>
            </div>

            <div className={cx("form-content")}>
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
                        <SidebarDropdown
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
                                <span>{formData.dueDate ? formData.dueDate.toLocaleDateString("vi-VN") : "Chọn ngày hoàn thành"}</span>
                            </button>
                        </div>
                    </div>

                    <div className={cx("form-row")}>
                        <div className={cx("form-group")}>
                            <label>Người phụ trách *</label>
                            <SidebarDropdown
                                options={EMPLOYEES}
                                value={formData.assignee}
                                onChange={(value) => handleInputChange("assignee", value)}
                                placeholder="Chọn người phụ trách"
                            />
                        </div>

                        <div className={cx("form-group")}>
                            <label>Độ ưu tiên *</label>
                            <SidebarDropdown
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

                <div className={cx("form-actions")}>
                    <button type="button" onClick={onReset} className={cx("reset-btn")}>
                        Đặt lại
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className={cx("submit-btn")}
                        disabled={!formData.title || !formData.dueDate || !formData.milestoneId}
                    >
                        <FontAwesomeIcon icon={faCheck} />
                        Tạo công việc
                    </button>
                </div>
            </div>

            {showDatePicker && (
                <DatePicker startDate={formData.dueDate} onDateChange={handleDateChange} onClose={() => setShowDatePicker(false)} />
            )}
        </div>
    );
};
