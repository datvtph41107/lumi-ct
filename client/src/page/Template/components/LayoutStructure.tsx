import React, { useState } from 'react';
import { Editor } from '@tiptap/core';
import { ChevronDown, ChevronRight, GripVertical, Eye, EyeOff } from 'lucide-react';
import { SortableBlockList, SortableBlockItem } from './SortableBlockItem';
import './LayoutStructure.scss';

interface LayoutStructureProps {
  editor: Editor;
}

interface BlockNode {
  id: string;
  type: string;
  title: string;
  level: number;
  visible: boolean;
  children?: BlockNode[];
}

const LayoutStructure: React.FC<LayoutStructureProps> = ({ editor }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [blockNodes, setBlockNodes] = useState<BlockNode[]>([]);

  // Parse document structure
  React.useEffect(() => {
    if (!editor) return;

    const parseDocument = () => {
      const { doc } = editor.state;
      const nodes: BlockNode[] = [];
      let nodeId = 0;

      const processNode = (node: any, level: number = 0): BlockNode | null => {
        const id = `node-${nodeId++}`;
        
        switch (node.type.name) {
          case 'heading':
            return {
              id,
              type: 'heading',
              title: node.textContent || `Heading ${node.attrs.level}`,
              level,
              visible: true,
            };
          case 'clauseBlock':
            return {
              id,
              type: 'clause',
              title: node.attrs.title || 'Điều khoản',
              level,
              visible: true,
            };
          case 'signatureBlock':
            return {
              id,
              type: 'signature',
              title: 'Chữ ký',
              level,
              visible: true,
            };
          case 'pageBreak':
            return {
              id,
              type: 'pageBreak',
              title: 'Ngắt trang',
              level,
              visible: true,
            };
          case 'table':
            return {
              id,
              type: 'table',
              title: 'Bảng',
              level,
              visible: true,
            };
          default:
            return null;
        }
      };

      const traverse = (node: any, level: number = 0) => {
        const blockNode = processNode(node, level);
        if (blockNode) {
          nodes.push(blockNode);
        }

        if (node.content) {
          node.content.forEach((child: any) => {
            traverse(child, level + 1);
          });
        }
      };

      traverse(doc);
      setBlockNodes(nodes);
    };

    parseDocument();
  }, [editor]);

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const toggleNodeVisibility = (nodeId: string) => {
    setBlockNodes(prev => 
      prev.map(node => 
        node.id === nodeId 
          ? { ...node, visible: !node.visible }
          : node
      )
    );
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'heading':
        return '📝';
      case 'clause':
        return '📄';
      case 'signature':
        return '✍️';
      case 'pageBreak':
        return '📄';
      case 'table':
        return '📊';
      default:
        return '📄';
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (!active || !over || active.id === over.id) return;

    // Handle reordering blocks
    const oldIndex = blockNodes.findIndex(node => node.id === active.id);
    const newIndex = blockNodes.findIndex(node => node.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newNodes = [...blockNodes];
      const [movedNode] = newNodes.splice(oldIndex, 1);
      newNodes.splice(newIndex, 0, movedNode);
      setBlockNodes(newNodes);

      // Update editor content (this would need more complex logic to actually move blocks)
      console.log('Reordering blocks:', { from: oldIndex, to: newIndex });
    }
  };

  const renderNode = (node: BlockNode) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="layout-node">
        <div className="layout-node__header">
          <SortableBlockItem id={node.id} className="layout-node__sortable">
            <div className="layout-node__content">
              <div className="layout-node__drag-handle">
                <GripVertical size={12} />
              </div>
              
              <div className="layout-node__info">
                <span className="layout-node__icon">{getNodeIcon(node.type)}</span>
                <span className="layout-node__title">{node.title}</span>
                <span className="layout-node__type">({node.type})</span>
              </div>

              <div className="layout-node__actions">
                <button
                  className="layout-node__action-btn"
                  onClick={() => toggleNodeVisibility(node.id)}
                  title={node.visible ? 'Ẩn' : 'Hiện'}
                >
                  {node.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                
                {hasChildren && (
                  <button
                    className="layout-node__action-btn"
                    onClick={() => toggleNodeExpansion(node.id)}
                    title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                  >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                )}
              </div>
            </div>
          </SortableBlockItem>
        </div>

        {hasChildren && isExpanded && (
          <div className="layout-node__children">
            {node.children?.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="layout-structure">
      <div className="layout-structure__header">
        <h4>Cấu trúc Layout</h4>
        <div className="layout-structure__controls">
          <button
            className="layout-structure__btn"
            onClick={() => setExpandedNodes(new Set(blockNodes.map(n => n.id)))}
          >
            Mở tất cả
          </button>
          <button
            className="layout-structure__btn"
            onClick={() => setExpandedNodes(new Set())}
          >
            Đóng tất cả
          </button>
        </div>
      </div>

      <div className="layout-structure__content">
        {blockNodes.length === 0 ? (
          <div className="layout-structure__empty">
            <p>Chưa có block nào trong document</p>
          </div>
        ) : (
          <SortableBlockList
            items={blockNodes.map(n => n.id)}
            children={(id) => {
              const node = blockNodes.find(n => n.id === id);
              return node ? renderNode(node) : null;
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LayoutStructure;