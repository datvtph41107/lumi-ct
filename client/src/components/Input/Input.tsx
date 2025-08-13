import React from "react";
import { useFormContext } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import classNames from "classnames/bind";
import styles from "./Input.module.scss";

const cx = classNames.bind(styles);

interface InputProps {
    name: string;
    label?: string;
    type?: string;
    placeholder?: string;
    required?: string;
    minLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
    min?: number | string;
    max?: number | string;
    step?: number | string;
    classNameInput?: string;
    classNameLabel?: string;
    disabled?: boolean;
    value?: string | number;
    onChange?: (value: string | number) => void;
    error?: string;
}

const Input: React.FC<InputProps> = ({
    name,
    label,
    type = "text",
    placeholder,
    required,
    minLength,
    pattern,
    min,
    max,
    step,
    classNameInput,
    classNameLabel,
    disabled,
    value,
    onChange,
    error,
}) => {
    const form = useFormContext();
    const isControlled = typeof value !== "undefined" && typeof onChange === "function";

    const inputProps = isControlled
        ? {
              value,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(type === "number" ? Number(e.target.value) : e.target.value),
          }
        : form?.register?.(name, {
              required,
              minLength,
              pattern,
          });

    const hasError = !!error || !!form?.formState?.errors?.[name];

    return (
        <div className={cx("form-group")}>
            {label && (
                <label htmlFor={name} className={cx("form-label", classNameLabel)}>
                    {label}
                </label>
            )}

            <input
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={disabled}
                tabIndex={disabled ? -1 : undefined}
                min={min}
                max={max}
                step={step}
                className={cx("form-input", classNameInput, {
                    error: hasError,
                    disable: disabled,
                })}
                {...inputProps}
            />

            {error ? (
                <p className={cx("error-message")}>{error}</p>
            ) : (
                form &&
                form.formState?.errors &&
                name in form.formState.errors && (
                    <ErrorMessage
                        errors={form.formState.errors}
                        name={name}
                        render={({ message }) => <p className={cx("error-message")}>{message}</p>}
                    />
                )
            )}
        </div>
    );
};

export default Input;
