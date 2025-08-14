import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFileAlt, 
    faEdit, 
    faUpload,
    faArrowRight,
    faCheckCircle,
    faInfoCircle,
    faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { useContractDraftStore } from '~/store/contract-draft-store';
import { templateService } from '~/services/api/template.service';
import { contractService } from '~/services/api/contract.service';
import type { 
    ContractCreationMethod, 
    ContractTemplate, 
    ContractDraft 
} from '~/types/contract/contract.types';
import styles from './StageDraft.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface StageDraftProps {
    creationMethod: ContractCreationMethod | null;
    onMethodSelect: (method: ContractCreationMethod) => void;
    onTemplateSelect: (template: ContractTemplate) => void;
    onDraftSelect: (draft: ContractDraft) => void;
    selectedTemplate: ContractTemplate | null;
    selectedDraft: ContractDraft | null;
}

const StageDraft: React.FC<StageDraftProps> = ({
    creationMethod,
    onMethodSelect,
    onTemplateSelect,
    onDraftSelect,
    selectedTemplate,
    selectedDraft
}) => {
    const [activeSection, setActiveSection] = useState<'method' | 'template' | 'draft'>('method');
    const [templates, setTemplates] = useState<ContractTemplate[]>([]);
    const [drafts, setDrafts] = useState<ContractDraft[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (creationMethod) {
            loadTemplates();
            loadDrafts();
        }
    }, [creationMethod]);

    const loadTemplates = async () => {
        if (!creationMethod) return;
        
        try {
            setLoading(true);
            const response = await templateService.listTemplates({
                type: creationMethod,
                limit: 10
            });
            setTemplates(response.data?.data || []);
        } catch (err) {
            setError('Không thể tải templates');
            console.error('Error loading templates:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadDrafts = async () => {
        try {
            setLoading(true);
            const response = await contractService.listDrafts({
                limit: 10
            });
            setDrafts(response.data?.data || []);
        } catch (err) {
            setError('Không thể tải bản nháp');
            console.error('Error loading drafts:', err);
        } finally {
            setLoading(false);
        }
    };

    const creationMethods = [
        {
            id: 'basic' as ContractCreationMethod,
            title: 'Soạn thảo Form',
            description: 'Tạo hợp đồng bằng cách điền các trường thông tin cơ bản',
            icon: faFileAlt,
            features: [
                'Điền form thông tin cơ bản',
                'Tự động tạo cấu trúc hợp đồng',
                'Phù hợp cho hợp đồng đơn giản',
                'Tốc độ tạo nhanh'
            ],
            bestFor: 'Hợp đồng có cấu trúc chuẩn, thông tin đơn giản'
        },
        {
            id: 'editor' as ContractCreationMethod,
            title: 'Soạn thảo Editor',
            description: 'Tạo hợp đồng bằng editor chuyên nghiệp với nhiều tính năng',
            icon: faEdit,
            features: [
                'Editor TipTap chuyên nghiệp',
                'Gợi ý soạn thảo thông minh',
                'Cấu trúc hợp đồng rõ ràng',
                'Hỗ trợ template đa dạng',
                'Chỉnh sửa chi tiết từng phần'
            ],
            bestFor: 'Hợp đồng phức tạp, cần chỉnh sửa chi tiết'
        },
        {
            id: 'uploadFile' as ContractCreationMethod,
            title: 'Tải file lên',
            description: 'Tải file hợp đồng có sẵn và chuyển đổi thành editor',
            icon: faUpload,
            features: [
                'Hỗ trợ file Word, PDF',
                'Tự động trích xuất nội dung',
                'Chuyển đổi sang editor',
                'Giữ nguyên định dạng',
                'Chỉnh sửa sau khi upload'
            ],
            bestFor: 'Có file hợp đồng sẵn, cần chỉnh sửa'
        }
    ];

    const handleMethodSelect = (method: ContractCreationMethod) => {
        onMethodSelect(method);
        setActiveSection('template');
    };

    const handleTemplateSelect = (template: ContractTemplate) => {
        onTemplateSelect(template);
        setActiveSection('draft');
    };

    const handleDraftSelect = (draft: ContractDraft) => {
        onDraftSelect(draft);
    };

    const getMethodDisplayName = (method: ContractCreationMethod) => {
        switch (method) {
            case 'basic': return 'Form';
            case 'editor': return 'Editor';
            case 'uploadFile': return 'Upload File';
            default: return method;
        }
    };

    return (
        <div className={cx('stage-draft')}>
            <div className={cx('stage-header')}>
                <h2>Giai đoạn 1: Chọn phương thức tạo hợp đồng</h2>
                <p>Chọn cách bắt đầu soạn thảo hợp đồng của bạn</p>
            </div>

            {/* Progress Steps */}
            <div className={cx('progress-steps')}>
                <div className={cx('step', { active: activeSection === 'method', completed: creationMethod !== null })}>
                    <div className={cx('step-number')}>1</div>
                    <span>Chọn phương thức</span>
                </div>
                <div className={cx('step', { active: activeSection === 'template', completed: selectedTemplate !== null })}>
                    <div className={cx('step-number')}>2</div>
                    <span>Chọn template</span>
                </div>
                <div className={cx('step', { active: activeSection === 'draft' })}>
                    <div className={cx('step-number')}>3</div>
                    <span>Bắt đầu soạn thảo</span>
                </div>
            </div>

            {/* Method Selection */}
            {activeSection === 'method' && (
                <div className={cx('method-selection')}>
                    <div className={cx('methods-grid')}>
                        {creationMethods.map((method) => (
                            <div
                                key={method.id}
                                className={cx('method-card', {
                                    selected: creationMethod === method.id
                                })}
                                onClick={() => handleMethodSelect(method.id)}
                            >
                                <div className={cx('method-header')}>
                                    <div className={cx('method-icon')}>
                                        <FontAwesomeIcon icon={method.icon} />
                                    </div>
                                    <div className={cx('method-info')}>
                                        <h3>{method.title}</h3>
                                        <p>{method.description}</p>
                                    </div>
                                    {creationMethod === method.id && (
                                        <div className={cx('selected-indicator')}>
                                            <FontAwesomeIcon icon={faCheckCircle} />
                                        </div>
                                    )}
                                </div>

                                <div className={cx('method-features')}>
                                    <h4>Tính năng chính:</h4>
                                    <ul>
                                        {method.features.map((feature, index) => (
                                            <li key={index}>{feature}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className={cx('method-best-for')}>
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                    <span>Phù hợp cho: {method.bestFor}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Template Selection */}
            {activeSection === 'template' && creationMethod && (
                <div className={cx('template-selection')}>
                    <div className={cx('section-header')}>
                        <h3>Chọn template cho {getMethodDisplayName(creationMethod)}</h3>
                        <p>Template sẽ giúp bạn bắt đầu nhanh chóng</p>
                    </div>

                    {loading ? (
                        <div className={cx('loading')}>
                            <FontAwesomeIcon icon={faSpinner} spin />
                            <span>Đang tải templates...</span>
                        </div>
                    ) : error ? (
                        <div className={cx('error')}>{error}</div>
                    ) : (
                        <div className={cx('templates-grid')}>
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    className={cx('template-card', {
                                        selected: selectedTemplate?.id === template.id
                                    })}
                                    onClick={() => handleTemplateSelect(template)}
                                >
                                    <div className={cx('template-preview')}>
                                        {template.thumbnail ? (
                                            <img src={template.thumbnail} alt={template.name} />
                                        ) : (
                                            <div className={cx('template-placeholder')}>
                                                <FontAwesomeIcon icon={faFileAlt} />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className={cx('template-info')}>
                                        <h4>{template.name}</h4>
                                        <p>{template.description}</p>
                                        
                                        <div className={cx('template-meta')}>
                                            <span className={cx('category')}>{template.category}</span>
                                            <span className={cx('type')}>{template.type}</span>
                                        </div>
                                        
                                        <div className={cx('template-stats')}>
                                            <span>{template.usage_count || 0} lượt sử dụng</span>
                                            <span>{new Date(template.updated_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={cx('template-actions')}>
                        <button
                            className={cx('skip-btn')}
                            onClick={() => setActiveSection('draft')}
                        >
                            Bỏ qua template
                        </button>
                        <button
                            className={cx('continue-btn', { disabled: !selectedTemplate })}
                            onClick={() => selectedTemplate && setActiveSection('draft')}
                            disabled={!selectedTemplate}
                        >
                            Tiếp tục
                            <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                    </div>
                </div>
            )}

            {/* Draft Selection */}
            {activeSection === 'draft' && (
                <div className={cx('draft-selection')}>
                    <div className={cx('section-header')}>
                        <h3>Bắt đầu soạn thảo</h3>
                        <p>Chọn bản nháp có sẵn hoặc tạo mới</p>
                    </div>

                    <div className={cx('draft-options')}>
                        <div className={cx('option-card', 'new-draft')}>
                            <div className={cx('option-icon')}>
                                <FontAwesomeIcon icon={faFileAlt} />
                            </div>
                            <div className={cx('option-content')}>
                                <h4>Tạo hợp đồng mới</h4>
                                <p>Bắt đầu từ đầu với {selectedTemplate ? `template "${selectedTemplate.name}"` : 'phương thức đã chọn'}</p>
                            </div>
                            <button className={cx('select-btn')}>
                                Bắt đầu
                                <FontAwesomeIcon icon={faArrowRight} />
                            </button>
                        </div>

                        {drafts.length > 0 && (
                            <div className={cx('existing-drafts')}>
                                <h4>Bản nháp gần đây</h4>
                                <div className={cx('drafts-list')}>
                                    {drafts.slice(0, 3).map((draft) => (
                                        <div
                                            key={draft.id}
                                            className={cx('draft-item')}
                                            onClick={() => handleDraftSelect(draft)}
                                        >
                                            <div className={cx('draft-info')}>
                                                <h5>{draft.name || 'Hợp đồng không tên'}</h5>
                                                <p>{draft.description || 'Không có mô tả'}</p>
                                                <span className={cx('draft-meta')}>
                                                    {getMethodDisplayName(draft.creation_method)} • 
                                                    {new Date(draft.updated_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <FontAwesomeIcon icon={faArrowRight} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StageDraft;