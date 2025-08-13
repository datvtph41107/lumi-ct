"use client";

import type React from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faEdit,
    faTrash,
    faGripVertical,
    faTimes,
    faEye,
    faColumns,
    faListAlt,
    faCheck,
    faRedo,
    faInfoCircle,
    faFileAlt,
} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames/bind";
import styles from "./ContractContentRenderer.module.scss";
import { AddFieldForm } from "./field-form/add-field-form";
import Input from "~/components/Input";
import TextArea from "~/components/TextArea";
import Select from "~/components/Select";
import ControlledDateRangeField from "~/components/Form/ControllerValid/ControllerDatePicker";

const cx = classNames.bind(styles);

export interface FieldConfig {
    id: string;
    name: string;
    label: string;
    type: "text" | "number" | "textarea" | "date" | "select";
    placeholder: string;
    required: boolean;
    options?: { value: string; label: string }[];
}

interface ContractContentRendererProps {
    contractType: string;
}

export const ContractContentRenderer: React.FC<ContractContentRendererProps> = ({ contractType }) => {
    const [fields, setFields] = useState<FieldConfig[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingField, setEditingField] = useState<FieldConfig | null>(null);
    const [showAddFields, setShowAddFields] = useState(false);
    const [customFields, setCustomFields] = useState<FieldConfig[]>([]);
    const [fieldInputs, setFieldInputs] = useState(
        Array(5).fill({
            label: "",
            placeholder: "",
            type: "text",
            required: false,
        }),
    );

    const fieldTypes = [
        { value: "text", label: "Text" },
        { value: "number", label: "Number" },
        { value: "textarea", label: "Textarea" },
        { value: "date", label: "Date" },
        { value: "select", label: "Dropdown" },
    ];

    const handleFieldInputChange = (index: number, field: string, value: any) => {
        const newInputs = [...fieldInputs];
        newInputs[index] = { ...newInputs[index], [field]: value };
        setFieldInputs(newInputs);
    };

    const handleSubmit = () => {
        const validFields = fieldInputs.filter((field) => field.label.trim() !== "");

        if (validFields.length === 0) {
            alert("Vui lòng nhập ít nhất một trường!");
            return;
        }

        const newCustomFields: FieldConfig[] = validFields.map((field, index) => ({
            id: `customField${index + 1}`,
            name: `customField${index + 1}`,
            label: field.label,
            placeholder: field.placeholder,
            type: field.type,
            required: field.required,
            options:
                field.type === "select"
                    ? [
                          { value: "option1", label: "Lựa chọn 1" },
                          { value: "option2", label: "Lựa chọn 2" },
                          { value: "option3", label: "Lựa chọn 3" },
                      ]
                    : undefined,
        }));

        setCustomFields(newCustomFields);
        setShowAddFields(false);
    };

    const handleReset = () => {
        setFieldInputs(
            Array(5).fill({
                label: "",
                placeholder: "",
                type: "text",
                required: false,
            }),
        );
    };

    const handleToggleAddForm = () => {
        setShowAddForm(!showAddForm);
        setEditingField(null);
    };

    const handleEditField = (field: FieldConfig) => {
        setEditingField(field);
        setShowAddForm(true);
    };

    const handleDeleteField = (fieldId: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa trường này?")) {
            setFields(fields.filter((field) => field.id !== fieldId));
        }
    };

    const handleSaveField = (fieldConfig: FieldConfig) => {
        if (editingField) {
            setFields(fields.map((field) => (field.id === editingField.id ? fieldConfig : field)));
            setShowAddForm(false);
            setEditingField(null);
        } else {
            setFields([...fields, fieldConfig]);
            // Không đóng form, chỉ reset để có thể thêm tiếp
        }
    };

    const handleCancelForm = () => {
        setShowAddForm(false);
        setEditingField(null);
    };

    const getFieldsByColumn = (column: 1 | 2 | 3) => {
        return fields.filter((field) => field.column === column);
    };

    const moveField = (fieldId: string, newColumn: 1 | 2 | 3) => {
        setFields(fields.map((field) => (field.id === fieldId ? { ...field, column: newColumn } : field)));
    };

    const getFieldStats = () => {
        return {
            total: fields.length,
            column1: getFieldsByColumn(1).length,
            column2: getFieldsByColumn(2).length,
            column3: getFieldsByColumn(3).length,
        };
    };

    const stats = getFieldStats();

    const renderCustomField = (field: FieldConfig) => {
        switch (field.type) {
            case "textarea":
                return (
                    <TextArea
                        key={field.id}
                        name={field.name}
                        label={field.label}
                        placeholder={field.placeholder}
                        required={field.required ? "Trường này là bắt buộc" : undefined}
                        rows={3}
                    />
                );

            case "date":
                return (
                    <ControlledDateRangeField
                        key={field.id}
                        name={field.name}
                        label={field.label}
                        placeholder={field.placeholder}
                        requiredMessage={field.required ? "Trường này là bắt buộc" : undefined}
                    />
                );

            case "select":
                return (
                    <Select
                        key={field.id}
                        name={field.name}
                        label={field.label}
                        options={field.options || []}
                        required={field.required ? "Trường này là bắt buộc" : undefined}
                    />
                );

            default:
                return (
                    <Input
                        key={field.id}
                        name={field.name}
                        label={field.label}
                        type={field.type}
                        placeholder={field.placeholder}
                        required={field.required ? "Trường này là bắt buộc" : undefined}
                    />
                );
        }
    };

    const filledFieldsCount = fieldInputs.filter((field) => field.label.trim() !== "").length;

    return (
        <div className={cx("container")}>
            {/* Stats Bar */}
            <div className={cx("content-header")}>
                <h4>📋 Thông tin nhân viên và công việc</h4>
                <p>Quản lý thông tin chi tiết về nhân viên và điều kiện làm việc</p>
            </div>
            {fields.length > 0 && (
                <div className={cx("stats-bar")}>
                    <div className={cx("stat-item")}>
                        <FontAwesomeIcon icon={faListAlt} />
                        <span>
                            Tổng: <span className={cx("stat-number")}>{stats.total}</span> trường
                        </span>
                    </div>
                    <div className={cx("stat-item")}>
                        <FontAwesomeIcon icon={faColumns} />
                        <span>
                            Cột 1: <span className={cx("stat-number")}>{stats.column1}</span>
                        </span>
                    </div>
                    <div className={cx("stat-item")}>
                        <FontAwesomeIcon icon={faColumns} />
                        <span>
                            Cột 2: <span className={cx("stat-number")}>{stats.column2}</span>
                        </span>
                    </div>
                    <div className={cx("stat-item")}>
                        <FontAwesomeIcon icon={faColumns} />
                        <span>
                            Cột 3: <span className={cx("stat-number")}>{stats.column3}</span>
                        </span>
                    </div>
                </div>
            )}

            {/* Add Field Form */}
            {showAddForm && (
                <div className={cx("add-field-section")}>
                    <AddFieldForm onSave={handleSaveField} onCancel={handleCancelForm} editingField={editingField} />
                </div>
            )}

            {/* Add Fields Section */}
            <div className={cx("add-fields-section")}>
                <h3 className={cx("section-title")}>
                    <FontAwesomeIcon icon={faFileAlt} />
                    Thêm trường thông tin tùy chọn
                </h3>

                {!showAddFields ? (
                    <button type="button" className={cx("add-button")} onClick={() => setShowAddFields(true)}>
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm trường
                    </button>
                ) : (
                    <>
                        <div className={cx("field-count-info")}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            <span>
                                Đã điền <span className={cx("count")}>{filledFieldsCount}</span> / 5 trường
                            </span>
                        </div>

                        <table className={cx("fields-table")}>
                            <thead className={cx("table-header")}>
                                <tr>
                                    <th>Tên nhãn (label)</th>
                                    <th>Placeholder</th>
                                    <th>Kiểu dạng</th>
                                    <th>Bắt buộc</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fieldInputs.map((field, index) => (
                                    <tr key={index} className={cx("table-row")}>
                                        <td>
                                            <input
                                                type="text"
                                                value={field.label}
                                                onChange={(e) => handleFieldInputChange(index, "label", e.target.value)}
                                                placeholder="Nhập tên hiển thị..."
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={field.placeholder}
                                                onChange={(e) => handleFieldInputChange(index, "placeholder", e.target.value)}
                                                placeholder="Nhập gợi ý..."
                                            />
                                        </td>
                                        <td>
                                            <select
                                                value={field.type}
                                                onChange={(e) => handleFieldInputChange(index, "type", e.target.value)}
                                            >
                                                {fieldTypes.map((type) => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={field.required}
                                                onChange={(e) => handleFieldInputChange(index, "required", e.target.checked)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className={cx("form-actions")}>
                            <button type="button" className={cx("button", "reset-button")} onClick={handleReset}>
                                <FontAwesomeIcon icon={faRedo} />
                                Xóa tất cả
                            </button>
                            <button
                                type="button"
                                className={cx("button", "submit-button")}
                                onClick={handleSubmit}
                                disabled={filledFieldsCount === 0}
                            >
                                <FontAwesomeIcon icon={faCheck} />
                                Hoàn tất
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Preview Section */}
            {customFields.length > 0 && (
                <div className={cx("preview-section")}>
                    <div className={cx("preview-header")}>
                        <FontAwesomeIcon icon={faEye} />
                        <h5>Xem trước các trường đã tạo</h5>
                    </div>

                    <div className={cx("preview-grid")}>{customFields.map((field) => renderCustomField(field))}</div>
                </div>
            )}

            {customFields.length === 0 && showAddFields === false && (
                <div className={cx("preview-section")}>
                    <div className={cx("empty-preview")}>
                        <FontAwesomeIcon icon={faFileAlt} />
                        <p>Chưa có trường tùy chọn nào được tạo</p>
                    </div>
                </div>
            )}
        </div>
    );
};

interface FieldCardProps {
    field: FieldConfig;
    onEdit: (field: FieldConfig) => void;
    onDelete: (fieldId: string) => void;
    onMove: (fieldId: string, newColumn: 1 | 2 | 3) => void;
}

const FieldCard: React.FC<FieldCardProps> = ({ field, onEdit, onDelete, onMove }) => {
    return (
        <div className={cx("field-card")}>
            <div className={cx("field-header")}>
                <div className={cx("field-info")}>
                    <div className={cx("field-title")}>
                        <FontAwesomeIcon icon={faGripVertical} className={cx("drag-handle")} />
                        <span className={cx("field-label")}>{field.label}</span>
                        {field.required && <span className={cx("required-mark")}>*</span>}
                    </div>
                    <p className={cx("field-meta")}>
                        Loại: {field.type} | Tên: {field.name}
                    </p>
                    {field.placeholder && <p className={cx("field-placeholder")}>"{field.placeholder}"</p>}
                </div>

                <div className={cx("field-actions")}>
                    <button type="button" className={cx("action-button")} onClick={() => onEdit(field)}>
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button type="button" className={cx("action-button", "delete-button")} onClick={() => onDelete(field.id)}>
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            </div>

            <div className={cx("column-selector")}>
                {[1, 2, 3].map((col) => (
                    <button
                        key={col}
                        type="button"
                        className={cx("column-button", { active: field.column === col })}
                        onClick={() => onMove(field.id, col as 1 | 2 | 3)}
                    >
                        {col}
                    </button>
                ))}
            </div>
        </div>
    );
};
