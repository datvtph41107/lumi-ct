import React, { useState } from 'react';
import { Editor } from '@tiptap/core';
import { Plus, Settings, FileText, Type, Table, User, Calendar, DollarSign, Hash, Layers, Database } from 'lucide-react';
import { FieldDef } from '../store/fieldStore';
import FieldManager from './FieldManager';
import BlockLibrary from './BlockLibrary';
import LayoutStructure from './LayoutStructure';
import BlockTemplates from './BlockTemplates';
import DefinedFields from './DefinedFields';
import './Sidebar.scss';

interface SidebarProps {
  editor: Editor;
  fields: FieldDef[];
  onAddField: (field: FieldDef) => void;
  onUpdateField: (key: string, updates: Partial<FieldDef>) => void;
  onDeleteField: (key: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  editor,
  fields,
  onAddField,
  onUpdateField,
  onDeleteField,
}) => {
  const [activeTab, setActiveTab] = useState<'blocks' | 'fields' | 'defined-fields' | 'templates' | 'layout'>('blocks');

  const tabs = [
    { id: 'blocks', label: 'Blocks', icon: FileText, description: 'Thư viện blocks' },
    { id: 'fields', label: 'Fields', icon: Settings, description: 'Quản lý fields' },
    { id: 'defined-fields', label: 'Đã định nghĩa', icon: Database, description: 'Fields đã tạo' },
    { id: 'templates', label: 'Templates', icon: Type, description: 'Templates có sẵn' },
    { id: 'layout', label: 'Layout', icon: Layers, description: 'Cấu trúc tài liệu' }
  ];

  return (
    <div className="template-sidebar">
      <div className="template-sidebar__header">
        <h3>Template Editor</h3>
        <p className="template-sidebar__subtitle">Thư viện và công cụ</p>
      </div>

      <div className="template-sidebar__tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`template-sidebar__tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
            title={tab.description}
          >
            <tab.icon size={16} />
            <span className="template-sidebar__tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="template-sidebar__content">
        {activeTab === 'blocks' && (
          <BlockLibrary
            fields={fields}
          />
        )}
        
        {activeTab === 'fields' && (
          <FieldManager
            fields={fields}
            onAddField={onAddField}
            onUpdateField={onUpdateField}
            onDeleteField={onDeleteField}
          />
        )}

        {activeTab === 'defined-fields' && (
          <DefinedFields
            fields={fields}
            onAddField={onAddField}
            onUpdateField={onUpdateField}
            onDeleteField={onDeleteField}
          />
        )}

        {activeTab === 'templates' && (
          <BlockTemplates />
        )}

        {activeTab === 'layout' && (
          <LayoutStructure
            editor={editor}
          />
        )}
      </div>

      <div className="template-sidebar__footer">
        <div className="template-sidebar__status">
          <span className="template-sidebar__status-text">
            {activeTab === 'blocks' && `${fields.length} fields available`}
            {activeTab === 'fields' && 'Field management'}
            {activeTab === 'defined-fields' && `${fields.length} defined fields`}
            {activeTab === 'templates' && 'Ready to use templates'}
            {activeTab === 'layout' && 'Document structure'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;