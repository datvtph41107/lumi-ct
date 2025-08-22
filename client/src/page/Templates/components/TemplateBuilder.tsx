import { useState, useMemo, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { VariableToken } from './extensions/variable-token';
import { ClauseBlock } from './extensions/clause-block';
import { SignatureBlock } from './extensions/signature-block';
import { LayoutContainer } from './extensions/layout-container';
import styles from './TemplateBuilder.module.scss';

// Field types for drag & drop
export type FieldType = {
    id: string;
    type: 'text' | 'date' | 'currency' | 'select' | 'textarea' | 'signature' | 'clause' | 'table' | 'image';
    label: string;
    key?: string;
    placeholder?: string;
    required?: boolean;
    validation?: any;
    style?: any;
    position?: { x: number; y: number };
};

// Predefined field library
const FIELD_LIBRARY: FieldType[] = [
    // Basic fields
    { id: 'text', type: 'text', label: 'Văn bản', key: 'text_field' },
    { id: 'date', type: 'date', label: 'Ngày tháng', key: 'date_field' },
    { id: 'currency', type: 'currency', label: 'Số tiền', key: 'currency_field' },
    { id: 'select', type: 'select', label: 'Lựa chọn', key: 'select_field' },
    { id: 'textarea', type: 'textarea', label: 'Văn bản dài', key: 'textarea_field' },
    
    // Contract specific fields
    { id: 'party_a', type: 'text', label: 'Bên A - Tên', key: 'partyA.name' },
    { id: 'party_b', type: 'text', label: 'Bên B - Tên', key: 'partyB.name' },
    { id: 'contract_date', type: 'date', label: 'Ngày ký hợp đồng', key: 'contract.date' },
    { id: 'contract_value', type: 'currency', label: 'Giá trị hợp đồng', key: 'contract.value' },
    { id: 'contract_duration', type: 'text', label: 'Thời hạn hợp đồng', key: 'contract.duration' },
    
    // Special blocks
    { id: 'clause', type: 'clause', label: 'Điều khoản', key: 'clause' },
    { id: 'signature', type: 'signature', label: 'Chữ ký', key: 'signature' },
    { id: 'table', type: 'table', label: 'Bảng', key: 'table' },
    { id: 'image', type: 'image', label: 'Hình ảnh', key: 'image' },
];

export const TemplateBuilder = ({ 
    value = [], 
    onChange,
    onSave 
}: { 
    value?: FieldType[];
    onChange?: (fields: FieldType[]) => void;
    onSave?: (fields: FieldType[]) => void;
}) => {
    const [canvas, setCanvas] = useState<FieldType[]>(value);
    const [selectedField, setSelectedField] = useState<FieldType | null>(null);
    const [previewMode, setPreviewMode] = useState(false);

    // Tiptap editor for rich text fields
    const editor = useEditor({
        extensions: [StarterKit, VariableToken, ClauseBlock, SignatureBlock, LayoutContainer],
        content: '<p>Bắt đầu thiết kế template hợp đồng...</p>',
        onUpdate: ({ editor }) => {
            // Handle editor content changes
        },
    });

    const onDragEnd = useCallback((result: DropResult) => {
        const { destination, source, draggableId } = result;
        
        if (!destination) return;

        // From toolbox to canvas
        if (destination.droppableId === 'canvas' && source.droppableId === 'toolbox') {
            const fieldTemplate = FIELD_LIBRARY.find(f => f.id === draggableId);
            if (!fieldTemplate) return;
            
            const newField: FieldType = {
                ...fieldTemplate,
                id: `${fieldTemplate.id}-${Date.now()}`,
                position: { x: destination.index, y: 0 }
            };
            
            const newCanvas = Array.from(canvas);
            newCanvas.splice(destination.index, 0, newField);
            setCanvas(newCanvas);
            onChange?.(newCanvas);
        }

        // Reorder within canvas
        if (destination.droppableId === 'canvas' && source.droppableId === 'canvas') {
            const newCanvas = Array.from(canvas);
            const [removed] = newCanvas.splice(source.index, 1);
            newCanvas.splice(destination.index, 0, removed);
            setCanvas(newCanvas);
            onChange?.(newCanvas);
        }
    }, [canvas, onChange]);

    const updateField = useCallback((fieldId: string, updates: Partial<FieldType>) => {
        const newCanvas = canvas.map(field => 
            field.id === fieldId ? { ...field, ...updates } : field
        );
        setCanvas(newCanvas);
        onChange?.(newCanvas);
    }, [canvas, onChange]);

    const removeField = useCallback((fieldId: string) => {
        const newCanvas = canvas.filter(field => field.id !== fieldId);
        setCanvas(newCanvas);
        onChange?.(newCanvas);
        if (selectedField?.id === fieldId) {
            setSelectedField(null);
        }
    }, [canvas, onChange, selectedField]);

    const handleSave = useCallback(() => {
        onSave?.(canvas);
    }, [canvas, onSave]);

    // Generate preview HTML
    const previewHtml = useMemo(() => {
        return `
            <div class="contract-template">
                <div class="contract-header">
                    <h1>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h1>
                    <h2>Độc lập - Tự do - Hạnh phúc</h2>
                    <h3>HỢP ĐỒNG DỊCH VỤ</h3>
                </div>
                <div class="contract-body">
                    ${canvas.map(field => {
                        switch (field.type) {
                            case 'text':
                            case 'date':
                            case 'currency':
                                return `<div class="field ${field.type}">
                                    <label>${field.label}:</label>
                                    <span class="placeholder">{{${field.key || field.id}}}</span>
                                </div>`;
                            case 'clause':
                                return `<div class="clause-block">
                                    <h4>${field.label}</h4>
                                    <div class="clause-content">{{${field.key || field.id}}}</div>
                                </div>`;
                            case 'signature':
                                return `<div class="signature-block">
                                    <div class="signature-line"></div>
                                    <span>${field.label}</span>
                                </div>`;
                            default:
                                return `<div class="field">${field.label}</div>`;
                        }
                    }).join('')}
                </div>
            </div>
        `;
    }, [canvas]);

    return (
        <div className={styles.templateBuilder}>
            {/* Top Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                    <button 
                        className={`${styles.toolbarButton} ${!previewMode ? styles.active : ''}`}
                        onClick={() => setPreviewMode(false)}
                    >
                        🎨 Thiết kế
                    </button>
                    <button 
                        className={`${styles.toolbarButton} ${previewMode ? styles.active : ''}`}
                        onClick={() => setPreviewMode(true)}
                    >
                        👁️ Xem trước
                    </button>
                </div>
                <div className={styles.toolbarRight}>
                    <button className={styles.saveButton} onClick={handleSave}>
                        💾 Lưu Template
                    </button>
                </div>
            </div>

            <div className={styles.mainContent}>
                {/* Left Sidebar - Field Library */}
                <div className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <h3>📚 Thư viện Fields</h3>
                        <p>Kéo thả vào canvas để thêm</p>
                    </div>
                    
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="toolbox" isDropDisabled>
                            {(provided) => (
                                <div 
                                    ref={provided.innerRef} 
                                    {...provided.droppableProps}
                                    className={styles.fieldLibrary}
                                >
                                    {FIELD_LIBRARY.map((field, index) => (
                                        <Draggable 
                                            key={field.id} 
                                            draggableId={field.id} 
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`${styles.fieldItem} ${snapshot.isDragging ? styles.dragging : ''}`}
                                                >
                                                    <div className={styles.fieldIcon}>
                                                        {field.type === 'text' && '📝'}
                                                        {field.type === 'date' && '📅'}
                                                        {field.type === 'currency' && '💰'}
                                                        {field.type === 'select' && '📋'}
                                                        {field.type === 'textarea' && '📄'}
                                                        {field.type === 'clause' && '📜'}
                                                        {field.type === 'signature' && '✍️'}
                                                        {field.type === 'table' && '📊'}
                                                        {field.type === 'image' && '🖼️'}
                                                    </div>
                                                    <div className={styles.fieldInfo}>
                                                        <div className={styles.fieldLabel}>{field.label}</div>
                                                        <div className={styles.fieldType}>{field.type}</div>
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

                {/* Center Canvas */}
                <div className={styles.canvas}>
                    {previewMode ? (
                        <div className={styles.previewMode}>
                            <div className={styles.previewHeader}>
                                <h3>👁️ Xem trước Template</h3>
                                <button 
                                    className={styles.exportButton}
                                    onClick={() => {
                                        const blob = new Blob([previewHtml], { type: 'text/html' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = 'template-preview.html';
                                        a.click();
                                    }}
                                >
                                    📥 Xuất HTML
                                </button>
                            </div>
                            <div 
                                className={styles.previewContent}
                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                            />
                        </div>
                    ) : (
                        <div className={styles.canvasArea}>
                            <div className={styles.canvasHeader}>
                                <h3>🎨 Canvas Thiết kế</h3>
                                <p>Kéo thả fields từ sidebar vào đây</p>
                            </div>
                            
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="canvas">
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`${styles.canvasDropZone} ${snapshot.isDraggingOver ? styles.dragOver : ''}`}
                                        >
                                            {canvas.length === 0 && (
                                                <div className={styles.emptyCanvas}>
                                                    <div className={styles.emptyIcon}>📄</div>
                                                    <h4>Canvas trống</h4>
                                                    <p>Kéo thả fields từ sidebar để bắt đầu thiết kế template</p>
                                                </div>
                                            )}
                                            
                                            {canvas.map((field, index) => (
                                                <Draggable 
                                                    key={field.id} 
                                                    draggableId={field.id} 
                                                    index={index}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`${styles.canvasField} ${snapshot.isDragging ? styles.dragging : ''} ${selectedField?.id === field.id ? styles.selected : ''}`}
                                                            onClick={() => setSelectedField(field)}
                                                        >
                                                            <div className={styles.fieldHeader}>
                                                                <div className={styles.fieldIcon}>
                                                                    {field.type === 'text' && '📝'}
                                                                    {field.type === 'date' && '📅'}
                                                                    {field.type === 'currency' && '💰'}
                                                                    {field.type === 'select' && '📋'}
                                                                    {field.type === 'textarea' && '📄'}
                                                                    {field.type === 'clause' && '📜'}
                                                                    {field.type === 'signature' && '✍️'}
                                                                    {field.type === 'table' && '📊'}
                                                                    {field.type === 'image' && '🖼️'}
                                                                </div>
                                                                <div className={styles.fieldLabel}>{field.label}</div>
                                                                <div className={styles.fieldActions}>
                                                                    <button 
                                                                        className={styles.fieldAction}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            removeField(field.id);
                                                                        }}
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className={styles.fieldPreview}>
                                                                {field.type === 'text' && (
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}`}
                                                                        className={styles.fieldInput}
                                                                    />
                                                                )}
                                                                {field.type === 'date' && (
                                                                    <input 
                                                                        type="date" 
                                                                        className={styles.fieldInput}
                                                                    />
                                                                )}
                                                                {field.type === 'currency' && (
                                                                    <input 
                                                                        type="number" 
                                                                        placeholder="0" 
                                                                        className={styles.fieldInput}
                                                                    />
                                                                )}
                                                                {field.type === 'clause' && (
                                                                    <textarea 
                                                                        placeholder="Nội dung điều khoản..."
                                                                        className={styles.fieldTextarea}
                                                                    />
                                                                )}
                                                                {field.type === 'signature' && (
                                                                    <div className={styles.signaturePreview}>
                                                                        <div className={styles.signatureLine}></div>
                                                                        <span>Chữ ký</span>
                                                                    </div>
                                                                )}
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
                    )}
                </div>

                {/* Right Sidebar - Properties Panel */}
                <div className={styles.propertiesPanel}>
                    <div className={styles.propertiesHeader}>
                        <h3>⚙️ Thuộc tính</h3>
                        {selectedField && (
                            <span className={styles.selectedFieldName}>{selectedField.label}</span>
                        )}
                    </div>
                    
                    {selectedField ? (
                        <div className={styles.propertiesContent}>
                            <div className={styles.propertyGroup}>
                                <label>Nhãn (Label)</label>
                                <input
                                    type="text"
                                    value={selectedField.label}
                                    onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                                    className={styles.propertyInput}
                                />
                            </div>
                            
                            <div className={styles.propertyGroup}>
                                <label>Khóa (Key)</label>
                                <input
                                    type="text"
                                    value={selectedField.key || ''}
                                    onChange={(e) => updateField(selectedField.id, { key: e.target.value })}
                                    placeholder="partyA.name"
                                    className={styles.propertyInput}
                                />
                            </div>
                            
                            <div className={styles.propertyGroup}>
                                <label>Placeholder</label>
                                <input
                                    type="text"
                                    value={selectedField.placeholder || ''}
                                    onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                                    className={styles.propertyInput}
                                />
                            </div>
                            
                            <div className={styles.propertyGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={selectedField.required || false}
                                        onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                                    />
                                    Bắt buộc
                                </label>
                            </div>
                            
                            {selectedField.type === 'currency' && (
                                <div className={styles.propertyGroup}>
                                    <label>Định dạng tiền tệ</label>
                                    <select 
                                        className={styles.propertySelect}
                                        value={selectedField.validation?.format || 'VND'}
                                        onChange={(e) => updateField(selectedField.id, { 
                                            validation: { ...selectedField.validation, format: e.target.value }
                                        })}
                                    >
                                        <option value="VND">VND (Việt Nam)</option>
                                        <option value="USD">USD (Đô la Mỹ)</option>
                                        <option value="EUR">EUR (Euro)</option>
                                    </select>
                                </div>
                            )}
                            
                            {selectedField.type === 'date' && (
                                <div className={styles.propertyGroup}>
                                    <label>Định dạng ngày</label>
                                    <select 
                                        className={styles.propertySelect}
                                        value={selectedField.validation?.format || 'DD/MM/YYYY'}
                                        onChange={(e) => updateField(selectedField.id, { 
                                            validation: { ...selectedField.validation, format: e.target.value }
                                        })}
                                    >
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={styles.noSelection}>
                            <div className={styles.noSelectionIcon}>👆</div>
                            <p>Chọn một field để chỉnh sửa thuộc tính</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TemplateBuilder;
