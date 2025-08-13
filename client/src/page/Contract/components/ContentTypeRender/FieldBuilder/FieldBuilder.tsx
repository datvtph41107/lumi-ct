"use client";

import type React from "react";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faEdit, faSave, faTimes, faGripVertical, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import type { ContractField } from "~/types/contract/contract-field.types";
import classNames from "classnames/bind";
import styles from "./FieldBuilder.module.scss";

const cx = classNames.bind(styles);

const FIELD_TYPES = [
    { value: "text", label: "Văn bản", icon: "📝" },
    { value: "textarea", label: "Văn bản dài", icon: "📄" },
    { value: "number", label: "Số", icon: "🔢" },
    { value: "date", label: "Ngày tháng", icon: "📅" },
    { value: "select", label: "Danh sách chọn", icon: "📋" },
    { value: "checkbox", label: "Hộp kiểm", icon: "☑️" },
    { value: "radio", label: "Lựa chọn đơn", icon: "🔘" },
    { value: "file", label: "Tệp đính kèm", icon: "📎" },
];

interface FieldBuilderProps {
    fields: ContractField[];
    onChange: (fields: ContractField[]) => void;
}

export const FieldBuilder: React.FC<FieldBuilderProps> = ({ fields, onChange }) => {
    const [editingField, setEditingField] = useState<ContractField | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const [fieldForm, setFieldForm] = useState<Partial<ContractField>>({
        type: "text",
        required: false,
        order: fields.length,
    });

    const handleAddField = () => {
        const newField: ContractField = {
            id: `field_${Date.now()}`,
            name: fieldForm.name || "",
            label: fieldForm.label || "",
            type: fieldForm.type || "text",
            required: fieldForm.required || false,
            placeholder: fieldForm.placeholder,
            description: fieldForm.description,
            validation: fieldForm.validation,
            options: fieldForm.options,
            defaultValue: fieldForm.defaultValue,
            order: fields.length,
        };

        onChange([...fields, newField]);
        resetForm();
    };

    const handleUpdateField = () => {
        if (!editingField) return;

        const updatedFields = fields.map((field) => (field.id === editingField.id ? { ...editingField, ...fieldForm } : field));
        onChange(updatedFields);
        setEditingField(null);
        resetForm();
    };

    const handleDeleteField = (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa trường này?")) {
            onChange(fields.filter((field) => field.id !== id));
        }
    };

    const handleEditField = (field: ContractField) => {
        setEditingField(field);
        setFieldForm({ ...field });
    };

    const resetForm = () => {
        setFieldForm({
            type: "text",
            required: false,
            order: fields.length,
        });
        setEditingField(null);
    };

    const moveField = (index: number, direction: "up" | "down") => {
        const newFields = [...fields];
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newFields.length) {
            [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
            // Update order
            newFields.forEach((field, idx) => {
                field.order = idx;
            });
            onChange(newFields);
        }
    };

    const addOption = () => {
        const options = fieldForm.options || [];
        setFieldForm({
            ...fieldForm,
            options: [...options, { value: "", label: "" }],
        });
    };

    const updateOption = (index: number, key: "value" | "label", value: string) => {
        const options = [...(fieldForm.options || [])];
        options[index] = { ...options[index], [key]: value };
        setFieldForm({ ...fieldForm, options });
    };

    const removeOption = (index: number) => {
        const options = [...(fieldForm.options || [])];
        options.splice(index, 1);
        setFieldForm({ ...fieldForm, options });
    };

    return (
        <div className={cx("field-builder")}>
            {/* Field List */}
            <div className={cx("fields-list")}>
                <div className={cx("list-header")}>
                    <h4>Danh sách trường ({fields.length})</h4>
                    <button
                        className={cx("preview-toggle")}
                        onClick={() => setShowPreview(!showPreview)}
                        title={showPreview ? "Ẩn xem trước" : "Hiện xem trước"}
                    >
                        <FontAwesomeIcon icon={showPreview ? faEyeSlash : faEye} />
                        {showPreview ? "Ẩn xem trước" : "Xem trước"}
                    </button>
                </div>

                {fields.length === 0 ? (
                    <div className={cx("empty-fields")}>
                        <p>Chưa có trường nào được thêm</p>
                    </div>
                ) : (
                    <div className={cx("fields-container")}>
                        {fields.map((field, index) => (
                            <div key={field.id} className={cx("field-item")}>
                                <div className={cx("field-drag")}>
                                    <FontAwesomeIcon icon={faGripVertical} />
                                </div>

                                <div className={cx("field-info")}>
                                    <div className={cx("field-header")}>
                                        <span className={cx("field-type")}>{FIELD_TYPES.find((t) => t.value === field.type)?.icon}</span>
                                        <strong>{field.label}</strong>
                                        {field.required && <span className={cx("required-badge")}>Bắt buộc</span>}
                                    </div>
                                    <div className={cx("field-details")}>
                                        <span>Tên: {field.name}</span>
                                        <span>Loại: {FIELD_TYPES.find((t) => t.value === field.type)?.label}</span>
                                    </div>
                                </div>

                                <div className={cx("field-actions")}>
                                    <button
                                        className={cx("move-btn")}
                                        onClick={() => moveField(index, "up")}
                                        disabled={index === 0}
                                        title="Di chuyển lên"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        className={cx("move-btn")}
                                        onClick={() => moveField(index, "down")}
                                        disabled={index === fields.length - 1}
                                        title="Di chuyển xuống"
                                    >
                                        ↓
                                    </button>
                                    <button className={cx("edit-btn")} onClick={() => handleEditField(field)} title="Chỉnh sửa">
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button className={cx("delete-btn")} onClick={() => handleDeleteField(field.id)} title="Xóa">
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Field Form */}
            <div className={cx("field-form")}>
                <h4>{editingField ? "Chỉnh sửa trường" : "Thêm trường mới"}</h4>

                <div className={cx("form-grid")}>
                    <div className={cx("field")}>
                        <label>Tên trường *</label>
                        <input
                            type="text"
                            value={fieldForm.name || ""}
                            onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
                            placeholder="contract_value"
                        />
                    </div>

                    <div className={cx("field")}>
                        <label>Nhãn hiển thị *</label>
                        <input
                            type="text"
                            value={fieldForm.label || ""}
                            onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
                            placeholder="Giá trị hợp đồng"
                        />
                    </div>

                    <div className={cx("field")}>
                        <label>Loại trường *</label>
                        <select
                            value={fieldForm.type || "text"}
                            onChange={(e) => setFieldForm({ ...fieldForm, type: e.target.value as ContractField["type"] })}
                        >
                            {FIELD_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.icon} {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={cx("field")}>
                        <label>
                            <input
                                type="checkbox"
                                checked={fieldForm.required || false}
                                onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.checked })}
                            />
                            Trường bắt buộc
                        </label>
                    </div>

                    <div className={cx("field", "full-width")}>
                        <label>Placeholder</label>
                        <input
                            type="text"
                            value={fieldForm.placeholder || ""}
                            onChange={(e) => setFieldForm({ ...fieldForm, placeholder: e.target.value })}
                            placeholder="Nhập giá trị hợp đồng..."
                        />
                    </div>

                    <div className={cx("field", "full-width")}>
                        <label>Mô tả</label>
                        <textarea
                            value={fieldForm.description || ""}
                            onChange={(e) => setFieldForm({ ...fieldForm, description: e.target.value })}
                            placeholder="Mô tả chi tiết về trường này..."
                            rows={2}
                        />
                    </div>

                    {/* Options for select/radio fields */}
                    {(fieldForm.type === "select" || fieldForm.type === "radio") && (
                        <div className={cx("field", "full-width")}>
                            <label>Tùy chọn</label>
                            <div className={cx("options-builder")}>
                                {(fieldForm.options || []).map((option, index) => (
                                    <div key={index} className={cx("option-item")}>
                                        <input
                                            type="text"
                                            value={option.value}
                                            onChange={(e) => updateOption(index, "value", e.target.value)}
                                            placeholder="Giá trị"
                                        />
                                        <input
                                            type="text"
                                            value={option.label}
                                            onChange={(e) => updateOption(index, "label", e.target.value)}
                                            placeholder="Nhãn hiển thị"
                                        />
                                        <button type="button" className={cx("remove-option")} onClick={() => removeOption(index)}>
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" className={cx("add-option")} onClick={addOption}>
                                    <FontAwesomeIcon icon={faPlus} />
                                    Thêm tùy chọn
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Validation for number/text fields */}
                    {(fieldForm.type === "number" || fieldForm.type === "text") && (
                        <div className={cx("field", "full-width")}>
                            <label>Validation</label>
                            <div className={cx("validation-grid")}>
                                {fieldForm.type === "number" && (
                                    <>
                                        <input
                                            type="number"
                                            value={fieldForm.validation?.min || ""}
                                            onChange={(e) =>
                                                setFieldForm({
                                                    ...fieldForm,
                                                    validation: {
                                                        ...fieldForm.validation,
                                                        min: e.target.value ? Number(e.target.value) : undefined,
                                                    },
                                                })
                                            }
                                            placeholder="Giá trị tối thiểu"
                                        />
                                        <input
                                            type="number"
                                            value={fieldForm.validation?.max || ""}
                                            onChange={(e) =>
                                                setFieldForm({
                                                    ...fieldForm,
                                                    validation: {
                                                        ...fieldForm.validation,
                                                        max: e.target.value ? Number(e.target.value) : undefined,
                                                    },
                                                })
                                            }
                                            placeholder="Giá trị tối đa"
                                        />
                                    </>
                                )}
                                {fieldForm.type === "text" && (
                                    <input
                                        type="text"
                                        value={fieldForm.validation?.pattern || ""}
                                        onChange={(e) =>
                                            setFieldForm({
                                                ...fieldForm,
                                                validation: {
                                                    ...fieldForm.validation,
                                                    pattern: e.target.value,
                                                },
                                            })
                                        }
                                        placeholder="Regex pattern (tùy chọn)"
                                    />
                                )}
                                <input
                                    type="text"
                                    value={fieldForm.validation?.message || ""}
                                    onChange={(e) =>
                                        setFieldForm({
                                            ...fieldForm,
                                            validation: {
                                                ...fieldForm.validation,
                                                message: e.target.value,
                                            },
                                        })
                                    }
                                    placeholder="Thông báo lỗi tùy chỉnh"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className={cx("form-actions")}>
                    {editingField ? (
                        <>
                            <button className={cx("save-btn")} onClick={handleUpdateField}>
                                <FontAwesomeIcon icon={faSave} />
                                Cập nhật trường
                            </button>
                            <button className={cx("cancel-btn")} onClick={resetForm}>
                                <FontAwesomeIcon icon={faTimes} />
                                Hủy
                            </button>
                        </>
                    ) : (
                        <button className={cx("add-btn")} onClick={handleAddField}>
                            <FontAwesomeIcon icon={faPlus} />
                            Thêm trường
                        </button>
                    )}
                </div>
            </div>

            {/* Preview */}
            {showPreview && fields.length > 0 && (
                <div className={cx("fields-preview")}>
                    <h4>Xem trước form</h4>
                    <div className={cx("preview-form")}>
                        {fields
                            .sort((a, b) => a.order - b.order)
                            .map((field) => (
                                <div key={field.id} className={cx("preview-field")}>
                                    <label>
                                        {field.label}
                                        {field.required && <span className={cx("required")}>*</span>}
                                    </label>
                                    {field.description && <small>{field.description}</small>}

                                    {field.type === "text" && <input type="text" placeholder={field.placeholder} disabled />}
                                    {field.type === "textarea" && <textarea placeholder={field.placeholder} rows={3} disabled />}
                                    {field.type === "number" && <input type="number" placeholder={field.placeholder} disabled />}
                                    {field.type === "date" && <input type="date" disabled />}
                                    {field.type === "select" && (
                                        <select disabled>
                                            <option>{field.placeholder || "Chọn..."}</option>
                                            {field.options?.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {field.type === "checkbox" && (
                                        <label>
                                            <input type="checkbox" disabled />
                                            {field.placeholder || field.label}
                                        </label>
                                    )}
                                    {field.type === "radio" && (
                                        <div className={cx("radio-group")}>
                                            {field.options?.map((option) => (
                                                <label key={option.value}>
                                                    <input type="radio" name={field.name} value={option.value} disabled />
                                                    {option.label}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    {field.type === "file" && <input type="file" disabled />}
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};
