import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import { InlineField } from './extensions/InlineField';
import { BlockField } from './extensions/BlockField';
import { ClauseBlock } from './extensions/ClauseBlock';
import { SignatureBlock } from './extensions/SignatureBlock';
import { PageBreak } from './extensions/PageBreak';
import { TableBlock } from './extensions/TableBlock';
import { CrossReference } from './extensions/CrossReference';
import { ConditionalBlock } from './extensions/ConditionalBlock';
import { useTemplateStore } from './store/templateStore';
import { useFieldStore } from './store/fieldStore';
import { useUIModeStore } from './store/uiModeStore';
import { useNumberingStore } from './store/numberingStore';
import { useConditionalStore } from './store/conditionalStore';
import { DndProvider } from './contexts/DndContext';
import Sidebar from './components/Sidebar';
import PropertiesPanel from './components/PropertiesPanel';
import Toolbar from './components/Toolbar';
import CanvasDropZone from './components/CanvasDropZone';
import { sampleTemplate } from './demo/sampleTemplate';
import './styles/TemplateEditor.scss';

const TemplateEditor: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const { mode, setMode } = useUIModeStore();
  const { fields, addField, updateField, deleteField, setFields } = useFieldStore();
  const { template, saveTemplate, loadTemplate, setTemplate } = useTemplateStore();
  const { generateNumbers } = useNumberingStore();
  const { evaluateConditions } = useConditionalStore();

  // Load sample template on mount
  useEffect(() => {
    if (!template) {
      setTemplate(sampleTemplate);
      setFields(sampleTemplate.fieldsSchema);
    }
  }, [template, setTemplate, setFields]);

  // Initialize numbering system
  useEffect(() => {
    if (template?.docSchema) {
      // Parse document and add numbered items
      // This would be implemented to scan the document for clauses, tables, etc.
      generateNumbers();
    }
  }, [template, generateNumbers]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      InlineField,
      BlockField,
      ClauseBlock,
      SignatureBlock,
      PageBreak,
      TableBlock,
      CrossReference,
      ConditionalBlock,
    ],
    content: template?.docSchema || '',
    onUpdate: ({ editor }) => {
      // Auto-save template
      const docSchema = editor.getJSON();
      saveTemplate({
        ...template,
        docSchema,
      });
    },
    onSelectionUpdate: ({ editor }) => {
      const { selection } = editor.state;
      if (selection.empty) {
        setSelectedNode(null);
        return;
      }
      
      const node = editor.state.doc.nodeAt(selection.from);
      if (node) {
        setSelectedNode({
          type: node.type.name,
          attrs: node.attrs,
          pos: selection.from,
        });
      }
    },
  });

  const handleDragStart = useCallback((event: any) => {
    console.log('Drag started:', event);
  }, []);

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;
    
    if (!active || !over) return;

    const activeData = active.data?.current;
    const overId = over.id;

    // Handle dropping from sidebar to canvas
    if (activeData?.source === 'sidebar') {
      const blockType = activeData.type;
      const attrs = activeData.attrs || {};
      
      if (editor && overId === 'canvas-drop-zone') {
        // Insert at the end of document
        const { state } = editor;
        const pos = state.doc.content.size;
        
        switch (blockType) {
          case 'heading':
            editor.commands.insertContentAt(pos, {
              type: 'heading',
              attrs: { level: attrs.level || 1 },
              content: [{ type: 'text', text: 'Tiêu đề mới' }],
            });
            break;
          case 'clauseBlock':
            editor.commands.insertContentAt(pos, {
              type: 'clauseBlock',
              attrs: { title: attrs.title || 'Điều khoản mới' },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Nội dung điều khoản...' }],
                },
              ],
            });
            break;
          case 'tableBlock':
            editor.commands.setTableBlock({
              title: attrs.title || 'Bảng dữ liệu',
              headers: attrs.headers || ['STT', 'Tên', 'Đơn vị', 'Số lượng', 'Đơn giá', 'Thành tiền'],
              rows: attrs.rows || 3,
              cols: attrs.cols || 6,
              autoNumbering: attrs.autoNumbering !== false,
              showTotal: attrs.showTotal || false,
            });
            break;
          case 'conditionalBlock':
            editor.commands.setConditionalBlock({
              type: attrs.type || 'if',
              conditions: attrs.conditions || [],
              description: attrs.description || '',
            });
            break;
          case 'inlineField':
            editor.commands.insertContentAt(pos, {
              type: 'inlineField',
              attrs: attrs,
            });
            break;
          case 'blockField':
            editor.commands.insertContentAt(pos, {
              type: 'blockField',
              attrs: attrs,
            });
            break;
          case 'signatureBlock':
            editor.commands.insertContentAt(pos, {
              type: 'signatureBlock',
              attrs: attrs,
            });
            break;
          case 'pageBreak':
            editor.commands.insertContentAt(pos, {
              type: 'pageBreak',
              attrs: attrs,
            });
            break;
          case 'table':
            editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true });
            break;
        }
      }
    }

    // Handle reordering within canvas
    if (activeData?.source === 'canvas' && overId !== 'canvas-drop-zone') {
      // This would handle reordering blocks within the editor
      // Implementation depends on how you want to handle block reordering
      console.log('Reordering blocks:', { active: active.id, over: overId });
    }
  }, [editor]);

  const handleDragOver = useCallback((event: any) => {
    // Handle drag over events for visual feedback
    console.log('Drag over:', event);
  }, []);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <DndProvider
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="template-editor">
        <Toolbar 
          editor={editor}
          mode={mode}
          onModeChange={setMode}
          onSave={() => saveTemplate(template)}
        />
        
        <div className="template-editor__main">
          <Sidebar 
            editor={editor}
            fields={fields}
            onAddField={addField}
            onUpdateField={updateField}
            onDeleteField={deleteField}
          />
          
          <div className="template-editor__canvas">
            <CanvasDropZone editor={editor} />
          </div>
          
          <PropertiesPanel 
            selectedNode={selectedNode}
            editor={editor}
            fields={fields}
            onUpdateField={updateField}
          />
        </div>
      </div>
    </DndProvider>
  );
};

export default TemplateEditor;