import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface ConditionRule {
  id: string;
  fieldKey: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
  logicalOperator?: 'and' | 'or';
}

export interface ConditionalBlock {
  id: string;
  type: 'if' | 'else' | 'elseif';
  conditions: ConditionRule[];
  visible: boolean;
  parentId?: string;
  children: string[]; // IDs of child blocks
}

export interface ConditionalExpression {
  id: string;
  blockId: string;
  expression: string; // JSON Logic expression
  description: string;
}

interface ConditionalStore {
  conditionalBlocks: ConditionalBlock[];
  expressions: ConditionalExpression[];
  addConditionalBlock: (block: Omit<ConditionalBlock, 'id'>) => string;
  updateConditionalBlock: (id: string, updates: Partial<ConditionalBlock>) => void;
  removeConditionalBlock: (id: string) => void;
  addCondition: (blockId: string, condition: Omit<ConditionRule, 'id'>) => void;
  updateCondition: (blockId: string, conditionId: string, updates: Partial<ConditionRule>) => void;
  removeCondition: (blockId: string, conditionId: string) => void;
  addExpression: (expression: Omit<ConditionalExpression, 'id'>) => void;
  updateExpression: (id: string, updates: Partial<ConditionalExpression>) => void;
  removeExpression: (id: string) => void;
  evaluateConditions: (blockId: string, fieldValues: Record<string, any>) => boolean;
  getBlockById: (id: string) => ConditionalBlock | undefined;
  getExpressionsByBlock: (blockId: string) => ConditionalExpression[];
}

export const useConditionalStore = create<ConditionalStore>()(
  devtools(
    (set, get) => ({
      conditionalBlocks: [],
      expressions: [],

      addConditionalBlock: (block) => {
        const id = `conditional_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newBlock: ConditionalBlock = { ...block, id };
        
        set((state) => ({
          conditionalBlocks: [...state.conditionalBlocks, newBlock],
        }));

        return id;
      },

      updateConditionalBlock: (id, updates) => {
        set((state) => ({
          conditionalBlocks: state.conditionalBlocks.map((block) =>
            block.id === id ? { ...block, ...updates } : block
          ),
        }));
      },

      removeConditionalBlock: (id) => {
        set((state) => ({
          conditionalBlocks: state.conditionalBlocks.filter((block) => block.id !== id),
          expressions: state.expressions.filter((expr) => expr.blockId !== id),
        }));
      },

      addCondition: (blockId, condition) => {
        const conditionId = `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newCondition: ConditionRule = { ...condition, id: conditionId };
        
        set((state) => ({
          conditionalBlocks: state.conditionalBlocks.map((block) =>
            block.id === blockId
              ? { ...block, conditions: [...block.conditions, newCondition] }
              : block
          ),
        }));
      },

      updateCondition: (blockId, conditionId, updates) => {
        set((state) => ({
          conditionalBlocks: state.conditionalBlocks.map((block) =>
            block.id === blockId
              ? {
                  ...block,
                  conditions: block.conditions.map((condition) =>
                    condition.id === conditionId ? { ...condition, ...updates } : condition
                  ),
                }
              : block
          ),
        }));
      },

      removeCondition: (blockId, conditionId) => {
        set((state) => ({
          conditionalBlocks: state.conditionalBlocks.map((block) =>
            block.id === blockId
              ? {
                  ...block,
                  conditions: block.conditions.filter((condition) => condition.id !== conditionId),
                }
              : block
          ),
        }));
      },

      addExpression: (expression) => {
        const id = `expr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newExpression: ConditionalExpression = { ...expression, id };
        
        set((state) => ({
          expressions: [...state.expressions, newExpression],
        }));
      },

      updateExpression: (id, updates) => {
        set((state) => ({
          expressions: state.expressions.map((expr) =>
            expr.id === id ? { ...expr, ...updates } : expr
          ),
        }));
      },

      removeExpression: (id) => {
        set((state) => ({
          expressions: state.expressions.filter((expr) => expr.id !== id),
        }));
      },

      evaluateConditions: (blockId, fieldValues) => {
        const block = get().getBlockById(blockId);
        if (!block || block.conditions.length === 0) return true;

        return block.conditions.every((condition, index) => {
          const fieldValue = fieldValues[condition.fieldKey];
          const result = evaluateCondition(condition, fieldValue);
          
          // Handle logical operators
          if (index > 0 && condition.logicalOperator) {
            const prevResult = evaluateCondition(block.conditions[index - 1], fieldValues[block.conditions[index - 1].fieldKey]);
            if (condition.logicalOperator === 'and') {
              return prevResult && result;
            } else if (condition.logicalOperator === 'or') {
              return prevResult || result;
            }
          }
          
          return result;
        });
      },

      getBlockById: (id) => {
        const { conditionalBlocks } = get();
        return conditionalBlocks.find((block) => block.id === id);
      },

      getExpressionsByBlock: (blockId) => {
        const { expressions } = get();
        return expressions.filter((expr) => expr.blockId === blockId);
      },
    }),
    {
      name: 'conditional-store',
    }
  )
);

// Helper function to evaluate a single condition
function evaluateCondition(condition: ConditionRule, fieldValue: any): boolean {
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