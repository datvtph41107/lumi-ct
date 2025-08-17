import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faSave, 
  faPrint, 
  faFilePdf, 
  faFileWord,
  faUndo,
  faRedo,
  faBold,
  faItalic,
  faUnderline,
  faListUl,
  faListOl,
  faTable,
  faLink,
  faImage,
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify
} from '@fortawesome/free-solid-svg-icons';

import './EditorHeader.scss';

interface EditorHeaderProps {
  onToggleSidebar: () => void;
  onSave: () => void;
  onPrint: () => void;
  onExportPDF: () => void;
  onExportWord: () => void;
  isSidebarOpen: boolean;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  onToggleSidebar,
  onSave,
  onPrint,
  onExportPDF,
  onExportWord,
  isSidebarOpen
}) => {
  return (
    <div className="editor-header">
      <div className="editor-header-left">
        <button
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          title={isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        
        <div className="editor-title">
          <h2>Contract Editor</h2>
        </div>
      </div>

      <div className="editor-header-center">
        <div className="formatting-toolbar">
          <div className="toolbar-group">
            <button className="toolbar-btn" title="Bold">
              <FontAwesomeIcon icon={faBold} />
            </button>
            <button className="toolbar-btn" title="Italic">
              <FontAwesomeIcon icon={faItalic} />
            </button>
            <button className="toolbar-btn" title="Underline">
              <FontAwesomeIcon icon={faUnderline} />
            </button>
          </div>

          <div className="toolbar-group">
            <button className="toolbar-btn" title="Bullet List">
              <FontAwesomeIcon icon={faListUl} />
            </button>
            <button className="toolbar-btn" title="Numbered List">
              <FontAwesomeIcon icon={faListOl} />
            </button>
            <button className="toolbar-btn" title="Table">
              <FontAwesomeIcon icon={faTable} />
            </button>
          </div>

          <div className="toolbar-group">
            <button className="toolbar-btn" title="Link">
              <FontAwesomeIcon icon={faLink} />
            </button>
            <button className="toolbar-btn" title="Image">
              <FontAwesomeIcon icon={faImage} />
            </button>
          </div>

          <div className="toolbar-group">
            <button className="toolbar-btn" title="Align Left">
              <FontAwesomeIcon icon={faAlignLeft} />
            </button>
            <button className="toolbar-btn" title="Align Center">
              <FontAwesomeIcon icon={faAlignCenter} />
            </button>
            <button className="toolbar-btn" title="Align Right">
              <FontAwesomeIcon icon={faAlignRight} />
            </button>
            <button className="toolbar-btn" title="Align Justify">
              <FontAwesomeIcon icon={faAlignJustify} />
            </button>
          </div>

          <div className="toolbar-group">
            <button className="toolbar-btn" title="Undo">
              <FontAwesomeIcon icon={faUndo} />
            </button>
            <button className="toolbar-btn" title="Redo">
              <FontAwesomeIcon icon={faRedo} />
            </button>
          </div>
        </div>
      </div>

      <div className="editor-header-right">
        <button
          className="action-btn save-btn"
          onClick={onSave}
          title="Save Contract"
        >
          <FontAwesomeIcon icon={faSave} />
          <span>Save</span>
        </button>

        <div className="export-actions">
          <button
            className="action-btn print-btn"
            onClick={onPrint}
            title="Print Contract"
          >
            <FontAwesomeIcon icon={faPrint} />
          </button>
          
          <button
            className="action-btn pdf-btn"
            onClick={onExportPDF}
            title="Export as PDF"
          >
            <FontAwesomeIcon icon={faFilePdf} />
          </button>
          
          <button
            className="action-btn word-btn"
            onClick={onExportWord}
            title="Export as Word"
          >
            <FontAwesomeIcon icon={faFileWord} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorHeader;