"use client";

import type React from "react";
import classNames from "classnames/bind";
import styles from "../SidebarRight.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

interface SecuritySectionProps {
    isExpanded: boolean;
    onToggle: () => void;
    version: string;
    setVersion: (value: string) => void;
    internalNotes: string;
    setInternalNotes: (value: string) => void;
    currentUser: string;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({
    isExpanded,
    onToggle,
    version,
    setVersion,
    internalNotes,
    setInternalNotes,
    currentUser,
}) => {
    return (
        <div className={cx("section")}>
            <div className={cx("header_right")} onClick={onToggle}>
                <div className={cx("header_right-layer")}>
                    <h4>
                        <FontAwesomeIcon icon={faLock} /> Bảo mật & Lưu vết
                    </h4>
                    <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                </div>
                <p className={cx("subtext")}>Phiên bản và ghi chú nội bộ</p>
            </div>

            {isExpanded && (
                <div className={cx("section-content")}>
                    <div className={cx("field")}>
                        <label>Phiên bản hiện tại</label>
                        <input type="text" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="Draft v1.0" />
                    </div>

                    <div className={cx("field")}>
                        <label>Ghi chú nội bộ</label>
                        <textarea
                            value={internalNotes}
                            onChange={(e) => setInternalNotes(e.target.value)}
                            rows={4}
                            placeholder="Ghi chú, comment giữa các bộ phận..."
                        />
                    </div>

                    <div className={cx("history-section")}>
                        <p className={cx("label")}>Lịch sử chỉnh sửa</p>
                        <div className={cx("history-item")}>
                            <div className={cx("history-time")}>{new Date().toLocaleString("vi-VN")}</div>
                            <div className={cx("history-action")}>Tạo bản nháp hợp đồng - {currentUser.split(" - ")[0]}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecuritySection;
