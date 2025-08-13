import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import Dropdown from "~/page/Contract/components/Dropdown/Dropdown";
import classNames from "classnames/bind";
import styles from "./ControlledField.module.scss";

const cx = classNames.bind(styles);

interface Option {
    value: string;
    label: string;
    icon?: string;
}

interface ControlledDropdownFieldProps {
    name: string;
    label?: string;
    options: Option[];
    className?: string;
    placeholder?: string;
    requiredMessage?: string;
    disabled?: boolean;
    // Controlled mode
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
}

const ControlledDropdownField: React.FC<ControlledDropdownFieldProps> = ({
    name,
    label,
    options,
    className,
    placeholder = "Chọn...",
    requiredMessage = "Vui lòng chọn giá trị",
    disabled = false,
    value,
    onChange,
    error,
}) => {
    const form = useFormContext();
    const isControlled = typeof value !== "undefined" && typeof onChange === "function";
    const formError = form?.formState?.errors?.[name];
    const hasError = !!error || !!formError;

    return (
        <div className={cx("form-group", "custom-dropdown", className)}>
            {label && <label className={cx("form-label")}>{label} *</label>}

            {isControlled ? (
                <Dropdown
                    options={options}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    error={hasError}
                />
            ) : (
                <Controller
                    name={name}
                    control={form?.control}
                    rules={{ required: requiredMessage }}
                    render={({ field }) => (
                        <Dropdown
                            options={options}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={placeholder}
                            disabled={disabled}
                            error={!!formError}
                        />
                    )}
                />
            )}

            {error ? (
                <p className={cx("error-message")}>{error}</p>
            ) : (
                formError && <p className={cx("error-message")}>{String(formError?.message)}</p>
            )}
        </div>
    );
};

export default ControlledDropdownField;
