import React, { useCallback, useState } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { useUIModeStore } from '../store/uiModeStore';
import './ClauseBlockView.scss';

export const ClauseBlockView: React.FC<NodeViewProps> = ({ node, updateAttributes, editor }) => {
  const { mode } = useUIModeStore();
  const [isCollapsed, setIsCollapsed] = useState(node.attrs.collapsed || false);

  const handleToggleCollapse = useCallback(() => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    updateAttributes({ collapsed: newCollapsed });
  }, [isCollapsed, updateAttributes]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData('application/x-template-block', JSON.stringify({
      type: 'clauseBlock',
      attrs: node.attrs,
    }));
  }, [node.attrs]);

  const renderHeader = () => {
    const title = node.attrs.title || 'Điều khoản';
    const number = node.attrs.number;

    return (
      <div className="clause-block__header">
        <div className="clause-block__drag-handle" draggable onDragStart={handleDragStart}>
          <GripVertical size={16} />
        </div>
        
        <button 
          className="clause-block__collapse-btn"
          onClick={handleToggleCollapse}
          type="button"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>
        
        <div className="clause-block__title">
          {number && <span className="clause-block__number">Điều {number}.</span>}
          <span className="clause-block__title-text">{title}</span>
        </div>
        
        {mode === 'edit' && (
          <div className="clause-block__actions">
            <button 
              className="clause-block__action-btn"
              onClick={() => console.log('Edit clause properties')}
              type="button"
            >
              ⚙️
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (isCollapsed) {
      return null;
    }

    return (
      <div className="clause-block__content">
        {/* The content will be rendered by Tiptap */}
      </div>
    );
  };

  return (
    <NodeViewWrapper className="clause-block">
      {renderHeader()}
      {renderContent()}
    </NodeViewWrapper>
  );
};