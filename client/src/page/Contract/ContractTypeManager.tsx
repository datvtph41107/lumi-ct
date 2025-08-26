'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faEdit,
    faTrash,
    faSave,
    faTimes,
    faFileContract,
    faEye,
    faCog,
    faList,
} from '@fortawesome/free-solid-svg-icons';
import { useContractTypeStore } from '~/store/contract-type-store';
import { FieldBuilder } from './components/ContentTypeRender/FieldBuilder/FieldBuilder';
import { ContractTypePreview } from './components/ContentTypeRender/Preview/ContractTypePreview';
import type { CustomContractType, ContractField } from '~/types/contract/contract-field.types';
import classNames from 'classnames/bind';
import styles from './ContractTypeManager.module.scss';
import { InteractivePreview } from './components/ContentTypeRender/Preview/InteractivePreview';
// import { IconSelector } from "./IconSelector";

const cx = classNames.bind(styles);

// const ICON_OPTIONS = [
//     { value: "📄", label: "Tài liệu", category: "document" },
//     { value: "🤝", label: "Hợp tác", category: "business" },
//     { value: "💼", label: "Kinh doanh", category: "business" },
//     { value: "🏠", label: "Bất động sản", category: "property" },
//     { value: "👥", label: "Nhân sự", category: "people" },
//     { value: "🔧", label: "Dịch vụ", category: "service" },
//     { value: "📚", label: "Đào tạo", category: "education" },
//     { value: "🔒", label: "Bảo mật", category: "security" },
//     { value: "⚖️", label: "Pháp lý", category: "legal" },
//     { value: "💰", label: "Tài chính", category: "finance" },
//     { value: "🎯", label: "Mục tiêu", category: "business" },
//     { value: "📊", label: "Báo cáo", category: "document" },
//     { value: "🚀", label: "Dự án", category: "business" },
//     { value: "🔄", label: "Quy trình", category: "process" },
//     { value: "📋", label: "Checklist", category: "document" },
// ];

const ContractTypeManager = () => {
    const { customTypes, addCustomType, updateCustomType, deleteCustomType } = useContractTypeStore();
    const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit' | 'preview'>('list');
    const [editingType, setEditingType] = useState<CustomContractType | null>(null);
    const [previewType, setPreviewType] = useState<CustomContractType | null>(null);
    const [showInteractivePreview, setShowInteractivePreview] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        label: '',
        description: '',
        icon: '📄',
        fields: [] as ContractField[],
    });

    const handleCreateNew = () => {
        setFormData({
            name: '',
            label: '',
            description: '',
            icon: '📄',
            fields: [],
        });
        setEditingType(null);
        setActiveTab('create');
    };

    const handleEdit = (type: CustomContractType) => {
        setFormData({
            name: type.name,
            label: type.label,
            description: type.description,
            icon: type.icon,
            fields: [...type.fields],
        });
        setEditingType(type);
        setActiveTab('edit');
    };

    const handleSave = () => {
        if (!formData.name || !formData.label) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        if (editingType) {
            updateCustomType(editingType.id, formData);
        } else {
            addCustomType(formData);
        }

        setActiveTab('list');
        setEditingType(null);
    };

    const handleDelete = (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa thể loại hợp đồng này?')) {
            deleteCustomType(id);
        }
    };

    const handlePreview = (type: CustomContractType) => {
        setPreviewType(type);
        setActiveTab('preview');
    };

    const handleFieldsChange = (fields: ContractField[]) => {
        setFormData({ ...formData, fields });
    };

    return (
        <div className={cx('contract-type-manager')}>
            {/* Header */}
            <div className={cx('manager-header')}>
                <div className={cx('header-content')}>
                    <FontAwesomeIcon icon={faFileContract} />
                    <div>
                        <h1>Quản lý thể loại hợp đồng</h1>
                        <p>Tạo và tùy chỉnh các thể loại hợp đồng theo nhu cầu của bạn</p>
                    </div>
                </div>

                {activeTab === 'list' && (
                    <button className={cx('create-btn')} onClick={handleCreateNew}>
                        <FontAwesomeIcon icon={faPlus} />
                        Tạo thể loại mới
                    </button>
                )}

                {(activeTab === 'create' || activeTab === 'edit') && (
                    <div className={cx('action-buttons')}>
                        <button className={cx('save-btn')} onClick={handleSave}>
                            <FontAwesomeIcon icon={faSave} />
                            {editingType ? 'Cập nhật' : 'Tạo mới'}
                        </button>
                        <button className={cx('cancel-btn')} onClick={() => setActiveTab('list')}>
                            <FontAwesomeIcon icon={faTimes} />
                            Hủy
                        </button>
                    </div>
                )}

                {activeTab === 'preview' && (
                    <button className={cx('back-btn')} onClick={() => setActiveTab('list')}>
                        <FontAwesomeIcon icon={faTimes} />
                        Đóng xem trước
                    </button>
                )}
            </div>

            {/* Tab Navigation */}
            <div className={cx('tab-navigation')}>
                <button
                    className={cx('tab-btn', { active: activeTab === 'list' })}
                    onClick={() => setActiveTab('list')}
                >
                    <FontAwesomeIcon icon={faList} />
                    Danh sách thể loại
                </button>
                {(activeTab === 'create' || activeTab === 'edit') && (
                    <>
                        <button className={cx('tab-btn', { active: activeTab === 'create' || activeTab === 'edit' })}>
                            <FontAwesomeIcon icon={faCog} />
                            {editingType ? 'Chỉnh sửa thể loại' : 'Tạo thể loại mới'}
                        </button>
                        <button
                            className={cx('tab-btn', { active: showInteractivePreview })}
                            onClick={() => setShowInteractivePreview(!showInteractivePreview)}
                        >
                            <FontAwesomeIcon icon={faEye} />
                            Demo tương tác
                        </button>
                    </>
                )}
                {activeTab === 'preview' && (
                    <button className={cx('tab-btn', 'active')}>
                        <FontAwesomeIcon icon={faEye} />
                        Xem trước
                    </button>
                )}
            </div>

            {/* Content */}
            <div className={cx('manager-content')}>
                {activeTab === 'list' && (
                    <div className={cx('types-list')}>
                        {customTypes.length === 0 ? (
                            <div className={cx('empty-state')}>
                                <FontAwesomeIcon icon={faFileContract} />
                                <h3>Chưa có thể loại hợp đồng nào</h3>
                                <p>Tạo thể loại hợp đồng đầu tiên để bắt đầu tùy chỉnh form nhập liệu</p>
                                <button className={cx('create-first-btn')} onClick={handleCreateNew}>
                                    <FontAwesomeIcon icon={faPlus} />
                                    Tạo thể loại đầu tiên
                                </button>
                            </div>
                        ) : (
                            <div className={cx('types-grid')}>
                                {customTypes.map((type) => (
                                    <div key={type.id} className={cx('type-card')}>
                                        <div className={cx('type-header')}>
                                            <span className={cx('type-icon')}>{type.icon}</span>
                                            <div className={cx('type-info')}>
                                                <h3>{type.label}</h3>
                                                <p>{type.description}</p>
                                            </div>
                                        </div>

                                        <div className={cx('type-stats')}>
                                            <div className={cx('stat')}>
                                                <span className={cx('stat-number')}>{type.fields.length}</span>
                                                <span className={cx('stat-label')}>Trường dữ liệu</span>
                                            </div>
                                            <div className={cx('stat')}>
                                                <span className={cx('stat-number')}>
                                                    {type.fields.filter((f) => f.required).length}
                                                </span>
                                                <span className={cx('stat-label')}>Bắt buộc</span>
                                            </div>
                                        </div>

                                        <div className={cx('type-meta')}>
                                            <span>Tạo: {type.createdAt.toLocaleDateString('vi-VN')}</span>
                                            <span>Cập nhật: {type.updatedAt.toLocaleDateString('vi-VN')}</span>
                                        </div>

                                        <div className={cx('type-actions')}>
                                            <button
                                                className={cx('action-btn', 'preview')}
                                                onClick={() => handlePreview(type)}
                                                title="Xem trước"
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                            <button
                                                className={cx('action-btn', 'edit')}
                                                onClick={() => handleEdit(type)}
                                                title="Chỉnh sửa"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button
                                                className={cx('action-btn', 'delete')}
                                                onClick={() => handleDelete(type.id)}
                                                title="Xóa"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {(activeTab === 'create' || activeTab === 'edit') && (
                    <div className={cx('type-form-container')}>
                        <div className={cx('type-form', { 'with-preview': showInteractivePreview })}>
                            <div className={cx('form-section')}>
                                <h3>Thông tin cơ bản</h3>
                                <div className={cx('form-grid')}>
                                    <div className={cx('field')}>
                                        <label>Tên thể loại (ID) *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="hop_dong_dich_vu"
                                            disabled={!!editingType}
                                        />
                                        <small>Tên này sẽ được sử dụng làm ID, không thể thay đổi sau khi tạo</small>
                                    </div>

                                    <div className={cx('field')}>
                                        <label>Tên hiển thị *</label>
                                        <input
                                            type="text"
                                            value={formData.label}
                                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                            placeholder="Hợp đồng dịch vụ"
                                        />
                                    </div>

                                    <div className={cx('field', 'full-width')}>
                                        <label>Mô tả</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Mô tả về thể loại hợp đồng này..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className={cx('field')}>
                                        123
                                        {/* <IconSelector
                                            label="Icon"
                                            value={formData.icon}
                                            onChange={(value) => setFormData({ ...formData, icon: value })}
                                        /> */}
                                    </div>
                                </div>
                            </div>

                            <div className={cx('form-section')}>
                                <h3>Cấu hình trường dữ liệu</h3>
                                <FieldBuilder fields={formData.fields} onChange={handleFieldsChange} />
                            </div>
                        </div>

                        {showInteractivePreview && (
                            <div className={cx('interactive-preview-panel')}>
                                <InteractivePreview
                                    contractType={{
                                        id: 'preview',
                                        name: formData.name || 'preview',
                                        label: formData.label || 'Xem trước',
                                        description: formData.description || 'Đây là bản xem trước',
                                        icon: formData.icon,
                                        fields: formData.fields,
                                        createdAt: new Date(),
                                        updatedAt: new Date(),
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'preview' && previewType && <ContractTypePreview contractType={previewType} />}
            </div>
        </div>
    );
};

export default ContractTypeManager;
