import React, { useState, useEffect } from 'react';
import { useContractDraftStore } from '~/store/contract-draft-store';
import type { ContractFormData, Milestone, Task } from '~/types/contract/contract.types';
import { Logger } from '~/core/Logger';
import Button from '~/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEye, 
    faDownload, 
    faPrint, 
    faCheckCircle,
    faExclamationTriangle,
    faCalendarAlt,
    faUser,
    faBuilding,
    faClock,
    faFileAlt,
    faBell,
    faTasks
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './StagePreview.module.scss';

const cx = classNames.bind(styles);
const logger = Logger.getInstance();

const StagePreview: React.FC = () => {
    const { currentDraft, validateCurrentStage } = useContractDraftStore();
    
    const [contractData, setContractData] = useState<ContractFormData | null>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        if (currentDraft) {
            setContractData(currentDraft.contractData);
            validateContract();
        }
    }, [currentDraft]);

    const validateContract = () => {
        const errors: string[] = [];
        
        if (!contractData?.name?.trim()) {
            errors.push('Tên hợp đồng không được để trống');
        }
        
        if (!contractData?.contractType) {
            errors.push('Loại hợp đồng không được để trống');
        }
        
        if (contractData?.milestones?.length === 0) {
            errors.push('Cần có ít nhất một mốc thời gian');
        }
        
        // Validate milestones
        contractData?.milestones?.forEach((milestone, index) => {
            if (!milestone.name?.trim()) {
                errors.push(`Mốc thời gian ${index + 1}: Tên không được để trống`);
            }
            if (!milestone.dateRange.startDate || !milestone.dateRange.endDate) {
                errors.push(`Mốc thời gian ${index + 1}: Ngày bắt đầu và kết thúc không được để trống`);
            }
            if (!milestone.assignee?.trim()) {
                errors.push(`Mốc thời gian ${index + 1}: Người phụ trách không được để trống`);
            }
        });
        
        setValidationErrors(errors);
        setIsValid(errors.length === 0);
    };

    const handleExportPDF = () => {
        logger.info('Exporting contract to PDF');
        // TODO: Implement PDF export
        alert('Tính năng xuất PDF sẽ được triển khai');
    };

    const handleExportDOCX = () => {
        logger.info('Exporting contract to DOCX');
        // TODO: Implement DOCX export
        alert('Tính năng xuất DOCX sẽ được triển khai');
    };

    const handlePrint = () => {
        logger.info('Printing contract');
        window.print();
    };

    const handleSubmitForApproval = async () => {
        if (!isValid) {
            alert('Vui lòng kiểm tra và sửa các lỗi trước khi gửi phê duyệt');
            return;
        }

        try {
            // TODO: Implement submit for approval
            logger.info('Submitting contract for approval');
            alert('Hợp đồng đã được gửi để phê duyệt');
        } catch (error) {
            logger.error('Failed to submit contract for approval:', error);
            alert('Có lỗi xảy ra khi gửi phê duyệt');
        }
    };

    const getContractTypeLabel = (type: string) => {
        const typeLabels: Record<string, string> = {
            'service': 'Hợp đồng dịch vụ',
            'purchase': 'Hợp đồng mua bán',
            'employment': 'Hợp đồng lao động',
            'nda': 'Thỏa thuận bảo mật',
            'partnership': 'Hợp đồng hợp tác',
            'rental': 'Hợp đồng thuê',
            'custom': 'Hợp đồng tùy chỉnh'
        };
        return typeLabels[type] || type;
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low': return '#28a745';
            case 'medium': return '#ffc107';
            case 'high': return '#fd7e14';
            case 'critical': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getDepartmentName = (code: string) => {
        const departments: Record<string, string> = {
            'SALES': 'Phòng Kinh doanh',
            'TECH': 'Phòng Kỹ thuật',
            'HR': 'Phòng Nhân sự',
            'FINANCE': 'Phòng Tài chính',
            'LEGAL': 'Phòng Pháp chế'
        };
        return departments[code] || code;
    };

    if (!contractData) {
        return (
            <div className={cx('loading')}>
                <p>Đang tải thông tin hợp đồng...</p>
            </div>
        );
    }

    return (
        <div className={cx('stage-preview')}>
            <div className={cx('header')}>
                <div className={cx('header-content')}>
                    <h2>Xem trước hợp đồng</h2>
                    <p>Kiểm tra toàn bộ thông tin trước khi gửi phê duyệt</p>
                </div>
                
                <div className={cx('header-actions')}>
                    <Button
                        type="button"
                        onClick={handleExportPDF}
                        leftIcon={<FontAwesomeIcon icon={faDownload} />}
                    >
                        Xuất PDF
                    </Button>
                    <Button
                        type="button"
                        onClick={handleExportDOCX}
                        leftIcon={<FontAwesomeIcon icon={faDownload} />}
                    >
                        Xuất DOCX
                    </Button>
                    <Button
                        type="button"
                        onClick={handlePrint}
                        leftIcon={<FontAwesomeIcon icon={faPrint} />}
                    >
                        In
                    </Button>
                </div>
            </div>

            {/* Validation Summary */}
            {validationErrors.length > 0 && (
                <div className={cx('validation-errors')}>
                    <div className={cx('error-header')}>
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        <h3>Cần sửa các lỗi sau:</h3>
                    </div>
                    <ul>
                        {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {isValid && (
                <div className={cx('validation-success')}>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <span>Tất cả thông tin đã được kiểm tra và hợp lệ</span>
                </div>
            )}

            <div className={cx('content')}>
                {/* Contract Basic Information */}
                <div className={cx('section')}>
                    <div className={cx('section-header')}>
                        <h3>
                            <FontAwesomeIcon icon={faFileAlt} />
                            Thông tin cơ bản
                        </h3>
                    </div>
                    
                    <div className={cx('info-grid')}>
                        <div className={cx('info-item')}>
                            <label>Tên hợp đồng:</label>
                            <span>{contractData.name}</span>
                        </div>
                        <div className={cx('info-item')}>
                            <label>Loại hợp đồng:</label>
                            <span>{getContractTypeLabel(contractData.contractType)}</span>
                        </div>
                        <div className={cx('info-item')}>
                            <label>Mã hợp đồng:</label>
                            <span>{contractData.contractCode || 'Chưa có'}</span>
                        </div>
                        <div className={cx('info-item')}>
                            <label>Người soạn thảo:</label>
                            <span>{contractData.drafter || 'Chưa có'}</span>
                        </div>
                        <div className={cx('info-item')}>
                            <label>Người quản lý:</label>
                            <span>{contractData.manager || 'Chưa có'}</span>
                        </div>
                        <div className={cx('info-item')}>
                            <label>Độ ưu tiên:</label>
                            <span style={{ color: getPriorityColor(contractData.priority || 'medium') }}>
                                {contractData.priority?.toUpperCase() || 'MEDIUM'}
                            </span>
                        </div>
                    </div>

                    {contractData.tags && contractData.tags.length > 0 && (
                        <div className={cx('tags-section')}>
                            <label>Tags:</label>
                            <div className={cx('tags-list')}>
                                {contractData.tags.map((tag, index) => (
                                    <span key={index} className={cx('tag')}>{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {contractData.notes && (
                        <div className={cx('notes-section')}>
                            <label>Ghi chú:</label>
                            <p>{contractData.notes}</p>
                        </div>
                    )}
                </div>

                {/* Contract Content */}
                <div className={cx('section')}>
                    <div className={cx('section-header')}>
                        <h3>
                            <FontAwesomeIcon icon={faFileAlt} />
                            Nội dung hợp đồng
                        </h3>
                    </div>
                    
                    <div className={cx('content-preview')}>
                        {contractData.mode === 'basic' && contractData.content?.mode === 'basic' && (
                            <div className={cx('basic-content')}>
                                <p>Hợp đồng được tạo từ template với {Object.keys(contractData.content.fieldValues || {}).length} trường dữ liệu</p>
                                {contractData.content.description && (
                                    <div className={cx('description')}>
                                        <strong>Mô tả:</strong> {contractData.content.description}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {contractData.mode === 'editor' && contractData.content?.mode === 'editor' && (
                            <div className={cx('editor-content')}>
                                <div 
                                    className={cx('content-html')}
                                    dangerouslySetInnerHTML={{ __html: contractData.content.editorContent.content }}
                                />
                                <div className={cx('content-meta')}>
                                    <span>Số từ: {contractData.content.editorContent.metadata.wordCount}</span>
                                    <span>Số ký tự: {contractData.content.editorContent.metadata.characterCount}</span>
                                    <span>Phiên bản: {contractData.content.editorContent.metadata.version}</span>
                                </div>
                            </div>
                        )}
                        
                        {contractData.mode === 'upload' && contractData.content?.mode === 'upload' && (
                            <div className={cx('upload-content')}>
                                <div className={cx('uploaded-file')}>
                                    <FontAwesomeIcon icon={faFileAlt} />
                                    <div className={cx('file-info')}>
                                        <strong>{contractData.content.uploadedFile.fileName}</strong>
                                        <span>{(contractData.content.uploadedFile.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                </div>
                                {contractData.content.editorContent.content && (
                                    <div className={cx('edited-content')}>
                                        <h4>Nội dung đã chỉnh sửa:</h4>
                                        <div 
                                            className={cx('content-html')}
                                            dangerouslySetInnerHTML={{ __html: contractData.content.editorContent.content }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Milestones and Tasks */}
                <div className={cx('section')}>
                    <div className={cx('section-header')}>
                        <h3>
                            <FontAwesomeIcon icon={faTasks} />
                            Mốc thời gian và công việc ({contractData.milestones?.length || 0})
                        </h3>
                    </div>
                    
                    <div className={cx('milestones-preview')}>
                        {contractData.milestones?.map((milestone, index) => (
                            <div key={milestone.id} className={cx('milestone-preview')}>
                                <div className={cx('milestone-header')}>
                                    <h4>Mốc {index + 1}: {milestone.name}</h4>
                                    <div className={cx('milestone-meta')}>
                                        <span className={cx('priority')} style={{ color: getPriorityColor(milestone.priority) }}>
                                            {milestone.priority.toUpperCase()}
                                        </span>
                                        {milestone.departmentCode && (
                                            <span className={cx('department')}>
                                                <FontAwesomeIcon icon={faBuilding} />
                                                {getDepartmentName(milestone.departmentCode)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {milestone.description && (
                                    <p className={cx('milestone-description')}>{milestone.description}</p>
                                )}
                                
                                <div className={cx('milestone-details')}>
                                    <div className={cx('detail-item')}>
                                        <FontAwesomeIcon icon={faCalendarAlt} />
                                        <span>
                                            {milestone.dateRange.startDate} - {milestone.dateRange.endDate}
                                        </span>
                                    </div>
                                    <div className={cx('detail-item')}>
                                        <FontAwesomeIcon icon={faUser} />
                                        <span>{milestone.assignee}</span>
                                    </div>
                                </div>
                                
                                {milestone.tasks && milestone.tasks.length > 0 && (
                                    <div className={cx('tasks-preview')}>
                                        <h5>Công việc ({milestone.tasks.length})</h5>
                                        <div className={cx('tasks-list')}>
                                            {milestone.tasks.map((task) => (
                                                <div key={task.id} className={cx('task-preview')}>
                                                    <div className={cx('task-info')}>
                                                        <span className={cx('task-name')}>{task.name}</span>
                                                        <div className={cx('task-meta')}>
                                                            <span>
                                                                <FontAwesomeIcon icon={faUser} />
                                                                {task.assignee}
                                                            </span>
                                                            <span>
                                                                <FontAwesomeIcon icon={faClock} />
                                                                {task.timeRange.estimatedHours}h
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notification Settings */}
                {contractData.notificationSettings && (
                    <div className={cx('section')}>
                        <div className={cx('section-header')}>
                            <h3>
                                <FontAwesomeIcon icon={faBell} />
                                Cài đặt thông báo
                            </h3>
                        </div>
                        
                        <div className={cx('notification-preview')}>
                            <div className={cx('notification-summary')}>
                                <div className={cx('summary-item')}>
                                    <span>Người nhận:</span>
                                    <strong>{contractData.notificationSettings.recipients?.length || 0} người</strong>
                                </div>
                                <div className={cx('summary-item')}>
                                    <span>Nhắc nhở:</span>
                                    <strong>{contractData.notificationSettings.reminders?.length || 0} lịch</strong>
                                </div>
                                <div className={cx('summary-item')}>
                                    <span>Email:</span>
                                    <strong>{contractData.notificationSettings.emailNotifications ? 'Bật' : 'Tắt'}</strong>
                                </div>
                                <div className={cx('summary-item')}>
                                    <span>SMS:</span>
                                    <strong>{contractData.notificationSettings.smsNotifications ? 'Bật' : 'Tắt'}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className={cx('actions')}>
                <Button
                    type="button"
                    onClick={() => window.history.back()}
                >
                    Quay lại
                </Button>
                <Button
                    type="button"
                    primary
                    onClick={handleSubmitForApproval}
                    disabled={!isValid}
                    leftIcon={<FontAwesomeIcon icon={faCheckCircle} />}
                >
                    Gửi phê duyệt
                </Button>
            </div>
        </div>
    );
};

export default StagePreview;