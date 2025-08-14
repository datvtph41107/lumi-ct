
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSave, 
    faEye, 
    faSpinner,
    faExclamationTriangle,
    faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { useAutoSave } from '~/hooks/useAutoSave';
import { useContractDraftStore } from '~/store/contract-draft-store';
import type { ContractTemplate, TemplateField } from '~/types/contract/contract.types';
import ContractContentRenderer from '../ContractContentRenderer/ContractContentRenderer';
import styles from './BasicContractForm.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface BasicContractFormProps {
    template?: ContractTemplate;
    onSave?: (data: any) => void;
    onPreview?: (data: any) => void;
}

interface FormData {
    [key: string]: any;
}

const BasicContractForm: React.FC<BasicContractFormProps> = ({
    template,
    onSave,
    onPreview
}) => {
    const { setDirty } = useContractDraftStore();
    const [formData, setFormData] = useState<FormData>({});
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Auto-save hook
    useAutoSave();

    useEffect(() => {
        if (template?.fields) {
            // Initialize form data with template fields
            const initialData: FormData = {};
            template.fields.forEach(field => {
                initialData[field.name] = field.default_value || '';
            });
            setFormData(initialData);
        }
    }, [template]);

    const handleInputChange = (fieldName: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));

        // Clear validation error for this field
        if (validationErrors[fieldName]) {
            setValidationErrors(prev => ({
                ...prev,
                [fieldName]: ''
            }));
        }

        // Mark as dirty for auto-save
        setDirty(true);
    };

    const validateForm = (): boolean => {
        if (!template?.fields) return true;

        const errors: Record<string, string> = {};

        template.fields.forEach(field => {
            const value = formData[field.name];

            if (field.required && (!value || value.toString().trim() === '')) {
                errors[field.name] = `${field.label} là bắt buộc`;
            } else if (value && field.validation) {
                // Custom validation rules
                if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
                    errors[field.name] = field.validation.message || `${field.label} không hợp lệ`;
                }
                if (field.validation.min_length && value.length < field.validation.min_length) {
                    errors[field.name] = `${field.label} phải có ít nhất ${field.validation.min_length} ký tự`;
                }
                if (field.validation.max_length && value.length > field.validation.max_length) {
                    errors[field.name] = `${field.label} không được vượt quá ${field.validation.max_length} ký tự`;
                }
            }
        });

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave?.(formData);
        } catch (error) {
            console.error('Error saving form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePreview = () => {
        if (validateForm()) {
            setShowPreview(true);
            onPreview?.(formData);
        }
    };

    const renderField = (field: TemplateField) => {
        const value = formData[field.name] || '';
        const error = validationErrors[field.name];

        const commonProps = {
            id: field.name,
            name: field.name,
            value: value,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
                handleInputChange(field.name, e.target.value),
            placeholder: field.placeholder,
            className: cx('form-input', { 'error': error }),
            disabled: isSubmitting
        };

        switch (field.type) {
            case 'text':
                return <input type="text" {...commonProps} />;

            case 'textarea':
                return (
                    <textarea 
                        {...commonProps} 
                        rows={field.rows || 4}
                    />
                );

            case 'number':
                return (
                    <input 
                        type="number" 
                        {...commonProps}
                        min={field.validation?.min}
                        max={field.validation?.max}
                    />
                );

            case 'email':
                return <input type="email" {...commonProps} />;

            case 'phone':
                return <input type="tel" {...commonProps} />;

            case 'date':
                return <input type="date" {...commonProps} />;

            case 'select':
                return (
                    <select {...commonProps}>
                        <option value="">Chọn {field.label.toLowerCase()}</option>
                        {field.options?.map((option, index) => (
                            <option key={index} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'checkbox':
                return (
                    <label className={cx('checkbox-wrapper')}>
                        <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleInputChange(field.name, e.target.checked)}
                            disabled={isSubmitting}
                        />
                        <span className={cx('checkmark')}></span>
                        {field.label}
                    </label>
                );

            case 'radio':
                return (
                    <div className={cx('radio-group')}>
                        {field.options?.map((option, index) => (
                            <label key={index} className={cx('radio-wrapper')}>
                                <input
                                    type="radio"
                                    name={field.name}
                                    value={option.value}
                                    checked={value === option.value}
                                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                                    disabled={isSubmitting}
                                />
                                <span className={cx('radio-mark')}></span>
                                {option.label}
                            </label>
                        ))}
                    </div>
                );

            default:
                return <input type="text" {...commonProps} />;
        }
    };

    if (!template) {
        return (
            <div className={cx('no-template')}>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <p>Không có template được chọn</p>
            </div>
        );
    }

    return (
        <div className={cx('basic-contract-form')}>
            <div className={cx('form-header')}>
                <h3>Soạn thảo hợp đồng: {template.name}</h3>
                <p>{template.description}</p>
            </div>

            <form onSubmit={handleSubmit} className={cx('contract-form')}>
                <div className={cx('form-fields')}>
                    {template.fields?.map((field, index) => (
                        <div key={field.id || index} className={cx('form-group')}>
                            <label htmlFor={field.name}>
                                {field.label}
                                {field.required && <span className={cx('required')}>*</span>}
                            </label>
                            
                            {renderField(field)}
                            
                            {validationErrors[field.name] && (
                                <span className={cx('error-text')}>
                                    {validationErrors[field.name]}
                                </span>
                            )}
                            
                            {field.help_text && (
                                <span className={cx('help-text')}>
                                    {field.help_text}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                <div className={cx('form-actions')}>
                    <button
                        type="button"
                        className={cx('preview-btn')}
                        onClick={handlePreview}
                        disabled={isSubmitting}
                    >
                        <FontAwesomeIcon icon={faEye} />
                        Xem trước
                    </button>
                    
                    <button
                        type="submit"
                        className={cx('save-btn', { 'loading': isSubmitting })}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faSave} />
                                Lưu và tiếp tục
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Preview Modal */}
            {showPreview && (
                <div className={cx('preview-modal')}>
                    <div className={cx('preview-content')}>
                        <div className={cx('preview-header')}>
                            <h4>Xem trước hợp đồng</h4>
                            <button
                                className={cx('close-btn')}
                                onClick={() => setShowPreview(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className={cx('preview-body')}>
                            <ContractContentRenderer
                                template={template}
                                data={formData}
                            />
                        </div>
                        
                        <div className={cx('preview-actions')}>
                            <button
                                className={cx('back-btn')}
                                onClick={() => setShowPreview(false)}
                            >
                                Quay lại chỉnh sửa
                            </button>
                            <button
                                className={cx('continue-btn')}
                                onClick={() => {
                                    setShowPreview(false);
                                    onSave?.(formData);
                                }}
                            >
                                <FontAwesomeIcon icon={faCheckCircle} />
                                Tiếp tục
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BasicContractForm;
