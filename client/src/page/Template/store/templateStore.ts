import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { FieldDef } from './fieldStore';

export interface Template {
  id?: string;
  name: string;
  description?: string;
  docSchema: any; // Tiptap JSON
  fieldsSchema: FieldDef[];
  layout?: {
    pageSize: 'A4' | 'A3' | 'Letter';
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    header?: string;
    footer?: string;
  };
  version: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ContractData {
  [key: string]: any;
}

interface TemplateStore {
  template: Template | null;
  contractData: ContractData;
  setTemplate: (template: Template) => void;
  saveTemplate: (template: Template) => void;
  loadTemplate: (templateId: string) => void;
  updateContractData: (key: string, value: any) => void;
  setContractData: (data: ContractData) => void;
  getContractData: (key: string) => any;
  validateContractData: () => { isValid: boolean; errors: { [key: string]: string[] } };
  generateResolvedDocument: () => { docJSON: any; html: string };
}

export const useTemplateStore = create<TemplateStore>()(
  devtools(
    (set, get) => ({
      template: null,
      contractData: {},

      setTemplate: (template) => {
        set({ template });
      },

      saveTemplate: (template) => {
        // In a real app, this would save to backend
        console.log('Saving template:', template);
        set({ template });
      },

      loadTemplate: (templateId) => {
        // In a real app, this would load from backend
        console.log('Loading template:', templateId);
      },

      updateContractData: (key, value) => {
        set((state) => ({
          contractData: {
            ...state.contractData,
            [key]: value,
          },
        }));
      },

      setContractData: (data) => {
        set({ contractData: data });
      },

      getContractData: (key) => {
        const { contractData } = get();
        return contractData[key];
      },

      validateContractData: () => {
        const { template, contractData } = get();
        if (!template) {
          return { isValid: false, errors: {} };
        }

        const errors: { [key: string]: string[] } = {};

        template.fieldsSchema.forEach((field) => {
          const value = contractData[field.key];
          const fieldErrors: string[] = [];

          // Required validation
          if (field.required && (value === undefined || value === null || value === '')) {
            fieldErrors.push('This field is required');
          }

          // Type validation
          if (value !== undefined && value !== null && value !== '') {
            switch (field.type) {
              case 'number':
                if (isNaN(Number(value))) {
                  fieldErrors.push('Must be a valid number');
                }
                break;
              case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(String(value))) {
                  fieldErrors.push('Must be a valid email address');
                }
                break;
              case 'phone':
                const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
                if (!phoneRegex.test(String(value))) {
                  fieldErrors.push('Must be a valid phone number');
                }
                break;
            }
          }

          // Custom validation
          if (field.validation) {
            if (field.validation.regex) {
              const regex = new RegExp(field.validation.regex);
              if (!regex.test(String(value))) {
                fieldErrors.push(field.validation.message || 'Invalid format');
              }
            }

            if (field.validation.min !== undefined && Number(value) < field.validation.min) {
              fieldErrors.push(`Minimum value is ${field.validation.min}`);
            }

            if (field.validation.max !== undefined && Number(value) > field.validation.max) {
              fieldErrors.push(`Maximum value is ${field.validation.max}`);
            }
          }

          if (fieldErrors.length > 0) {
            errors[field.key] = fieldErrors;
          }
        });

        return {
          isValid: Object.keys(errors).length === 0,
          errors,
        };
      },

      generateResolvedDocument: () => {
        const { template, contractData } = get();
        if (!template) {
          return { docJSON: null, html: '' };
        }

        // Deep clone the document schema
        const resolvedDoc = JSON.parse(JSON.stringify(template.docSchema));

        // Function to resolve field values in the document
        const resolveFields = (content: any[]): any[] => {
          return content.map((node) => {
            if (node.type === 'inlineField' || node.type === 'blockField') {
              const fieldKey = node.attrs.key;
              const value = contractData[fieldKey];
              const field = template.fieldsSchema.find(f => f.key === fieldKey);

              if (value !== undefined && value !== null && value !== '') {
                // Replace field node with text node containing formatted value
                return {
                  type: 'text',
                  text: formatValue(value, field),
                };
              } else {
                // Keep placeholder if no value
                return {
                  type: 'text',
                  text: `{{${fieldKey}}}`,
                };
              }
            }

            if (node.content) {
              return {
                ...node,
                content: resolveFields(node.content),
              };
            }

            return node;
          });
        };

        resolvedDoc.content = resolveFields(resolvedDoc.content);

        // Generate HTML (simplified - in real app would use Tiptap renderer)
        const html = generateHTML(resolvedDoc);

        return {
          docJSON: resolvedDoc,
          html,
        };
      },
    }),
    {
      name: 'template-store',
    }
  )
);

// Helper function to format values
function formatValue(value: any, field?: FieldDef): string {
  if (!field) return String(value);

  switch (field.type) {
    case 'money':
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(Number(value));
    
    case 'date':
      if (field.format) {
        // Simple date formatting - in real app would use date-fns
        const date = new Date(value);
        return date.toLocaleDateString('vi-VN');
      }
      return String(value);
    
    default:
      return String(value);
  }
}

// Helper function to generate HTML (simplified)
function generateHTML(docJSON: any): string {
  // This is a simplified HTML generator
  // In a real app, you would use Tiptap's HTML renderer or a proper HTML generator
  let html = '<div class="document">';
  
  const processNode = (node: any): string => {
    switch (node.type) {
      case 'doc':
        return node.content?.map(processNode).join('') || '';
      
      case 'paragraph':
        return `<p>${node.content?.map(processNode).join('') || ''}</p>`;
      
      case 'heading':
        return `<h${node.attrs.level}>${node.content?.map(processNode).join('') || ''}</h${node.attrs.level}>`;
      
      case 'text':
        return node.text || '';
      
      case 'table':
        return `<table>${node.content?.map(processNode).join('') || ''}</table>`;
      
      case 'tableRow':
        return `<tr>${node.content?.map(processNode).join('') || ''}</tr>`;
      
      case 'tableCell':
        return `<td>${node.content?.map(processNode).join('') || ''}</td>`;
      
      case 'tableHeader':
        return `<th>${node.content?.map(processNode).join('') || ''}</th>`;
      
      default:
        return node.content?.map(processNode).join('') || '';
    }
  };

  html += processNode(docJSON);
  html += '</div>';
  
  return html;
}