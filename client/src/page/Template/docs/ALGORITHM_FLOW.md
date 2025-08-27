# Thuật toán Flow Data & Pipeline - Template Editor

## 🎯 **Tổng quan hệ thống**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Sidebar UI    │    │  Editor Canvas  │    │   Data Store    │
│   (Block List)  │◄──►│   (Tiptap)      │◄──►│   (Zustand)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Drag & Drop    │    │  Node Views     │    │  State Sync     │
│  (dnd-kit)      │    │  (React)        │    │  (Real-time)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 **1. Document Tree Management Algorithm**

### Data Structure
```typescript
interface DocumentNode {
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
  };
}

interface DocumentTree {
  root: DocumentNode;
  nodes: Map<string, DocumentNode>;
  order: string[]; // Maintains display order
}
```

### Algorithm: Tree Reordering
```typescript
function reorderTree(
  tree: DocumentTree, 
  sourceId: string, 
  targetId: string, 
  position: 'before' | 'after' | 'inside'
): DocumentTree {
  // 1. Remove source from current position
  const sourceNode = tree.nodes.get(sourceId);
  const sourceParent = tree.nodes.get(sourceNode.parentId);
  sourceParent.children = sourceParent.children.filter(id => id !== sourceId);
  
  // 2. Insert at new position
  if (position === 'inside') {
    const targetNode = tree.nodes.get(targetId);
    targetNode.children.push(sourceId);
    sourceNode.parentId = targetId;
  } else {
    const targetParent = tree.nodes.get(tree.nodes.get(targetId).parentId);
    const targetIndex = targetParent.children.indexOf(targetId);
    const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
    targetParent.children.splice(insertIndex, 0, sourceId);
    sourceNode.parentId = targetParent.id;
  }
  
  // 3. Update positions
  updatePositions(tree);
  
  // 4. Regenerate numbering
  regenerateNumbering(tree);
  
  return tree;
}
```

## 🔗 **2. Sidebar ↔ Editor Sync Algorithm**

### Sync Pipeline
```typescript
class SyncManager {
  private syncQueue: SyncOperation[] = [];
  private isProcessing = false;

  // Add sync operation to queue
  addOperation(operation: SyncOperation) {
    this.syncQueue.push(operation);
    this.processQueue();
  }

  // Process sync queue
  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.syncQueue.length > 0) {
      const operation = this.syncQueue.shift();
      await this.executeOperation(operation);
    }

    this.isProcessing = false;
  }

  // Execute single sync operation
  private async executeOperation(operation: SyncOperation) {
    switch (operation.type) {
      case 'UPDATE_NODE':
        await this.updateNode(operation.nodeId, operation.data);
        break;
      case 'REORDER_NODES':
        await this.reorderNodes(operation.sourceId, operation.targetId, operation.position);
        break;
      case 'ADD_NODE':
        await this.addNode(operation.nodeData, operation.parentId);
        break;
      case 'DELETE_NODE':
        await this.deleteNode(operation.nodeId);
        break;
    }
  }
}
```

### Sync Operations
```typescript
interface SyncOperation {
  type: 'UPDATE_NODE' | 'REORDER_NODES' | 'ADD_NODE' | 'DELETE_NODE';
  nodeId?: string;
  data?: any;
  sourceId?: string;
  targetId?: string;
  position?: 'before' | 'after' | 'inside';
  parentId?: string;
  nodeData?: any;
}
```

## 🎯 **3. Field Binding & Data Management**

### Field Binding Algorithm
```typescript
class FieldBindingManager {
  private fieldRegistry = new Map<string, FieldDefinition>();
  private fieldValues = new Map<string, any>();
  private fieldSubscribers = new Map<string, Set<string>>(); // fieldId -> nodeIds

  // Register a field
  registerField(fieldId: string, definition: FieldDefinition) {
    this.fieldRegistry.set(fieldId, definition);
    this.fieldSubscribers.set(fieldId, new Set());
  }

  // Subscribe a node to field changes
  subscribeToField(nodeId: string, fieldId: string) {
    if (!this.fieldSubscribers.has(fieldId)) {
      this.fieldSubscribers.set(fieldId, new Set());
    }
    this.fieldSubscribers.get(fieldId).add(nodeId);
  }

  // Update field value and notify subscribers
  updateFieldValue(fieldId: string, value: any) {
    this.fieldValues.set(fieldId, value);
    
    // Notify all subscribers
    const subscribers = this.fieldSubscribers.get(fieldId);
    if (subscribers) {
      subscribers.forEach(nodeId => {
        this.notifyNodeUpdate(nodeId, fieldId, value);
      });
    }
  }

  // Get field value with fallback
  getFieldValue(fieldId: string): any {
    return this.fieldValues.get(fieldId) || this.fieldRegistry.get(fieldId)?.default;
  }
}
```

## 🔢 **4. Auto Numbering & Cross-Reference Algorithm**

### Numbering Algorithm
```typescript
class NumberingManager {
  private numberingCache = new Map<string, string>();
  private referenceCache = new Map<string, CrossReference[]>();

  // Generate numbering for entire document
  generateNumbering(tree: DocumentTree): void {
    this.numberingCache.clear();
    this.traverseAndNumber(tree.root, '', 1);
  }

  // Recursive numbering traversal
  private traverseAndNumber(node: DocumentNode, prefix: string, level: number): void {
    let counter = 1;
    
    for (const childId of node.children) {
      const child = tree.nodes.get(childId);
      
      // Generate number based on type
      let number: string;
      switch (child.type) {
        case 'clause':
          number = `${prefix}${counter}`;
          break;
        case 'subclause':
          number = `${prefix}${counter}`;
          break;
        case 'table':
          number = `Bảng ${counter}`;
          break;
        case 'section':
          number = `Phần ${counter}`;
          break;
        default:
          number = `${counter}`;
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
  updateCrossReferences(tree: DocumentNode): void {
    this.referenceCache.clear();
    
    // Find all cross-references
    this.findCrossReferences(tree);
    
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
}
```

## 🔀 **5. Conditional Logic Algorithm**

### Condition Evaluation Engine
```typescript
class ConditionalLogicEngine {
  private conditionCache = new Map<string, boolean>();
  private fieldValues: Map<string, any>;

  // Evaluate conditions for a block
  evaluateBlockConditions(blockId: string, conditions: ConditionRule[]): boolean {
    if (conditions.length === 0) return true;

    return conditions.every((condition, index) => {
      const result = this.evaluateCondition(condition);
      
      // Handle logical operators
      if (index > 0 && condition.logicalOperator) {
        const prevCondition = conditions[index - 1];
        const prevResult = this.evaluateCondition(prevCondition);
        
        if (condition.logicalOperator === 'and') {
          return prevResult && result;
        } else if (condition.logicalOperator === 'or') {
          return prevResult || result;
        }
      }
      
      return result;
    });
  }

  // Evaluate single condition
  private evaluateCondition(condition: ConditionRule): boolean {
    const fieldValue = this.fieldValues.get(condition.fieldKey);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'not_contains':
        return !String(fieldValue).includes(String(condition.value));
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'is_empty':
        return !fieldValue || fieldValue === '';
      case 'is_not_empty':
        return fieldValue && fieldValue !== '';
      default:
        return true;
    }
  }

  // Update visibility for all conditional blocks
  updateConditionalVisibility(tree: DocumentTree): void {
    this.traverseAndUpdateVisibility(tree.root);
  }

  private traverseAndUpdateVisibility(node: DocumentNode): void {
    if (node.type === 'conditionalBlock') {
      const isVisible = this.evaluateBlockConditions(node.id, node.metadata.conditions);
      node.metadata.visible = isVisible;
    }
    
    // Recursive call for children
    node.children.forEach(childId => {
      const child = tree.nodes.get(childId);
      this.traverseAndUpdateVisibility(child);
    });
  }
}
```

## 🖱️ **6. Drag & Drop Pipeline Algorithm**

### Drag & Drop Event Pipeline
```typescript
class DragDropPipeline {
  private dragState: DragState = null;
  private dropZones: Map<string, DropZone> = new Map();

  // Handle drag start
  handleDragStart(event: DragStartEvent): void {
    const { active } = event;
    
    this.dragState = {
      activeId: active.id,
      sourceType: active.data.current?.source,
      sourceData: active.data.current,
      startPosition: this.getMousePosition(event),
    };

    // Show drag overlay
    this.showDragOverlay(active);
  }

  // Handle drag over
  handleDragOver(event: DragOverEvent): void {
    const { over } = event;
    
    if (!over) {
      this.hideDropIndicators();
      return;
    }

    // Find valid drop zone
    const dropZone = this.findDropZone(over.id);
    if (dropZone) {
      this.showDropIndicator(dropZone, event);
    }
  }

  // Handle drag end
  async handleDragEnd(event: DragEndEvent): Promise<void> {
    const { active, over } = event;
    
    if (!active || !over) {
      this.cleanupDrag();
      return;
    }

    // Execute drop operation
    await this.executeDrop(active, over);
    
    // Cleanup
    this.cleanupDrag();
  }

  // Execute drop operation
  private async executeDrop(active: Active, over: Over): Promise<void> {
    const operation = this.createDropOperation(active, over);
    
    // Add to sync queue
    syncManager.addOperation(operation);
    
    // Update UI immediately for responsiveness
    this.updateUI(operation);
  }

  // Create drop operation
  private createDropOperation(active: Active, over: Over): SyncOperation {
    const sourceId = active.id;
    const targetId = over.id;
    const position = this.calculateDropPosition(active, over);

    return {
      type: 'REORDER_NODES',
      sourceId,
      targetId,
      position,
    };
  }
}
```

## 📤 **7. Export & Versioning Algorithm**

### Export Pipeline
```typescript
class ExportPipeline {
  private transformers: Map<string, ExportTransformer> = new Map();

  // Register export transformers
  registerTransformer(format: string, transformer: ExportTransformer) {
    this.transformers.set(format, transformer);
  }

  // Export document
  async exportDocument(tree: DocumentTree, format: string, options: ExportOptions): Promise<ExportResult> {
    // 1. Resolve all field values
    const resolvedTree = await this.resolveFields(tree);
    
    // 2. Apply conditional logic
    const filteredTree = this.applyConditionalLogic(resolvedTree);
    
    // 3. Generate numbering
    numberingManager.generateNumbering(filteredTree);
    
    // 4. Update cross-references
    numberingManager.updateCrossReferences(filteredTree);
    
    // 5. Transform to target format
    const transformer = this.transformers.get(format);
    if (!transformer) {
      throw new Error(`Unsupported export format: ${format}`);
    }
    
    return await transformer.transform(filteredTree, options);
  }

  // Resolve field values
  private async resolveFields(tree: DocumentTree): Promise<DocumentTree> {
    const resolvedTree = cloneDeep(tree);
    
    this.traverseAndResolveFields(resolvedTree.root);
    
    return resolvedTree;
  }

  private traverseAndResolveFields(node: DocumentNode): void {
    // Replace field placeholders with actual values
    if (node.content && typeof node.content === 'string') {
      node.content = this.replaceFieldPlaceholders(node.content);
    }
    
    // Recursive call for children
    node.children.forEach(childId => {
      const child = resolvedTree.nodes.get(childId);
      this.traverseAndResolveFields(child);
    });
  }

  // Replace field placeholders
  private replaceFieldPlaceholders(content: string): string {
    return content.replace(/\{\{(\w+)\}\}/g, (match, fieldId) => {
      const value = fieldBindingManager.getFieldValue(fieldId);
      return value || match;
    });
  }
}
```

### Versioning Algorithm
```typescript
class VersioningManager {
  private versions: Version[] = [];
  private currentVersion: number = 0;

  // Create new version
  createVersion(tree: DocumentTree, metadata: VersionMetadata): string {
    const versionId = `v${this.versions.length + 1}`;
    const version: Version = {
      id: versionId,
      timestamp: Date.now(),
      metadata,
      tree: cloneDeep(tree),
      diff: this.calculateDiff(this.getCurrentTree(), tree),
    };

    this.versions.push(version);
    this.currentVersion = this.versions.length - 1;

    return versionId;
  }

  // Rollback to previous version
  rollbackToVersion(versionId: string): DocumentTree {
    const version = this.versions.find(v => v.id === versionId);
    if (!version) {
      throw new Error(`Version not found: ${versionId}`);
    }

    this.currentVersion = this.versions.indexOf(version);
    return cloneDeep(version.tree);
  }

  // Calculate diff between versions
  private calculateDiff(oldTree: DocumentTree, newTree: DocumentTree): TreeDiff {
    // Implementation of tree diff algorithm
    // Returns changes between two document trees
  }
}
```

## 🔄 **8. Complete Data Flow Sequence**

### Main Data Flow
```typescript
// 1. User drags block from sidebar
userDragsBlock() {
  // Trigger drag start
  dragDropPipeline.handleDragStart(event);
  
  // Show visual feedback
  uiManager.showDragOverlay();
}

// 2. User drops block in editor
userDropsBlock() {
  // Execute drop operation
  const operation = dragDropPipeline.createDropOperation(active, over);
  
  // Add to sync queue
  syncManager.addOperation(operation);
  
  // Update document tree
  documentTree = treeManager.reorderTree(documentTree, operation);
  
  // Regenerate numbering
  numberingManager.generateNumbering(documentTree);
  
  // Update cross-references
  numberingManager.updateCrossReferences(documentTree);
  
  // Update UI
  uiManager.updateEditor(documentTree);
  uiManager.updateSidebar(documentTree);
}

// 3. User updates field value
userUpdatesField(fieldId: string, value: any) {
  // Update field value
  fieldBindingManager.updateFieldValue(fieldId, value);
  
  // Evaluate conditional logic
  conditionalEngine.updateConditionalVisibility(documentTree);
  
  // Update UI
  uiManager.updateEditor(documentTree);
}

// 4. User saves document
userSavesDocument() {
  // Create version
  const versionId = versioningManager.createVersion(documentTree, {
    author: currentUser,
    message: 'User save',
  });
  
  // Save to storage
  storageManager.saveDocument(documentTree, versionId);
}
```

## 🎯 **Tóm tắt thuật toán then chốt:**

1. **Document Tree Management**: Quản lý cấu trúc cây với reordering và position tracking
2. **Sync Pipeline**: Đồng bộ real-time giữa UI và data store
3. **Field Binding**: Mapping field values và notify subscribers
4. **Auto Numbering**: Generate và update numbering với cross-references
5. **Conditional Logic**: Evaluate conditions và update visibility
6. **Drag & Drop**: Event pipeline với visual feedback
7. **Export & Versioning**: Transform data và track versions

Thuật toán này đảm bảo hệ thống hoạt động mượt mà, responsive và maintainable.