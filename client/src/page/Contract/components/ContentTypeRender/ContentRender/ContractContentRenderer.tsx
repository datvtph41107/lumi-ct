import type React from "react";

import { useFormContext } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { useContractTypeStore } from "~/store/contract-type-store";
import type { ContractField } from "~/types/contract/contract-field.types";
import classNames from "classnames/bind";
import styles from "./ContractContentRenderer.module.scss";

const cx = classNames.bind(styles);

interface ContractContentRendererProps {
    contractType: string;
}

export const ContractContentRenderer: React.FC<ContractContentRendererProps> = ({ contractType }) => {
    const { getCustomType } = useContractTypeStore();
    const {
        register,
        formState: { errors },
        watch,
        setValue,
    } = useFormContext();

    const customType = getCustomType(contractType);

    if (!customType) {
        return (
            <div className={cx("no-custom-type")}>
                <p>Không tìm thấy cấu hình cho thể loại hợp đồng này</p>
            </div>
        );
    }

    const renderField = (field: ContractField) => {
        const fieldName = `customFields.${field.name}`;
        const fieldError = errors.customFields?.[field.name];

        const validationRules = {
            required: field.required ? `${field.label} là bắt buộc` : false,
            ...(field.validation?.min && {
                min: { value: field.validation.min, message: `Giá trị tối thiểu là ${field.validation.min}` },
            }),
            ...(field.validation?.max && {
                max: { value: field.validation.max, message: `Giá trị tối đa là ${field.validation.max}` },
            }),
            ...(field.validation?.pattern && {
                pattern: {
                    value: new RegExp(field.validation.pattern),
                    message: field.validation.message || "Định dạng không hợp lệ",
                },
            }),
        };

        return (
            <div key={field.id} className={cx("custom-field")}>
                <label className={cx("field-label")}>
                    {field.label}
                    {field.required && <span className={cx("required")}>*</span>}
                </label>

                {field.description && <div className={cx("field-description")}>{field.description}</div>}

                <div className={cx("field-input")}>
                    {field.type === "text" && (
                        <input
                            type="text"
                            {...register(fieldName, validationRules)}
                            placeholder={field.placeholder}
                            className={cx("input", { error: fieldError })}
                        />
                    )}

                    {field.type === "textarea" && (
                        <textarea
                            {...register(fieldName, validationRules)}
                            placeholder={field.placeholder}
                            rows={3}
                            className={cx("textarea", { error: fieldError })}
                        />
                    )}

                    {field.type === "number" && (
                        <input
                            type="number"
                            {...register(fieldName, validationRules)}
                            placeholder={field.placeholder}
                            className={cx("input", { error: fieldError })}
                        />
                    )}

                    {field.type === "date" && (
                        <input type="date" {...register(fieldName, validationRules)} className={cx("input", { error: fieldError })} />
                    )}

                    {field.type === "select" && (
                        <select {...register(fieldName, validationRules)} className={cx("select", { error: fieldError })}>
                            <option value="">{field.placeholder || "Chọn..."}</option>
                            {field.options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    )}

                    {field.type === "checkbox" && (
                        <label className={cx("checkbox-label")}>
                            <input type="checkbox" {...register(fieldName, validationRules)} className={cx("checkbox")} />
                            <span>{field.placeholder || field.label}</span>
                        </label>
                    )}

                    {field.type === "radio" && (
                        <div className={cx("radio-group")}>
                            {field.options?.map((option) => (
                                <label key={option.value} className={cx("radio-label")}>
                                    <input
                                        type="radio"
                                        {...register(fieldName, validationRules)}
                                        value={option.value}
                                        className={cx("radio")}
                                    />
                                    <span>{option.label}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {field.type === "file" && (
                        <div className={cx("file-input")}>
                            <input type="file" {...register(fieldName, validationRules)} className={cx("file")} />
                            <span className={cx("file-hint")}>{field.placeholder || "Chọn tệp để tải lên"}</span>
                        </div>
                    )}
                </div>

                <ErrorMessage
                    errors={errors}
                    name={fieldName}
                    render={({ message }) => <div className={cx("error-message")}>{message}</div>}
                />
            </div>
        );
    };

    return (
        <div className={cx("contract-content-renderer")}>
            <div className={cx("renderer-header")}>
                <span className={cx("type-icon")}>{customType.icon}</span>
                <div>
                    <h3>{customType.label}</h3>
                    <p>{customType.description}</p>
                </div>
            </div>

            <div className={cx("custom-fields")}>{customType.fields.sort((a, b) => a.order - b.order).map(renderField)}</div>
        </div>
    );
};
