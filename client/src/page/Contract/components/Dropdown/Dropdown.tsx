import type React from "react";
import { useState, useRef, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./Dropdown.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCheck } from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

interface Option {
    value: string;
    label: string;
    icon?: string;
}

interface DropdownProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
    options,
    value,
    onChange,
    placeholder = "Chọn...",
    disabled = false,
    error = false,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((option) => option.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={cx("dropdown", { disabled }, className)} ref={dropdownRef}>
            <div className={cx("dropdown-trigger", { open: isOpen, error: error })} onClick={() => !disabled && setIsOpen(!isOpen)}>
                <div className={cx("selected-content")}>
                    {selectedOption?.icon && <span className={cx("icon")}>{selectedOption.icon}</span>}
                    <span className={cx("text")}>{selectedOption?.label || placeholder}</span>
                </div>
                <FontAwesomeIcon icon={faChevronDown} className={cx("chevron", { rotated: isOpen })} />
            </div>

            {isOpen && (
                <div className={cx("dropdown-menu")}>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={cx("dropdown-item", { selected: option.value === value })}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.icon && <span className={cx("icon")}>{option.icon}</span>}
                            <span className={cx("text")}>{option.label}</span>
                            {option.value === value && <FontAwesomeIcon icon={faCheck} className={cx("check-icon")} />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
