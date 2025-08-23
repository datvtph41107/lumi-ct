import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTextWidth,
    faCalendar,
    faDollarSign,
    faCheckSquare,
    faList,
    faFileText,
    faSignature,
    faImage,
    faTrash,
    faCog,
    faEye,
    faCopy,
    faGripVertical
} from '@fortawesome/free-solid-svg-icons';
import styles from './TemplateBuilder.module.scss';

type FieldType = 'text' | 'date' | 'currency' | 'checkbox' | 'select' | 'textarea' | 'signature' | 'image' | 'table' | 'section';

interface Field {
    id: string;
    type: FieldType;
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
    properties?: Record<string, any>;
}

const initialFields: Field[] = [
    { id: 'text-1', type: 'text', label: 'Tiêu đề', placeholder: 'Nhập tiêu đề...', required: true },
    { id: 'date-1', type: 'date', label: 'Ngày hiệu lực', required: true },
    { id: 'currency-1', type: 'currency', label: 'Số tiền hợp đồng', placeholder: '0', required: true },
    { id: 'textarea-1', type: 'textarea', label: 'Mô tả', placeholder: 'Nhập mô tả...' },
    { id: 'select-1', type: 'select', label: 'Loại hợp đồng', options: ['Lao động', 'Dịch vụ', 'NDA', 'Hợp tác'] },
    { id: 'checkbox-1', type: 'checkbox', label: 'Đồng ý với điều khoản' },
    { id: 'section-1', type: 'section', label: 'Điều khoản 1' },
    { id: 'table-1', type: 'table', label: 'Bảng thông tin' },
    { id: 'signature-1', type: 'signature', label: 'Chữ ký bên A' },
    { id: 'image-1', type: 'image', label: 'Logo công ty' }
];

const fieldCategories = [
    {
        name: 'Cơ bản',
        fields: [
            { type: 'text', label: 'Văn bản', icon: faTextWidth },
            { type: 'textarea', label: 'Văn bản dài', icon: faFileText },
            { type: 'date', label: 'Ngày tháng', icon: faCalendar },
            { type: 'currency', label: 'Tiền tệ', icon: faDollarSign }
        ]
    },
    {
        name: 'Lựa chọn',
        fields: [
            { type: 'checkbox', label: 'Checkbox', icon: faCheckSquare },
            { type: 'select', label: 'Dropdown', icon: faList }
        ]
    },
    {
        name: 'Đặc biệt',
        fields: [
            { type: 'signature', label: 'Chữ ký', icon: faSignature },
            { type: 'image', label: 'Hình ảnh', icon: faImage },
            { type: 'table', label: 'Bảng', icon: faList },
            { type: 'section', label: 'Phần', icon: faFileText }
        ]
    }
];

export const TemplateBuilder = () => {
    const [canvas, setCanvas] = useState<Field[]>([]);
    const [selectedField, setSelectedField] = useState<string | null>(null);

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;

        if (destination.droppableId === 'canvas' && source.droppableId === 'toolbox') {
            // Add new field from toolbox
            const fieldType = draggableId as FieldType;
            const newField: Field = {
                id: `${fieldType}-${Date.now()}`,
                type: fieldType,
                label: `Trường ${fieldType}`,
                placeholder: `Nhập ${fieldType}...`,
                required: false
            };
            
            if (fieldType === 'select') {
                newField.options = ['Tùy chọn 1', 'Tùy chọn 2', 'Tùy chọn 3'];
            }
            
            setCanvas(prev => [...prev, newField]);
            setSelectedField(newField.id);
        }
        
        if (destination.droppableId === 'canvas' && source.droppableId === 'canvas') {
            // Reorder fields in canvas
            const updated = Array.from(canvas);
            const [removed] = updated.splice(source.index, 1);
            updated.splice(destination.index, 0, removed);
            setCanvas(updated);
        }
    };

    const updateField = (id: string, updates: Partial<Field>) => {
        setCanvas(prev => prev.map(field => 
            field.id === id ? { ...field, ...updates } : field
        ));
    };

    const deleteField = (id: string) => {
        setCanvas(prev => prev.filter(field => field.id !== id));
        setSelectedField(null);
    };

    const duplicateField = (id: string) => {
        const field = canvas.find(f => f.id === id);
        if (!field) return;
        
        const newField: Field = {
            ...field,
            id: `${field.type}-${Date.now()}`,
            label: `${field.label} (bản sao)`
        };
        
        setCanvas(prev => [...prev, newField]);
        setSelectedField(newField.id);
    };

    const getFieldIcon = (type: FieldType) => {
        switch (type) {
            case 'text': return faTextWidth;
            case 'date': return faCalendar;
            case 'currency': return faDollarSign;
            case 'checkbox': return faCheckSquare;
            case 'select': return faList;
            case 'textarea': return faFileText;
            case 'signature': return faSignature;
            case 'image': return faImage;
            case 'table': return faList;
            case 'section': return faFileText;
            default: return faTextWidth;
        }
    };

    const renderFieldPreview = (field: Field) => {
        switch (field.type) {
            case 'text':
                return (
                    <div className={styles.fieldPreview}>
                        <label>{field.label}{field.required && <span className={styles.required}>*</span>}</label>
                        <input 
                            type="text" 
                            placeholder={field.placeholder} 
                            disabled 
                            className={styles.previewInput}
                        />
                    </div>
                );
            case 'textarea':
                return (
                    <div className={styles.fieldPreview}>
                        <label>{field.label}{field.required && <span className={styles.required}>*</span>}</label>
                        <textarea 
                            placeholder={field.placeholder} 
                            disabled 
                            className={styles.previewTextarea}
                            rows={3}
                        />
                    </div>
                );
            case 'date':
                return (
                    <div className={styles.fieldPreview}>
                        <label>{field.label}{field.required && <span className={styles.required}>*</span>}</label>
                        <input 
                            type="date" 
                            disabled 
                            className={styles.previewInput}
                        />
                    </div>
                );
            case 'currency':
                return (
                    <div className={styles.fieldPreview}>
                        <label>{field.label}{field.required && <span className={styles.required}>*</span>}</label>
                        <input 
                            type="number" 
                            placeholder={field.placeholder} 
                            disabled 
                            className={styles.previewInput}
                        />
                    </div>
                );
            case 'checkbox':
                return (
                    <div className={styles.fieldPreview}>
                        <label className={styles.checkboxLabel}>
                            <input type="checkbox" disabled />
                            {field.label}{field.required && <span className={styles.required}>*</span>}
                        </label>
                    </div>
                );
            case 'select':
                return (
                    <div className={styles.fieldPreview}>
                        <label>{field.label}{field.required && <span className={styles.required}>*</span>}</label>
                        <select disabled className={styles.previewSelect}>
                            <option>{field.placeholder || 'Chọn...'}</option>
                            {field.options?.map((option, index) => (
                                <option key={index}>{option}</option>
                            ))}
                        </select>
                    </div>
                );
            case 'signature':
                return (
                    <div className={styles.fieldPreview}>
                        <label>{field.label}{field.required && <span className={styles.required}>*</span>}</label>
                        <div className={styles.signatureBox}>
                            <FontAwesomeIcon icon={faSignature} />
                            <span>Khu vực chữ ký</span>
                        </div>
                    </div>
                );
            case 'image':
                return (
                    <div className={styles.fieldPreview}>
                        <label>{field.label}{field.required && <span className={styles.required}>*</span>}</label>
                        <div className={styles.imageBox}>
                            <FontAwesomeIcon icon={faImage} />
                            <span>Khu vực hình ảnh</span>
                        </div>
                    </div>
                );
            case 'table':
                return (
                    <div className={styles.fieldPreview}>
                        <label>{field.label}{field.required && <span className={styles.required}>*</span>}</label>
                        <div className={styles.tableBox}>
                            <table className={styles.previewTable}>
                                <thead>
                                    <tr>
                                        <th>Tiêu đề 1</th>
                                        <th>Tiêu đề 2</th>
                                        <th>Tiêu đề 3</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Dữ liệu 1</td>
                                        <td>Dữ liệu 2</td>
                                        <td>Dữ liệu 3</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'section':
                return (
                    <div className={styles.fieldPreview}>
                        <h3 className={styles.sectionTitle}>{field.label}</h3>
                        <div className={styles.sectionContent}>
                            <p>Nội dung phần này sẽ được thêm vào đây...</p>
                        </div>
                    </div>
                );
            default:
                return <div>Unknown field type</div>;
        }
    };

    return (
        <div className={styles.container}>
            {/* Fields Toolbox */}
            <div className={styles.toolbox}>
                <div className={styles.toolboxHeader}>
                    <h3>Thư viện trường</h3>
                    <p>Kéo thả để thêm vào template</p>
                </div>
                
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="toolbox" isDropDisabled>
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className={styles.toolboxContent}>
                                {fieldCategories.map((category, categoryIndex) => (
                                    <div key={category.name} className={styles.category}>
                                        <h4 className={styles.categoryTitle}>{category.name}</h4>
                                        <div className={styles.categoryFields}>
                                            {category.fields.map((field, fieldIndex) => (
                                                <Draggable 
                                                    key={field.type} 
                                                    draggableId={field.type} 
                                                    index={categoryIndex * 100 + fieldIndex}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`${styles.toolboxField} ${snapshot.isDragging ? styles.dragging : ''}`}
                                                        >
                                                            <FontAwesomeIcon icon={field.icon} />
                                                            <span>{field.label}</span>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            {/* Canvas */}
            <div className={styles.canvas}>
                <div className={styles.canvasHeader}>
                    <h3>Khu vực thiết kế</h3>
                    <div className={styles.canvasActions}>
                        <button className={styles.actionButton}>
                            <FontAwesomeIcon icon={faEye} />
                            Xem trước
                        </button>
                        <button className={styles.actionButton}>
                            <FontAwesomeIcon icon={faCopy} />
                            Xuất
                        </button>
                    </div>
                </div>
                
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="canvas">
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`${styles.canvasContent} ${snapshot.isDraggingOver ? styles.dragOver : ''}`}
                            >
                                {canvas.length === 0 && (
                                    <div className={styles.emptyCanvas}>
                                        <FontAwesomeIcon icon={faFileText} className={styles.emptyIcon} />
                                        <h4>Chưa có trường nào</h4>
                                        <p>Kéo thả trường từ thư viện bên trái vào đây để bắt đầu thiết kế</p>
                                    </div>
                                )}
                                
                                {canvas.map((field, index) => (
                                    <Draggable key={field.id} draggableId={field.id} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`${styles.canvasField} ${snapshot.isDragging ? styles.dragging : ''} ${selectedField === field.id ? styles.selected : ''}`}
                                                onClick={() => setSelectedField(field.id)}
                                            >
                                                <div {...provided.dragHandleProps} className={styles.dragHandle}>
                                                    <FontAwesomeIcon icon={faGripVertical} />
                                                </div>
                                                
                                                <div className={styles.fieldContent}>
                                                    {renderFieldPreview(field)}
                                                </div>
                                                
                                                <div className={styles.fieldActions}>
                                                    <button 
                                                        className={styles.fieldAction}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            duplicateField(field.id);
                                                        }}
                                                        title="Nhân bản"
                                                    >
                                                        <FontAwesomeIcon icon={faCopy} />
                                                    </button>
                                                    <button 
                                                        className={styles.fieldAction}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteField(field.id);
                                                        }}
                                                        title="Xóa"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            {/* Properties Panel */}
            <div className={styles.properties}>
                <div className={styles.propertiesHeader}>
                    <h3>Thuộc tính</h3>
                    {selectedField && <span className={styles.selectedFieldName}>Đã chọn trường</span>}
                </div>
                
                {selectedField ? (
                    <div className={styles.propertiesContent}>
                        {(() => {
                            const field = canvas.find(f => f.id === selectedField);
                            if (!field) return null;
                            
                            return (
                                <div className={styles.fieldProperties}>
                                    <div className={styles.propertyGroup}>
                                        <label>Nhãn trường</label>
                                        <input
                                            type="text"
                                            value={field.label}
                                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                                            className={styles.propertyInput}
                                        />
                                    </div>
                                    
                                    {field.type === 'text' || field.type === 'textarea' || field.type === 'currency' ? (
                                        <div className={styles.propertyGroup}>
                                            <label>Placeholder</label>
                                            <input
                                                type="text"
                                                value={field.placeholder || ''}
                                                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                                className={styles.propertyInput}
                                            />
                                        </div>
                                    ) : null}
                                    
                                    {field.type === 'select' ? (
                                        <div className={styles.propertyGroup}>
                                            <label>Tùy chọn</label>
                                            <textarea
                                                value={field.options?.join('\n') || ''}
                                                onChange={(e) => updateField(field.id, { 
                                                    options: e.target.value.split('\n').filter(opt => opt.trim()) 
                                                })}
                                                className={styles.propertyTextarea}
                                                rows={4}
                                                placeholder="Mỗi dòng một tùy chọn"
                                            />
                                        </div>
                                    ) : null}
                                    
                                    <div className={styles.propertyGroup}>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={field.required || false}
                                                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                            />
                                            Bắt buộc
                                        </label>
                                    </div>
                                    
                                    <div className={styles.propertyActions}>
                                        <button 
                                            className={styles.propertyButton}
                                            onClick={() => duplicateField(field.id)}
                                        >
                                            <FontAwesomeIcon icon={faCopy} />
                                            Nhân bản
                                        </button>
                                        <button 
                                            className={`${styles.propertyButton} ${styles.danger}`}
                                            onClick={() => deleteField(field.id)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                    <div className={styles.noSelection}>
                        <FontAwesomeIcon icon={faCog} className={styles.noSelectionIcon} />
                        <p>Chọn một trường để chỉnh sửa thuộc tính</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TemplateBuilder;
