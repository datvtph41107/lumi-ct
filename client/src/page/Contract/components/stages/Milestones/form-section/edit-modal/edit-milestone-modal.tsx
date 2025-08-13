import type React from "react";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "../../../../../../../components/DateRangePicker/DatePicker/DatePicker";
import Dropdown from "../../../../Dropdown/Dropdown";
import { MILESTONE_TYPES, PRIORITY_OPTIONS, EMPLOYEES } from "~/constants/milestone.constants";
import type { Milestone } from "~/types/milestone.types";
import classNames from "classnames/bind";
import styles from "./edit-milestone-modal.module.scss";

const cx = classNames.bind(styles);

interface EditMilestoneModalProps {
    milestone: Milestone;
    onSave: (updatedMilestone: Milestone) => void;
    onClose: () => void;
}

export const EditMilestoneModal = ({ milestone, onSave, onClose }: EditMilestoneModalProps) => {
    const [formData, setFormData] = useState({
        title: milestone.title,
        description: milestone.description,
        type: milestone.type,
        dueDate: milestone.dueDate,
        priority: milestone.priority,
        assignee: milestone.assignee,
        estimatedHours: milestone.estimatedHours || 0,
        deliverables: milestone.deliverables || [],
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [newDeliverable, setNewDeliverable] = useState("");

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (startDate: Date | null, endDate: Date | null) => {
        if (startDate) {
            setFormData((prev) => ({ ...prev, dueDate: startDate }));
        }
        setShowDatePicker(false);
    };

    const addDeliverable = () => {
        if (newDeliverable.trim()) {
            setFormData((prev) => ({
                ...prev,
                deliverables: [...prev.deliverables, newDeliverable.trim()],
            }));
            setNewDeliverable("");
        }
    };

    const removeDeliverable = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            deliverables: prev.deliverables.filter((_, i) => i !== index),
        }));
    };

    const handleSave = () => {
        const updatedMilestone: Milestone = {
            ...milestone,
            title: formData.title,
            description: formData.description,
            type: formData.type,
            dueDate: formData.dueDate,
            priority: formData.priority,
            assignee: formData.assignee,
            estimatedHours: formData.estimatedHours,
            deliverables: formData.deliverables,
        };
        onSave(updatedMilestone);
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const selectedType = MILESTONE_TYPES.find((type) => type.value === formData.type);

    return (
        <div className={cx("modal-overlay")} onClick={handleOverlayClick}>
            <div className={cx("modal-content")}>
                <div className={cx("modal-header")}>
                    <div className={cx("header-info")}>
                        <span className={cx("type-icon")}>{selectedType?.icon}</span>
                        <div>
                            <h3>Chỉnh sửa mốc thời gian</h3>
                            <p>Cập nhật thông tin giai đoạn trong hợp đồng</p>
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
                            <label>Tên mốc thời gian *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange("title", e.target.value)}
                                placeholder="VD: Giai đoạn 1 - Ký kết hợp đồng"
                                className={cx("form-input")}
                            />
                        </div>

                        <div className={cx("form-group")}>
                            <label>Mô tả chi tiết</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                placeholder="Mô tả chi tiết về giai đoạn này, mục tiêu và yêu cầu cần đạt được..."
                                rows={3}
                                className={cx("form-textarea")}
                            />
                        </div>

                        <div className={cx("form-row")}>
                            <div className={cx("form-group")}>
                                <label>Loại mốc thời gian *</label>
                                <Dropdown
                                    options={MILESTONE_TYPES}
                                    value={formData.type}
                                    onChange={(value) => handleInputChange("type", value)}
                                    placeholder="Chọn loại mốc"
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
                    </div>

                    <div className={cx("form-section")}>
                        <h4>⏰ Thời gian & Nguồn lực</h4>

                        <div className={cx("form-group")}>
                            <label>Thời hạn hoàn thành *</label>
                            <div className={cx("date-input-wrapper")}>
                                <button type="button" onClick={() => setShowDatePicker(true)} className={cx("date-input-btn")}>
                                    <FontAwesomeIcon icon={faCalendarAlt} />
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
                                <label>Ước tính thời gian (giờ)</label>
                                <input
                                    type="number"
                                    value={formData.estimatedHours}
                                    onChange={(e) => handleInputChange("estimatedHours", Number(e.target.value))}
                                    min="1"
                                    step="0.5"
                                    className={cx("form-input")}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={cx("form-section")}>
                        <h4>📦 Sản phẩm bàn giao</h4>

                        <div className={cx("deliverables-input")}>
                            <input
                                type="text"
                                value={newDeliverable}
                                onChange={(e) => setNewDeliverable(e.target.value)}
                                placeholder="VD: Hợp đồng đã ký, Hồ sơ pháp lý..."
                                className={cx("form-input")}
                                onKeyPress={(e) => e.key === "Enter" && addDeliverable()}
                            />
                            <button type="button" onClick={addDeliverable} className={cx("add-btn")} disabled={!newDeliverable.trim()}>
                                <FontAwesomeIcon icon={faCheck} />
                            </button>
                        </div>

                        {formData.deliverables.length > 0 && (
                            <div className={cx("deliverables-list")}>
                                {formData.deliverables.map((deliverable, index) => (
                                    <div key={index} className={cx("deliverable-item")}>
                                        <span>{deliverable}</span>
                                        <button type="button" onClick={() => removeDeliverable(index)} className={cx("remove-btn")}>
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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
