import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faEdit, 
    faTrash, 
    faEye,
    faSave,
    faTimes,
    faSearch,
    faFilter,
    faFileAlt,
    faCode,
    faPalette,
    faUsers,
    faCalendarAlt,
    faStar,
    faCopy
} from '@fortawesome/free-solid-svg-icons';
import { templateService } from '~/services/api/template.service';
import type { 
    ContractTemplate, 
    TemplateField,
    TemplateSection 
} from '~/types/contract/contract.types';
import styles from './TemplateManagement.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface TemplateManagementProps {
    mode: 'basic' | 'editor';
    onSelect?: (template: ContractTemplate) => void;
}

const TemplateManagement: React.FC<TemplateManagementProps> = ({ mode, onSelect }) => {
    const [templates, setTemplates] = useState<ContractTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Form states
    const [showForm, setShowForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<ContractTemplate | null>(null);
    
    // Form data
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'employment',
        type: mode,
        thumbnail: '',
        is_public: false,
        fields: [] as TemplateField[],
        sections: [] as TemplateSection[],
        content: '',
        variables: [] as string[]
    });

    // Search and filter
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        loadTemplates();
    }, [mode]);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await templateService.listTemplates({
                type: mode,
                search: searchTerm,
                category: filterCategory !== 'all' ? filterCategory : undefined
            });
            
            setTemplates(response.data?.data || []);
        } catch (err) {
            setError('Không thể tải danh sách template');
            console.error('Error loading templates:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await templateService.createTemplate(formData);
            setTemplates(prev => [...prev, response.data]);
            setShowForm(false);
            resetForm();
            await loadTemplates();
        } catch (err) {
            setError('Không thể tạo template');
            console.error('Error creating template:', err);
        }
    };

    const handleUpdateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTemplate) return;

        try {
            const response = await templateService.updateTemplate(editingTemplate.id, formData);
            setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? response.data : t));
            setEditingTemplate(null);
            setShowForm(false);
            resetForm();
            await loadTemplates();
        } catch (err) {
            setError('Không thể cập nhật template');
            console.error('Error updating template:', err);
        }
    };

    const handleDeleteTemplate = async (templateId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa template này?')) {
            return;
        }

        try {
            await templateService.deleteTemplate(templateId);
            setTemplates(prev => prev.filter(t => t.id !== templateId));
        } catch (err) {
            setError('Không thể xóa template');
            console.error('Error deleting template:', err);
        }
    };

    const handleDuplicateTemplate = async (template: ContractTemplate) => {
        try {
            const duplicateData = {
                ...template,
                name: `${template.name} (Bản sao)`,
                is_public: false
            };
            delete duplicateData.id;
            delete duplicateData.created_at;
            delete duplicateData.updated_at;
            
            const response = await templateService.createTemplate(duplicateData);
            setTemplates(prev => [...prev, response.data]);
            await loadTemplates();
        } catch (err) {
            setError('Không thể sao chép template');
            console.error('Error duplicating template:', err);
        }
    };

    const handleEditTemplate = (template: ContractTemplate) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name,
            description: template.description,
            category: template.category,
            type: template.type,
            thumbnail: template.thumbnail || '',
            is_public: template.is_public,
            fields: template.fields || [],
            sections: template.sections || [],
            content: template.content || '',
            variables: template.variables || []
        });
        setShowForm(true);
    };

    const handlePreviewTemplate = (template: ContractTemplate) => {
        setPreviewTemplate(template);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: 'employment',
            type: mode,
            thumbnail: '',
            is_public: false,
            fields: [],
            sections: [],
            content: '',
            variables: []
        });
    };

    const addField = () => {
        setFormData(prev => ({
            ...prev,
            fields: [...prev.fields, {
                id: `field_${Date.now()}`,
                name: '',
                label: '',
                type: 'text',
                required: false,
                placeholder: '',
                options: []
            }]
        }));
    };

    const removeField = (fieldId: string) => {
        setFormData(prev => ({
            ...prev,
            fields: prev.fields.filter(f => f.id !== fieldId)
        }));
    };

    const updateField = (fieldId: string, updates: Partial<TemplateField>) => {
        setFormData(prev => ({
            ...prev,
            fields: prev.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
        }));
    };

    const getCategoryDisplayName = (category: string) => {
        switch (category) {
            case 'employment': return 'Hợp đồng lao động';
            case 'business': return 'Hợp đồng kinh doanh';
            case 'service': return 'Hợp đồng dịch vụ';
            case 'rental': return 'Hợp đồng thuê mướn';
            default: return category;
        }
    };

    const getTypeDisplayName = (type: string) => {
        switch (type) {
            case 'basic': return 'Form';
            case 'editor': return 'Editor';
            default: return type;
        }
    };

    return (
        <div className={cx('template-management')}>
            <div className={cx('header')}>
                <h2>Quản lý Template - {getTypeDisplayName(mode)}</h2>
                <button 
                    className={cx('create-btn')}
                    onClick={() => {
                        setEditingTemplate(null);
                        resetForm();
                        setShowForm(true);
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Tạo template mới
                </button>
            </div>

            {/* Search and Filter */}
            <div className={cx('controls')}>
                <div className={cx('search-box')}>
                    <FontAwesomeIcon icon={faSearch} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm template..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && loadTemplates()}
                    />
                </div>
                
                <div className={cx('filter-box')}>
                    <FontAwesomeIcon icon={faFilter} />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="all">Tất cả danh mục</option>
                        <option value="employment">Hợp đồng lao động</option>
                        <option value="business">Hợp đồng kinh doanh</option>
                        <option value="service">Hợp đồng dịch vụ</option>
                        <option value="rental">Hợp đồng thuê mướn</option>
                    </select>
                </div>
            </div>

            {/* Templates Grid */}
            <div className={cx('templates-grid')}>
                {loading ? (
                    <div className={cx('loading')}>Đang tải templates...</div>
                ) : error ? (
                    <div className={cx('error')}>{error}</div>
                ) : templates.length === 0 ? (
                    <div className={cx('empty-state')}>
                        <p>Không có template nào</p>
                        <button 
                            className={cx('create-first-btn')}
                            onClick={() => {
                                setEditingTemplate(null);
                                resetForm();
                                setShowForm(true);
                            }}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Tạo template đầu tiên
                        </button>
                    </div>
                ) : (
                    templates.map((template) => (
                        <div key={template.id} className={cx('template-card')}>
                            <div className={cx('template-preview')}>
                                {template.thumbnail ? (
                                    <img src={template.thumbnail} alt={template.name} />
                                ) : (
                                    <div className={cx('template-placeholder')}>
                                        <FontAwesomeIcon icon={mode === 'basic' ? faFileAlt : faCode} />
                                    </div>
                                )}
                                
                                <div className={cx('template-overlay')}>
                                    <div className={cx('template-actions')}>
                                        <button
                                            className={cx('action-btn', 'preview')}
                                            onClick={() => handlePreviewTemplate(template)}
                                            title="Xem trước"
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                        
                                        <button
                                            className={cx('action-btn', 'edit')}
                                            onClick={() => handleEditTemplate(template)}
                                            title="Chỉnh sửa"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        
                                        <button
                                            className={cx('action-btn', 'duplicate')}
                                            onClick={() => handleDuplicateTemplate(template)}
                                            title="Sao chép"
                                        >
                                            <FontAwesomeIcon icon={faCopy} />
                                        </button>
                                        
                                        <button
                                            className={cx('action-btn', 'delete')}
                                            onClick={() => handleDeleteTemplate(template.id)}
                                            title="Xóa"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={cx('template-info')}>
                                <h4>{template.name}</h4>
                                <p>{template.description}</p>
                                
                                <div className={cx('template-meta')}>
                                    <span className={cx('category')}>
                                        {getCategoryDisplayName(template.category)}
                                    </span>
                                    <span className={cx('type')}>
                                        {getTypeDisplayName(template.type)}
                                    </span>
                                    {template.is_public && (
                                        <span className={cx('public')}>
                                            <FontAwesomeIcon icon={faUsers} />
                                            Công khai
                                        </span>
                                    )}
                                </div>
                                
                                <div className={cx('template-stats')}>
                                    <span>
                                        <FontAwesomeIcon icon={faStar} />
                                        {template.rating || 0}/5
                                    </span>
                                    <span>
                                        <FontAwesomeIcon icon={faUsers} />
                                        {template.usage_count || 0} lượt sử dụng
                                    </span>
                                    <span>
                                        <FontAwesomeIcon icon={faCalendarAlt} />
                                        {new Date(template.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                {onSelect && (
                                    <button
                                        className={cx('select-btn')}
                                        onClick={() => onSelect(template)}
                                    >
                                        Sử dụng template này
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Template Form Modal */}
            {showForm && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal')}>
                        <div className={cx('modal-header')}>
                            <h3>{editingTemplate ? 'Chỉnh sửa template' : 'Tạo template mới'}</h3>
                            <button 
                                className={cx('close-btn')}
                                onClick={() => setShowForm(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        
                        <form onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate} className={cx('modal-form')}>
                            <div className={cx('form-section')}>
                                <h4>Thông tin cơ bản</h4>
                                
                                <div className={cx('form-group')}>
                                    <label>Tên template *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                    />
                                </div>
                                
                                <div className={cx('form-group')}>
                                    <label>Mô tả</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        rows={3}
                                    />
                                </div>
                                
                                <div className={cx('form-row')}>
                                    <div className={cx('form-group')}>
                                        <label>Danh mục</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        >
                                            <option value="employment">Hợp đồng lao động</option>
                                            <option value="business">Hợp đồng kinh doanh</option>
                                            <option value="service">Hợp đồng dịch vụ</option>
                                            <option value="rental">Hợp đồng thuê mướn</option>
                                        </select>
                                    </div>
                                    
                                    <div className={cx('form-group')}>
                                        <label>Loại template</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                                        >
                                            <option value="basic">Form</option>
                                            <option value="editor">Editor</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className={cx('form-group')}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_public}
                                            onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                                        />
                                        Template công khai
                                    </label>
                                </div>
                            </div>

                            {formData.type === 'basic' && (
                                <div className={cx('form-section')}>
                                    <h4>Thiết lập trường dữ liệu</h4>
                                    
                                    <div className={cx('fields-list')}>
                                        {formData.fields.map((field, index) => (
                                            <div key={field.id} className={cx('field-item')}>
                                                <div className={cx('field-header')}>
                                                    <h5>Trường {index + 1}</h5>
                                                    <button
                                                        type="button"
                                                        className={cx('remove-field-btn')}
                                                        onClick={() => removeField(field.id)}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                                
                                                <div className={cx('field-form')}>
                                                    <div className={cx('form-row')}>
                                                        <div className={cx('form-group')}>
                                                            <label>Tên trường</label>
                                                            <input
                                                                type="text"
                                                                value={field.name}
                                                                onChange={(e) => updateField(field.id, { name: e.target.value })}
                                                                placeholder="company_name"
                                                            />
                                                        </div>
                                                        
                                                        <div className={cx('form-group')}>
                                                            <label>Nhãn hiển thị</label>
                                                            <input
                                                                type="text"
                                                                value={field.label}
                                                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                                placeholder="Tên công ty"
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className={cx('form-row')}>
                                                        <div className={cx('form-group')}>
                                                            <label>Loại trường</label>
                                                            <select
                                                                value={field.type}
                                                                onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                                                            >
                                                                <option value="text">Văn bản</option>
                                                                <option value="textarea">Văn bản dài</option>
                                                                <option value="number">Số</option>
                                                                <option value="date">Ngày tháng</option>
                                                                <option value="email">Email</option>
                                                                <option value="phone">Số điện thoại</option>
                                                                <option value="select">Lựa chọn</option>
                                                                <option value="checkbox">Checkbox</option>
                                                            </select>
                                                        </div>
                                                        
                                                        <div className={cx('form-group')}>
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={field.required}
                                                                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                                                />
                                                                Bắt buộc
                                                            </label>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className={cx('form-group')}>
                                                        <label>Placeholder</label>
                                                        <input
                                                            type="text"
                                                            value={field.placeholder}
                                                            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                                            placeholder="Nhập tên công ty..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <button
                                        type="button"
                                        className={cx('add-field-btn')}
                                        onClick={addField}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                        Thêm trường
                                    </button>
                                </div>
                            )}

                            {formData.type === 'editor' && (
                                <div className={cx('form-section')}>
                                    <h4>Nội dung template</h4>
                                    
                                    <div className={cx('form-group')}>
                                        <label>Nội dung HTML</label>
                                        <textarea
                                            value={formData.content}
                                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                            rows={15}
                                            placeholder="Nhập nội dung HTML của template..."
                                        />
                                    </div>
                                    
                                    <div className={cx('form-group')}>
                                        <label>Biến số (mỗi dòng một biến)</label>
                                        <textarea
                                            value={formData.variables.join('\n')}
                                            onChange={(e) => setFormData(prev => ({ 
                                                ...prev, 
                                                variables: e.target.value.split('\n').filter(v => v.trim()) 
                                            }))}
                                            rows={5}
                                            placeholder="company_name&#10;employee_name&#10;start_date"
                                        />
                                    </div>
                                </div>
                            )}
                            
                            <div className={cx('modal-actions')}>
                                <button type="button" onClick={() => setShowForm(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className={cx('primary')}>
                                    <FontAwesomeIcon icon={editingTemplate ? faEdit : faPlus} />
                                    {editingTemplate ? 'Cập nhật' : 'Tạo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Template Preview Modal */}
            {previewTemplate && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal', 'preview-modal')}>
                        <div className={cx('modal-header')}>
                            <h3>Xem trước: {previewTemplate.name}</h3>
                            <button 
                                className={cx('close-btn')}
                                onClick={() => setPreviewTemplate(null)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        
                        <div className={cx('preview-content')}>
                            {previewTemplate.type === 'basic' ? (
                                <div className={cx('basic-preview')}>
                                    <h4>Trường dữ liệu:</h4>
                                    <div className={cx('fields-preview')}>
                                        {previewTemplate.fields?.map((field, index) => (
                                            <div key={field.id} className={cx('field-preview')}>
                                                <label>{field.label || field.name}</label>
                                                <input
                                                    type={field.type}
                                                    placeholder={field.placeholder}
                                                    disabled
                                                />
                                                {field.required && <span className={cx('required')}>*</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className={cx('editor-preview')}>
                                    <h4>Nội dung template:</h4>
                                    <div 
                                        className={cx('content-preview')}
                                        dangerouslySetInnerHTML={{ __html: previewTemplate.content || '' }}
                                    />
                                    
                                    {previewTemplate.variables && previewTemplate.variables.length > 0 && (
                                        <div className={cx('variables-preview')}>
                                            <h5>Biến số:</h5>
                                            <div className={cx('variables-list')}>
                                                {previewTemplate.variables.map((variable, index) => (
                                                    <span key={index} className={cx('variable-tag')}>
                                                        {variable}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateManagement;