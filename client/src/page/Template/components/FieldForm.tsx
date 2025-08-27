import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { FieldDef } from '../store/fieldStore';
import './FieldForm.scss';

interface FieldFormProps {
  field?: FieldDef | null;
  onSubmit: (field: FieldDef) => void;
  onCancel: () => void;
}

const FieldForm: React.FC<FieldFormProps> = ({ field, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<FieldDef>>({
    key: '',
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
    description: '',
  });

  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [newOption, setNewOption] = useState({ value: '', label: '' });

  useEffect(() => {
    if (field) {
      setFormData(field);
      setOptions(field.options || []);
    }
  }, [field]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddOption = () => {
    if (newOption.value && newOption.label) {
      setOptions(prev => [...prev, { ...newOption }]);
      setNewOption({ value: '', label: '' });
    }
  };

  const handleRemoveOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.key || !formData.label) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const fieldData: FieldDef = {
      key: formData.key,
      label: formData.label,
      type: formData.type || 'text',
      required: formData.required || false,
      placeholder: formData.placeholder || '',
      description: formData.description || '',
      options: formData.type === 'select' ? options : undefined,
    };

    onSubmit(fieldData);
  };

  const generateKeyFromLabel = (label: string) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_');
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const label = e.target.value;
    setFormData(prev => ({
      ...prev,
      label,
      key: generateKeyFromLabel(label),
    }));
  };

  return (
    <div className="field-form-overlay">
      <div className="field-form">
        <div className="field-form__header">
          <h3>{field ? 'Chỉnh sửa Field' : 'Tạo Field mới'}</h3>
          <button
            className="field-form__close-btn"
            onClick={onCancel}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="field-form__content">
          <div className="field-form__row">
            <label className="field-form__label">
              Label <span className="field-form__required">*</span>
            </label>
            <input
              type="text"
              name="label"
              value={formData.label}
              onChange={handleLabelChange}
              className="field-form__input"
              placeholder="Nhập label cho field"
              required
            />
          </div>

          <div className="field-form__row">
            <label className="field-form__label">
              Key <span className="field-form__required">*</span>
            </label>
            <input
              type="text"
              name="key"
              value={formData.key}
              onChange={handleInputChange}
              className="field-form__input"
              placeholder="field_key"
              required
            />
          </div>

          <div className="field-form__row">
            <label className="field-form__label">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="field-form__select"
            >
              <option value="text">Văn bản</option>
              <option value="textarea">Văn bản dài</option>
              <option value="number">Số</option>
              <option value="money">Tiền tệ</option>
              <option value="date">Ngày tháng</option>
              <option value="select">Lựa chọn</option>
              <option value="checkbox">Checkbox</option>
              <option value="email">Email</option>
              <option value="phone">Số điện thoại</option>
            </select>
          </div>

          <div className="field-form__row">
            <label className="field-form__label">Placeholder</label>
            <input
              type="text"
              name="placeholder"
              value={formData.placeholder}
              onChange={handleInputChange}
              className="field-form__input"
              placeholder="Text hiển thị khi chưa nhập"
            />
          </div>

          <div className="field-form__row">
            <label className="field-form__label">Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="field-form__textarea"
              placeholder="Mô tả chi tiết về field"
              rows={2}
            />
          </div>

          <div className="field-form__row">
            <label className="field-form__checkbox-label">
              <input
                type="checkbox"
                name="required"
                checked={formData.required}
                onChange={handleInputChange}
                className="field-form__checkbox"
              />
              Bắt buộc
            </label>
          </div>

          {formData.type === 'select' && (
            <div className="field-form__section">
              <h4>Options</h4>
              <div className="field-form__options">
                {options.map((option, index) => (
                  <div key={index} className="field-form__option">
                    <input
                      type="text"
                      value={option.value}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index].value = e.target.value;
                        setOptions(newOptions);
                      }}
                      className="field-form__option-input"
                      placeholder="Value"
                    />
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index].label = e.target.value;
                        setOptions(newOptions);
                      }}
                      className="field-form__option-input"
                      placeholder="Label"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="field-form__option-remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                
                <div className="field-form__option-add">
                  <input
                    type="text"
                    value={newOption.value}
                    onChange={(e) => setNewOption(prev => ({ ...prev, value: e.target.value }))}
                    className="field-form__option-input"
                    placeholder="Value"
                  />
                  <input
                    type="text"
                    value={newOption.label}
                    onChange={(e) => setNewOption(prev => ({ ...prev, label: e.target.value }))}
                    className="field-form__option-input"
                    placeholder="Label"
                  />
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="field-form__option-add-btn"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="field-form__actions">
            <button
              type="button"
              onClick={onCancel}
              className="field-form__btn field-form__btn--cancel"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="field-form__btn field-form__btn--submit"
            >
              {field ? 'Cập nhật' : 'Tạo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FieldForm;