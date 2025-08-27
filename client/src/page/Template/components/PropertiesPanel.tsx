import React from 'react';
import { Editor } from '@tiptap/core';
import { FieldDef } from '../store/fieldStore';
import './PropertiesPanel.scss';

interface PropertiesPanelProps {
  selectedNode: any;
  editor: Editor;
  fields: FieldDef[];
  onUpdateField: (key: string, updates: Partial<FieldDef>) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  editor,
  fields,
  onUpdateField,
}) => {
  if (!selectedNode) {
    return (
      <div className="properties-panel">
        <div className="properties-panel__header">
          <h3>Properties</h3>
        </div>
        <div className="properties-panel__content">
          <div className="properties-panel__empty">
            <p>Chọn một element để xem properties</p>
          </div>
        </div>
      </div>
    );
  }

  const renderFieldProperties = () => {
    const field = fields.find(f => f.key === selectedNode.attrs.key);
    
    if (!field) {
      return (
        <div className="properties-panel__section">
          <h4>Field Properties</h4>
          <p>Field not found: {selectedNode.attrs.key}</p>
        </div>
      );
    }

    return (
      <div className="properties-panel__section">
        <h4>Field Properties</h4>
        
        <div className="properties-panel__field">
          <label>Label</label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => onUpdateField(field.key, { label: e.target.value })}
            className="properties-panel__input"
          />
        </div>

        <div className="properties-panel__field">
          <label>Key</label>
          <input
            type="text"
            value={field.key}
            disabled
            className="properties-panel__input"
          />
        </div>

        <div className="properties-panel__field">
          <label>Type</label>
          <select
            value={field.type}
            onChange={(e) => onUpdateField(field.key, { type: e.target.value as FieldDef['type'] })}
            className="properties-panel__select"
          >
            <option value="text">Text</option>
            <option value="textarea">Textarea</option>
            <option value="number">Number</option>
            <option value="money">Money</option>
            <option value="date">Date</option>
            <option value="select">Select</option>
            <option value="checkbox">Checkbox</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
          </select>
        </div>

        <div className="properties-panel__field">
          <label>Placeholder</label>
          <input
            type="text"
            value={field.placeholder || ''}
            onChange={(e) => onUpdateField(field.key, { placeholder: e.target.value })}
            className="properties-panel__input"
          />
        </div>

        <div className="properties-panel__field">
          <label>
            <input
              type="checkbox"
              checked={field.required || false}
              onChange={(e) => onUpdateField(field.key, { required: e.target.checked })}
              className="properties-panel__checkbox"
            />
            Required
          </label>
        </div>

        {field.type === 'money' && (
          <div className="properties-panel__field">
            <label>Format</label>
            <input
              type="text"
              value={field.format || 'VND'}
              onChange={(e) => onUpdateField(field.key, { format: e.target.value })}
              className="properties-panel__input"
              placeholder="VND"
            />
          </div>
        )}

        {field.type === 'date' && (
          <div className="properties-panel__field">
            <label>Format</label>
            <input
              type="text"
              value={field.format || 'DD/MM/YYYY'}
              onChange={(e) => onUpdateField(field.key, { format: e.target.value })}
              className="properties-panel__input"
              placeholder="DD/MM/YYYY"
            />
          </div>
        )}
      </div>
    );
  };

  const renderClauseProperties = () => {
    return (
      <div className="properties-panel__section">
        <h4>Clause Properties</h4>
        
        <div className="properties-panel__field">
          <label>Title</label>
          <input
            type="text"
            value={selectedNode.attrs.title || ''}
            onChange={(e) => {
              editor.commands.updateAttributes('clauseBlock', { title: e.target.value });
            }}
            className="properties-panel__input"
          />
        </div>

        <div className="properties-panel__field">
          <label>Number</label>
          <input
            type="number"
            value={selectedNode.attrs.number || ''}
            onChange={(e) => {
              editor.commands.updateAttributes('clauseBlock', { number: e.target.value });
            }}
            className="properties-panel__input"
            min="1"
          />
        </div>

        <div className="properties-panel__field">
          <label>Visible If</label>
          <input
            type="text"
            value={selectedNode.attrs.visibleIf || ''}
            onChange={(e) => {
              editor.commands.updateAttributes('clauseBlock', { visibleIf: e.target.value });
            }}
            className="properties-panel__input"
            placeholder="Condition expression"
          />
        </div>
      </div>
    );
  };

  const renderSignatureProperties = () => {
    return (
      <div className="properties-panel__section">
        <h4>Signature Properties</h4>
        
        <div className="properties-panel__field">
          <label>Parties</label>
          <input
            type="text"
            value={selectedNode.attrs.parties?.join(', ') || ''}
            onChange={(e) => {
              const parties = e.target.value.split(',').map(p => p.trim()).filter(Boolean);
              editor.commands.updateAttributes('signatureBlock', { parties });
            }}
            className="properties-panel__input"
            placeholder="A, B"
          />
        </div>

        <div className="properties-panel__field">
          <label>Signature Type</label>
          <select
            value={selectedNode.attrs.signatureType || 'digital'}
            onChange={(e) => {
              editor.commands.updateAttributes('signatureBlock', { signatureType: e.target.value });
            }}
            className="properties-panel__select"
          >
            <option value="digital">Digital</option>
            <option value="manual">Manual</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>
    );
  };

  const renderNodeProperties = () => {
    switch (selectedNode.type) {
      case 'inlineField':
      case 'blockField':
        return renderFieldProperties();
      case 'clauseBlock':
        return renderClauseProperties();
      case 'signatureBlock':
        return renderSignatureProperties();
      default:
        return (
          <div className="properties-panel__section">
            <h4>Node Properties</h4>
            <p>Type: {selectedNode.type}</p>
            <pre>{JSON.stringify(selectedNode.attrs, null, 2)}</pre>
          </div>
        );
    }
  };

  return (
    <div className="properties-panel">
      <div className="properties-panel__header">
        <h3>Properties</h3>
      </div>
      
      <div className="properties-panel__content">
        {renderNodeProperties()}
      </div>
    </div>
  );
};

export default PropertiesPanel;