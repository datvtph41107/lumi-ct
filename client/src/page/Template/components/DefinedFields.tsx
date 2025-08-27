import React, { useState } from 'react';
import { 
  Type, 
  Hash, 
  Calendar, 
  DollarSign,
  FileText,
  User,
  Building,
  MapPin,
  Phone,
  CreditCard,
  FileSignature,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye
} from 'lucide-react';
import { FieldDef } from '../store/fieldStore';
import { DraggableBlockItem } from './DraggableBlockItem';
import './DefinedFields.scss';

interface DefinedFieldsProps {
  fields: FieldDef[];
  onAddField: (field: FieldDef) => void;
  onUpdateField: (key: string, updates: Partial<FieldDef>) => void;
  onDeleteField: (key: string) => void;
}

const DefinedFields: React.FC<DefinedFieldsProps> = ({
  fields,
  onAddField,
  onUpdateField,
  onDeleteField,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFieldDetails, setShowFieldDetails] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Tất cả', icon: Eye, color: '#6c757d' },
    { id: 'contract', label: 'Hợp đồng', icon: FileText, color: '#007bff' },
    { id: 'party', label: 'Các bên', icon: Building, color: '#28a745' },
    { id: 'personal', label: 'Cá nhân', icon: User, color: '#fd7e14' },
    { id: 'financial', label: 'Tài chính', icon: DollarSign, color: '#dc3545' },
    { id: 'contact', label: 'Liên hệ', icon: Phone, color: '#6f42c1' }
  ];

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'text': return Type;
      case 'number': return Hash;
      case 'date': return Calendar;
      case 'money': return DollarSign;
      case 'textarea': return FileText;
      case 'select': return Type;
      case 'signature': return FileSignature;
      default: return Type;
    }
  };

  const getFieldCategory = (field: FieldDef) => {
    const key = field.key.toLowerCase();
    if (key.includes('contract') || key.includes('agreement')) return 'contract';
    if (key.includes('company') || key.includes('party') || key.includes('bên')) return 'party';
    if (key.includes('name') || key.includes('person') || key.includes('representative')) return 'personal';
    if (key.includes('amount') || key.includes('price') || key.includes('payment') || key.includes('money')) return 'financial';
    if (key.includes('phone') || key.includes('email') || key.includes('address')) return 'contact';
    return 'contract';
  };

  const filteredFields = fields.filter(field => {
    const matchesCategory = selectedCategory === 'all' || getFieldCategory(field) === selectedCategory;
    const matchesSearch = field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         field.key.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleFieldDrag = (field: FieldDef) => {
    // Logic để kéo field vào editor
    console.log('Dragging field:', field);
  };

  const handleFieldEdit = (field: FieldDef) => {
    // Logic để edit field
    console.log('Editing field:', field);
  };

  const handleFieldDuplicate = (field: FieldDef) => {
    const duplicatedField: FieldDef = {
      ...field,
      key: `${field.key}_copy`,
      label: `${field.label} (Copy)`
    };
    onAddField(duplicatedField);
  };

  const handleFieldDelete = (field: FieldDef) => {
    if (window.confirm(`Bạn có chắc muốn xóa field "${field.label}"?`)) {
      onDeleteField(field.key);
    }
  };

  return (
    <div className="defined-fields">
      <div className="defined-fields__header">
        <h4 className="defined-fields__title">Fields Đã Định Nghĩa</h4>
        <p className="defined-fields__subtitle">Kéo thả để sử dụng trong template</p>
      </div>

      <div className="defined-fields__search">
        <div className="defined-fields__search-input-wrapper">
          <Search size={16} className="defined-fields__search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="defined-fields__search-input"
          />
        </div>
      </div>

      <div className="defined-fields__categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`defined-fields__category ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
            style={{ '--category-color': category.color } as React.CSSProperties}
          >
            <category.icon size={16} />
            {category.label}
          </button>
        ))}
      </div>

      <div className="defined-fields__content">
        {filteredFields.length === 0 ? (
          <div className="defined-fields__empty">
            <Type size={48} />
            <p>Không tìm thấy field phù hợp</p>
            {fields.length === 0 && (
              <p className="defined-fields__empty-hint">
                Tạo field mới trong tab "Fields" để bắt đầu
              </p>
            )}
          </div>
        ) : (
          <div className="defined-fields__list">
            {filteredFields.map((field) => {
              const FieldIcon = getFieldIcon(field.type);
              const category = getFieldCategory(field);
              
              return (
                <div key={field.key} className="defined-fields__item">
                  <DraggableBlockItem
                    id={`field-${field.key}`}
                    data={{
                      source: 'sidebar',
                      type: 'inlineField',
                      attrs: {
                        key: field.key,
                        label: field.label,
                        type: field.type,
                        widget: field.widget,
                        format: field.format,
                        required: field.required,
                        placeholder: field.placeholder,
                      },
                    }}
                    className={`defined-fields__field defined-fields__field--${category}`}
                    onDragStart={() => handleFieldDrag(field)}
                  >
                    <div className="defined-fields__field-icon">
                      <FieldIcon size={16} />
                    </div>
                    <div className="defined-fields__field-content">
                      <div className="defined-fields__field-label">{field.label}</div>
                      <div className="defined-fields__field-key">({field.key})</div>
                      <div className="defined-fields__field-type">{field.type}</div>
                    </div>
                  </DraggableBlockItem>

                  <div className="defined-fields__item-actions">
                    <button
                      className="defined-fields__action-btn"
                      onClick={() => setShowFieldDetails(showFieldDetails === field.key ? null : field.key)}
                      title="Xem chi tiết"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className="defined-fields__action-btn"
                      onClick={() => handleFieldEdit(field)}
                      title="Chỉnh sửa"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="defined-fields__action-btn"
                      onClick={() => handleFieldDuplicate(field)}
                      title="Nhân bản"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      className="defined-fields__action-btn defined-fields__action-btn--danger"
                      onClick={() => handleFieldDelete(field)}
                      title="Xóa"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {showFieldDetails === field.key && (
                    <div className="defined-fields__field-details">
                      <div className="defined-fields__detail-row">
                        <span className="defined-fields__detail-label">Key:</span>
                        <span className="defined-fields__detail-value">{field.key}</span>
                      </div>
                      <div className="defined-fields__detail-row">
                        <span className="defined-fields__detail-label">Type:</span>
                        <span className="defined-fields__detail-value">{field.type}</span>
                      </div>
                      {field.required && (
                        <div className="defined-fields__detail-row">
                          <span className="defined-fields__detail-label">Required:</span>
                          <span className="defined-fields__detail-value">Có</span>
                        </div>
                      )}
                      {field.placeholder && (
                        <div className="defined-fields__detail-row">
                          <span className="defined-fields__detail-label">Placeholder:</span>
                          <span className="defined-fields__detail-value">{field.placeholder}</span>
                        </div>
                      )}
                      {field.description && (
                        <div className="defined-fields__detail-row">
                          <span className="defined-fields__detail-label">Mô tả:</span>
                          <span className="defined-fields__detail-value">{field.description}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="defined-fields__footer">
        <div className="defined-fields__stats">
          <span>{filteredFields.length} fields</span>
          {selectedCategory !== 'all' && (
            <span className="defined-fields__category-name">
              trong {categories.find(cat => cat.id === selectedCategory)?.label}
            </span>
          )}
        </div>
        <button
          className="defined-fields__add-btn"
          onClick={() => {
            // Logic để mở form tạo field mới
            console.log('Add new field');
          }}
        >
          <Plus size={16} />
          Thêm Field
        </button>
      </div>
    </div>
  );
};

export default DefinedFields;