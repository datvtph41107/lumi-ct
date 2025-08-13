"use client";

import type React from "react";
import classNames from "classnames/bind";
import styles from "../SidebarRight.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faChevronUp, faChevronDown, faFile, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { AttachedFile } from "~/hooks/useContractForm";

const cx = classNames.bind(styles);

interface AttachmentsSectionProps {
    isExpanded: boolean;
    onToggle: () => void;
    attachedFiles: AttachedFile[];
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeFile: (id: number) => void;
}

const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({ isExpanded, onToggle, attachedFiles, handleFileUpload, removeFile }) => {
    return (
        <div className={cx("section")}>
            <div className={cx("header_right")} onClick={onToggle}>
                <div className={cx("header_right-layer")}>
                    <h4>
                        <FontAwesomeIcon icon={faUpload} /> Tài liệu đính kèm
                    </h4>
                    <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                </div>
                <p className={cx("subtext")}>File hợp đồng và tài liệu liên quan</p>
            </div>

            {isExpanded && (
                <div className={cx("section-content")}>
                    <div className={cx("field")}>
                        <label>Tải lên tài liệu</label>
                        <div className={cx("upload-area")}>
                            <input
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                                className={cx("file-input")}
                                id="file-upload"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                            />
                            <label htmlFor="file-upload" className={cx("upload-label")}>
                                <FontAwesomeIcon icon={faUpload} />
                                <span>Chọn file hoặc kéo thả vào đây</span>
                                <small>Hỗ trợ: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Tối đa 10MB/file)</small>
                            </label>
                        </div>
                    </div>

                    {attachedFiles.length > 0 && (
                        <div className={cx("file-list")}>
                            <p className={cx("label")}>Tài liệu đã tải ({attachedFiles.length})</p>
                            <ul>
                                {attachedFiles.map((file) => (
                                    <li key={file.id} className={cx("file-item")}>
                                        <FontAwesomeIcon icon={faFile} />
                                        <div className={cx("file-info")}>
                                            <span className={cx("file-name")} title={file.name}>
                                                {file.name}
                                            </span>
                                            <span className={cx("file-size")}>{file.size}</span>
                                        </div>
                                        <FontAwesomeIcon
                                            icon={faTrash}
                                            className={cx("trash")}
                                            onClick={() => removeFile(file.id)}
                                            title="Xóa file"
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AttachmentsSection;
