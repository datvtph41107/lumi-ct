import type React from "react";
import classNames from "classnames/bind";
import styles from "./field-renderer.module.scss";
import type { FieldConfig } from "../contract-content-renderer";

const cx = classNames.bind(styles);

interface FieldRendererProps {
    field: FieldConfig;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({ field }) => {
    const renderField = () => {
        switch (field.type) {
            case "textarea":
                return (
                    <textarea
                        name={field.name}
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={3}
                        className={cx("form-input")}
                    />
                );

            case "select":
            case "dropdown":
                return (
                    <select name={field.name} required={field.required} className={cx("form-input")}>
                        <option value="">{field.placeholder || "Chọn..."}</option>
                        {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            default:
                return (
                    <input
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        required={field.required}
                        className={cx("form-input")}
                    />
                );
        }
    };

    return (
        <div className={cx("form-group")}>
            <label htmlFor={field.name} className={cx("form-label")}>
                {field.label}
                {field.required && <span className={cx("required-mark")}>*</span>}
            </label>
            {renderField()}
        </div>
    );
};
