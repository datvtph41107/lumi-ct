import React, { useState, useEffect } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { 
  Eye, 
  EyeOff, 
  Settings, 
  Plus, 
  Minus,
  Code,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useUIModeStore } from '../store/uiModeStore';
import { useConditionalStore, ConditionRule } from '../store/conditionalStore';
import { useFieldStore } from '../store/fieldStore';
import './ConditionalBlockView.scss';

interface ConditionalBlockViewProps {
  node: any;
  updateAttributes: (attrs: any) => void;
  editor: any;
}

export const ConditionalBlockView: React.FC<ConditionalBlockViewProps> = ({
  node,
  updateAttributes,
  editor,
}) => {
  const { mode } = useUIModeStore();
  const { fields } = useFieldStore();
  const { 
    addConditionalBlock, 
    updateConditionalBlock, 
    addCondition, 
    updateCondition, 
    removeCondition,
    evaluateConditions 
  } = useConditionalStore();
  
  const [showSettings, setShowSettings] = useState(false);
  const [showConditionBuilder, setShowConditionBuilder] = useState(false);

  const {
    type = 'if',
    conditions = [],
    description = '',
    blockId,
    visible = true,
  } = node.attrs;

  // Initialize block in store if not exists
  useEffect(() => {
    if (!blockId) {
      const newBlockId = addConditionalBlock({
        type,
        conditions,
        visible,
        children: [],
      });
      updateAttributes({ blockId: newBlockId });
    }
  }, [blockId, addConditionalBlock, updateAttributes, type, conditions, visible]);

  const handleAddCondition = () => {
    const newCondition: Omit<ConditionRule, 'id'> = {
      fieldKey: '',
      operator: 'equals',
      value: '',
    };
    
    if (blockId) {
      addCondition(blockId, newCondition);
    }
    setShowConditionBuilder(true);
  };

  const handleUpdateCondition = (conditionId: string, updates: Partial<ConditionRule>) => {
    if (blockId) {
      updateCondition(blockId, conditionId, updates);
    }
  };

  const handleRemoveCondition = (conditionId: string) => {
    if (blockId) {
      removeCondition(blockId, conditionId);
    }
  };

  const handleToggleVisibility = () => {
    updateAttributes({ visible: !visible });
    if (blockId) {
      updateConditionalBlock(blockId, { visible: !visible });
    }
  };

  const getOperatorLabel = (operator: string) => {
    const labels: Record<string, string> = {
      equals: 'bằng',
      not_equals: 'không bằng',
      contains: 'chứa',
      not_contains: 'không chứa',
      greater_than: 'lớn hơn',
      less_than: 'nhỏ hơn',
      is_empty: 'rỗng',
      is_not_empty: 'không rỗng',
    };
    return labels[operator] || operator;
  };

  const renderConditionBuilder = () => {
    if (!showConditionBuilder || mode !== 'edit') return null;

    return (
      <div className="conditional-builder">
        <div className="conditional-builder__header">
          <h4>Thêm điều kiện</h4>
          <button
            className="conditional-builder__close"
            onClick={() => setShowConditionBuilder(false)}
          >
            ×
          </button>
        </div>
        <div className="conditional-builder__content">
          <ConditionBuilder
            fields={fields}
            onAddCondition={handleAddCondition}
            onCancel={() => setShowConditionBuilder(false)}
          />
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    if (!showSettings || mode !== 'edit') return null;

    return (
      <div className="conditional-settings">
        <div className="conditional-settings__section">
          <label className="conditional-settings__label">Loại điều kiện:</label>
          <select
            value={type}
            onChange={(e) => updateAttributes({ type: e.target.value })}
            className="conditional-settings__select"
          >
            <option value="if">Nếu (If)</option>
            <option value="elseif">Nếu không thì (Else If)</option>
            <option value="else">Ngược lại (Else)</option>
          </select>
        </div>

        <div className="conditional-settings__section">
          <label className="conditional-settings__label">Mô tả:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => updateAttributes({ description: e.target.value })}
            className="conditional-settings__input"
            placeholder="Mô tả điều kiện..."
          />
        </div>

        <div className="conditional-settings__section">
          <label className="conditional-settings__label">Điều kiện:</label>
          <div className="conditional-settings__conditions">
            {conditions.map((condition: ConditionRule, index: number) => (
              <div key={condition.id || index} className="conditional-settings__condition">
                <div className="conditional-settings__condition-row">
                  <select
                    value={condition.fieldKey}
                    onChange={(e) => handleUpdateCondition(condition.id, { fieldKey: e.target.value })}
                    className="conditional-settings__field-select"
                  >
                    <option value="">Chọn trường...</option>
                    {fields.map((field) => (
                      <option key={field.key} value={field.key}>
                        {field.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={condition.operator}
                    onChange={(e) => handleUpdateCondition(condition.id, { operator: e.target.value as any })}
                    className="conditional-settings__operator-select"
                  >
                    <option value="equals">bằng</option>
                    <option value="not_equals">không bằng</option>
                    <option value="contains">chứa</option>
                    <option value="not_contains">không chứa</option>
                    <option value="greater_than">lớn hơn</option>
                    <option value="less_than">nhỏ hơn</option>
                    <option value="is_empty">rỗng</option>
                    <option value="is_not_empty">không rỗng</option>
                  </select>

                  {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
                    <input
                      type="text"
                      value={condition.value || ''}
                      onChange={(e) => handleUpdateCondition(condition.id, { value: e.target.value })}
                      className="conditional-settings__value-input"
                      placeholder="Giá trị..."
                    />
                  )}

                  <button
                    className="conditional-settings__remove-btn"
                    onClick={() => handleRemoveCondition(condition.id)}
                    title="Xóa điều kiện"
                  >
                    <Minus size={14} />
                  </button>
                </div>

                {index < conditions.length - 1 && (
                  <div className="conditional-settings__logical-operator">
                    <select
                      value={condition.logicalOperator || 'and'}
                      onChange={(e) => handleUpdateCondition(condition.id, { logicalOperator: e.target.value as 'and' | 'or' })}
                      className="conditional-settings__logical-select"
                    >
                      <option value="and">VÀ (AND)</option>
                      <option value="or">HOẶC (OR)</option>
                    </select>
                  </div>
                )}
              </div>
            ))}

            <button
              className="conditional-settings__add-btn"
              onClick={handleAddCondition}
            >
              <Plus size={14} />
              Thêm điều kiện
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (mode) {
      case 'edit':
        return (
          <div className="conditional-block-edit">
            <div className="conditional-block-header">
              <div className="conditional-block-info">
                <span className="conditional-block-type">
                  {type === 'if' ? 'Nếu' : type === 'elseif' ? 'Nếu không thì' : 'Ngược lại'}
                </span>
                {description && (
                  <span className="conditional-block-description">{description}</span>
                )}
              </div>
              <div className="conditional-block-actions">
                <button
                  className="conditional-block-btn"
                  onClick={handleToggleVisibility}
                  title={visible ? 'Ẩn block' : 'Hiện block'}
                >
                  {visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  className="conditional-block-btn"
                  onClick={() => setShowSettings(!showSettings)}
                  title="Cài đặt điều kiện"
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>

            {renderSettings()}
            {renderConditionBuilder()}

            <div className={`conditional-block-content ${!visible ? 'hidden' : ''}`}>
              <NodeViewContent />
            </div>

            {conditions.length > 0 && (
              <div className="conditional-block-summary">
                <div className="conditional-block-summary__title">
                  <Code size={14} />
                  Điều kiện:
                </div>
                <div className="conditional-block-summary__conditions">
                  {conditions.map((condition: ConditionRule, index: number) => (
                    <span key={condition.id || index} className="conditional-block-summary__condition">
                      {fields.find(f => f.key === condition.fieldKey)?.label || condition.fieldKey} {getOperatorLabel(condition.operator)} {condition.value}
                      {index < conditions.length - 1 && (
                        <span className="conditional-block-summary__operator">
                          {condition.logicalOperator === 'or' ? ' HOẶC ' : ' VÀ '}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'fill':
        return (
          <div className="conditional-block-fill">
            <div className="conditional-block-header">
              <span className="conditional-block-type">
                {type === 'if' ? 'Nếu' : type === 'elseif' ? 'Nếu không thì' : 'Ngược lại'}
              </span>
              {description && (
                <span className="conditional-block-description">{description}</span>
              )}
            </div>
            <div className={`conditional-block-content ${!visible ? 'hidden' : ''}`}>
              <NodeViewContent />
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="conditional-block-preview">
            <div className="conditional-block-header">
              <span className="conditional-block-type">
                {type === 'if' ? 'Nếu' : type === 'elseif' ? 'Nếu không thì' : 'Ngược lại'}
              </span>
              {description && (
                <span className="conditional-block-description">{description}</span>
              )}
            </div>
            <div className={`conditional-block-content ${!visible ? 'hidden' : ''}`}>
              <NodeViewContent />
            </div>
          </div>
        );

      default:
        return (
          <div className="conditional-block-content">
            <NodeViewContent />
          </div>
        );
    }
  };

  return (
    <NodeViewWrapper className="conditional-block">
      {renderContent()}
    </NodeViewWrapper>
  );
};

// Condition Builder Component
interface ConditionBuilderProps {
  fields: any[];
  onAddCondition: () => void;
  onCancel: () => void;
}

const ConditionBuilder: React.FC<ConditionBuilderProps> = ({
  fields,
  onAddCondition,
  onCancel,
}) => {
  const [fieldKey, setFieldKey] = useState('');
  const [operator, setOperator] = useState('equals');
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (fieldKey) {
      onAddCondition();
      setFieldKey('');
      setOperator('equals');
      setValue('');
    }
  };

  return (
    <div className="condition-builder">
      <div className="condition-builder__row">
        <select
          value={fieldKey}
          onChange={(e) => setFieldKey(e.target.value)}
          className="condition-builder__field-select"
        >
          <option value="">Chọn trường...</option>
          {fields.map((field) => (
            <option key={field.key} value={field.key}>
              {field.label}
            </option>
          ))}
        </select>

        <select
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          className="condition-builder__operator-select"
        >
          <option value="equals">bằng</option>
          <option value="not_equals">không bằng</option>
          <option value="contains">chứa</option>
          <option value="not_contains">không chứa</option>
          <option value="greater_than">lớn hơn</option>
          <option value="less_than">nhỏ hơn</option>
          <option value="is_empty">rỗng</option>
          <option value="is_not_empty">không rỗng</option>
        </select>

        {!['is_empty', 'is_not_empty'].includes(operator) && (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="condition-builder__value-input"
            placeholder="Giá trị..."
          />
        )}
      </div>

      <div className="condition-builder__actions">
        <button
          className="condition-builder__btn condition-builder__btn--primary"
          onClick={handleSubmit}
          disabled={!fieldKey}
        >
          <CheckCircle size={14} />
          Thêm
        </button>
        <button
          className="condition-builder__btn condition-builder__btn--secondary"
          onClick={onCancel}
        >
          <XCircle size={14} />
          Hủy
        </button>
      </div>
    </div>
  );
};