import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faPlus, faCheck } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "../../../../../../components/DateRangePicker/DatePicker/DatePicker";
import Dropdown from "../../../Dropdown/Dropdown";
import { MILESTONE_TYPES, PRIORITY_OPTIONS, EMPLOYEES } from "~/constants/milestone.constants";
import type { MilestoneFormData } from "~/types/contract/contract.types";
import classNames from "classnames/bind";
import styles from "./MilestoneForm.module.scss";

const cx = classNames.bind(styles);

interface MilestoneFormProps {
    onSubmit: (data: MilestoneFormData) => void;
    onReset: () => void;
}

export const MilestoneForm = ({ onSubmit, onReset }: MilestoneFormProps) => {
    const [formData, setFormData] = useState<MilestoneFormData>({
        title: "",
        description: "",
        type: "custom",
        dueDate: null,
        priority: "medium",
        assignee: "",
        estimatedHours: 8,
        deliverables: [],
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [newDeliverable, setNewDeliverable] = useState("");

    const handleInputChange = (field: keyof MilestoneFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (startDate: Date | null, endDate: Date | null) => {
        setFormData((prev) => ({ ...prev, dueDate: startDate }));
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

    const handleSubmit = () => {
        if (formData.title && formData.dueDate) {
            onSubmit(formData);
            setFormData({
                title: "",
                description: "",
                type: "custom",
                dueDate: null,
                priority: "medium",
                assignee: "",
                estimatedHours: 8,
                deliverables: [],
            });
        }
    };

    const selectedType = MILESTONE_TYPES.find((type) => type.value === formData.type);

    return (
        <div className={cx("milestone-form")}>
            <div className={cx("form-header")}>
                <div className={cx("type-preview")}>
                    <span className={cx("type-icon")}>{selectedType?.icon}</span>
                    <div className={cx("type-info")}>
                        <h3>Tạo mốc thời gian mới</h3>
                        <p>Thiết lập giai đoạn quan trọng trong hợp đồng</p>
                    </div>
                </div>
            </div>

            <div className={cx("form-content")}>
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
                                <span>{formData.dueDate ? formData.dueDate.toLocaleDateString("vi-VN") : "Chọn ngày hoàn thành"}</span>
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
                            <FontAwesomeIcon icon={faPlus} />
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

                <div className={cx("form-actions")}>
                    <button type="button" onClick={onReset} className={cx("reset-btn")}>
                        Đặt lại
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className={cx("submit-btn")}
                        disabled={!formData.title || !formData.dueDate}
                    >
                        <FontAwesomeIcon icon={faCheck} />
                        Tạo mốc thời gian
                    </button>
                </div>
            </div>

            {showDatePicker && (
                <DatePicker startDate={formData.dueDate} onDateChange={handleDateChange} onClose={() => setShowDatePicker(false)} />
            )}
        </div>
    );
};
