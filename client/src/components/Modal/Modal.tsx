import React, { useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./Modal.module.scss";

import type { ReactNode } from "react";

const cx = classNames.bind(styles);

interface ModalProps {
    show: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    width?: string;
}

const Modal: React.FC<ModalProps> = ({ show, onClose, children, width = "500px" }) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!show) return null;

    return (
        <>
            <div className={cx("modal-overlay")} onClick={onClose} />
            <div className={cx("modal-wrapper")} style={{ width }}>
                {children}
            </div>
        </>
    );
};

export default Modal;
