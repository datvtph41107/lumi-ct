// Core Algorithms for Template Editor
export * from './DocumentTreeManager';
export * from './SyncManager';
export * from './FieldBindingManager';
export * from './ConditionalLogicEngine';
export * from './DragDropPipeline';
export * from './ExportPipeline';

// Main Algorithm Orchestrator
export class TemplateEditorAlgorithms {
  private treeManager: DocumentTreeManager;
  private syncManager: SyncManager;
  private fieldManager: FieldBindingManager;
  private conditionalEngine: ConditionalLogicEngine;
  private dragDropPipeline: DragDropPipeline;
  private exportPipeline: ExportPipeline;

  constructor() {
    // Initialize core managers
    this.treeManager = new DocumentTreeManager();
    this.syncManager = new SyncManager(this.treeManager);
    this.fieldManager = new FieldBindingManager(this.treeManager);
    this.conditionalEngine = new ConditionalLogicEngine(this.treeManager, this.fieldManager);
    this.dragDropPipeline = new DragDropPipeline(this.treeManager, this.syncManager);
    this.exportPipeline = new ExportPipeline(this.treeManager, this.fieldManager, this.conditionalEngine);

    // Setup cross-dependencies
    this.setupCrossDependencies();
  }

  // Setup cross-dependencies between algorithms
  private setupCrossDependencies(): void {
    // Sync manager callbacks
    this.syncManager.registerCallbacks({
      onNodeUpdate: (nodeId: string, data: any) => {
        // Trigger conditional evaluation if needed
        if (data.metadata?.conditions) {
          this.conditionalEngine.queueEvaluation(nodeId);
        }
      },
      onFieldUpdate: (fieldId: string, value: any) => {
        // Field updates are handled by FieldBindingManager
        console.log(`Field ${fieldId} updated to:`, value);
      },
      onError: (error: string) => {
        console.error('Sync error:', error);
      }
    });

    // Drag & Drop callbacks
    this.dragDropPipeline.registerCallbacks({
      onDragStart: (dragState) => {
        console.log('Drag started:', dragState);
      },
      onDragOver: (dropZone) => {
        console.log('Drag over:', dropZone);
      },
      onDragEnd: (operation) => {
        console.log('Drag ended:', operation);
      },
      onError: (error: string) => {
        console.error('Drag & Drop error:', error);
      }
    });
  }

  // Get algorithm instances
  getTreeManager(): DocumentTreeManager {
    return this.treeManager;
  }

  getSyncManager(): SyncManager {
    return this.syncManager;
  }

  getFieldManager(): FieldBindingManager {
    return this.fieldManager;
  }

  getConditionalEngine(): ConditionalLogicEngine {
    return this.conditionalEngine;
  }

  getDragDropPipeline(): DragDropPipeline {
    return this.dragDropPipeline;
  }

  getExportPipeline(): ExportPipeline {
    return this.exportPipeline;
  }

  // Initialize document from Tiptap
  initializeFromTiptap(doc: any): void {
    this.treeManager.createFromTiptap(doc);
  }

  // Get system statistics
  getSystemStats(): {
    tree: { nodeCount: number; depth: number };
    sync: { pending: number; processed: number };
    fields: { total: number; withValues: number; withErrors: number };
    conditional: { totalBlocks: number; visibleBlocks: number; hiddenBlocks: number };
    dragDrop: { isDragging: boolean; dropZonesCount: number };
    export: { totalVersions: number; supportedFormats: string[] };
  } {
    const tree = this.treeManager.getTree();
    const fieldStats = this.fieldManager.getFieldStats();
    const conditionalStats = this.conditionalEngine.getConditionalStats();
    const dragDropStats = this.dragDropPipeline.getDragDropStats();
    const exportStats = this.exportPipeline.getExportStats();

    return {
      tree: {
        nodeCount: tree.nodes.size,
        depth: this.calculateTreeDepth(tree.root)
      },
      sync: this.syncManager.getStats(),
      fields: fieldStats,
      conditional: conditionalStats,
      dragDrop: {
        isDragging: dragDropStats.isDragging,
        dropZonesCount: dragDropStats.dropZonesCount
      },
      export: {
        totalVersions: exportStats.totalVersions,
        supportedFormats: exportStats.supportedFormats
      }
    };
  }

  // Calculate tree depth
  private calculateTreeDepth(node: any, currentDepth: number = 0): number {
    if (!node.children || node.children.length === 0) {
      return currentDepth;
    }

    let maxDepth = currentDepth;
    node.children.forEach((childId: string) => {
      const child = this.treeManager.getNode(childId);
      if (child) {
        const childDepth = this.calculateTreeDepth(child, currentDepth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    });

    return maxDepth;
  }

  // Export all data
  exportAllData(): {
    tree: string;
    fields: string;
    conditional: string;
    versions: any[];
  } {
    return {
      tree: this.treeManager.exportToJSON(),
      fields: this.fieldManager.exportFieldData(),
      conditional: this.conditionalEngine.exportConditionalData(),
      versions: this.exportPipeline.getAllVersions()
    };
  }

  // Import all data
  importAllData(data: {
    tree: string;
    fields: string;
    conditional: string;
    versions?: any[];
  }): void {
    try {
      // Import tree
      this.treeManager.importFromJSON(data.tree);

      // Import fields
      this.fieldManager.importFieldData(data.fields);

      // Import conditional logic
      this.conditionalEngine.importConditionalData(data.conditional);

      // Import versions if provided
      if (data.versions) {
        // Note: Version import would need to be implemented in ExportPipeline
        console.log('Version import not yet implemented');
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  // Cleanup resources
  cleanup(): void {
    // Clear all timers and subscriptions
    this.syncManager.clearPending();
    this.conditionalEngine.clearAllConditionalBlocks();
    this.fieldManager.clearAllFieldValues();
  }
}