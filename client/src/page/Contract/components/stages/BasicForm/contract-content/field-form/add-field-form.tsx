import type React from "react";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faPlus, faTrash, faRedo, faCheck } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames/bind";
import styles from "../ContractContentRenderer.module.scss";
import type { FieldConfig } from "../contract-content-renderer";

const cx = classNames.bind(styles);

interface AddFieldFormProps {
    onSave: (field: FieldConfig) => void;
    onCancel: () => void;
    editingField: FieldConfig | null;
}

const initialFormData = {
    name: "",
    label: "",
    type: "text" as const,
    placeholder: "",
    required: false,
    options: [] as { value: string; label: string }[],
    column: 1 as 1 | 2 | 3,
};

export const AddFieldForm: React.FC<AddFieldFormProps> = ({ onSave, onCancel, editingField }) => {
    const [formData, setFormData] = useState<Partial<FieldConfig>>(initialFormData);

    useEffect(() => {
        if (editingField) {
            setFormData(editingField);
        } else {
            setFormData(initialFormData);
        }
    }, [editingField]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.label) {
            alert("Vui lòng điền đầy đủ tên trường và nhãn");
            return;
        }

        const fieldConfig: FieldConfig = {
            id: editingField?.id || `field_${Date.now()}`,
            name: formData.name!,
            label: formData.label!,
            type: formData.type!,
            placeholder: formData.placeholder,
            required: formData.required,
            options: formData.options,
            column: formData.column!,
        };

        onSave(fieldConfig);

        // Reset form nếu không phải đang edit
        if (!editingField) {
            setFormData(initialFormData);
        }
    };

    const handleReset = () => {
        setFormData(initialFormData);
    };

    const addOption = () => {
        setFormData({
            ...formData,
            options: [...(formData.options || []), { value: "", label: "" }],
        });
    };

    const updateOption = (index: number, field: "value" | "label", value: string) => {
        const newOptions = [...(formData.options || [])];
        newOptions[index] = { ...newOptions[index], [field]: value };
        setFormData({ ...formData, options: newOptions });
    };

    const removeOption = (index: number) => {
        const newOptions = formData.options?.filter((_, i) => i !== index) || [];
        setFormData({ ...formData, options: newOptions });
    };

    const fieldTypes = [
        { value: "text", label: "Văn bản" },
        { value: "number", label: "Số" },
        { value: "email", label: "Email" },
        { value: "tel", label: "Số điện thoại" },
        { value: "date", label: "Ngày tháng" },
        { value: "textarea", label: "Văn bản dài" },
        { value: "select", label: "Danh sách lựa chọn" },
        { value: "dropdown", label: "Dropdown" },
    ];

    return (
        <div className={cx("add-field-form")}>
            <div className={cx("form-header")}>
                <h6>
                    <FontAwesomeIcon icon={faCog} />
                    {editingField ? "Chỉnh sửa trường" : "Thêm trường mới"}
                </h6>
            </div>

            <form onSubmit={handleSubmit} className={cx("form-content")}>
                <div className={cx("form-row")}>
                    <div className={cx("form-group")}>
                        <label htmlFor="name">Tên trường *</label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="vd: customerName"
                        />
                    </div>

                    <div className={cx("form-group")}>
                        <label htmlFor="label">Nhãn hiển thị *</label>
                        <input
                            id="label"
                            type="text"
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            placeholder="vd: Tên khách hàng"
                        />
                    </div>
                </div>

                <div className={cx("form-row", "three-cols")}>
                    <div className={cx("form-group")}>
                        <label htmlFor="type">Loại trường</label>
                        <select id="type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}>
                            {fieldTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={cx("form-group")}>
                        <label htmlFor="column">Cột hiển thị</label>
                        <select
                            id="column"
                            value={formData.column?.toString()}
                            onChange={(e) => setFormData({ ...formData, column: Number.parseInt(e.target.value) as 1 | 2 | 3 })}
                        >
                            <option value="1">Cột 1</option>
                            <option value="2">Cột 2</option>
                            <option value="3">Cột 3</option>
                        </select>
                    </div>

                    <div className={cx("form-group")}>
                        <div className={cx("checkbox-group")} style={{ marginTop: "1.5rem" }}>
                            <input
                                id="required"
                                type="checkbox"
                                checked={formData.required}
                                onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                            />
                            <label htmlFor="required">Bắt buộc nhập</label>
                        </div>
                    </div>
                </div>

                <div className={cx("form-group")}>
                    <label htmlFor="placeholder">Placeholder</label>
                    <input
                        id="placeholder"
                        type="text"
                        value={formData.placeholder}
                        onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                        placeholder="Văn bản gợi ý cho người dùng"
                    />
                </div>

                {(formData.type === "select" || formData.type === "dropdown") && (
                    <div className={cx("form-group")}>
                        <div className={cx("options-section")}>
                            <div className={cx("options-header")}>
                                <label>Danh sách lựa chọn</label>
                                <button type="button" className={cx("add-option-button")} onClick={addOption}>
                                    <FontAwesomeIcon icon={faPlus} />
                                    Thêm lựa chọn
                                </button>
                            </div>

                            <div className={cx("options-list")}>
                                {formData.options?.map((option, index) => (
                                    <div key={index} className={cx("option-row")}>
                                        <input
                                            type="text"
                                            placeholder="Giá trị"
                                            value={option.value}
                                            onChange={(e) => updateOption(index, "value", e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Nhãn hiển thị"
                                            value={option.label}
                                            onChange={(e) => updateOption(index, "label", e.target.value)}
                                        />
                                        <button type="button" className={cx("remove-option-button")} onClick={() => removeOption(index)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className={cx("form-actions")}>
                    <button type="button" className={cx("button", "reset-button")} onClick={handleReset}>
                        <FontAwesomeIcon icon={faRedo} />
                        Reset
                    </button>
                    <button type="submit" className={cx("button", "add-button")}>
                        <FontAwesomeIcon icon={faCheck} />
                        {editingField ? "Cập nhật trường" : "Thêm trường"}
                    </button>
                </div>
            </form>
        </div>
    );
};
