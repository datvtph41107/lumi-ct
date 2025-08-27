import React, { useCallback } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useUIModeStore } from '../store/uiModeStore';
import { FileText, Trash2 } from 'lucide-react';
import './PageBreakView.scss';

export const PageBreakView: React.FC<NodeViewProps> = ({ node, updateAttributes, editor }) => {
  const { mode } = useUIModeStore();

  const breakType = node.attrs.type || 'page';
  const title = node.attrs.title;

  const handleDelete = useCallback(() => {
    if (editor) {
      const { selection } = editor.state;
      const tr = editor.state.tr.delete(selection.from, selection.to);
      editor.view.dispatch(tr);
    }
  }, [editor]);

  const handleEdit = useCallback(() => {
    if (mode === 'edit') {
      console.log('Edit page break properties');
    }
  }, [mode]);

  const renderEditMode = () => {
    return (
      <div className="page-break__edit" onClick={handleEdit}>
        <div className="page-break__content">
          <FileText size={20} />
          <span className="page-break__label">
            {breakType === 'page' ? 'Ngắt trang' : 'Ngắt phần'}
          </span>
          {title && <span className="page-break__title">({title})</span>}
        </div>
        
        <div className="page-break__actions">
          <button 
            className="page-break__action-btn page-break__action-btn--delete"
            onClick={handleDelete}
            type="button"
            title="Xóa ngắt trang"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  const renderFillMode = () => {
    return (
      <div className="page-break__fill">
        <div className="page-break__line"></div>
        <span className="page-break__label">
          {breakType === 'page' ? '--- Ngắt trang ---' : '--- Ngắt phần ---'}
        </span>
        <div className="page-break__line"></div>
      </div>
    );
  };

  const renderPreviewMode = () => {
    return (
      <div className="page-break__preview">
        <div className="page-break__line"></div>
        <span className="page-break__label">
          {breakType === 'page' ? '--- Ngắt trang ---' : '--- Ngắt phần ---'}
        </span>
        <div className="page-break__line"></div>
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

  return (
    <NodeViewWrapper className="page-break">
      {renderContent()}
    </NodeViewWrapper>
  );
};