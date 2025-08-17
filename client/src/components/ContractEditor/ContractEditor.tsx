import React, { useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import FontFamily from '@tiptap/extension-font-family';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FloatingMenu from '@tiptap/extension-floating-menu';
import { useReactToPrint } from 'react-to-print';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import EditorHeader from './EditorHeader';
import EditorSidebar from './EditorSidebar';
import ContractTemplates from './ContractTemplates';
import ContractStructure from './ContractStructure';
import TextSuggestions from './TextSuggestions';
import { ContractType, ContractTemplate } from '../../types/contract';
import { useContractStore } from '../../store/contractStore';

import './ContractEditor.scss';

interface ContractEditorProps {
  contractType?: ContractType;
  initialContent?: string;
  onSave?: (content: string) => void;
}

const ContractEditor: React.FC<ContractEditorProps> = ({
  contractType = 'employment',
  initialContent = '',
  onSave
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'templates' | 'structure' | 'suggestions'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const { saveContract, currentContract } = useContractStore();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Highlight,
      Link,
      Image,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      FontFamily,
      TextStyle,
      Color,
      FloatingMenu,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      if (onSave) {
        onSave(content);
      }
    },
    editorProps: {
      attributes: {
        class: 'contract-editor-content prose prose-lg max-w-none focus:outline-none',
      },
    },
  });

  const handleTemplateSelect = useCallback((template: ContractTemplate) => {
    setSelectedTemplate(template);
    if (editor && template.content) {
      editor.commands.setContent(template.content);
    }
  }, [editor]);

  const handleStructureInsert = useCallback((structure: string) => {
    if (editor) {
      editor.commands.insertContent(structure);
    }
  }, [editor]);

  const handleSuggestionInsert = useCallback((suggestion: string) => {
    if (editor) {
      editor.commands.insertContent(suggestion);
    }
  }, [editor]);

  const handlePrint = useReactToPrint({
    content: () => editorRef.current,
    onAfterPrint: () => setShowPrintPreview(false),
  });

  const handleExportPDF = async () => {
    if (!editorRef.current) return;
    
    try {
      const canvas = await html2canvas(editorRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('contract.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const handleExportWord = () => {
    if (!editor) return;
    
    const content = editor.getHTML();
    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    saveAs(blob, 'contract.docx');
  };

  const handleSave = () => {
    if (editor && onSave) {
      const content = editor.getHTML();
      onSave(content);
      saveContract({
        id: currentContract?.id || Date.now().toString(),
        type: contractType,
        content,
        template: selectedTemplate?.name || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="contract-editor">
      <EditorHeader
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onSave={handleSave}
        onPrint={handlePrint}
        onExportPDF={handleExportPDF}
        onExportWord={handleExportWord}
        isSidebarOpen={isSidebarOpen}
      />
      
      <div className="contract-editor-main">
        {isSidebarOpen && (
          <EditorSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            contractType={contractType}
          >
            {activeTab === 'templates' && (
              <ContractTemplates
                contractType={contractType}
                onTemplateSelect={handleTemplateSelect}
                selectedTemplate={selectedTemplate}
              />
            )}
            {activeTab === 'structure' && (
              <ContractStructure
                contractType={contractType}
                onStructureInsert={handleStructureInsert}
              />
            )}
            {activeTab === 'suggestions' && (
              <TextSuggestions
                contractType={contractType}
                onSuggestionInsert={handleSuggestionInsert}
              />
            )}
          </EditorSidebar>
        )}
        
        <div className="contract-editor-content-wrapper">
          <div 
            ref={editorRef}
            className="contract-editor-content"
          >
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
      
      {showPrintPreview && (
        <div className="print-preview-overlay">
          <div className="print-preview-content">
            <div className="print-preview-header">
              <h3>Print Preview</h3>
              <button onClick={() => setShowPrintPreview(false)}>Close</button>
            </div>
            <div className="print-preview-body" ref={editorRef}>
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractEditor;