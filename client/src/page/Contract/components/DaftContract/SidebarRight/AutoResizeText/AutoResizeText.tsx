"use client";

import type React from "react";
import { useRef, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./AutoResizeText.module.scss";

const cx = classNames.bind(styles);

interface AutoResizeTextProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minRows?: number;
    maxRows?: number;
    className?: string;
}

const AutoResizeText: React.FC<AutoResizeTextProps> = ({ value, onChange, placeholder, minRows = 1, maxRows = 5, className }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            const scrollHeight = textarea.scrollHeight;
            const lineHeight = Number.parseInt(getComputedStyle(textarea).lineHeight);
            const minHeight = lineHeight * minRows;
            const maxHeight = lineHeight * maxRows;

            const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
            textarea.style.height = `${newHeight}px`;
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
        adjustHeight();
    };

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={cx("auto-resize-textarea", className)}
            rows={minRows}
        />
    );
};

export default AutoResizeText;
