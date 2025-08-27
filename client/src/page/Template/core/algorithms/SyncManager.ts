import { DocumentTreeManager, DocumentNode } from './DocumentTreeManager';

export interface SyncOperation {
  id: string;
  type: 'UPDATE_NODE' | 'REORDER_NODES' | 'ADD_NODE' | 'DELETE_NODE' | 'UPDATE_FIELD' | 'UPDATE_CONDITIONAL';
  nodeId?: string;
  data?: any;
  sourceId?: string;
  targetId?: string;
  position?: 'before' | 'after' | 'inside';
  parentId?: string;
  nodeData?: any;
  fieldId?: string;
  fieldValue?: any;
  timestamp: number;
  priority: 'low' | 'normal' | 'high';
}

export interface SyncResult {
  success: boolean;
  operationId: string;
  data?: any;
  error?: string;
}

export interface SyncCallback {
  onNodeUpdate?: (nodeId: string, data: any) => void;
  onNodeReorder?: (sourceId: string, targetId: string, position: string) => void;
  onNodeAdd?: (nodeId: string, nodeData: any) => void;
  onNodeDelete?: (nodeId: string) => void;
  onFieldUpdate?: (fieldId: string, value: any) => void;
  onConditionalUpdate?: (nodeId: string, visible: boolean) => void;
  onError?: (error: string) => void;
}

export class SyncManager {
  private syncQueue: SyncOperation[] = [];
  private isProcessing = false;
  private treeManager: DocumentTreeManager;
  private callbacks: SyncCallback = {};
  private batchOperations: SyncOperation[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 100; // ms

  constructor(treeManager: DocumentTreeManager) {
    this.treeManager = treeManager;
  }

  // Register callbacks
  registerCallbacks(callbacks: SyncCallback): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Add operation to sync queue
  addOperation(operation: Omit<SyncOperation, 'id' | 'timestamp'>): string {
    const syncOperation: SyncOperation = {
      ...operation,
      id: this.generateOperationId(),
      timestamp: Date.now()
    };

    // Add to batch for performance optimization
    this.batchOperations.push(syncOperation);

    // Start batch timeout if not already running
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => {
        this.processBatch();
      }, this.BATCH_DELAY);
    }

    return syncOperation.id;
  }

  // Process batch operations
  private processBatch(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    if (this.batchOperations.length === 0) return;

    // Group operations by type for optimization
    const groupedOperations = this.groupOperationsByType(this.batchOperations);
    
    // Process each group
    Object.entries(groupedOperations).forEach(([type, operations]) => {
      this.processOperationGroup(type as SyncOperation['type'], operations);
    });

    // Clear batch
    this.batchOperations = [];
  }

  // Group operations by type
  private groupOperationsByType(operations: SyncOperation[]): Record<string, SyncOperation[]> {
    return operations.reduce((groups, operation) => {
      const type = operation.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(operation);
      return groups;
    }, {} as Record<string, SyncOperation[]>);
  }

  // Process operation group
  private processOperationGroup(type: SyncOperation['type'], operations: SyncOperation[]): void {
    switch (type) {
      case 'UPDATE_NODE':
        this.processNodeUpdates(operations);
        break;
      case 'REORDER_NODES':
        this.processNodeReorders(operations);
        break;
      case 'ADD_NODE':
        this.processNodeAdds(operations);
        break;
      case 'DELETE_NODE':
        this.processNodeDeletes(operations);
        break;
      case 'UPDATE_FIELD':
        this.processFieldUpdates(operations);
        break;
      case 'UPDATE_CONDITIONAL':
        this.processConditionalUpdates(operations);
        break;
    }
  }

  // Process node updates
  private processNodeUpdates(operations: SyncOperation[]): void {
    operations.forEach(operation => {
      try {
        if (operation.nodeId && operation.data) {
          this.treeManager.updateNode(operation.nodeId, operation.data);
          this.callbacks.onNodeUpdate?.(operation.nodeId, operation.data);
        }
      } catch (error) {
        this.handleError(operation.id, error as string);
      }
    });
  }

  // Process node reorders
  private processNodeReorders(operations: SyncOperation[]): void {
    operations.forEach(operation => {
      try {
        if (operation.sourceId && operation.targetId && operation.position) {
          this.treeManager.reorderTree(operation.sourceId, operation.targetId, operation.position);
          this.callbacks.onNodeReorder?.(operation.sourceId, operation.targetId, operation.position);
        }
      } catch (error) {
        this.handleError(operation.id, error as string);
      }
    });
  }

  // Process node adds
  private processNodeAdds(operations: SyncOperation[]): void {
    operations.forEach(operation => {
      try {
        if (operation.nodeData && operation.parentId) {
          const nodeId = this.treeManager.addNode(operation.nodeData, operation.parentId);
          this.callbacks.onNodeAdd?.(nodeId, operation.nodeData);
        }
      } catch (error) {
        this.handleError(operation.id, error as string);
      }
    });
  }

  // Process node deletes
  private processNodeDeletes(operations: SyncOperation[]): void {
    operations.forEach(operation => {
      try {
        if (operation.nodeId) {
          this.treeManager.removeNode(operation.nodeId);
          this.callbacks.onNodeDelete?.(operation.nodeId);
        }
      } catch (error) {
        this.handleError(operation.id, error as string);
      }
    });
  }

  // Process field updates
  private processFieldUpdates(operations: SyncOperation[]): void {
    operations.forEach(operation => {
      try {
        if (operation.fieldId && operation.fieldValue !== undefined) {
          // Update field value in tree manager
          this.updateFieldValue(operation.fieldId, operation.fieldValue);
          this.callbacks.onFieldUpdate?.(operation.fieldId, operation.fieldValue);
        }
      } catch (error) {
        this.handleError(operation.id, error as string);
      }
    });
  }

  // Process conditional updates
  private processConditionalUpdates(operations: SyncOperation[]): void {
    operations.forEach(operation => {
      try {
        if (operation.nodeId && operation.data) {
          const visible = operation.data.visible;
          this.treeManager.updateNode(operation.nodeId, { metadata: { visible } });
          this.callbacks.onConditionalUpdate?.(operation.nodeId, visible);
        }
      } catch (error) {
        this.handleError(operation.id, error as string);
      }
    });
  }

  // Update field value in document
  private updateFieldValue(fieldId: string, value: any): void {
    const nodes = this.treeManager.getAllNodes();
    
    nodes.forEach((node, nodeId) => {
      if (node.content && typeof node.content === 'object' && node.content.fieldKey === fieldId) {
        // Update field content
        this.treeManager.updateNode(nodeId, {
          content: { ...node.content, value }
        });
      }
    });
  }

  // Handle errors
  private handleError(operationId: string, error: string): void {
    console.error(`Sync operation ${operationId} failed:`, error);
    this.callbacks.onError?.(error);
  }

  // Generate unique operation ID
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Force process all pending operations
  forceProcess(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    this.processBatch();
  }

  // Get pending operations count
  getPendingCount(): number {
    return this.batchOperations.length;
  }

  // Clear all pending operations
  clearPending(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    this.batchOperations = [];
  }

  // Get sync statistics
  getStats(): { pending: number; processed: number } {
    return {
      pending: this.batchOperations.length,
      processed: this.syncQueue.length
    };
  }
}