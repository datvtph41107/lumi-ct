"use client";

import type React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileContract } from "@fortawesome/free-solid-svg-icons";
import type { CustomContractType } from "~/types/contract/contract-field.types";
import classNames from "classnames/bind";
import styles from "./ContractTypePreview.module.scss";

const cx = classNames.bind(styles);

interface ContractTypePreviewProps {
    contractType: CustomContractType;
}

export const ContractTypePreview: React.FC<ContractTypePreviewProps> = ({ contractType }) => {
    return (
        <div className={cx("contract-type-preview")}>
            <div className={cx("preview-header")}>
                <div className={cx("type-info")}>
                    <span className={cx("type-icon")}>{contractType.icon}</span>
                    <div>
                        <h2>{contractType.label}</h2>
                        <p>{contractType.description}</p>
                    </div>
                </div>
                <div className={cx("type-stats")}>
                    <div className={cx("stat")}>
                        <span className={cx("stat-number")}>{contractType.fields.length}</span>
                        <span className={cx("stat-label")}>Trường dữ liệu</span>
                    </div>
                    <div className={cx("stat")}>
                        <span className={cx("stat-number")}>{contractType.fields.filter((f) => f.required).length}</span>
                        <span className={cx("stat-label")}>Bắt buộc</span>
                    </div>
                </div>
            </div>

            <div className={cx("preview-form")}>
                <h3>
                    <FontAwesomeIcon icon={faFileContract} />
                    Form nhập liệu sẽ hiển thị
                </h3>

                <div className={cx("form-container")}>
                    {contractType.fields
                        .sort((a, b) => a.order - b.order)
                        .map((field) => (
                            <div key={field.id} className={cx("form-field")}>
                                <label className={cx("field-label")}>
                                    {field.label}
                                    {field.required && <span className={cx("required")}>*</span>}
                                </label>

                                {field.description && <div className={cx("field-description")}>{field.description}</div>}

                                <div className={cx("field-input")}>
                                    {field.type === "text" && (
                                        <input type="text" placeholder={field.placeholder} className={cx("input")} disabled />
                                    )}

                                    {field.type === "textarea" && (
                                        <textarea placeholder={field.placeholder} rows={3} className={cx("textarea")} disabled />
                                    )}

                                    {field.type === "number" && (
                                        <input type="number" placeholder={field.placeholder} className={cx("input")} disabled />
                                    )}

                                    {field.type === "date" && <input type="date" className={cx("input")} disabled />}

                                    {field.type === "select" && (
                                        <select className={cx("select")} disabled>
                                            <option>{field.placeholder || "Chọn..."}</option>
                                            {field.options?.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {field.type === "checkbox" && (
                                        <label className={cx("checkbox-label")}>
                                            <input type="checkbox" disabled />
                                            <span>{field.placeholder || field.label}</span>
                                        </label>
                                    )}

                                    {field.type === "radio" && (
                                        <div className={cx("radio-group")}>
                                            {field.options?.map((option) => (
                                                <label key={option.value} className={cx("radio-label")}>
                                                    <input type="radio" name={field.name} value={option.value} disabled />
                                                    <span>{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {field.type === "file" && (
                                        <div className={cx("file-input")}>
                                            <input type="file" disabled />
                                            <span className={cx("file-hint")}>Chọn tệp để tải lên</span>
                                        </div>
                                    )}
                                </div>

                                {field.validation && (
                                    <div className={cx("field-validation")}>
                                        {field.validation.min && <span>Tối thiểu: {field.validation.min}</span>}
                                        {field.validation.max && <span>Tối đa: {field.validation.max}</span>}
                                        {field.validation.pattern && <span>Pattern: {field.validation.pattern}</span>}
                                    </div>
                                )}
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};
