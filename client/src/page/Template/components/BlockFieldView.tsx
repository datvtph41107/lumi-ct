import React, { useCallback } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useUIModeStore } from '../store/uiModeStore';
import { useTemplateStore } from '../store/templateStore';
import { useFieldStore } from '../store/fieldStore';
import { formatValue } from '../utils/formatters';
import './BlockFieldView.scss';

export const BlockFieldView: React.FC<NodeViewProps> = ({ node, updateAttributes, editor }) => {
    const { mode } = useUIModeStore();
    const { getContractData, updateContractData } = useTemplateStore();
    const { getField } = useFieldStore();

    const fieldKey = node.attrs.key;
    const field = getField(fieldKey);
    const value = getContractData(fieldKey);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const newValue = e.target.value;
            updateContractData(fieldKey, newValue);
        },
        [fieldKey, updateContractData],
    );

    const handleFieldClick = useCallback(() => {
        if (mode === 'edit' && field) {
            console.log('Open field properties for:', field);
        }
    }, [mode, field]);

    const renderEditMode = () => {
        if (!field) {
            return (
                <div className="block-field__placeholder" onClick={handleFieldClick}>
                    <div className="block-field__placeholder-content">
                        <span>[Chưa định nghĩa field]</span>
                        <small>Click để cấu hình</small>
                    </div>
                </div>
            );
        }

        return (
            <div className="block-field__container" onClick={handleFieldClick} data-field-key={fieldKey}>
                <div className="block-field__header">
                    <span className="block-field__label">{field.label}</span>
                    <span className="block-field__key">({{ fieldKey }})</span>
                    {field.required && <span className="block-field__required">*</span>}
                </div>
                <div className="block-field__preview">
                    <span className="block-field__preview-text">{field.placeholder || `[${field.type} field]`}</span>
                </div>
            </div>
        );
    };

    const renderFillMode = () => {
        if (!field) {
            return <div className="block-field__error">Field not found: {fieldKey}</div>;
        }

        return (
            <div className="block-field__fill-container">
                <label className="block-field__fill-label">
                    {field.label}
                    {field.required && <span className="block-field__required">*</span>}
                </label>

                {field.type === 'textarea' ? (
                    <textarea
                        value={value || ''}
                        onChange={handleInputChange}
                        placeholder={field.placeholder || field.label}
                        className="block-field__textarea"
                        rows={4}
                        required={field.required}
                    />
                ) : (
                    <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={value || ''}
                        onChange={handleInputChange}
                        placeholder={field.placeholder || field.label}
                        className="block-field__input"
                        required={field.required}
                        min={field.validation?.min}
                        max={field.validation?.max}
                    />
                )}
            </div>
        );
    };

    const renderPreviewMode = () => {
        if (!field) {
            return <div className="block-field__error">[Field not found: {fieldKey}]</div>;
        }

        return (
            <div className="block-field__preview-container">
                <div className="block-field__preview-label">{field.label}:</div>
                <div className="block-field__preview-value">
                    {value !== undefined && value !== null && value !== '' ? (
                        formatValue(value, field)
                    ) : (
                        <span className="block-field__empty">[Chưa điền]</span>
                    )}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        switch (mode) {
            case 'edit':
                return renderEditMode();
            case 'fill':
                return renderFillMode();
            case 'preview':
                return renderPreviewMode();
            default:
                return renderEditMode();
        }
    };

    return <NodeViewWrapper className="block-field">{renderContent()}</NodeViewWrapper>;
};
