"use client";

import type React from "react";
import { useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./BaseModal.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    size?: "small" | "medium" | "large" | "extra-large" | "full-screen";
    className?: string;
}

const BaseModal: React.FC<BaseModalProps> = ({ isOpen, onClose, title, icon, children, size = "medium", className }) => {
    // Close modal on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={cx("modal-overlay")} onClick={onClose}>
            <div className={cx("modal-container", size, className)} onClick={(e) => e.stopPropagation()}>
                <div className={cx("modal-header")}>
                    <div className={cx("modal-title")}>
                        {icon && <span className={cx("modal-icon")}>{icon}</span>}
                        <h2>{title}</h2>
                    </div>
                    <button className={cx("close-button")} onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className={cx("modal-content")}>{children}</div>
            </div>
        </div>
    );
};

export default BaseModal;
