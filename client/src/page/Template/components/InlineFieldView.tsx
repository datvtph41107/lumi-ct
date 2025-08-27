import React, { useCallback, useEffect, useRef } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useUIModeStore } from '../store/uiModeStore';
import { useTemplateStore } from '../store/templateStore';
import { useFieldStore } from '../store/fieldStore';
import { FieldDef } from '../store/fieldStore';
import { formatValue } from '../utils/formatters';
import './InlineFieldView.scss';

export const InlineFieldView: React.FC<NodeViewProps> = ({ node, updateAttributes, editor }) => {
  const { mode } = useUIModeStore();
  const { getContractData, updateContractData } = useTemplateStore();
  const { getField } = useFieldStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const fieldKey = node.attrs.key;
  const field = getField(fieldKey);
  const value = getContractData(fieldKey);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    updateContractData(fieldKey, newValue);
  }, [fieldKey, updateContractData]);

  const handleFieldClick = useCallback(() => {
    if (mode === 'edit' && field) {
      // Open field properties panel
      // This would typically trigger a modal or sidebar
      console.log('Open field properties for:', field);
    }
  }, [mode, field]);

  const renderEditMode = () => {
    if (!field) {
      return (
        <span className="inline-field__placeholder" onClick={handleFieldClick}>
          [Chưa định nghĩa field]
        </span>
      );
    }

    return (
      <span 
        className="inline-field__chip" 
        onClick={handleFieldClick}
        data-field-key={fieldKey}
      >
        <span className="inline-field__label">{field.label}</span>
        <span className="inline-field__key">({{fieldKey}})</span>
        {field.required && <span className="inline-field__required">*</span>}
      </span>
    );
  };

  const renderFillMode = () => {
    if (!field) {
      return (
        <span className="inline-field__error">
          Field not found: {fieldKey}
        </span>
      );
    }

    const inputProps = {
      ref: inputRef,
      value: value || '',
      onChange: handleInputChange,
      placeholder: field.placeholder || field.label,
      className: `inline-field__input inline-field__input--${field.type}`,
      required: field.required,
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...inputProps}
            rows={2}
            className="inline-field__textarea"
          />
        );
      
      case 'date':
        return (
          <input
            {...inputProps}
            type="date"
            className="inline-field__date"
          />
        );
      
      case 'number':
        return (
          <input
            {...inputProps}
            type="number"
            min={field.validation?.min}
            max={field.validation?.max}
            step="any"
          />
        );
      
      case 'money':
        return (
          <input
            {...inputProps}
            type="number"
            step="0.01"
            min="0"
            className="inline-field__money"
          />
        );
      
      case 'select':
        return (
          <select
            {...inputProps}
            className="inline-field__select"
          >
            <option value="">{field.placeholder || 'Chọn...'}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <input
            {...inputProps}
            type="checkbox"
            checked={Boolean(value)}
            className="inline-field__checkbox"
          />
        );
      
      default:
        return <input {...inputProps} type="text" />;
    }
  };

  const renderPreviewMode = () => {
    if (!field) {
      return <span className="inline-field__error">[Field not found]</span>;
    }

    if (value === undefined || value === null || value === '') {
      return <span className="inline-field__empty">[Chưa điền]</span>;
    }

    return (
      <span className="inline-field__value">
        {formatValue(value, field)}
      </span>
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

  return (
    <NodeViewWrapper className="inline-field">
      {renderContent()}
    </NodeViewWrapper>
  );
};