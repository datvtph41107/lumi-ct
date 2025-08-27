import React, { useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Link, ExternalLink, Edit3 } from 'lucide-react';
import { useUIModeStore } from '../store/uiModeStore';
import { useNumberingStore } from '../store/numberingStore';
import './CrossReferenceView.scss';

interface CrossReferenceViewProps {
  node: any;
  updateAttributes: (attrs: any) => void;
  editor: any;
}

export const CrossReferenceView: React.FC<CrossReferenceViewProps> = ({
  node,
  updateAttributes,
  editor,
}) => {
  const { mode } = useUIModeStore();
  const { getItemById, addCrossReference, getCrossReferencesByTarget } = useNumberingStore();
  const [showSelector, setShowSelector] = useState(false);

  const {
    targetId,
    targetType = 'clause',
    text = '',
    customText = '',
  } = node.attrs;

  const targetItem = targetId ? getItemById(targetId) : null;
  const references = targetId ? getCrossReferencesByTarget(targetId) : [];

  const handleTargetSelect = (selectedTargetId: string) => {
    updateAttributes({ targetId: selectedTargetId });
    setShowSelector(false);
    
    // Add cross reference to store
    addCrossReference({
      sourceId: node.attrs.id || `node_${Date.now()}`,
      targetId: selectedTargetId,
      text: text || customText,
      type: targetType,
    });
  };

  const handleTextChange = (newText: string) => {
    updateAttributes({ customText: newText });
  };

  const handleClick = () => {
    if (targetItem && mode === 'edit') {
      // Scroll to target item in editor
      const targetElement = document.querySelector(`[data-node-id="${targetId}"]`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetElement.classList.add('highlight-target');
        setTimeout(() => {
          targetElement.classList.remove('highlight-target');
        }, 2000);
      }
    }
  };

  const renderContent = () => {
    switch (mode) {
      case 'edit':
        return (
          <div className="cross-reference-edit">
            <button
              className="cross-reference-btn"
              onClick={() => setShowSelector(!showSelector)}
              title="Chọn mục tiêu tham chiếu"
            >
              <Link size={14} />
              {targetItem ? (
                <span className="cross-reference-text">
                  {customText || `Điều ${targetItem.number}`}
                </span>
              ) : (
                <span className="cross-reference-placeholder">
                  Chọn tham chiếu...
                </span>
              )}
            </button>
            
            {showSelector && (
              <div className="cross-reference-selector">
                <div className="cross-reference-selector__header">
                  <h4>Chọn mục tiêu tham chiếu</h4>
                  <button
                    className="cross-reference-selector__close"
                    onClick={() => setShowSelector(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="cross-reference-selector__content">
                  <TargetSelector
                    targetType={targetType}
                    onSelect={handleTargetSelect}
                    currentTargetId={targetId}
                  />
                </div>
                <div className="cross-reference-selector__footer">
                  <input
                    type="text"
                    placeholder="Văn bản tùy chỉnh (tùy chọn)"
                    value={customText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    className="cross-reference-selector__input"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'fill':
        return (
          <span className="cross-reference-fill">
            {targetItem ? (
              <span className="cross-reference-link">
                {customText || `Điều ${targetItem.number}`}
              </span>
            ) : (
              <span className="cross-reference-broken">
                [Tham chiếu không hợp lệ]
              </span>
            )}
          </span>
        );

      case 'preview':
        return (
          <span 
            className="cross-reference-preview"
            onClick={handleClick}
            title={targetItem ? `Nhấp để xem ${targetItem.title}` : 'Tham chiếu không hợp lệ'}
          >
            {targetItem ? (
              <>
                {customText || `Điều ${targetItem.number}`}
                <ExternalLink size={12} />
              </>
            ) : (
              <span className="cross-reference-broken">
                [Tham chiếu không hợp lệ]
              </span>
            )}
          </span>
        );

      default:
        return (
          <span className="cross-reference-default">
            {targetItem ? `Điều ${targetItem.number}` : '[Tham chiếu]'}
          </span>
        );
    }
  };

  return (
    <NodeViewWrapper className="cross-reference">
      {renderContent()}
    </NodeViewWrapper>
  );
};

// Target Selector Component
interface TargetSelectorProps {
  targetType: string;
  onSelect: (targetId: string) => void;
  currentTargetId?: string;
}

const TargetSelector: React.FC<TargetSelectorProps> = ({
  targetType,
  onSelect,
  currentTargetId,
}) => {
  const { numberedItems } = useNumberingStore();
  
  const filteredItems = numberedItems.filter(item => 
    item.type === targetType || 
    (targetType === 'clause' && (item.type === 'clause' || item.type === 'subclause'))
  );

  return (
    <div className="target-selector">
      {filteredItems.length === 0 ? (
        <div className="target-selector__empty">
          <p>Không có {targetType} nào để tham chiếu</p>
        </div>
      ) : (
        <div className="target-selector__list">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              className={`target-selector__item ${item.id === currentTargetId ? 'selected' : ''}`}
              onClick={() => onSelect(item.id)}
            >
              <div className="target-selector__item-number">{item.number}</div>
              <div className="target-selector__item-title">{item.title}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};