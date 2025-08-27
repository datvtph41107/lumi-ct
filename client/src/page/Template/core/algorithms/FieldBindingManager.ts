import { DocumentTreeManager } from './DocumentTreeManager';

export interface FieldDefinition {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'email' | 'phone';
  required?: boolean;
  default?: any;
  validation?: FieldValidation;
  options?: FieldOption[];
  placeholder?: string;
  description?: string;
}

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  custom?: (value: any) => boolean;
  message?: string;
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldValue {
  fieldId: string;
  value: any;
  timestamp: number;
  isValid: boolean;
  errors: string[];
}

export interface FieldSubscriber {
  nodeId: string;
  callback: (fieldId: string, value: any) => void;
  priority: 'low' | 'normal' | 'high';
}

export class FieldBindingManager {
  private fieldRegistry = new Map<string, FieldDefinition>();
  private fieldValues = new Map<string, FieldValue>();
  private fieldSubscribers = new Map<string, FieldSubscriber[]>();
  private treeManager: DocumentTreeManager;
  private validationCache = new Map<string, boolean>();
  private debounceTimers = new Map<string, NodeJS.Timeout>();

  constructor(treeManager: DocumentTreeManager) {
    this.treeManager = treeManager;
  }

  // Register a field definition
  registerField(definition: FieldDefinition): void {
    this.fieldRegistry.set(definition.key, definition);
    
    // Initialize with default value if provided
    if (definition.default !== undefined) {
      this.setFieldValue(definition.key, definition.default);
    }
  }

  // Register multiple fields
  registerFields(definitions: FieldDefinition[]): void {
    definitions.forEach(definition => this.registerField(definition));
  }

  // Subscribe a node to field changes
  subscribeToField(nodeId: string, fieldKey: string, callback: (fieldId: string, value: any) => void, priority: 'low' | 'normal' | 'high' = 'normal'): void {
    if (!this.fieldSubscribers.has(fieldKey)) {
      this.fieldSubscribers.set(fieldKey, []);
    }

    const subscribers = this.fieldSubscribers.get(fieldKey)!;
    
    // Remove existing subscription for this node
    const existingIndex = subscribers.findIndex(sub => sub.nodeId === nodeId);
    if (existingIndex !== -1) {
      subscribers.splice(existingIndex, 1);
    }

    // Add new subscription
    subscribers.push({
      nodeId,
      callback,
      priority
    });

    // Sort by priority
    subscribers.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Unsubscribe a node from field changes
  unsubscribeFromField(nodeId: string, fieldKey: string): void {
    const subscribers = this.fieldSubscribers.get(fieldKey);
    if (subscribers) {
      const index = subscribers.findIndex(sub => sub.nodeId === nodeId);
      if (index !== -1) {
        subscribers.splice(index, 1);
      }
    }
  }

  // Set field value with validation and notification
  setFieldValue(fieldKey: string, value: any, debounce: boolean = true): void {
    if (debounce) {
      // Debounce field updates for performance
      const existingTimer = this.debounceTimers.get(fieldKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        this.updateFieldValue(fieldKey, value);
        this.debounceTimers.delete(fieldKey);
      }, 300);

      this.debounceTimers.set(fieldKey, timer);
    } else {
      this.updateFieldValue(fieldKey, value);
    }
  }

  // Update field value immediately
  private updateFieldValue(fieldKey: string, value: any): void {
    const definition = this.fieldRegistry.get(fieldKey);
    if (!definition) {
      console.warn(`Field ${fieldKey} not registered`);
      return;
    }

    // Validate value
    const validation = this.validateFieldValue(definition, value);
    
    // Create field value object
    const fieldValue: FieldValue = {
      fieldId: fieldKey,
      value,
      timestamp: Date.now(),
      isValid: validation.isValid,
      errors: validation.errors
    };

    // Store value
    this.fieldValues.set(fieldKey, fieldValue);
    this.validationCache.set(fieldKey, validation.isValid);

    // Notify subscribers
    this.notifySubscribers(fieldKey, value);

    // Update document tree if field is used in nodes
    this.updateDocumentFields(fieldKey, value);
  }

  // Validate field value
  private validateFieldValue(definition: FieldDefinition, value: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required validation
    if (definition.required && (value === null || value === undefined || value === '')) {
      errors.push('Trường này là bắt buộc');
    }

    // Type validation
    if (value !== null && value !== undefined && value !== '') {
      switch (definition.type) {
        case 'number':
          if (isNaN(Number(value))) {
            errors.push('Giá trị phải là số');
          }
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(value))) {
            errors.push('Email không hợp lệ');
          }
          break;
        case 'phone':
          const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
          if (!phoneRegex.test(String(value))) {
            errors.push('Số điện thoại không hợp lệ');
          }
          break;
      }
    }

    // Custom validation
    if (definition.validation) {
      const validation = definition.validation;
      
      if (validation.min !== undefined && Number(value) < validation.min) {
        errors.push(`Giá trị tối thiểu là ${validation.min}`);
      }
      
      if (validation.max !== undefined && Number(value) > validation.max) {
        errors.push(`Giá trị tối đa là ${validation.max}`);
      }
      
      if (validation.pattern && !new RegExp(validation.pattern).test(String(value))) {
        errors.push(validation.message || 'Giá trị không đúng định dạng');
      }
      
      if (validation.custom && !validation.custom(value)) {
        errors.push(validation.message || 'Giá trị không hợp lệ');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Notify all subscribers of field change
  private notifySubscribers(fieldKey: string, value: any): void {
    const subscribers = this.fieldSubscribers.get(fieldKey);
    if (!subscribers) return;

    subscribers.forEach(subscriber => {
      try {
        subscriber.callback(fieldKey, value);
      } catch (error) {
        console.error(`Error in field subscriber ${subscriber.nodeId}:`, error);
      }
    });
  }

  // Update document tree fields
  private updateDocumentFields(fieldKey: string, value: any): void {
    const nodes = this.treeManager.getAllNodes();
    
    nodes.forEach((node, nodeId) => {
      if (node.content && typeof node.content === 'object' && node.content.fieldKey === fieldKey) {
        // Update field content in document tree
        this.treeManager.updateNode(nodeId, {
          content: { ...node.content, value }
        });
      }
    });
  }

  // Get field value
  getFieldValue(fieldKey: string): any {
    const fieldValue = this.fieldValues.get(fieldKey);
    if (fieldValue) {
      return fieldValue.value;
    }

    // Return default value if no value set
    const definition = this.fieldRegistry.get(fieldKey);
    return definition?.default;
  }

  // Get field definition
  getFieldDefinition(fieldKey: string): FieldDefinition | undefined {
    return this.fieldRegistry.get(fieldKey);
  }

  // Get all field definitions
  getAllFieldDefinitions(): FieldDefinition[] {
    return Array.from(this.fieldRegistry.values());
  }

  // Get field validation status
  isFieldValid(fieldKey: string): boolean {
    return this.validationCache.get(fieldKey) ?? true;
  }

  // Get field errors
  getFieldErrors(fieldKey: string): string[] {
    const fieldValue = this.fieldValues.get(fieldKey);
    return fieldValue?.errors || [];
  }

  // Get all field values
  getAllFieldValues(): Map<string, FieldValue> {
    return new Map(this.fieldValues);
  }

  // Clear field value
  clearFieldValue(fieldKey: string): void {
    this.fieldValues.delete(fieldKey);
    this.validationCache.delete(fieldKey);
    this.notifySubscribers(fieldKey, null);
  }

  // Clear all field values
  clearAllFieldValues(): void {
    this.fieldValues.clear();
    this.validationCache.clear();
    
    // Notify all subscribers
    this.fieldRegistry.forEach((definition, fieldKey) => {
      this.notifySubscribers(fieldKey, null);
    });
  }

  // Get subscribers for a field
  getFieldSubscribers(fieldKey: string): FieldSubscriber[] {
    return this.fieldSubscribers.get(fieldKey) || [];
  }

  // Check if field has subscribers
  hasSubscribers(fieldKey: string): boolean {
    const subscribers = this.fieldSubscribers.get(fieldKey);
    return subscribers ? subscribers.length > 0 : false;
  }

  // Get field statistics
  getFieldStats(): {
    totalFields: number;
    fieldsWithValues: number;
    fieldsWithErrors: number;
    fieldsWithSubscribers: number;
  } {
    const totalFields = this.fieldRegistry.size;
    const fieldsWithValues = this.fieldValues.size;
    const fieldsWithErrors = Array.from(this.validationCache.values()).filter(valid => !valid).length;
    const fieldsWithSubscribers = Array.from(this.fieldSubscribers.values()).filter(subs => subs.length > 0).length;

    return {
      totalFields,
      fieldsWithValues,
      fieldsWithErrors,
      fieldsWithSubscribers
    };
  }

  // Export field data
  exportFieldData(): string {
    const exportData = {
      definitions: Array.from(this.fieldRegistry.entries()),
      values: Array.from(this.fieldValues.entries()),
      subscribers: Array.from(this.fieldSubscribers.entries()).map(([key, subs]) => ({
        fieldKey: key,
        subscriberCount: subs.length
      }))
    };
    return JSON.stringify(exportData, null, 2);
  }

  // Import field data
  importFieldData(jsonData: string): void {
    const importData = JSON.parse(jsonData);
    
    // Import definitions
    if (importData.definitions) {
      importData.definitions.forEach(([key, definition]: [string, FieldDefinition]) => {
        this.fieldRegistry.set(key, definition);
      });
    }
    
    // Import values
    if (importData.values) {
      importData.values.forEach(([key, value]: [string, FieldValue]) => {
        this.fieldValues.set(key, value);
        this.validationCache.set(key, value.isValid);
      });
    }
  }
}