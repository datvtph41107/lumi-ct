import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faFileAlt, 
    faSave,
    faSearch,
    faFilter,
    faClock,
    faUser,
    faCalendarAlt,
    faArrowRight,
    faEdit,
    faTrash,
    faEye
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useContractDraftStore } from '~/store/contract-draft-store';
import { contractService } from '~/services/api/contract.service';
import { templateService } from '~/services/api/template.service';
import type { 
    Contract, 
    ContractTemplate, 
    ContractDraft,
    ContractCreationMethod 
} from '~/types/contract/contract.types';
import styles from './ContractCollection.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface ContractCollectionProps {
    onSelect: (type: 'new' | 'template' | 'draft', data?: any) => void;
}

const ContractCollection: React.FC<ContractCollectionProps> = ({ onSelect }) => {
    const navigate = useNavigate();
    const { creationMethod, currentDraft } = useContractDraftStore();
    
    const [activeTab, setActiveTab] = useState<'new' | 'template' | 'draft'>('new');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    
    // Data states
    const [templates, setTemplates] = useState<ContractTemplate[]>([]);
    const [drafts, setDrafts] = useState<ContractDraft[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            if (activeTab === 'template') {
                const response = await templateService.listTemplates({
                    type: creationMethod,
                    search: searchTerm,
                    category: filterType !== 'all' ? filterType : undefined
                });
                setTemplates(response.data?.data || []);
            } else if (activeTab === 'draft') {
                const response = await contractService.listDrafts({
                    search: searchTerm,
                    status: filterType !== 'all' ? filterType : undefined
                });
                setDrafts(response.data?.data || []);
            }
        } catch (err) {
            setError('Không thể tải dữ liệu');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleNewContract = () => {
        onSelect('new');
        navigate('/contracts/draft');
    };

    const handleSelectTemplate = (template: ContractTemplate) => {
        onSelect('template', template);
        navigate('/contracts/draft');
    };

    const handleSelectDraft = (draft: ContractDraft) => {
        onSelect('draft', draft);
        navigate('/contracts/draft');
    };

    const handleDeleteDraft = async (draftId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bản nháp này?')) {
            return;
        }

        try {
            await contractService.deleteDraft(draftId);
            setDrafts(prev => prev.filter(d => d.id !== draftId));
        } catch (err) {
            setError('Không thể xóa bản nháp');
            console.error('Error deleting draft:', err);
        }
    };

    const getMethodDisplayName = (method: ContractCreationMethod) => {
        switch (method) {
            case 'basic': return 'Form';
            case 'editor': return 'Editor';
            case 'uploadFile': return 'Upload File';
            default: return method;
        }
    };

    const getStageDisplayName = (stage: string) => {
        switch (stage) {
            case 'basic_info': return 'Thông tin cơ bản';
            case 'milestones_tasks': return 'Mốc thời gian & Công việc';
            case 'review': return 'Xem lại';
            default: return stage;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return '#ffc107';
            case 'in_progress': return '#007bff';
            case 'completed': return '#28a745';
            default: return '#6c757d';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'draft': return 'Bản nháp';
            case 'in_progress': return 'Đang soạn thảo';
            case 'completed': return 'Hoàn thành';
            default: return status;
        }
    };

    return (
        <div className={cx('contract-collection')}>
            <div className={cx('header')}>
                <h1>Bộ sưu tập hợp đồng</h1>
                <p>Chọn cách bắt đầu soạn thảo hợp đồng của bạn</p>
            </div>

            {/* Tabs */}
            <div className={cx('tabs')}>
                <button
                    className={cx('tab', { active: activeTab === 'new' })}
                    onClick={() => setActiveTab('new')}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Tạo mới
                </button>
                <button
                    className={cx('tab', { active: activeTab === 'template' })}
                    onClick={() => setActiveTab('template')}
                >
                    <FontAwesomeIcon icon={faFileAlt} />
                    Template ({templates.length})
                </button>
                <button
                    className={cx('tab', { active: activeTab === 'draft' })}
                    onClick={() => setActiveTab('draft')}
                >
                    <FontAwesomeIcon icon={faSave} />
                    Bản nháp ({drafts.length})
                </button>
            </div>

            {/* Search and Filter */}
            <div className={cx('controls')}>
                <div className={cx('search-box')}>
                    <FontAwesomeIcon icon={faSearch} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && loadData()}
                    />
                </div>
                
                <div className={cx('filter-box')}>
                    <FontAwesomeIcon icon={faFilter} />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">Tất cả</option>
                        {activeTab === 'template' && (
                            <>
                                <option value="employment">Hợp đồng lao động</option>
                                <option value="business">Hợp đồng kinh doanh</option>
                                <option value="service">Hợp đồng dịch vụ</option>
                                <option value="rental">Hợp đồng thuê mướn</option>
                            </>
                        )}
                        {activeTab === 'draft' && (
                            <>
                                <option value="draft">Bản nháp</option>
                                <option value="in_progress">Đang soạn thảo</option>
                                <option value="completed">Hoàn thành</option>
                            </>
                        )}
                    </select>
                </div>
            </div>

            {/* Content */}
            <div className={cx('content')}>
                {activeTab === 'new' && (
                    <div className={cx('new-contract')}>
                        <div className={cx('method-info')}>
                            <h3>Phương thức đã chọn: {getMethodDisplayName(creationMethod)}</h3>
                            <p>Bắt đầu tạo hợp đồng mới với phương thức {getMethodDisplayName(creationMethod).toLowerCase()}</p>
                        </div>
                        
                        <div className={cx('new-actions')}>
                            <button 
                                className={cx('start-new-btn')}
                                onClick={handleNewContract}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                Bắt đầu tạo mới
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'template' && (
                    <div className={cx('templates-grid')}>
                        {loading ? (
                            <div className={cx('loading')}>Đang tải templates...</div>
                        ) : error ? (
                            <div className={cx('error')}>{error}</div>
                        ) : templates.length === 0 ? (
                            <div className={cx('empty-state')}>
                                <p>Không có template nào phù hợp</p>
                            </div>
                        ) : (
                            templates.map((template) => (
                                <div 
                                    key={template.id} 
                                    className={cx('template-card')}
                                    onClick={() => handleSelectTemplate(template)}
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
                                            <span>
                                                <FontAwesomeIcon icon={faUser} />
                                                {template.usage_count} lượt sử dụng
                                            </span>
                                            <span>
                                                <FontAwesomeIcon icon={faCalendarAlt} />
                                                {new Date(template.updated_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'draft' && (
                    <div className={cx('drafts-list')}>
                        {loading ? (
                            <div className={cx('loading')}>Đang tải bản nháp...</div>
                        ) : error ? (
                            <div className={cx('error')}>{error}</div>
                        ) : drafts.length === 0 ? (
                            <div className={cx('empty-state')}>
                                <p>Không có bản nháp nào</p>
                            </div>
                        ) : (
                            drafts.map((draft) => (
                                <div key={draft.id} className={cx('draft-item')}>
                                    <div className={cx('draft-info')}>
                                        <h4>{draft.name || 'Hợp đồng không tên'}</h4>
                                        <p>{draft.description || 'Không có mô tả'}</p>
                                        
                                        <div className={cx('draft-meta')}>
                                            <span className={cx('method')}>
                                                {getMethodDisplayName(draft.creation_method)}
                                            </span>
                                            <span 
                                                className={cx('status')}
                                                style={{ color: getStatusColor(draft.status) }}
                                            >
                                                {getStatusText(draft.status)}
                                            </span>
                                            <span className={cx('stage')}>
                                                Giai đoạn: {getStageDisplayName(draft.current_stage)}
                                            </span>
                                        </div>
                                        
                                        <div className={cx('draft-stats')}>
                                            <span>
                                                <FontAwesomeIcon icon={faClock} />
                                                {new Date(draft.updated_at).toLocaleString()}
                                            </span>
                                            <span>
                                                <FontAwesomeIcon icon={faUser} />
                                                {draft.created_by_name || 'Không xác định'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className={cx('draft-actions')}>
                                        <button
                                            className={cx('action-btn', 'edit')}
                                            onClick={() => handleSelectDraft(draft)}
                                            title="Tiếp tục soạn thảo"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        
                                        <button
                                            className={cx('action-btn', 'view')}
                                            onClick={() => navigate(`/contracts/${draft.id}`)}
                                            title="Xem chi tiết"
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                        
                                        <button
                                            className={cx('action-btn', 'delete')}
                                            onClick={() => handleDeleteDraft(draft.id)}
                                            title="Xóa bản nháp"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContractCollection;