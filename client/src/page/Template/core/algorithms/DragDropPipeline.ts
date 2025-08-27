import { DocumentTreeManager } from './DocumentTreeManager';
import { SyncManager } from './SyncManager';

export interface DragState {
  activeId: string;
  sourceType: 'sidebar' | 'canvas';
  sourceData: any;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  isDragging: boolean;
}

export interface DropZone {
  id: string;
  type: 'canvas' | 'block' | 'section';
  position: 'before' | 'after' | 'inside';
  parentId?: string;
  targetId?: string;
  isValid: boolean;
  visualFeedback: 'none' | 'highlight' | 'line' | 'overlay';
}

export interface DragOperation {
  sourceId: string;
  targetId: string;
  position: 'before' | 'after' | 'inside';
  blockType?: string;
  blockData?: any;
}

export interface DragValidationResult {
  isValid: boolean;
  error?: string;
  suggestedPosition?: 'before' | 'after' | 'inside';
}

export class DragDropPipeline {
  private dragState: DragState | null = null;
  private dropZones = new Map<string, DropZone>();
  private treeManager: DocumentTreeManager;
  private syncManager: SyncManager;
  private validationRules = new Map<string, (operation: DragOperation) => DragValidationResult>();
  private visualFeedbackCallbacks: {
    onDragStart?: (dragState: DragState) => void;
    onDragOver?: (dropZone: DropZone) => void;
    onDragEnd?: (operation: DragOperation) => void;
    onError?: (error: string) => void;
  } = {};

  constructor(treeManager: DocumentTreeManager, syncManager: SyncManager) {
    this.treeManager = treeManager;
    this.syncManager = syncManager;
    this.initializeValidationRules();
  }

  // Register visual feedback callbacks
  registerCallbacks(callbacks: typeof this.visualFeedbackCallbacks): void {
    this.visualFeedbackCallbacks = { ...this.visualFeedbackCallbacks, ...callbacks };
  }

  // Initialize validation rules
  private initializeValidationRules(): void {
    // Rule: Signature blocks can only be at the end
    this.validationRules.set('signatureBlock', (operation: DragOperation) => {
      const targetNode = this.treeManager.getNode(operation.targetId);
      if (!targetNode) return { isValid: false, error: 'Target not found' };

      // Check if there are blocks after the target
      const parent = this.treeManager.getNode(targetNode.parentId!);
      if (parent) {
        const targetIndex = parent.children.indexOf(operation.targetId);
        const hasBlocksAfter = targetIndex < parent.children.length - 1;
        
        if (hasBlocksAfter && operation.position !== 'after') {
          return {
            isValid: false,
            error: 'Chữ ký phải ở cuối tài liệu',
            suggestedPosition: 'after'
          };
        }
      }

      return { isValid: true };
    });

    // Rule: Table blocks cannot be inside other blocks
    this.validationRules.set('tableBlock', (operation: DragOperation) => {
      if (operation.position === 'inside') {
        const targetNode = this.treeManager.getNode(operation.targetId);
        if (targetNode && targetNode.type !== 'document' && targetNode.type !== 'section') {
          return {
            isValid: false,
            error: 'Bảng không thể được đặt bên trong block khác',
            suggestedPosition: 'after'
          };
        }
      }
      return { isValid: true };
    });

    // Rule: Conditional blocks can contain other blocks
    this.validationRules.set('conditionalBlock', (operation: DragOperation) => {
      return { isValid: true };
    });
  }

  // Handle drag start
  handleDragStart(event: any): void {
    const { active } = event;
    
    this.dragState = {
      activeId: active.id,
      sourceType: active.data?.current?.source || 'canvas',
      sourceData: active.data?.current || {},
      startPosition: this.getMousePosition(event),
      currentPosition: this.getMousePosition(event),
      isDragging: true
    };

    // Show drag overlay
    this.visualFeedbackCallbacks.onDragStart?.(this.dragState);
  }

  // Handle drag over
  handleDragOver(event: any): void {
    if (!this.dragState) return;

    const { over } = event;
    this.dragState.currentPosition = this.getMousePosition(event);

    if (!over) {
      this.hideDropIndicators();
      return;
    }

    // Find valid drop zone
    const dropZone = this.findDropZone(over.id, event);
    if (dropZone) {
      this.showDropIndicator(dropZone);
    }
  }

  // Handle drag end
  async handleDragEnd(event: any): Promise<void> {
    const { active, over } = event;
    
    if (!active || !over) {
      this.cleanupDrag();
      return;
    }

    // Execute drop operation
    const operation = this.createDropOperation(active, over);
    const validation = this.validateDropOperation(operation);

    if (validation.isValid) {
      await this.executeDrop(operation);
      this.visualFeedbackCallbacks.onDragEnd?.(operation);
    } else {
      this.visualFeedbackCallbacks.onError?.(validation.error || 'Drop operation invalid');
    }

    // Cleanup
    this.cleanupDrag();
  }

  // Create drop operation from drag event
  private createDropOperation(active: any, over: any): DragOperation {
    const sourceId = active.id;
    const targetId = over.id;
    const position = this.calculateDropPosition(active, over);
    const sourceData = active.data?.current;

    return {
      sourceId,
      targetId,
      position,
      blockType: sourceData?.type,
      blockData: sourceData?.attrs
    };
  }

  // Calculate drop position
  private calculateDropPosition(active: any, over: any): 'before' | 'after' | 'inside' {
    const sourceData = active.data?.current;
    const overData = over.data?.current;

    // If dragging from sidebar, default to 'after'
    if (sourceData?.source === 'sidebar') {
      return 'after';
    }

    // If over a drop zone with specific position
    if (overData?.dropPosition) {
      return overData.dropPosition;
    }

    // Calculate based on mouse position relative to target
    const targetRect = over.rect;
    const mouseY = this.dragState?.currentPosition.y || 0;
    const targetTop = targetRect.top;
    const targetBottom = targetRect.bottom;
    const targetHeight = targetRect.height;

    // If mouse is in top 25% of target, drop before
    if (mouseY < targetTop + targetHeight * 0.25) {
      return 'before';
    }
    // If mouse is in bottom 25% of target, drop after
    else if (mouseY > targetBottom - targetHeight * 0.25) {
      return 'after';
    }
    // Otherwise, drop inside
    else {
      return 'inside';
    }
  }

  // Validate drop operation
  private validateDropOperation(operation: DragOperation): DragValidationResult {
    // Basic validation
    if (!operation.sourceId || !operation.targetId) {
      return { isValid: false, error: 'Invalid source or target' };
    }

    // Check if source and target are the same
    if (operation.sourceId === operation.targetId) {
      return { isValid: false, error: 'Cannot drop on itself' };
    }

    // Check if target is a descendant of source
    if (this.isDescendant(operation.targetId, operation.sourceId)) {
      return { isValid: false, error: 'Cannot drop parent into child' };
    }

    // Apply specific validation rules
    if (operation.blockType && this.validationRules.has(operation.blockType)) {
      const validator = this.validationRules.get(operation.blockType)!;
      const result = validator(operation);
      if (!result.isValid) {
        return result;
      }
    }

    return { isValid: true };
  }

  // Check if node is descendant of another
  private isDescendant(nodeId: string, ancestorId: string): boolean {
    const node = this.treeManager.getNode(nodeId);
    if (!node || !node.parentId) return false;

    if (node.parentId === ancestorId) return true;
    return this.isDescendant(node.parentId, ancestorId);
  }

  // Execute drop operation
  private async executeDrop(operation: DragOperation): Promise<void> {
    try {
      if (operation.sourceData?.source === 'sidebar') {
        // Insert new block from sidebar
        await this.insertBlockFromSidebar(operation);
      } else {
        // Reorder existing block
        await this.reorderBlock(operation);
      }
    } catch (error) {
      console.error('Drop operation failed:', error);
      this.visualFeedbackCallbacks.onError?.(`Drop operation failed: ${error}`);
    }
  }

  // Insert block from sidebar
  private async insertBlockFromSidebar(operation: DragOperation): Promise<void> {
    const blockData = {
      type: 'block',
      content: operation.blockData,
      metadata: {
        title: operation.blockData?.title || operation.blockType,
        blockType: operation.blockType
      }
    };

    // Add to sync queue
    this.syncManager.addOperation({
      type: 'ADD_NODE',
      nodeData: blockData,
      parentId: operation.targetId,
      priority: 'high'
    });
  }

  // Reorder existing block
  private async reorderBlock(operation: DragOperation): Promise<void> {
    // Add to sync queue
    this.syncManager.addOperation({
      type: 'REORDER_NODES',
      sourceId: operation.sourceId,
      targetId: operation.targetId,
      position: operation.position,
      priority: 'high'
    });
  }

  // Find drop zone for target
  private findDropZone(targetId: string, event: any): DropZone | null {
    const targetNode = this.treeManager.getNode(targetId);
    if (!targetNode) return null;

    const dropZone: DropZone = {
      id: targetId,
      type: targetNode.type as 'canvas' | 'block' | 'section',
      position: this.calculateDropPosition(event.active, { id: targetId, data: { current: {} } }),
      parentId: targetNode.parentId,
      targetId,
      isValid: true,
      visualFeedback: 'highlight'
    };

    // Validate drop zone
    const validation = this.validateDropZone(dropZone, event);
    dropZone.isValid = validation.isValid;
    dropZone.visualFeedback = validation.isValid ? 'highlight' : 'none';

    return dropZone;
  }

  // Validate drop zone
  private validateDropZone(dropZone: DropZone, event: any): { isValid: boolean; error?: string } {
    const sourceData = event.active?.data?.current;
    
    // Check if source is from sidebar
    if (sourceData?.source === 'sidebar') {
      return { isValid: true };
    }

    // Check if target can accept the source
    const targetNode = this.treeManager.getNode(dropZone.targetId);
    if (!targetNode) return { isValid: false, error: 'Target not found' };

    // Specific validation based on target type
    switch (targetNode.type) {
      case 'document':
      case 'section':
        return { isValid: true };
      case 'block':
        // Some blocks can contain other blocks
        if (targetNode.content?.blockType === 'conditionalBlock') {
          return { isValid: true };
        }
        return { isValid: false, error: 'Cannot drop into this block type' };
      default:
        return { isValid: false, error: 'Invalid target type' };
    }
  }

  // Show drop indicator
  private showDropIndicator(dropZone: DropZone): void {
    this.visualFeedbackCallbacks.onDragOver?.(dropZone);
  }

  // Hide drop indicators
  private hideDropIndicators(): void {
    // Implementation depends on UI framework
  }

  // Get mouse position from event
  private getMousePosition(event: any): { x: number; y: number } {
    return {
      x: event.clientX || 0,
      y: event.clientY || 0
    };
  }

  // Cleanup drag state
  private cleanupDrag(): void {
    this.dragState = null;
    this.hideDropIndicators();
  }

  // Add validation rule
  addValidationRule(blockType: string, validator: (operation: DragOperation) => DragValidationResult): void {
    this.validationRules.set(blockType, validator);
  }

  // Remove validation rule
  removeValidationRule(blockType: string): void {
    this.validationRules.delete(blockType);
  }

  // Get drag state
  getDragState(): DragState | null {
    return this.dragState;
  }

  // Check if currently dragging
  isDragging(): boolean {
    return this.dragState?.isDragging || false;
  }

  // Get drop zones
  getDropZones(): DropZone[] {
    return Array.from(this.dropZones.values());
  }

  // Force process pending operations
  forceProcess(): void {
    this.syncManager.forceProcess();
  }

  // Get drag drop statistics
  getDragDropStats(): {
    isDragging: boolean;
    dropZonesCount: number;
    validationRulesCount: number;
    pendingOperations: number;
  } {
    return {
      isDragging: this.isDragging(),
      dropZonesCount: this.dropZones.size,
      validationRulesCount: this.validationRules.size,
      pendingOperations: this.syncManager.getPendingCount()
    };
  }
}