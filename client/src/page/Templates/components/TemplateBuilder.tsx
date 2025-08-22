import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

type Field = { id: string; type: string; label: string };

const initialFields: Field[] = [
    { id: 'f1', type: 'text', label: 'Tiêu đề' },
    { id: 'f2', type: 'date', label: 'Ngày hiệu lực' },
    { id: 'f3', type: 'currency', label: 'Số tiền hợp đồng' },
];

export const TemplateBuilder = () => {
    const [toolbox] = useState<Field[]>(initialFields);
    const [canvas, setCanvas] = useState<Field[]>([]);

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === 'canvas' && source.droppableId === 'toolbox') {
            const field = toolbox.find((f) => f.id === draggableId);
            if (!field) return;
            setCanvas((prev) => [...prev, { ...field, id: field.id + '-' + (prev.length + 1) }]);
        }
        if (destination.droppableId === 'canvas' && source.droppableId === 'canvas') {
            const updated = Array.from(canvas);
            const [removed] = updated.splice(source.index, 1);
            updated.splice(destination.index, 0, removed);
            setCanvas(updated);
        }
    };

    const preview = useMemo(() => {
        return canvas.map((f) => `${f.label}`).join(' | ');
    }, [canvas]);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', gap: 16, minHeight: 400 }}>
            {/* Fields toolbox */}
            <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Fields</div>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="toolbox" isDropDisabled>
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                {toolbox.map((f, idx) => (
                                    <Draggable draggableId={f.id} index={idx} key={f.id}>
                                        {(p) => (
                                            <div
                                                ref={p.innerRef}
                                                {...p.draggableProps}
                                                {...p.dragHandleProps}
                                                style={{
                                                    padding: 8,
                                                    marginBottom: 8,
                                                    border: '1px solid #ddd',
                                                    borderRadius: 6,
                                                    background: '#fafafa',
                                                    ...p.draggableProps.style,
                                                }}
                                            >
                                                {f.label}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>

                    {/* Canvas */}
                    <Droppable droppableId="canvas">
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                style={{ minHeight: 300, border: '1px dashed #cbd5e1', borderRadius: 8, padding: 12 }}
                            >
                                {canvas.length === 0 && (
                                    <div style={{ color: '#94a3b8' }}>Kéo thả trường từ trái vào đây</div>
                                )}
                                {canvas.map((f, idx) => (
                                    <Draggable draggableId={f.id} index={idx} key={f.id}>
                                        {(p) => (
                                            <div
                                                ref={p.innerRef}
                                                {...p.draggableProps}
                                                {...p.dragHandleProps}
                                                style={{
                                                    padding: 10,
                                                    marginBottom: 8,
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: 8,
                                                    background: 'white',
                                                    ...p.draggableProps.style,
                                                }}
                                            >
                                                {f.label}
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

            {/* Preview Pane */}
            <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Preview</div>
                <div style={{ color: '#475569' }}>{preview || 'Chưa có nội dung'}</div>
            </div>

            {/* Properties Panel */}
            <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Properties</div>
                <div style={{ color: '#64748b' }}>Chọn một block để chỉnh thuộc tính</div>
            </div>
        </div>
    );
};

export default TemplateBuilder;
