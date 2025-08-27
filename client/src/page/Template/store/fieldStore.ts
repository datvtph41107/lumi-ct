import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'money' | 'date' | 'select' | 'array' | 'object' | 'checkbox' | 'phone' | 'email';
  widget?: 'input' | 'textarea' | 'datepicker' | 'select' | 'currency';
  required?: boolean;
  default?: any;
  format?: string; // "DD/MM/YYYY" | "VND"
  validation?: {
    regex?: string;
    min?: number;
    max?: number;
    message?: string;
  };
  options?: { value: any; label: string }[];
  placeholder?: string;
  visibleIf?: string; // json-logic expression
  compute?: string; // computed expression
  description?: string;
}

interface FieldStore {
  fields: FieldDef[];
  selectedField: FieldDef | null;
  addField: (field: FieldDef) => void;
  updateField: (key: string, updates: Partial<FieldDef>) => void;
  deleteField: (key: string) => void;
  selectField: (field: FieldDef | null) => void;
  getField: (key: string) => FieldDef | undefined;
  getFieldsByType: (type: FieldDef['type']) => FieldDef[];
  validateField: (field: FieldDef) => { isValid: boolean; errors: string[] };
  setFields: (fields: FieldDef[]) => void;
}

export const useFieldStore = create<FieldStore>()(
  devtools(
    (set, get) => ({
      fields: [],
      selectedField: null,

      addField: (field) => {
        const { fields } = get();
        const existingField = fields.find(f => f.key === field.key);
        
        if (existingField) {
          throw new Error(`Field with key "${field.key}" already exists`);
        }

        set((state) => ({
          fields: [...state.fields, field],
        }));
      },

      updateField: (key, updates) => {
        set((state) => ({
          fields: state.fields.map((field) =>
            field.key === key ? { ...field, ...updates } : field
          ),
        }));
      },

      deleteField: (key) => {
        set((state) => ({
          fields: state.fields.filter((field) => field.key !== key),
          selectedField: state.selectedField?.key === key ? null : state.selectedField,
        }));
      },

      selectField: (field) => {
        set({ selectedField: field });
      },

      getField: (key) => {
        const { fields } = get();
        return fields.find(f => f.key === key);
      },

      getFieldsByType: (type) => {
        const { fields } = get();
        return fields.filter(f => f.type === type);
      },

      validateField: (field) => {
        const errors: string[] = [];

        if (!field.key) {
          errors.push('Field key is required');
        }

        if (!field.label) {
          errors.push('Field label is required');
        }

        if (field.key && field.key.includes(' ')) {
          errors.push('Field key cannot contain spaces');
        }

        if (field.validation) {
          if (field.validation.min !== undefined && field.validation.max !== undefined) {
            if (field.validation.min > field.validation.max) {
              errors.push('Min value cannot be greater than max value');
            }
          }
        }

        return {
          isValid: errors.length === 0,
          errors,
        };
      },

      setFields: (fields) => {
        set({ fields });
      },
    }),
    {
      name: 'field-store',
    }
  )
);