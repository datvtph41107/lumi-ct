import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUpload, 
    faFileWord, 
    faFilePdf, 
    faFileAlt,
    faSpinner,
    faCheckCircle,
    faExclamationTriangle,
    faTimes,
    faEye,
    faEdit
} from '@fortawesome/free-solid-svg-icons';
import { useContractDraftStore } from '~/store/contract-draft-store';
import styles from './UploadFile.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface UploadFileProps {
    onFileProcessed: (content: string, fileName: string) => void;
    onCancel: () => void;
}

interface FileInfo {
    name: string;
    size: number;
    type: string;
    lastModified: number;
}

interface ProcessingResult {
    success: boolean;
    content?: string;
    error?: string;
    fileName?: string;
}

const UploadFile: React.FC<UploadFileProps> = ({ onFileProcessed, onCancel }) => {
    const { setDirty } = useContractDraftStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const supportedTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword', // .doc
        'application/pdf', // .pdf
        'text/plain' // .txt
    ];

    const maxFileSize = 10 * 1024 * 1024; // 10MB

    const getFileIcon = (fileType: string) => {
        if (fileType.includes('word') || fileType.includes('document')) {
            return faFileWord;
        }
        if (fileType.includes('pdf')) {
            return faFilePdf;
        }
        return faFileAlt;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const validateFile = (file: File): string | null => {
        if (!supportedTypes.includes(file.type)) {
            return 'Loại file không được hỗ trợ. Chỉ chấp nhận file Word (.doc, .docx), PDF (.pdf) và Text (.txt)';
        }

        if (file.size > maxFileSize) {
            return 'Kích thước file quá lớn. Tối đa 10MB';
        }

        return null;
    };

    const handleFileSelect = (file: File) => {
        const error = validateFile(file);
        if (error) {
            alert(error);
            return;
        }

        setSelectedFile(file);
        setFileInfo({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        });
        setProcessingResult(null);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const processFile = async (file: File): Promise<ProcessingResult> => {
        return new Promise((resolve) => {
            // Simulate file processing
            setTimeout(() => {
                try {
                    // In a real implementation, you would:
                    // 1. For Word files: Use mammoth.js or similar library
                    // 2. For PDF files: Use pdf.js or similar library
                    // 3. For text files: Read as text
                    
                    // For now, we'll simulate successful processing
                    const mockContent = `
                        <h1>HỢP ĐỒNG LAO ĐỘNG</h1>
                        
                        <p><strong>Số hợp đồng:</strong> ${file.name.replace(/\.[^/.]+$/, '')}-001</p>
                        <p><strong>Ngày ký:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
                        
                        <h2>THÔNG TIN CÁC BÊN</h2>
                        
                        <h3>BÊN A (NGƯỜI SỬ DỤNG LAO ĐỘNG)</h3>
                        <p>Tên công ty: _______________</p>
                        <p>Địa chỉ: _______________</p>
                        <p>Điện thoại: _______________</p>
                        <p>Người đại diện: _______________</p>
                        
                        <h3>BÊN B (NGƯỜI LAO ĐỘNG)</h3>
                        <p>Họ và tên: _______________</p>
                        <p>Ngày sinh: _______________</p>
                        <p>CMND/CCCD: _______________</p>
                        <p>Địa chỉ: _______________</p>
                        
                        <h2>ĐIỀU KHOẢN CHÍNH</h2>
                        
                        <h3>Điều 1: Vị trí công việc</h3>
                        <p>Bên B được thuê làm việc tại vị trí: _______________</p>
                        
                        <h3>Điều 2: Thời hạn hợp đồng</h3>
                        <p>Thời hạn hợp đồng: _______________</p>
                        
                        <h3>Điều 3: Mức lương</h3>
                        <p>Mức lương cơ bản: _______________ VNĐ/tháng</p>
                        
                        <h2>CHỮ KÝ CÁC BÊN</h2>
                        
                        <div style="display: flex; justify-content: space-between; margin-top: 50px;">
                            <div>
                                <p><strong>BÊN A</strong></p>
                                <p>Chữ ký: _______________</p>
                            </div>
                            <div>
                                <p><strong>BÊN B</strong></p>
                                <p>Chữ ký: _______________</p>
                            </div>
                        </div>
                    `;

                    resolve({
                        success: true,
                        content: mockContent,
                        fileName: file.name
                    });
                } catch (error) {
                    resolve({
                        success: false,
                        error: 'Không thể xử lý file. Vui lòng thử lại.'
                    });
                }
            }, 2000); // Simulate 2 seconds processing time
        });
    };

    const handleProcessFile = async () => {
        if (!selectedFile) return;

        setIsProcessing(true);
        setProcessingResult(null);

        try {
            const result = await processFile(selectedFile);
            setProcessingResult(result);

            if (result.success && result.content) {
                setDirty(true);
            }
        } catch (error) {
            setProcessingResult({
                success: false,
                error: 'Có lỗi xảy ra khi xử lý file'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleContinue = () => {
        if (processingResult?.success && processingResult.content) {
            onFileProcessed(processingResult.content, processingResult.fileName || '');
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFileInfo(null);
        setProcessingResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRetry = () => {
        setProcessingResult(null);
        if (selectedFile) {
            handleProcessFile();
        }
    };

    return (
        <div className={cx('upload-file')}>
            <div className={cx('upload-header')}>
                <h3>Tải file hợp đồng lên</h3>
                <p>Chọn file Word, PDF hoặc Text để chuyển đổi thành nội dung soạn thảo</p>
            </div>

            {/* File Upload Area */}
            {!selectedFile && (
                <div 
                    className={cx('upload-area', { 'drag-active': dragActive })}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className={cx('upload-content')}>
                        <FontAwesomeIcon icon={faUpload} className={cx('upload-icon')} />
                        <h4>Kéo thả file vào đây hoặc click để chọn</h4>
                        <p>Hỗ trợ: .doc, .docx, .pdf, .txt (Tối đa 10MB)</p>
                        <button className={cx('select-file-btn')}>
                            Chọn file
                        </button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".doc,.docx,.pdf,.txt"
                        onChange={handleFileInputChange}
                        style={{ display: 'none' }}
                    />
                </div>
            )}

            {/* Selected File Info */}
            {selectedFile && fileInfo && (
                <div className={cx('file-info')}>
                    <div className={cx('file-details')}>
                        <FontAwesomeIcon 
                            icon={getFileIcon(fileInfo.type)} 
                            className={cx('file-icon')} 
                        />
                        <div className={cx('file-meta')}>
                            <h4>{fileInfo.name}</h4>
                            <p>{formatFileSize(fileInfo.size)} • {new Date(fileInfo.lastModified).toLocaleDateString()}</p>
                        </div>
                        <button 
                            className={cx('remove-btn')}
                            onClick={handleRemoveFile}
                            disabled={isProcessing}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    {!processingResult && !isProcessing && (
                        <button 
                            className={cx('process-btn')}
                            onClick={handleProcessFile}
                        >
                            <FontAwesomeIcon icon={faUpload} />
                            Xử lý file
                        </button>
                    )}

                    {isProcessing && (
                        <div className={cx('processing')}>
                            <FontAwesomeIcon icon={faSpinner} spin />
                            <span>Đang xử lý file...</span>
                        </div>
                    )}

                    {processingResult && (
                        <div className={cx('processing-result', { success: processingResult.success })}>
                            {processingResult.success ? (
                                <>
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                    <span>Xử lý thành công!</span>
                                    <div className={cx('result-actions')}>
                                        <button 
                                            className={cx('preview-btn')}
                                            onClick={() => {
                                                // Show preview modal
                                                console.log('Preview content:', processingResult.content);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                            Xem trước
                                        </button>
                                        <button 
                                            className={cx('continue-btn')}
                                            onClick={handleContinue}
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                            Chuyển sang Editor
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faExclamationTriangle} />
                                    <span>{processingResult.error}</span>
                                    <button 
                                        className={cx('retry-btn')}
                                        onClick={handleRetry}
                                    >
                                        Thử lại
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className={cx('upload-actions')}>
                <button 
                    className={cx('cancel-btn')}
                    onClick={onCancel}
                    disabled={isProcessing}
                >
                    Hủy
                </button>
            </div>

            {/* Instructions */}
            <div className={cx('upload-instructions')}>
                <h4>Hướng dẫn:</h4>
                <ul>
                    <li>File Word (.doc, .docx): Nội dung sẽ được trích xuất và chuyển đổi</li>
                    <li>File PDF (.pdf): Văn bản sẽ được OCR và chuyển đổi</li>
                    <li>File Text (.txt): Nội dung sẽ được giữ nguyên định dạng</li>
                    <li>Sau khi xử lý, bạn có thể chỉnh sửa nội dung trong Editor</li>
                </ul>
            </div>
        </div>
    );
};

export default UploadFile;