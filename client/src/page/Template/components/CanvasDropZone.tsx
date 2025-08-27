import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Editor } from '@tiptap/core';
import { EditorContent } from '@tiptap/react';
import { useUIModeStore } from '../store/uiModeStore';
import './CanvasDropZone.scss';

interface CanvasDropZoneProps {
  editor: Editor;
}

const CanvasDropZone: React.FC<CanvasDropZoneProps> = ({ editor }) => {
  const { mode } = useUIModeStore();
  const [isDragOver, setIsDragOver] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-drop-zone',
  });

  // Update drag over state
  React.useEffect(() => {
    setIsDragOver(isOver);
  }, [isOver]);

  return (
    <div 
      ref={setNodeRef}
      className={`canvas-drop-zone ${isDragOver ? 'drag-over' : ''}`}
    >
      <div className="canvas-container">
        <EditorContent editor={editor} />
        
        {isDragOver && (
          <div className="canvas-drop-zone__overlay">
            <div className="canvas-drop-zone__drop-indicator">
              <div className="canvas-drop-zone__drop-icon">📄</div>
              <div className="canvas-drop-zone__drop-text">
                Thả vào đây để thêm block
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasDropZone;