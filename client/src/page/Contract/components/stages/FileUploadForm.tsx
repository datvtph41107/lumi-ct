"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt, faFileContract, faTrash, faEye, faEdit, faCheck } from "@fortawesome/free-solid-svg-icons";
import { useContractStore } from "~/store/contract-store";
import styles from "./FileUploadForm.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

const FileUploadForm = () => {
    const { contractData, updateContractData } = useContractStore();

    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [extractedContent, setExtractedContent] = useState(contractData.content || "");
    const [isProcessing, setIsProcessing] = useState(false);
    const [showEditor, setShowEditor] = useState(false);

    const handleFileUpload = async (file: File) => {
        setUploadedFile(file);
        setIsProcessing(true);

        // Simulate file processing
        setTimeout(() => {
            const mockContent = `HỢPĐỒNG CUNG CẤP DỊCH VỤ

Số: ${Date.now().toString().slice(-6)}

Căn cứ Bộ luật Dân sự năm 2015;
Căn cứ Luật Thương mại năm 2005;
Căn cứ nhu cầu và khả năng của các bên;

Hôm nay, ngày ${new Date().toLocaleDateString("vi-VN")}, chúng tôi gồm:

BÊN A (BÊN THUÊ DỊCH VỤ):
Tên: [Tên khách hàng]
Địa chỉ: [Địa chỉ]
Điện thoại: [Số điện thoại]
Email: [Email]

BÊN B (BÊN CUNG CẤP DỊCH VỤ):
Tên: [Tên công ty]
Địa chỉ: [Địa chỉ]
Điện thoại: [Số điện thoại]
Email: [Email]

Hai bên thống nhất ký kết hợp đồng với các điều khoản sau:

ĐIỀU 1: NỘI DUNG DỊCH VỤ
Bên B cam kết cung cấp cho Bên A các dịch vụ sau:
- [Mô tả dịch vụ chi tiết]

ĐIỀU 2: GIÁ TRỊ HỢP ĐỒNG VÀ PHƯƠNG THỨC THANH TOÁN
- Tổng giá trị hợp đồng: [Số tiền] VNĐ
- Phương thức thanh toán: [Phương thức]

ĐIỀU 3: THỜI GIAN THỰC HIỆN
- Thời gian bắt đầu: [Ngày bắt đầu]
- Thời gian kết thúc: [Ngày kết thúc]

ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN
[Chi tiết quyền và nghĩa vụ]

ĐIỀU 5: ĐIỀU KHOẢN CHUNG
Hợp đồng này có hiệu lực kể từ ngày ký và được lập thành 02 bản có giá trị pháp lý như nhau.

BÊN A                           BÊN B
(Ký tên, đóng dấu)             (Ký tên, đóng dấu)`;

            setExtractedContent(mockContent);
            updateContractData({
                content: mockContent,
                title: `Hợp đồng từ file ${file.name}`,
                type: "service",
            });
            setIsProcessing(false);
        }, 2000);
    };

    const handleContentChange = (content: string) => {
        setExtractedContent(content);
        updateContractData({ content });
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        setExtractedContent("");
        setShowEditor(false);
        updateContractData({ content: "" });
    };

    return (
        <div className={cx("upload-form-container")}>
            <div className={cx("form-header")}>
                <h2>
                    <FontAwesomeIcon icon={faCloudUploadAlt} />
                    Tải file hợp đồng lên
                </h2>
                <p>Upload file hợp đồng có sẵn và chỉnh sửa nếu cần thiết</p>
            </div>

            <div className={cx("upload-section")}>
                {!uploadedFile ? (
                    <div className={cx("upload-area")}>
                        <input
                            type="file"
                            id="file-upload"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file);
                            }}
                            style={{ display: "none" }}
                        />

                        <label htmlFor="file-upload" className={cx("upload-label")}>
                            <FontAwesomeIcon icon={faCloudUploadAlt} />
                            <h3>Kéo thả file vào đây hoặc click để chọn</h3>
                            <p>Hỗ trợ: PDF, DOC, DOCX, TXT (Tối đa 10MB)</p>
                            <div className={cx("supported-formats")}>
                                <span>PDF</span>
                                <span>DOC</span>
                                <span>DOCX</span>
                                <span>TXT</span>
                            </div>
                        </label>
                    </div>
                ) : (
                    <div className={cx("uploaded-file-info")}>
                        <div className={cx("file-details")}>
                            <FontAwesomeIcon icon={faFileContract} />
                            <div className={cx("file-info")}>
                                <h4>{uploadedFile.name}</h4>
                                <p>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button className={cx("remove-file")} onClick={handleRemoveFile}>
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>

                        {isProcessing && (
                            <div className={cx("processing-status")}>
                                <div className={cx("loading-spinner")}></div>
                                <p>Đang xử lý và trích xuất nội dung...</p>
                            </div>
                        )}

                        {extractedContent && !isProcessing && (
                            <div className={cx("extraction-complete")}>
                                <FontAwesomeIcon icon={faCheck} />
                                <p>Trích xuất nội dung thành công!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {extractedContent && !isProcessing && (
                <div className={cx("content-section")}>
                    <div className={cx("content-header")}>
                        <h3>Nội dung được trích xuất</h3>
                        <div className={cx("content-actions")}>
                            <button className={cx("action-btn", { active: !showEditor })} onClick={() => setShowEditor(false)}>
                                <FontAwesomeIcon icon={faEye} />
                                Xem trước
                            </button>
                            <button className={cx("action-btn", { active: showEditor })} onClick={() => setShowEditor(true)}>
                                <FontAwesomeIcon icon={faEdit} />
                                Chỉnh sửa
                            </button>
                        </div>
                    </div>

                    <div className={cx("content-display")}>
                        {showEditor ? (
                            <textarea
                                value={extractedContent}
                                onChange={(e) => handleContentChange(e.target.value)}
                                className={cx("content-editor")}
                                rows={20}
                                placeholder="Chỉnh sửa nội dung hợp đồng..."
                            />
                        ) : (
                            <div className={cx("content-preview")}>
                                <pre>{extractedContent}</pre>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className={cx("help-section")}>
                <h3>Hướng dẫn sử dụng</h3>
                <div className={cx("help-content")}>
                    <div className={cx("help-item")}>
                        <span className={cx("step-number")}>1</span>
                        <div>
                            <h4>Tải file lên</h4>
                            <p>Chọn file hợp đồng từ máy tính của bạn</p>
                        </div>
                    </div>
                    <div className={cx("help-item")}>
                        <span className={cx("step-number")}>2</span>
                        <div>
                            <h4>Xem nội dung</h4>
                            <p>Hệ thống sẽ tự động trích xuất nội dung từ file</p>
                        </div>
                    </div>
                    <div className={cx("help-item")}>
                        <span className={cx("step-number")}>3</span>
                        <div>
                            <h4>Chỉnh sửa</h4>
                            <p>Bổ sung hoặc điều chỉnh nội dung nếu cần thiết</p>
                        </div>
                    </div>
                    <div className={cx("help-item")}>
                        <span className={cx("step-number")}>4</span>
                        <div>
                            <h4>Tiếp tục</h4>
                            <p>Chuyển sang giai đoạn tiếp theo để hoàn tất</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileUploadForm;
