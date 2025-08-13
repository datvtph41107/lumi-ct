import type React from "react";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faRedo, faEye, faCode, faCheckCircle, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import type { CustomContractType } from "~/types/contract/contract-field.types";
import classNames from "classnames/bind";
import styles from "./InteractivePreview.module.scss";

const cx = classNames.bind(styles);

interface InteractivePreviewProps {
    contractType: CustomContractType;
}

export const InteractivePreview: React.FC<InteractivePreviewProps> = ({ contractType }) => {
    const [viewMode, setViewMode] = useState<"form" | "data" | "validation">("form");
    const [submittedData, setSubmittedData] = useState<any>(null);
    const [validationErrors, setValidationErrors] = useState<any>({});

    const methods = useForm({
        mode: "onChange",
        defaultValues: contractType.fields.reduce((acc, field) => {
            acc[field.name] = field.defaultValue || "";
            return acc;
        }, {} as any),
    });

    const {
        handleSubmit,
        reset,
        watch,
        formState: { errors, isValid },
    } = methods;
    const watchedValues = watch();

    const onSubmit = (data: any) => {
        setSubmittedData(data);
        setValidationErrors({});
        console.log("Form submitted:", data);
    };

    const onError = (errors: any) => {
        setValidationErrors(errors);
        console.log("Validation errors:", errors);
    };

    const handleReset = () => {
        reset();
        setSubmittedData(null);
        setValidationErrors({});
    };

    const renderField = (field: any) => {
        const fieldName = field.name;
        const fieldError = errors[fieldName];
        const fieldValue = watchedValues[fieldName];

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
            <div
                key={field.id}
                className={cx("preview-field", {
                    "has-error": fieldError,
                    "has-value": fieldValue && fieldValue !== "",
                })}
            >
                <label className={cx("field-label")}>
                    {field.label}
                    {field.required && <span className={cx("required")}>*</span>}
                    {fieldValue && fieldValue !== "" && <FontAwesomeIcon icon={faCheckCircle} className={cx("field-valid")} />}
                    {fieldError && <FontAwesomeIcon icon={faExclamationTriangle} className={cx("field-error")} />}
                </label>

                {field.description && <div className={cx("field-description")}>{field.description}</div>}

                <div className={cx("field-input")}>
                    {field.type === "text" && (
                        <input
                            type="text"
                            {...methods.register(fieldName, validationRules)}
                            placeholder={field.placeholder}
                            className={cx("input", { error: fieldError })}
                        />
                    )}

                    {field.type === "textarea" && (
                        <textarea
                            {...methods.register(fieldName, validationRules)}
                            placeholder={field.placeholder}
                            rows={3}
                            className={cx("textarea", { error: fieldError })}
                        />
                    )}

                    {field.type === "number" && (
                        <input
                            type="number"
                            {...methods.register(fieldName, validationRules)}
                            placeholder={field.placeholder}
                            className={cx("input", { error: fieldError })}
                        />
                    )}

                    {field.type === "date" && (
                        <input
                            type="date"
                            {...methods.register(fieldName, validationRules)}
                            className={cx("input", { error: fieldError })}
                        />
                    )}

                    {field.type === "select" && (
                        <select {...methods.register(fieldName, validationRules)} className={cx("select", { error: fieldError })}>
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
                            <input type="checkbox" {...methods.register(fieldName, validationRules)} className={cx("checkbox")} />
                            <span>{field.placeholder || field.label}</span>
                        </label>
                    )}

                    {field.type === "radio" && (
                        <div className={cx("radio-group")}>
                            {field.options?.map((option) => (
                                <label key={option.value} className={cx("radio-label")}>
                                    <input
                                        type="radio"
                                        {...methods.register(fieldName, validationRules)}
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
                            <input type="file" {...methods.register(fieldName, validationRules)} className={cx("file")} />
                            <span className={cx("file-hint")}>{field.placeholder || "Chọn tệp để tải lên"}</span>
                        </div>
                    )}
                </div>

                {fieldError && <div className={cx("error-message")}>{fieldError.message}</div>}

                {field.validation && !fieldError && fieldValue && (
                    <div className={cx("field-validation-info")}>
                        {field.validation.min && <span>Tối thiểu: {field.validation.min}</span>}
                        {field.validation.max && <span>Tối đa: {field.validation.max}</span>}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={cx("interactive-preview")}>
            <div className={cx("preview-header")}>
                <div className={cx("preview-title")}>
                    <span className={cx("type-icon")}>{contractType.icon}</span>
                    <div>
                        <h3>Demo tương tác: {contractType.label}</h3>
                        <p>Thử nghiệm form như người dùng thực tế</p>
                    </div>
                </div>

                <div className={cx("preview-stats")}>
                    <div className={cx("stat", { valid: isValid })}>
                        <span className={cx("stat-number")}>
                            {Object.keys(watchedValues).filter((key) => watchedValues[key] && watchedValues[key] !== "").length}
                        </span>
                        <span className={cx("stat-label")}>Đã điền</span>
                    </div>
                    <div className={cx("stat", { error: Object.keys(errors).length > 0 })}>
                        <span className={cx("stat-number")}>{Object.keys(errors).length}</span>
                        <span className={cx("stat-label")}>Lỗi</span>
                    </div>
                </div>
            </div>

            <div className={cx("preview-controls")}>
                <div className={cx("view-modes")}>
                    <button className={cx("mode-btn", { active: viewMode === "form" })} onClick={() => setViewMode("form")}>
                        <FontAwesomeIcon icon={faEye} />
                        Form
                    </button>
                    <button className={cx("mode-btn", { active: viewMode === "data" })} onClick={() => setViewMode("data")}>
                        <FontAwesomeIcon icon={faCode} />
                        Dữ liệu
                    </button>
                    <button className={cx("mode-btn", { active: viewMode === "validation" })} onClick={() => setViewMode("validation")}>
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        Validation
                    </button>
                </div>

                <div className={cx("action-buttons")}>
                    <button className={cx("action-btn", "reset")} onClick={handleReset} type="button">
                        <FontAwesomeIcon icon={faRedo} />
                        Reset
                    </button>
                    <button className={cx("action-btn", "submit")} onClick={handleSubmit(onSubmit, onError)} type="button">
                        <FontAwesomeIcon icon={faPlay} />
                        Test Submit
                    </button>
                </div>
            </div>

            <div className={cx("preview-content")}>
                {viewMode === "form" && (
                    <FormProvider {...methods}>
                        <form className={cx("preview-form")} onSubmit={handleSubmit(onSubmit, onError)}>
                            <div className={cx("form-fields")}>
                                {contractType.fields.sort((a, b) => a.order - b.order).map(renderField)}
                            </div>
                        </form>
                    </FormProvider>
                )}

                {viewMode === "data" && (
                    <div className={cx("data-view")}>
                        <h4>Dữ liệu hiện tại:</h4>
                        <pre className={cx("data-display")}>{JSON.stringify(watchedValues, null, 2)}</pre>

                        {submittedData && (
                            <>
                                <h4>Dữ liệu đã submit:</h4>
                                <pre className={cx("data-display", "submitted")}>{JSON.stringify(submittedData, null, 2)}</pre>
                            </>
                        )}
                    </div>
                )}

                {viewMode === "validation" && (
                    <div className={cx("validation-view")}>
                        <h4>Trạng thái validation:</h4>
                        <div className={cx("validation-summary")}>
                            <div className={cx("summary-item", { valid: isValid })}>
                                <FontAwesomeIcon icon={isValid ? faCheckCircle : faExclamationTriangle} />
                                <span>Form {isValid ? "hợp lệ" : "chưa hợp lệ"}</span>
                            </div>
                        </div>

                        <div className={cx("field-validations")}>
                            {contractType.fields.map((field) => {
                                const fieldError = errors[field.name];
                                const fieldValue = watchedValues[field.name];
                                const hasValue = fieldValue && fieldValue !== "";

                                return (
                                    <div key={field.id} className={cx("validation-item")}>
                                        <div className={cx("field-name")}>
                                            {field.label}
                                            {field.required && <span className={cx("required")}>*</span>}
                                        </div>
                                        <div className={cx("validation-status")}>
                                            {fieldError ? (
                                                <span className={cx("status", "error")}>
                                                    <FontAwesomeIcon icon={faExclamationTriangle} />
                                                    {fieldError.message}
                                                </span>
                                            ) : hasValue ? (
                                                <span className={cx("status", "valid")}>
                                                    <FontAwesomeIcon icon={faCheckCircle} />
                                                    Hợp lệ
                                                </span>
                                            ) : field.required ? (
                                                <span className={cx("status", "pending")}>Chưa điền (bắt buộc)</span>
                                            ) : (
                                                <span className={cx("status", "optional")}>Tùy chọn</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
