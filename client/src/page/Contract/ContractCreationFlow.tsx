import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContractDraftStore } from '~/store/contract-draft-store';
import { useContractStore } from '~/store/contract-store';
import type { ContractCreationStage, ContractCreationMode } from '~/types/contract/contract.types';
import { Logger } from '~/core/Logger';
import Button from '~/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faArrowLeft, 
    faArrowRight, 
    faSave, 
    faCheck,
    faExclamationTriangle,
    faSpinner
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './ContractCreationFlow.module.scss';

const cx = classNames.bind(styles);
const logger = Logger.getInstance();

interface StageConfig {
    id: ContractCreationStage;
    title: string;
    description: string;
    component: React.ComponentType;
    required: boolean;
    order: number;
}

const ContractCreationFlow: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentDraft, currentStage, stageValidations, navigateToStage, nextStage, previousStage, validateCurrentStage } = useContractDraftStore();
    const { formData, setFormData } = useContractStore();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Stage configuration
    const stages: StageConfig[] = [
        {
            id: 'template_selection',
            title: 'Chọn template',
            description: 'Chọn mẫu hợp đồng hoặc tạo mới',
            component: () => <div>Template Selection Component</div>,
            required: true,
            order: 1
        },
        {
            id: 'basic_info',
            title: 'Thông tin cơ bản',
            description: 'Điền thông tin hợp đồng cơ bản',
            component: () => <div>Basic Info Component</div>,
            required: true,
            order: 2
        },
        {
            id: 'content_draft',
            title: 'Soạn thảo nội dung',
            description: 'Tạo nội dung hợp đồng',
            component: () => <div>Content Draft Component</div>,
            required: true,
            order: 3
        },
        {
            id: 'milestones_tasks',
            title: 'Mốc thời gian & Công việc',
            description: 'Thiết lập mốc thời gian và phân công',
            component: () => <div>Milestones Component</div>,
            required: false,
            order: 4
        },
        {
            id: 'review_preview',
            title: 'Xem trước & Hoàn tất',
            description: 'Kiểm tra và hoàn tất hợp đồng',
            component: () => <div>Preview Component</div>,
            required: true,
            order: 5
        }
    ];

    const currentStageConfig = stages.find(stage => stage.id === currentStage);
    const currentStageIndex = stages.findIndex(stage => stage.id === currentStage);

    useEffect(() => {
        // Initialize flow if not already done
        if (!currentDraft) {
            const searchParams = new URLSearchParams(location.search);
            const mode = searchParams.get('mode') as ContractCreationMode;
            if (mode) {
                initializeFlow(mode);
            }
        }
    }, [currentDraft, location.search]);

    const initializeFlow = async (mode: ContractCreationMode) => {
        try {
            setLoading(true);
            // Initialize the contract creation flow
            await navigateToStage('template_selection');
        } catch (error) {
            logger.error('Failed to initialize flow:', error);
            setError('Không thể khởi tạo quy trình tạo hợp đồng');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        try {
            setError(null);
            const isValid = await validateCurrentStage();
            
            if (!isValid) {
                setError('Vui lòng hoàn thành thông tin bắt buộc trước khi tiếp tục');
                return;
            }

            if (currentStageIndex < stages.length - 1) {
                await nextStage();
            } else {
                // Final stage - submit for approval
                await handleSubmitForApproval();
            }
        } catch (error) {
            logger.error('Failed to proceed to next stage:', error);
            setError('Có lỗi xảy ra khi chuyển sang bước tiếp theo');
        }
    };

    const handlePrevious = () => {
        if (currentStageIndex > 0) {
            previousStage();
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            
            // Save current draft
            await validateCurrentStage();
            
            // TODO: Implement save functionality
            logger.info('Saving contract draft');
            
        } catch (error) {
            logger.error('Failed to save draft:', error);
            setError('Không thể lưu bản nháp');
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitForApproval = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Validate all required stages
            for (const stage of stages.filter(s => s.required)) {
                const validation = stageValidations[stage.id];
                if (validation.status !== 'valid') {
                    setError(`Vui lòng hoàn thành bước "${stage.title}" trước khi gửi phê duyệt`);
                    return;
                }
            }
            
            // TODO: Implement submit for approval
            logger.info('Submitting contract for approval');
            
            // Navigate to success page or dashboard
            navigate('/dashboard');
            
        } catch (error) {
            logger.error('Failed to submit for approval:', error);
            setError('Có lỗi xảy ra khi gửi phê duyệt');
        } finally {
            setLoading(false);
        }
    };

    const handleStageClick = async (stage: StageConfig) => {
        try {
            setError(null);
            
            // Check if stage is accessible
            const validation = stageValidations[stage.id];
            if (!validation.isAccessible) {
                setError(`Vui lòng hoàn thành các bước trước để truy cập "${stage.title}"`);
                return;
            }
            
            await navigateToStage(stage.id);
        } catch (error) {
            logger.error('Failed to navigate to stage:', error);
            setError('Không thể chuyển đến bước này');
        }
    };

    const getStageStatus = (stage: StageConfig) => {
        const validation = stageValidations[stage.id];
        
        if (stage.id === currentStage) {
            return 'current';
        }
        
        if (validation.status === 'valid') {
            return 'completed';
        }
        
        if (validation.isAccessible) {
            return 'accessible';
        }
        
        return 'locked';
    };

    const getStageIcon = (stage: StageConfig, status: string) => {
        switch (status) {
            case 'completed':
                return <FontAwesomeIcon icon={faCheck} className={cx('stage-icon', 'completed')} />;
            case 'current':
                return <span className={cx('stage-number', 'current')}>{stage.order}</span>;
            case 'accessible':
                return <span className={cx('stage-number', 'accessible')}>{stage.order}</span>;
            case 'locked':
                return <span className={cx('stage-number', 'locked')}>{stage.order}</span>;
            default:
                return <span className={cx('stage-number')}>{stage.order}</span>;
        }
    };

    if (loading) {
        return (
            <div className={cx('loading-container')}>
                <FontAwesomeIcon icon={faSpinner} spin />
                <p>Đang tải...</p>
            </div>
        );
    }

    if (!currentDraft) {
        return (
            <div className={cx('error-container')}>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <p>Không tìm thấy thông tin hợp đồng</p>
                <Button onClick={() => navigate('/contract/create')}>
                    Quay lại trang tạo hợp đồng
                </Button>
            </div>
        );
    }

    return (
        <div className={cx('contract-creation-flow')}>
            {/* Progress Bar */}
            <div className={cx('progress-bar')}>
                <div className={cx('progress-steps')}>
                    {stages.map((stage, index) => {
                        const status = getStageStatus(stage);
                        const isLast = index === stages.length - 1;
                        
                        return (
                            <React.Fragment key={stage.id}>
                                <div 
                                    className={cx('step', status)}
                                    onClick={() => handleStageClick(stage)}
                                >
                                    {getStageIcon(stage, status)}
                                    <div className={cx('step-content')}>
                                        <h4>{stage.title}</h4>
                                        <p>{stage.description}</p>
                                    </div>
                                </div>
                                {!isLast && (
                                    <div className={cx('step-connector', {
                                        completed: index < currentStageIndex
                                    })} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className={cx('error-message')}>
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>{error}</span>
                </div>
            )}

            {/* Current Stage Content */}
            <div className={cx('stage-content')}>
                <div className={cx('stage-header')}>
                    <h2>{currentStageConfig?.title}</h2>
                    <p>{currentStageConfig?.description}</p>
                </div>

                <div className={cx('stage-body')}>
                    {/* Render current stage component */}
                    {currentStageConfig && <currentStageConfig.component />}
                </div>
            </div>

            {/* Navigation Actions */}
            <div className={cx('navigation-actions')}>
                <div className={cx('left-actions')}>
                    <Button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        disabled={loading || saving}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Hủy
                    </Button>
                    
                    {currentStageIndex > 0 && (
                        <Button
                            type="button"
                            onClick={handlePrevious}
                            disabled={loading || saving}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                            Quay lại
                        </Button>
                    )}
                </div>

                <div className={cx('right-actions')}>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={loading || saving}
                        loading={saving}
                    >
                        <FontAwesomeIcon icon={faSave} />
                        Lưu nháp
                    </Button>

                    <Button
                        type="button"
                        primary
                        onClick={handleNext}
                        disabled={loading || saving}
                        loading={loading}
                    >
                        {currentStageIndex === stages.length - 1 ? (
                            <>
                                <FontAwesomeIcon icon={faCheck} />
                                Gửi phê duyệt
                            </>
                        ) : (
                            <>
                                Tiếp tục
                                <FontAwesomeIcon icon={faArrowRight} />
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Stage Validation Summary */}
            <div className={cx('validation-summary')}>
                <h4>Tiến độ hoàn thành:</h4>
                <div className={cx('validation-items')}>
                    {stages.map(stage => {
                        const validation = stageValidations[stage.id];
                        const isCompleted = validation.status === 'valid';
                        const isCurrent = stage.id === currentStage;
                        
                        return (
                            <div 
                                key={stage.id}
                                className={cx('validation-item', {
                                    completed: isCompleted,
                                    current: isCurrent,
                                    required: stage.required
                                })}
                            >
                                <span className={cx('validation-icon')}>
                                    {isCompleted ? (
                                        <FontAwesomeIcon icon={faCheck} />
                                    ) : isCurrent ? (
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                    ) : (
                                        <span>{stage.order}</span>
                                    )}
                                </span>
                                <span className={cx('validation-text')}>
                                    {stage.title}
                                    {stage.required && <span className={cx('required-indicator')}>*</span>}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ContractCreationFlow;