import type React from "react";
import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCloudUploadAlt,
    faFile,
    faFileImage,
    faFilePdf,
    faFileWord,
    faFileExcel,
    faTrash,
    faEye,
    faDownload,
} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames/bind";
import styles from "./FileUploadSection.module.scss";
import type { FileAttachment } from "~/types/contract/contract.types";
import { validateFile } from "./validate-file";

const cx = classNames.bind(styles);

interface FileUploadSectionProps {
    files: FileAttachment[];
    onFilesChange: (files: FileAttachment[]) => void;
    maxFiles?: number;
    maxFileSize?: number; // in MB
    acceptedTypes?: string[];
}

export const FileUploadSection = ({
    files,
    onFilesChange,
    maxFiles = 10,
    maxFileSize = 10,
    acceptedTypes = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".txt"],
}: FileUploadSectionProps) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getFileIcon = (fileName: string, fileType: string) => {
        const extension = fileName.split(".").pop()?.toLowerCase();
        if (fileType.startsWith("image/")) return faFileImage;
        if (extension === "pdf") return faFilePdf;
        if (["doc", "docx"].includes(extension || "")) return faFileWord;
        if (["xls", "xlsx"].includes(extension || "")) return faFileExcel;
        return faFile;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    // const validateFile = (file: File): string | null => {
    //     if (file.size > maxFileSize * 1024 * 1024) {
    //         return `File quá lớn. Tối đa ${maxFileSize}MB`;
    //     }
    //     const extension = "." + file.name.split(".").pop()?.toLowerCase();
    //     if (!acceptedTypes.includes(extension)) {
    //         return `File không hợp lệ. Hỗ trợ: ${acceptedTypes.join(", ")}`;
    //     }
    //     if (files.length >= maxFiles) {
    //         return `Tối đa ${maxFiles} file`;
    //     }
    //     return null;
    // };

    // const simulateUpload = (file: File, fileId: string): Promise<string> => {
    //     return new Promise((resolve) => {
    //         let progress = 0;

    //         const interval = setInterval(() => {
    //             progress += Math.random() * 30;

    //             if (progress >= 100) {
    //                 progress = 100;
    //                 clearInterval(interval);
    //                 setUploadProgress((prev) => {
    //                     const next = { ...prev };
    //                     delete next[fileId];
    //                     return next;
    //                 });
    //                 resolve(`https://blob.example.com/${fileId}-${file.name}`);
    //             }

    //             setUploadProgress((prev) => ({
    //                 ...prev,
    //                 [fileId]: Math.min(progress, 100),
    //             }));
    //         }, 200);
    //     });
    // };

    const simulateUpload = (file: File, fileId: string): Promise<string> => {
        return new Promise((resolve) => {
            let progress = 0;

            const interval = setInterval(() => {
                progress += Math.random() * 20 + 10; // tăng mượt hơn

                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    setUploadProgress((prev) => {
                        const next = { ...prev };
                        delete next[fileId];
                        return next;
                    });

                    // ✅ Tạo URL local để có thể xem trước
                    const localUrl = URL.createObjectURL(file);
                    resolve(localUrl);
                }

                setUploadProgress((prev) => ({
                    ...prev,
                    [fileId]: Math.min(progress, 100),
                }));
            }, 150);
        });
    };

    const handleFileSelect = async (selectedFiles: FileList) => {
        const selectedArray = Array.from(selectedFiles);

        // Kiểm tra số lượng tối đa
        if (files.length + selectedArray.length > maxFiles) {
            alert(`Chỉ được đính kèm tối đa ${maxFiles} file`);
            return;
        }

        const validFiles: File[] = [];
        for (const file of selectedArray) {
            const error = validateFile(file, files, maxFiles, maxFileSize, acceptedTypes);
            if (error) {
                alert(error);
            } else {
                validFiles.push(file);
            }
        }

        if (validFiles.length === 0) return;

        // Tiến hành upload song song với fileId tương ứng
        const uploadedFiles = await Promise.all(
            validFiles.map(async (file, index) => {
                const fileId = `${Date.now()}-${index}`;
                const url = await simulateUpload(file, fileId);
                return {
                    id: fileId,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url,
                    file, // file object để gửi qua API
                    uploadedAt: new Date(),
                };
            }),
        );

        onFilesChange([...files, ...uploadedFiles]);

        // Reset input để chọn lại cùng file
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            handleFileSelect(e.target.files);
        }
        e.target.value = "";
    };

    const removeFile = (fileId: string) => {
        onFilesChange(files.filter((file) => file.id !== fileId));
        setUploadProgress((prev) => {
            const next = { ...prev };
            delete next[fileId];
            return next;
        });
    };

    const openFilePreview = (file: FileAttachment) => {
        const fileType = file.type;
        const fileUrl = file.url;

        // Nếu là ảnh hoặc PDF → mở xem trước trong tab mới
        if (fileType.startsWith("image/") || fileType === "application/pdf") {
            window.open(fileUrl, "_blank");
        }

        // Nếu là Word/Excel → hiện thông báo không hỗ trợ xem trực tiếp
        else if (
            fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || // .docx
            fileType === "application/msword" || // .doc
            fileType === "application/vnd.ms-excel" || // .xls
            fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" // .xlsx
        ) {
            alert("Tập tin không hỗ trợ xem trước. Vui lòng tải về để mở bằng phần mềm tương ứng.");
        }

        // Các loại khác
        else {
            alert("Định dạng này không hỗ trợ xem trước.");
        }
    };

    const downloadFile = (file: FileAttachment) => {
        const link = document.createElement("a");
        link.href = file.url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={cx("file-upload-section")}>
            <h4>📎 Tài liệu đính kèm</h4>

            <div
                className={cx("upload-area", { "drag-over": isDragOver })}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
            >
                <FontAwesomeIcon icon={faCloudUploadAlt} className={cx("upload-icon")} />
                <div className={cx("upload-text")}>
                    <p>
                        Kéo thả hoặc <span>nhấn để chọn</span>
                    </p>
                    <small>
                        Hỗ trợ: {acceptedTypes.join(", ")} • Tối đa {maxFileSize}MB • {maxFiles} files
                    </small>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptedTypes.join(",")}
                    onChange={handleFileInputChange}
                    className={cx("file-input")}
                />
            </div>

            {Object.keys(uploadProgress).length > 0 && (
                <div className={cx("upload-progress")}>
                    {Object.entries(uploadProgress).map(([fileId, progress]) => (
                        <div key={fileId} className={cx("progress-item")}>
                            <div className={cx("progress-bar")}>
                                <div className={cx("progress-fill")} style={{ width: `${progress}%` }} />
                            </div>
                            <span className={cx("progress-text")}>{Math.round(progress)}%</span>
                        </div>
                    ))}
                </div>
            )}

            {files.length > 0 ? (
                <div className={cx("files-list")}>
                    {files.map((file) => (
                        <div key={file.id} className={cx("file-item")}>
                            <div className={cx("file-info")}>
                                {file.type.startsWith("image/") ? (
                                    <img src={file.url} alt={file.name} className={cx("image-preview")} />
                                ) : (
                                    <FontAwesomeIcon icon={getFileIcon(file.name, file.type)} className={cx("file-icon")} />
                                )}
                                <div className={cx("file-details")}>
                                    <div className={cx("file-name")} title={file.name}>
                                        {file.name}
                                    </div>
                                    <div className={cx("file-meta")}>
                                        {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString("vi-VN")}
                                    </div>
                                </div>
                            </div>
                            <div className={cx("file-actions")}>
                                <button
                                    type="button"
                                    onClick={() => openFilePreview(file)}
                                    className={cx("action-btn", "preview")}
                                    title="Xem trước"
                                >
                                    <FontAwesomeIcon icon={faEye} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => downloadFile(file)}
                                    className={cx("action-btn", "download")}
                                    title="Tải xuống"
                                >
                                    <FontAwesomeIcon icon={faDownload} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeFile(file.id)}
                                    className={cx("action-btn", "delete")}
                                    title="Xóa"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={cx("empty-state")}>
                    <p>Chưa có tài liệu nào được đính kèm</p>
                </div>
            )}
        </div>
    );
};
