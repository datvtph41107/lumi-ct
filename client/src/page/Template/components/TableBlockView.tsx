import React, { useState } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { 
  Plus, 
  Minus, 
  Columns, 
  Rows, 
  Merge, 
  Split, 
  Settings,
  Calculator,
  Hash
} from 'lucide-react';
import { useUIModeStore } from '../store/uiModeStore';
import { useTemplateStore } from '../store/templateStore';
import './TableBlockView.scss';

interface TableBlockViewProps {
  node: any;
  updateAttributes: (attrs: any) => void;
  editor: any;
}

export const TableBlockView: React.FC<TableBlockViewProps> = ({
  node,
  updateAttributes,
  editor,
}) => {
  const { mode } = useUIModeStore();
  const { contractData } = useTemplateStore();
  const [showToolbar, setShowToolbar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const {
    title = 'Bảng dữ liệu',
    headers = ['STT', 'Tên', 'Đơn vị', 'Số lượng', 'Đơn giá', 'Thành tiền'],
    rows = 3,
    cols = 6,
    autoNumbering = true,
    showTotal = false,
    totalRow = -1,
  } = node.attrs;

  const handleAddRow = () => {
    updateAttributes({ rows: rows + 1 });
  };

  const handleAddColumn = () => {
    updateAttributes({ cols: cols + 1 });
  };

  const handleDeleteRow = () => {
    if (rows > 1) {
      updateAttributes({ rows: rows - 1 });
    }
  };

  const handleDeleteColumn = () => {
    if (cols > 1) {
      updateAttributes({ cols: cols - 1 });
    }
  };

  const handleToggleAutoNumbering = () => {
    updateAttributes({ autoNumbering: !autoNumbering });
  };

  const handleToggleShowTotal = () => {
    updateAttributes({ showTotal: !showTotal });
  };

  const handleMergeCells = () => {
    // Implementation for merging selected cells
    console.log('Merge cells');
  };

  const handleSplitCell = () => {
    // Implementation for splitting merged cell
    console.log('Split cell');
  };

  const handleUpdateHeaders = (newHeaders: string[]) => {
    updateAttributes({ headers: newHeaders });
  };

  const renderToolbar = () => {
    if (mode !== 'edit') return null;

    return (
      <div className="table-block-toolbar">
        <div className="table-block-toolbar__left">
          <button
            className="table-block-toolbar__btn"
            onClick={handleAddRow}
            title="Thêm dòng"
          >
            <Rows size={16} />
          </button>
          <button
            className="table-block-toolbar__btn"
            onClick={handleAddColumn}
            title="Thêm cột"
          >
            <Columns size={16} />
          </button>
          <button
            className="table-block-toolbar__btn"
            onClick={handleDeleteRow}
            title="Xóa dòng"
            disabled={rows <= 1}
          >
            <Minus size={16} />
          </button>
          <button
            className="table-block-toolbar__btn"
            onClick={handleDeleteColumn}
            title="Xóa cột"
            disabled={cols <= 1}
          >
            <Minus size={16} />
          </button>
        </div>

        <div className="table-block-toolbar__center">
          <button
            className={`table-block-toolbar__btn ${autoNumbering ? 'active' : ''}`}
            onClick={handleToggleAutoNumbering}
            title="Tự động đánh số"
          >
            <Hash size={16} />
          </button>
          <button
            className={`table-block-toolbar__btn ${showTotal ? 'active' : ''}`}
            onClick={handleToggleShowTotal}
            title="Hiển thị tổng"
          >
            <Calculator size={16} />
          </button>
        </div>

        <div className="table-block-toolbar__right">
          <button
            className="table-block-toolbar__btn"
            onClick={handleMergeCells}
            title="Gộp ô"
          >
            <Merge size={16} />
          </button>
          <button
            className="table-block-toolbar__btn"
            onClick={handleSplitCell}
            title="Tách ô"
          >
            <Split size={16} />
          </button>
          <button
            className="table-block-toolbar__btn"
            onClick={() => setShowSettings(!showSettings)}
            title="Cài đặt bảng"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    if (!showSettings || mode !== 'edit') return null;

    return (
      <div className="table-block-settings">
        <div className="table-block-settings__section">
          <label className="table-block-settings__label">Tiêu đề bảng:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => updateAttributes({ title: e.target.value })}
            className="table-block-settings__input"
          />
        </div>

        <div className="table-block-settings__section">
          <label className="table-block-settings__label">Tiêu đề cột:</label>
          <div className="table-block-settings__headers">
            {headers.map((header: string, index: number) => (
              <input
                key={index}
                type="text"
                value={header}
                onChange={(e) => {
                  const newHeaders = [...headers];
                  newHeaders[index] = e.target.value;
                  handleUpdateHeaders(newHeaders);
                }}
                className="table-block-settings__header-input"
                placeholder={`Cột ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="table-block-settings__section">
          <label className="table-block-settings__label">Kích thước:</label>
          <div className="table-block-settings__size">
            <div className="table-block-settings__size-item">
              <span>Dòng:</span>
              <input
                type="number"
                min="1"
                max="20"
                value={rows}
                onChange={(e) => updateAttributes({ rows: parseInt(e.target.value) })}
                className="table-block-settings__number-input"
              />
            </div>
            <div className="table-block-settings__size-item">
              <span>Cột:</span>
              <input
                type="number"
                min="1"
                max="10"
                value={cols}
                onChange={(e) => updateAttributes({ cols: parseInt(e.target.value) })}
                className="table-block-settings__number-input"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (mode) {
      case 'edit':
        return (
          <div className="table-block-edit">
            <div className="table-block-header">
              <h4 className="table-block-title">{title}</h4>
              <button
                className="table-block-toggle-btn"
                onClick={() => setShowToolbar(!showToolbar)}
                title="Hiển thị/ẩn toolbar"
              >
                <Settings size={16} />
              </button>
            </div>
            {renderToolbar()}
            {renderSettings()}
            <div className="table-block-content">
              <NodeViewContent />
            </div>
          </div>
        );

      case 'fill':
        return (
          <div className="table-block-fill">
            <h4 className="table-block-title">{title}</h4>
            <div className="table-block-content">
              <NodeViewContent />
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="table-block-preview">
            <h4 className="table-block-title">{title}</h4>
            <div className="table-block-content">
              <NodeViewContent />
            </div>
          </div>
        );

      default:
        return (
          <div className="table-block-content">
            <NodeViewContent />
          </div>
        );
    }
  };

  return (
    <NodeViewWrapper className="table-block">
      {renderContent()}
    </NodeViewWrapper>
  );
};