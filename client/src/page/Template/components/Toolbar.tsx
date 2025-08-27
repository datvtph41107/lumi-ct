import React from 'react';
import { Editor } from '@tiptap/core';
import { 
  Edit, 
  FileText, 
  Eye, 
  Save, 
  Download, 
  Undo, 
  Redo,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered
} from 'lucide-react';
import { UIMode } from '../store/uiModeStore';
import './Toolbar.scss';

interface ToolbarProps {
  editor: Editor;
  mode: UIMode;
  onModeChange: (mode: UIMode) => void;
  onSave: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  editor,
  mode,
  onModeChange,
  onSave,
}) => {
  const handleExport = () => {
    const { generateResolvedDocument } = require('../store/templateStore');
    const { docJSON, html } = generateResolvedDocument();
    console.log('Generated document:', { docJSON, html });
    // In a real app, this would trigger PDF export
  };

  const handleUndo = () => {
    editor.commands.undo();
  };

  const handleRedo = () => {
    editor.commands.redo();
  };

  const toggleBold = () => {
    editor.commands.toggleBold();
  };

  const toggleItalic = () => {
    editor.commands.toggleItalic();
  };

  const toggleUnderline = () => {
    editor.commands.toggleUnderline();
  };

  const setTextAlign = (align: 'left' | 'center' | 'right') => {
    editor.commands.setTextAlign(align);
  };

  const toggleBulletList = () => {
    editor.commands.toggleBulletList();
  };

  const toggleOrderedList = () => {
    editor.commands.toggleOrderedList();
  };

  return (
    <div className="template-toolbar">
      <div className="template-toolbar__left">
        <div className="template-toolbar__mode-switcher">
          <button
            className={`template-toolbar__mode-btn ${mode === 'edit' ? 'active' : ''}`}
            onClick={() => onModeChange('edit')}
            type="button"
            title="Edit Mode"
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            className={`template-toolbar__mode-btn ${mode === 'fill' ? 'active' : ''}`}
            onClick={() => onModeChange('fill')}
            type="button"
            title="Fill Mode"
          >
            <FileText size={16} />
            Fill
          </button>
          <button
            className={`template-toolbar__mode-btn ${mode === 'preview' ? 'active' : ''}`}
            onClick={() => onModeChange('preview')}
            type="button"
            title="Preview Mode"
          >
            <Eye size={16} />
            Preview
          </button>
        </div>
      </div>

      <div className="template-toolbar__center">
        {mode === 'edit' && (
          <div className="template-toolbar__formatting">
            <button
              className={`template-toolbar__btn ${editor.isActive('bold') ? 'active' : ''}`}
              onClick={toggleBold}
              type="button"
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button
              className={`template-toolbar__btn ${editor.isActive('italic') ? 'active' : ''}`}
              onClick={toggleItalic}
              type="button"
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <button
              className={`template-toolbar__btn ${editor.isActive('underline') ? 'active' : ''}`}
              onClick={toggleUnderline}
              type="button"
              title="Underline"
            >
              <Underline size={16} />
            </button>

            <div className="template-toolbar__separator"></div>

            <button
              className={`template-toolbar__btn ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
              onClick={() => setTextAlign('left')}
              type="button"
              title="Align Left"
            >
              <AlignLeft size={16} />
            </button>
            <button
              className={`template-toolbar__btn ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
              onClick={() => setTextAlign('center')}
              type="button"
              title="Align Center"
            >
              <AlignCenter size={16} />
            </button>
            <button
              className={`template-toolbar__btn ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
              onClick={() => setTextAlign('right')}
              type="button"
              title="Align Right"
            >
              <AlignRight size={16} />
            </button>

            <div className="template-toolbar__separator"></div>

            <button
              className={`template-toolbar__btn ${editor.isActive('bulletList') ? 'active' : ''}`}
              onClick={toggleBulletList}
              type="button"
              title="Bullet List"
            >
              <List size={16} />
            </button>
            <button
              className={`template-toolbar__btn ${editor.isActive('orderedList') ? 'active' : ''}`}
              onClick={toggleOrderedList}
              type="button"
              title="Numbered List"
            >
              <ListOrdered size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="template-toolbar__right">
        <div className="template-toolbar__actions">
          <button
            className="template-toolbar__btn"
            onClick={handleUndo}
            type="button"
            title="Undo"
            disabled={!editor.can().undo()}
          >
            <Undo size={16} />
          </button>
          <button
            className="template-toolbar__btn"
            onClick={handleRedo}
            type="button"
            title="Redo"
            disabled={!editor.can().redo()}
          >
            <Redo size={16} />
          </button>

          <div className="template-toolbar__separator"></div>

          <button
            className="template-toolbar__btn template-toolbar__btn--primary"
            onClick={onSave}
            type="button"
            title="Save Template"
          >
            <Save size={16} />
            Save
          </button>
          
          {mode === 'preview' && (
            <button
              className="template-toolbar__btn template-toolbar__btn--secondary"
              onClick={handleExport}
              type="button"
              title="Export PDF"
            >
              <Download size={16} />
              Export
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;