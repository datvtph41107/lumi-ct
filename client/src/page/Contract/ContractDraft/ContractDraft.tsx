import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faArrowLeft, 
    faSave, 
    faEye, 
    faPrint,
    faDownload,
    faUsers,
    faCog,
    faLightbulb,
    faChevronLeft,
    faChevronRight,
    faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { useContractDraftStore } from '~/store/contract-draft-store';
import { contractService } from '~/services/api/contract.service';
import { templateService } from '~/services/api/template.service';
import type { ContractCreationMethod, ContractTemplate, ContractDraft } from '~/types/contract/contract.types';
import styles from './ContractDraft.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

// Import stage components
import StageDraft from '../components/stages/StageDraft/StageDraft';
import EditorPage from '../components/DaftContract/EditorPage';
import StageMilestones from '../components/stages/StageMilestones/StageMilestones';
import StageReview from '../components/stages/StageReview/StageReview';

const ContractDraft: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        currentDraft,
        currentStage,
        creationMethod,
        setCurrentDraft,
        setCurrentStage,
        setCreationMethod,
        nextStage,
        previousStage,
        saveStage,
        loadDraft
    } = useContractDraftStore();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
    const [selectedDraft, setSelectedDraft] = useState<ContractDraft | null>(null);

    useEffect(() => {
        initializeDraft();
    }, [id]);

    const initializeDraft = async () => {
        setLoading(true);
        setError(null);

        try {
            if (id) {
                // Load existing draft
                const response = await contractService.getDraft(id);
                const draft = response.data;
                setCurrentDraft(draft);
                setCurrentStage(draft.current_stage);
                setCreationMethod(draft.creation_method);
            } else {
                // Check if we have a creation method from previous step
                if (!creationMethod) {
                    // Redirect to creation method selection
                    navigate('/contracts');
                    return;
                }

                // Create new draft
                const newDraft = {
                    id: `draft_${Date.now()}`,
                    name: 'Hợp đồng mới',
                    description: '',
                    creation_method: creationMethod,
                    current_stage: 'draft',
                    status: 'draft',
                    content: '',
                    data: {},
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    created_by: 1, // TODO: Get from auth context
                    created_by_name: 'Nguyễn Văn A', // TODO: Get from auth context
                    last_auto_save: null
                };

                setCurrentDraft(newDraft);
                setCurrentStage('draft');
            }
        } catch (err) {
            setError('Không thể tải bản nháp');
            console.error('Error initializing draft:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTemplateSelect = (template: ContractTemplate) => {
        setSelectedTemplate(template);
        // Apply template content to draft
        if (currentDraft) {
            const updatedDraft = {
                ...currentDraft,
                content: template.content || '',
                data: template.fields || {},
                name: template.name
            };
            setCurrentDraft(updatedDraft);
        }
    };

    const handleDraftSelect = (draft: ContractDraft) => {
        setSelectedDraft(draft);
        setCurrentDraft(draft);
        setCurrentStage(draft.current_stage);
        setCreationMethod(draft.creation_method);
    };

    const handleStageComplete = async () => {
        try {
            await saveStage();
            nextStage();
        } catch (err) {
            setError('Không thể lưu giai đoạn hiện tại');
            console.error('Error saving stage:', err);
        }
    };

    const handleBack = () => {
        if (currentStage === 'draft') {
            navigate('/contracts/collection');
        } else {
            previousStage();
        }
    };

    const handleSave = async () => {
        try {
            await saveStage();
            // Show success message
        } catch (err) {
            setError('Không thể lưu bản nháp');
            console.error('Error saving draft:', err);
        }
    };

    const handlePreview = () => {
        // Open preview modal or navigate to preview page
        console.log('Opening preview...');
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        // Export functionality
        console.log('Exporting...');
    };

    const getStageTitle = (stage: string) => {
        switch (stage) {
            case 'draft': return 'Chọn phương thức';
            case 'editor': return 'Soạn thảo nội dung';
            case 'milestones_tasks': return 'Mốc thời gian & Công việc';
            case 'review': return 'Xem lại & Hoàn thành';
            default: return stage;
        }
    };

    const getStageDescription = (stage: string) => {
        switch (stage) {
            case 'draft': return 'Chọn cách tạo hợp đồng phù hợp';
            case 'editor': return 'Soạn thảo nội dung chi tiết';
            case 'milestones_tasks': return 'Thiết lập mốc thời gian và công việc';
            case 'review': return 'Kiểm tra và hoàn thành hợp đồng';
            default: return '';
        }
    };

    const getStageIcon = (stage: string) => {
        switch (stage) {
            case 'draft': return faLightbulb;
            case 'editor': return faFileAlt;
            case 'milestones_tasks': return faUsers;
            case 'review': return faCheckCircle;
            default: return faFileAlt;
        }
    };

    const canProceed = () => {
        if (!currentDraft) return false;

        switch (currentStage) {
            case 'draft':
                return creationMethod !== null;
            case 'editor':
                return currentDraft.content && currentDraft.content.trim().length > 0;
            case 'milestones_tasks':
                return true; // Can always proceed from milestones
            case 'review':
                return true; // Can always proceed from review
            default:
                return false;
        }
    };

    const isLastStage = () => {
        return currentStage === 'review';
    };

    if (loading) {
        return (
            <div className={cx('loading-container')}>
                <div className={cx('loading-spinner')}></div>
                <p>Đang tải bản nháp...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cx('error-container')}>
                <div className={cx('error-message')}>
                    <h3>Lỗi</h3>
                    <p>{error}</p>
                    <button onClick={initializeDraft}>Thử lại</button>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('contract-draft')}>
            {/* Header */}
            <div className={cx('header')}>
                <div className={cx('header-left')}>
                    <button className={cx('back-btn')} onClick={handleBack}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Quay lại
                    </button>
                    <div className={cx('draft-info')}>
                        <h1>{currentDraft?.name || 'Hợp đồng mới'}</h1>
                        <p>{getStageDescription(currentStage)}</p>
                    </div>
                </div>

                <div className={cx('header-right')}>
                    <div className={cx('stage-indicator')}>
                        <FontAwesomeIcon icon={getStageIcon(currentStage)} />
                        <span>{getStageTitle(currentStage)}</span>
                    </div>
                    <div className={cx('actions')}>
                        <button className={cx('action-btn', 'save')} onClick={handleSave}>
                            <FontAwesomeIcon icon={faSave} />
                            Lưu
                        </button>
                        <button className={cx('action-btn', 'preview')} onClick={handlePreview}>
                            <FontAwesomeIcon icon={faEye} />
                            Xem trước
                        </button>
                        <button className={cx('action-btn', 'print')} onClick={handlePrint}>
                            <FontAwesomeIcon icon={faPrint} />
                            In
                        </button>
                        <button className={cx('action-btn', 'export')} onClick={handleExport}>
                            <FontAwesomeIcon icon={faDownload} />
                            Xuất
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className={cx('progress-bar')}>
                <div className={cx('progress-steps')}>
                    {['draft', 'editor', 'milestones_tasks', 'review'].map((stage, index) => (
                        <div
                            key={stage}
                            className={cx('progress-step', {
                                active: currentStage === stage,
                                completed: ['draft', 'editor', 'milestones_tasks', 'review'].indexOf(currentStage) > index
                            })}
                        >
                            <div className={cx('step-icon')}>
                                <FontAwesomeIcon icon={getStageIcon(stage)} />
                            </div>
                            <span className={cx('step-title')}>{getStageTitle(stage)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className={cx('main-content')}>
                {currentStage === 'draft' && (
                    <StageDraft
                        creationMethod={creationMethod}
                        onMethodSelect={setCreationMethod}
                        onTemplateSelect={handleTemplateSelect}
                        onDraftSelect={handleDraftSelect}
                        selectedTemplate={selectedTemplate}
                        selectedDraft={selectedDraft}
                    />
                )}

                {currentStage === 'editor' && creationMethod === 'editor' && (
                    <EditorPage
                        contractId={currentDraft?.id}
                        userId={currentDraft?.created_by}
                    />
                )}

                {currentStage === 'editor' && creationMethod === 'basic' && (
                    <div className={cx('basic-form-container')}>
                        {/* Basic form component will be rendered here */}
                        <p>Basic form editor for contract creation</p>
                    </div>
                )}

                {currentStage === 'milestones_tasks' && (
                    <StageMilestones
                        contractId={currentDraft?.id}
                        onComplete={handleStageComplete}
                    />
                )}

                {currentStage === 'review' && (
                    <StageReview
                        contractId={currentDraft?.id}
                        onComplete={handleStageComplete}
                    />
                )}
            </div>

            {/* Footer Navigation */}
            <div className={cx('footer')}>
                <div className={cx('footer-left')}>
                    <span className={cx('draft-status')}>
                        Trạng thái: {currentDraft?.status || 'draft'}
                    </span>
                    {currentDraft?.last_auto_save && (
                        <span className={cx('last-save')}>
                            Lưu cuối: {new Date(currentDraft.last_auto_save).toLocaleString()}
                        </span>
                    )}
                </div>

                <div className={cx('footer-right')}>
                    {currentStage !== 'draft' && (
                        <button 
                            className={cx('nav-btn', 'prev')} 
                            onClick={previousStage}
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                            Trước
                        </button>
                    )}
                    
                    {!isLastStage() && (
                        <button 
                            className={cx('nav-btn', 'next', { disabled: !canProceed() })} 
                            onClick={handleStageComplete}
                            disabled={!canProceed()}
                        >
                            Tiếp theo
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    )}
                    
                    {isLastStage() && (
                        <button 
                            className={cx('nav-btn', 'complete')} 
                            onClick={handleStageComplete}
                        >
                            Hoàn thành
                            <FontAwesomeIcon icon={faCheckCircle} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContractDraft;