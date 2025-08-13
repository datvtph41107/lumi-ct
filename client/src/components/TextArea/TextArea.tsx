import { useFormContext } from "react-hook-form";
import classNames from "classnames/bind";
import styles from "./TextArea.module.scss";
import React from "react";

const cx = classNames.bind(styles);

interface TextAreaProps {
    name: string;
    label?: string;
    placeholder?: string;
    rows?: number;
    required?: string;
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ name, label, placeholder, rows = 4, required, value, onChange, error }) => {
    const form = useFormContext();
    const isControlled = typeof value !== "undefined" && typeof onChange === "function";

    const inputProps = isControlled
        ? {
              value,
              onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value),
          }
        : form?.register?.(name, { required });

    const hasError = error || form?.formState?.errors?.[name];

    return (
        <div className={cx("form-group")}>
            {label && <label className={cx("form-label")}>{label}</label>}
            <textarea
                rows={rows}
                placeholder={placeholder}
                {...inputProps}
                className={cx("form-input", {
                    error: hasError,
                })}
            />
            {error ? (
                <p className={cx("error-message")}>{error}</p>
            ) : (
                form?.formState?.errors?.[name]?.message && (
                    <p className={cx("error-message")}>{String(form.formState.errors[name]?.message)}</p>
                )
            )}
        </div>
    );
};

export default TextArea;
