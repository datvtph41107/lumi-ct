import { Node as ProseMirrorNode } from 'prosemirror-model';

export interface DocumentNode {
  id: string;
  type: 'document' | 'section' | 'block' | 'field';
  position: number;
  parentId?: string;
  children: string[];
  content: any;
  metadata: {
    title?: string;
    numbering?: string;
    conditions?: ConditionRule[];
    references?: CrossReference[];
    visible?: boolean;
  };
}

export interface DocumentTree {
  root: DocumentNode;
  nodes: Map<string, DocumentNode>;
  order: string[]; // Maintains display order
}

export interface ConditionRule {
  id: string;
  fieldKey: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value?: any;
  logicalOperator?: 'and' | 'or';
}

export interface CrossReference {
  id: string;
  sourceId: string;
  targetId: string;
  text: string;
  type: 'clause' | 'table' | 'section';
}

export class DocumentTreeManager {
  private tree: DocumentTree;
  private numberingCache = new Map<string, string>();
  private referenceCache = new Map<string, CrossReference[]>();

  constructor() {
    this.tree = {
      root: {
        id: 'root',
        type: 'document',
        position: 0,
        children: [],
        content: null,
        metadata: {}
      },
      nodes: new Map(),
      order: []
    };
    this.tree.nodes.set('root', this.tree.root);
  }

  // Create document tree from Tiptap document
  createFromTiptap(doc: ProseMirrorNode): DocumentTree {
    this.tree = {
      root: {
        id: 'root',
        type: 'document',
        position: 0,
        children: [],
        content: null,
        metadata: {}
      },
      nodes: new Map(),
      order: []
    };
    this.tree.nodes.set('root', this.tree.root);

    this.parseTiptapNode(doc, 'root', 0);
    this.updatePositions();
    this.generateNumbering();

    return this.tree;
  }

  // Parse Tiptap node recursively
  private parseTiptapNode(node: ProseMirrorNode, parentId: string, level: number): void {
    const nodeId = this.generateNodeId();
    const nodeType = this.mapTiptapTypeToNodeType(node.type.name);
    
    const documentNode: DocumentNode = {
      id: nodeId,
      type: nodeType,
      position: level,
      parentId,
      children: [],
      content: this.extractNodeContent(node),
      metadata: this.extractNodeMetadata(node)
    };

    this.tree.nodes.set(nodeId, documentNode);
    this.tree.nodes.get(parentId)!.children.push(nodeId);
    this.tree.order.push(nodeId);

    // Recursively parse children
    node.forEach((child, index) => {
      this.parseTiptapNode(child, nodeId, level + 1);
    });
  }

  // Map Tiptap node type to our node type
  private mapTiptapTypeToNodeType(tiptapType: string): DocumentNode['type'] {
    switch (tiptapType) {
      case 'doc':
        return 'document';
      case 'heading':
      case 'clauseBlock':
      case 'tableBlock':
      case 'conditionalBlock':
        return 'block';
      case 'inlineField':
      case 'blockField':
        return 'field';
      default:
        return 'block';
    }
  }

  // Extract content from Tiptap node
  private extractNodeContent(node: ProseMirrorNode): any {
    if (node.type.name === 'inlineField' || node.type.name === 'blockField') {
      return {
        fieldKey: node.attrs.fieldKey,
        label: node.attrs.label,
        type: node.attrs.type
      };
    }
    
    if (node.type.name === 'tableBlock') {
      return {
        title: node.attrs.title,
        headers: node.attrs.headers,
        rows: node.attrs.rows,
        cols: node.attrs.cols
      };
    }

    if (node.type.name === 'conditionalBlock') {
      return {
        type: node.attrs.type,
        conditions: node.attrs.conditions,
        description: node.attrs.description
      };
    }

    return node.textContent || null;
  }

  // Extract metadata from Tiptap node
  private extractNodeMetadata(node: ProseMirrorNode): DocumentNode['metadata'] {
    const metadata: DocumentNode['metadata'] = {};

    if (node.attrs.title) metadata.title = node.attrs.title;
    if (node.attrs.numbering) metadata.numbering = node.attrs.numbering;
    if (node.attrs.conditions) metadata.conditions = node.attrs.conditions;
    if (node.attrs.visible !== undefined) metadata.visible = node.attrs.visible;

    return metadata;
  }

  // Generate unique node ID
  private generateNodeId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Reorder tree nodes
  reorderTree(sourceId: string, targetId: string, position: 'before' | 'after' | 'inside'): DocumentTree {
    const sourceNode = this.tree.nodes.get(sourceId);
    const targetNode = this.tree.nodes.get(targetId);

    if (!sourceNode || !targetNode) {
      throw new Error('Source or target node not found');
    }

    // Remove source from current position
    const sourceParent = this.tree.nodes.get(sourceNode.parentId!);
    if (sourceParent) {
      sourceParent.children = sourceParent.children.filter(id => id !== sourceId);
    }

    // Insert at new position
    if (position === 'inside') {
      targetNode.children.push(sourceId);
      sourceNode.parentId = targetId;
    } else {
      const targetParent = this.tree.nodes.get(targetNode.parentId!);
      if (targetParent) {
        const targetIndex = targetParent.children.indexOf(targetId);
        const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
        targetParent.children.splice(insertIndex, 0, sourceId);
        sourceNode.parentId = targetParent.id;
      }
    }

    // Update positions and regenerate numbering
    this.updatePositions();
    this.generateNumbering();
    this.updateCrossReferences();

    return this.tree;
  }

  // Update node positions
  private updatePositions(): void {
    const updateNodePosition = (nodeId: string, level: number): void => {
      const node = this.tree.nodes.get(nodeId);
      if (node) {
        node.position = level;
        node.children.forEach((childId, index) => {
          updateNodePosition(childId, level + 1);
        });
      }
    };

    updateNodePosition('root', 0);
  }

  // Generate numbering for all nodes
  generateNumbering(): void {
    this.numberingCache.clear();
    this.traverseAndNumber(this.tree.root, '', 1);
  }

  // Recursive numbering traversal
  private traverseAndNumber(node: DocumentNode, prefix: string, level: number): void {
    let counter = 1;
    
    for (const childId of node.children) {
      const child = this.tree.nodes.get(childId);
      if (!child) continue;
      
      // Generate number based on type
      let number: string;
      switch (child.type) {
        case 'block':
          if (child.content && typeof child.content === 'string' && child.content.includes('Điều')) {
            number = `${prefix}${counter}`;
          } else {
            number = `${prefix}${counter}`;
          }
          break;
        case 'field':
          number = `${prefix}${counter}`;
          break;
        default:
          number = `${prefix}${counter}`;
      }
      
      // Cache the number
      this.numberingCache.set(childId, number);
      
      // Update node metadata
      child.metadata.numbering = number;
      
      // Recursive call for children
      this.traverseAndNumber(child, `${number}.`, level + 1);
      counter++;
    }
  }

  // Update cross-references when numbering changes
  updateCrossReferences(): void {
    this.referenceCache.clear();
    
    // Find all cross-references
    this.findCrossReferences(this.tree.root);
    
    // Update reference text
    this.referenceCache.forEach((refs, nodeId) => {
      refs.forEach(ref => {
        const targetNumber = this.numberingCache.get(ref.targetId);
        if (targetNumber) {
          ref.text = ref.text.replace(/\d+(\.\d+)*/, targetNumber);
        }
      });
    });
  }

  // Find cross-references in document
  private findCrossReferences(node: DocumentNode): void {
    // Check if node content contains cross-references
    if (node.content && typeof node.content === 'string') {
      const crossRefMatches = node.content.match(/Điều\s+(\d+(\.\d+)*)/g);
      if (crossRefMatches) {
        const refs: CrossReference[] = crossRefMatches.map((match, index) => ({
          id: `${node.id}_ref_${index}`,
          sourceId: node.id,
          targetId: this.findTargetByNumber(match.replace('Điều ', '')),
          text: match,
          type: 'clause'
        }));
        
        if (refs.length > 0) {
          this.referenceCache.set(node.id, refs);
        }
      }
    }
    
    // Recursive call for children
    node.children.forEach(childId => {
      const child = this.tree.nodes.get(childId);
      if (child) {
        this.findCrossReferences(child);
      }
    });
  }

  // Find target node by numbering
  private findTargetByNumber(number: string): string {
    for (const [nodeId, cachedNumber] of this.numberingCache) {
      if (cachedNumber === number) {
        return nodeId;
      }
    }
    return '';
  }

  // Get node by ID
  getNode(nodeId: string): DocumentNode | undefined {
    return this.tree.nodes.get(nodeId);
  }

  // Get all nodes
  getAllNodes(): Map<string, DocumentNode> {
    return this.tree.nodes;
  }

  // Get document order
  getOrder(): string[] {
    return this.tree.order;
  }

  // Add new node
  addNode(nodeData: Partial<DocumentNode>, parentId: string = 'root'): string {
    const nodeId = this.generateNodeId();
    const parent = this.tree.nodes.get(parentId);
    
    if (!parent) {
      throw new Error('Parent node not found');
    }

    const newNode: DocumentNode = {
      id: nodeId,
      type: nodeData.type || 'block',
      position: parent.position + 1,
      parentId,
      children: [],
      content: nodeData.content || null,
      metadata: nodeData.metadata || {}
    };

    this.tree.nodes.set(nodeId, newNode);
    parent.children.push(nodeId);
    this.tree.order.push(nodeId);

    this.updatePositions();
    this.generateNumbering();

    return nodeId;
  }

  // Remove node
  removeNode(nodeId: string): void {
    const node = this.tree.nodes.get(nodeId);
    if (!node) return;

    // Remove from parent
    if (node.parentId) {
      const parent = this.tree.nodes.get(node.parentId);
      if (parent) {
        parent.children = parent.children.filter(id => id !== nodeId);
      }
    }

    // Remove from order
    this.tree.order = this.tree.order.filter(id => id !== nodeId);

    // Remove node and all children
    this.removeNodeRecursive(nodeId);

    this.updatePositions();
    this.generateNumbering();
  }

  // Recursively remove node and children
  private removeNodeRecursive(nodeId: string): void {
    const node = this.tree.nodes.get(nodeId);
    if (!node) return;

    // Remove children first
    node.children.forEach(childId => {
      this.removeNodeRecursive(childId);
    });

    // Remove node
    this.tree.nodes.delete(nodeId);
  }

  // Update node
  updateNode(nodeId: string, updates: Partial<DocumentNode>): void {
    const node = this.tree.nodes.get(nodeId);
    if (!node) return;

    Object.assign(node, updates);
    
    // If content or metadata changed, regenerate numbering
    if (updates.content || updates.metadata) {
      this.generateNumbering();
      this.updateCrossReferences();
    }
  }

  // Get tree structure
  getTree(): DocumentTree {
    return this.tree;
  }

  // Export tree to JSON
  exportToJSON(): string {
    const exportData = {
      root: this.tree.root,
      nodes: Array.from(this.tree.nodes.entries()),
      order: this.tree.order
    };
    return JSON.stringify(exportData, null, 2);
  }

  // Import tree from JSON
  importFromJSON(jsonData: string): void {
    const importData = JSON.parse(jsonData);
    this.tree = {
      root: importData.root,
      nodes: new Map(importData.nodes),
      order: importData.order
    };
    this.generateNumbering();
    this.updateCrossReferences();
  }
}