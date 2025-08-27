import React, { useState } from 'react';
import { Plus, Edit, Trash2, Type, Hash, Calendar, DollarSign, FileText } from 'lucide-react';
import { FieldDef } from '../store/fieldStore';
import FieldForm from './FieldForm';
import './FieldManager.scss';

interface FieldManagerProps {
  fields: FieldDef[];
  onAddField: (field: FieldDef) => void;
  onUpdateField: (key: string, updates: Partial<FieldDef>) => void;
  onDeleteField: (key: string) => void;
}

const FieldManager: React.FC<FieldManagerProps> = ({
  fields,
  onAddField,
  onUpdateField,
  onDeleteField,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<FieldDef | null>(null);

  const handleAddField = () => {
    setEditingField(null);
    setShowForm(true);
  };

  const handleEditField = (field: FieldDef) => {
    setEditingField(field);
    setShowForm(true);
  };

  const handleDeleteField = (field: FieldDef) => {
    if (window.confirm(`Bạn có chắc muốn xóa field "${field.label}"?`)) {
      onDeleteField(field.key);
    }
  };

  const handleFormSubmit = (field: FieldDef) => {
    if (editingField) {
      onUpdateField(editingField.key, field);
    } else {
      onAddField(field);
    }
    setShowForm(false);
    setEditingField(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingField(null);
  };

  const getFieldIcon = (type: FieldDef['type']) => {
    switch (type) {
      case 'text':
      case 'email':
      case 'phone':
        return <Type size={16} />;
      case 'number':
      case 'money':
        return <DollarSign size={16} />;
      case 'date':
        return <Calendar size={16} />;
      case 'textarea':
        return <FileText size={16} />;
      case 'select':
        return <Hash size={16} />;
      default:
        return <Type size={16} />;
    }
  };

  const getFieldTypeLabel = (type: FieldDef['type']) => {
    switch (type) {
      case 'text':
        return 'Văn bản';
      case 'textarea':
        return 'Văn bản dài';
      case 'number':
        return 'Số';
      case 'money':
        return 'Tiền tệ';
      case 'date':
        return 'Ngày tháng';
      case 'select':
        return 'Lựa chọn';
      case 'checkbox':
        return 'Checkbox';
      case 'email':
        return 'Email';
      case 'phone':
        return 'Số điện thoại';
      default:
        return type;
    }
  };

  return (
    <div className="field-manager">
      <div className="field-manager__header">
        <h4>Field Manager</h4>
        <button
          className="field-manager__add-btn"
          onClick={handleAddField}
          type="button"
        >
          <Plus size={16} />
          Add Field
        </button>
      </div>

      <div className="field-manager__list">
        {fields.length === 0 ? (
          <div className="field-manager__empty">
            <p>Chưa có field nào được định nghĩa</p>
            <button
              className="field-manager__add-btn"
              onClick={handleAddField}
              type="button"
            >
              <Plus size={16} />
              Tạo field đầu tiên
            </button>
          </div>
        ) : (
          fields.map((field) => (
            <div key={field.key} className="field-manager__item">
              <div className="field-manager__item-icon">
                {getFieldIcon(field.type)}
              </div>
              
              <div className="field-manager__item-content">
                <div className="field-manager__item-label">{field.label}</div>
                <div className="field-manager__item-details">
                  <span className="field-manager__item-key">{field.key}</span>
                  <span className="field-manager__item-type">{getFieldTypeLabel(field.type)}</span>
                  {field.required && <span className="field-manager__item-required">*</span>}
                </div>
              </div>
              
              <div className="field-manager__item-actions">
                <button
                  className="field-manager__action-btn"
                  onClick={() => handleEditField(field)}
                  type="button"
                  title="Chỉnh sửa"
                >
                  <Edit size={14} />
                </button>
                <button
                  className="field-manager__action-btn field-manager__action-btn--delete"
                  onClick={() => handleDeleteField(field)}
                  type="button"
                  title="Xóa"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <FieldForm
          field={editingField}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default FieldManager;