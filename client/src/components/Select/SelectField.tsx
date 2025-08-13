import type React from "react";
import styles from "./SelectField.module.scss";

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export const SelectField: React.FC<SelectProps> = ({
    value,
    onChange,
    options,
    placeholder = "Chọn...",
    className = "",
    disabled = false,
}) => {
    return (
        <div className={`${styles.selectWrapper} ${className}`}>
            <select value={value} onChange={(e) => onChange(e.target.value)} className={styles.select} disabled={disabled}>
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <div className={styles.selectIcon}>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
    );
};
