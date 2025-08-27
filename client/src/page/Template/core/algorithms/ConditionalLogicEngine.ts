import { DocumentTreeManager, ConditionRule } from './DocumentTreeManager';
import { FieldBindingManager } from './FieldBindingManager';

export interface ConditionalBlock {
  id: string;
  type: 'if' | 'else' | 'elseif';
  conditions: ConditionRule[];
  visible: boolean;
  parentId?: string;
  children: string[];
  metadata: {
    description?: string;
    blockId?: string;
  };
}

export interface ConditionEvaluationResult {
  blockId: string;
  visible: boolean;
  evaluatedConditions: EvaluatedCondition[];
  timestamp: number;
}

export interface EvaluatedCondition {
  condition: ConditionRule;
  result: boolean;
  fieldValue: any;
  error?: string;
}

export class ConditionalLogicEngine {
  private conditionalBlocks = new Map<string, ConditionalBlock>();
  private evaluationCache = new Map<string, ConditionEvaluationResult>();
  private treeManager: DocumentTreeManager;
  private fieldManager: FieldBindingManager;
  private evaluationQueue: string[] = [];
  private isEvaluating = false;

  constructor(treeManager: DocumentTreeManager, fieldManager: FieldBindingManager) {
    this.treeManager = treeManager;
    this.fieldManager = fieldManager;
  }

  // Register a conditional block
  registerConditionalBlock(block: ConditionalBlock): void {
    this.conditionalBlocks.set(block.id, block);
    
    // Subscribe to field changes for conditions
    block.conditions.forEach(condition => {
      this.fieldManager.subscribeToField(block.id, condition.fieldKey, () => {
        this.queueEvaluation(block.id);
      }, 'high');
    });
  }

  // Queue block for evaluation
  private queueEvaluation(blockId: string): void {
    if (!this.evaluationQueue.includes(blockId)) {
      this.evaluationQueue.push(blockId);
    }
    
    if (!this.isEvaluating) {
      this.processEvaluationQueue();
    }
  }

  // Process evaluation queue
  private async processEvaluationQueue(): Promise<void> {
    if (this.isEvaluating || this.evaluationQueue.length === 0) return;

    this.isEvaluating = true;

    while (this.evaluationQueue.length > 0) {
      const blockId = this.evaluationQueue.shift()!;
      await this.evaluateBlock(blockId);
    }

    this.isEvaluating = false;
  }

  // Evaluate conditions for a block
  async evaluateBlock(blockId: string): Promise<ConditionEvaluationResult> {
    const block = this.conditionalBlocks.get(blockId);
    if (!block) {
      throw new Error(`Conditional block ${blockId} not found`);
    }

    const evaluatedConditions: EvaluatedCondition[] = [];
    let finalResult = true;

    // Evaluate each condition
    for (let i = 0; i < block.conditions.length; i++) {
      const condition = block.conditions[i];
      const evaluation = await this.evaluateCondition(condition);
      evaluatedConditions.push(evaluation);

      // Handle logical operators
      if (i > 0 && condition.logicalOperator) {
        const prevCondition = block.conditions[i - 1];
        const prevResult = evaluatedConditions[i - 1].result;

        if (condition.logicalOperator === 'and') {
          finalResult = prevResult && evaluation.result;
        } else if (condition.logicalOperator === 'or') {
          finalResult = prevResult || evaluation.result;
        }
      } else {
        finalResult = evaluation.result;
      }
    }

    // Create evaluation result
    const result: ConditionEvaluationResult = {
      blockId,
      visible: finalResult,
      evaluatedConditions,
      timestamp: Date.now()
    };

    // Cache result
    this.evaluationCache.set(blockId, result);

    // Update block visibility
    block.visible = finalResult;

    // Update document tree
    this.updateBlockVisibility(blockId, finalResult);

    return result;
  }

  // Evaluate single condition
  private async evaluateCondition(condition: ConditionRule): Promise<EvaluatedCondition> {
    const fieldValue = this.fieldManager.getFieldValue(condition.fieldKey);
    
    let result = false;
    let error: string | undefined;

    try {
      switch (condition.operator) {
        case 'equals':
          result = fieldValue === condition.value;
          break;
        case 'not_equals':
          result = fieldValue !== condition.value;
          break;
        case 'contains':
          result = String(fieldValue).includes(String(condition.value));
          break;
        case 'not_contains':
          result = !String(fieldValue).includes(String(condition.value));
          break;
        case 'greater_than':
          result = Number(fieldValue) > Number(condition.value);
          break;
        case 'less_than':
          result = Number(fieldValue) < Number(condition.value);
          break;
        case 'is_empty':
          result = !fieldValue || fieldValue === '' || fieldValue === null || fieldValue === undefined;
          break;
        case 'is_not_empty':
          result = fieldValue && fieldValue !== '' && fieldValue !== null && fieldValue !== undefined;
          break;
        default:
          error = `Unknown operator: ${condition.operator}`;
          result = false;
      }
    } catch (err) {
      error = `Evaluation error: ${err}`;
      result = false;
    }

    return {
      condition,
      result,
      fieldValue,
      error
    };
  }

  // Update block visibility in document tree
  private updateBlockVisibility(blockId: string, visible: boolean): void {
    const block = this.conditionalBlocks.get(blockId);
    if (!block) return;

    // Update block metadata
    this.treeManager.updateNode(blockId, {
      metadata: { visible }
    });

    // Update children visibility
    block.children.forEach(childId => {
      this.treeManager.updateNode(childId, {
        metadata: { visible }
      });
    });
  }

  // Evaluate all conditional blocks
  async evaluateAllBlocks(): Promise<ConditionEvaluationResult[]> {
    const results: ConditionEvaluationResult[] = [];
    
    for (const [blockId, block] of this.conditionalBlocks) {
      const result = await this.evaluateBlock(blockId);
      results.push(result);
    }

    return results;
  }

  // Get evaluation result for a block
  getEvaluationResult(blockId: string): ConditionEvaluationResult | undefined {
    return this.evaluationCache.get(blockId);
  }

  // Get all evaluation results
  getAllEvaluationResults(): ConditionEvaluationResult[] {
    return Array.from(this.evaluationCache.values());
  }

  // Check if block is visible
  isBlockVisible(blockId: string): boolean {
    const result = this.evaluationCache.get(blockId);
    return result?.visible ?? true;
  }

  // Add condition to block
  addCondition(blockId: string, condition: ConditionRule): void {
    const block = this.conditionalBlocks.get(blockId);
    if (!block) {
      throw new Error(`Conditional block ${blockId} not found`);
    }

    block.conditions.push(condition);
    
    // Subscribe to field changes
    this.fieldManager.subscribeToField(blockId, condition.fieldKey, () => {
      this.queueEvaluation(blockId);
    }, 'high');

    // Re-evaluate block
    this.queueEvaluation(blockId);
  }

  // Update condition in block
  updateCondition(blockId: string, conditionId: string, updates: Partial<ConditionRule>): void {
    const block = this.conditionalBlocks.get(blockId);
    if (!block) {
      throw new Error(`Conditional block ${blockId} not found`);
    }

    const conditionIndex = block.conditions.findIndex(c => c.id === conditionId);
    if (conditionIndex === -1) {
      throw new Error(`Condition ${conditionId} not found in block ${blockId}`);
    }

    // Unsubscribe from old field
    const oldCondition = block.conditions[conditionIndex];
    this.fieldManager.unsubscribeFromField(blockId, oldCondition.fieldKey);

    // Update condition
    block.conditions[conditionIndex] = { ...oldCondition, ...updates };

    // Subscribe to new field
    const newCondition = block.conditions[conditionIndex];
    this.fieldManager.subscribeToField(blockId, newCondition.fieldKey, () => {
      this.queueEvaluation(blockId);
    }, 'high');

    // Re-evaluate block
    this.queueEvaluation(blockId);
  }

  // Remove condition from block
  removeCondition(blockId: string, conditionId: string): void {
    const block = this.conditionalBlocks.get(blockId);
    if (!block) {
      throw new Error(`Conditional block ${blockId} not found`);
    }

    const conditionIndex = block.conditions.findIndex(c => c.id === conditionId);
    if (conditionIndex === -1) {
      throw new Error(`Condition ${conditionId} not found in block ${blockId}`);
    }

    // Unsubscribe from field
    const condition = block.conditions[conditionIndex];
    this.fieldManager.unsubscribeFromField(blockId, condition.fieldKey);

    // Remove condition
    block.conditions.splice(conditionIndex, 1);

    // Re-evaluate block
    this.queueEvaluation(blockId);
  }

  // Get conditional block
  getConditionalBlock(blockId: string): ConditionalBlock | undefined {
    return this.conditionalBlocks.get(blockId);
  }

  // Get all conditional blocks
  getAllConditionalBlocks(): ConditionalBlock[] {
    return Array.from(this.conditionalBlocks.values());
  }

  // Remove conditional block
  removeConditionalBlock(blockId: string): void {
    const block = this.conditionalBlocks.get(blockId);
    if (!block) return;

    // Unsubscribe from all fields
    block.conditions.forEach(condition => {
      this.fieldManager.unsubscribeFromField(blockId, condition.fieldKey);
    });

    // Remove from collections
    this.conditionalBlocks.delete(blockId);
    this.evaluationCache.delete(blockId);
    this.evaluationQueue = this.evaluationQueue.filter(id => id !== blockId);
  }

  // Clear all conditional blocks
  clearAllConditionalBlocks(): void {
    // Unsubscribe from all fields
    this.conditionalBlocks.forEach(block => {
      block.conditions.forEach(condition => {
        this.fieldManager.unsubscribeFromField(block.id, condition.fieldKey);
      });
    });

    // Clear collections
    this.conditionalBlocks.clear();
    this.evaluationCache.clear();
    this.evaluationQueue = [];
  }

  // Get conditional logic statistics
  getConditionalStats(): {
    totalBlocks: number;
    visibleBlocks: number;
    hiddenBlocks: number;
    blocksWithErrors: number;
    pendingEvaluations: number;
  } {
    const totalBlocks = this.conditionalBlocks.size;
    const visibleBlocks = Array.from(this.evaluationCache.values()).filter(r => r.visible).length;
    const hiddenBlocks = totalBlocks - visibleBlocks;
    const blocksWithErrors = Array.from(this.evaluationCache.values()).filter(r => 
      r.evaluatedConditions.some(c => c.error)
    ).length;
    const pendingEvaluations = this.evaluationQueue.length;

    return {
      totalBlocks,
      visibleBlocks,
      hiddenBlocks,
      blocksWithErrors,
      pendingEvaluations
    };
  }

  // Export conditional logic data
  exportConditionalData(): string {
    const exportData = {
      blocks: Array.from(this.conditionalBlocks.entries()),
      evaluations: Array.from(this.evaluationCache.entries()),
      queue: this.evaluationQueue
    };
    return JSON.stringify(exportData, null, 2);
  }

  // Import conditional logic data
  importConditionalData(jsonData: string): void {
    const importData = JSON.parse(jsonData);
    
    // Import blocks
    if (importData.blocks) {
      importData.blocks.forEach(([id, block]: [string, ConditionalBlock]) => {
        this.registerConditionalBlock(block);
      });
    }
    
    // Import evaluations
    if (importData.evaluations) {
      importData.evaluations.forEach(([id, evaluation]: [string, ConditionEvaluationResult]) => {
        this.evaluationCache.set(id, evaluation);
      });
    }
    
    // Import queue
    if (importData.queue) {
      this.evaluationQueue = importData.queue;
    }
  }
}