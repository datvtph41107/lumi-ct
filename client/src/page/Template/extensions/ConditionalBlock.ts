import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ConditionalBlockView } from '../components/ConditionalBlockView';

export interface ConditionalBlockOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    conditionalBlock: {
      setConditionalBlock: (attributes?: { 
        type: 'if' | 'else' | 'elseif';
        conditions?: any[];
        description?: string;
      }) => ReturnType;
    };
  }
}

export const ConditionalBlock = Node.create<ConditionalBlockOptions>({
  name: 'conditionalBlock',
  group: 'block',
  content: 'block+',
  selectable: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      type: {
        default: 'if',
        parseHTML: element => element.getAttribute('data-type') || 'if',
        renderHTML: attributes => {
          return {
            'data-type': attributes.type,
          };
        },
      },
      conditions: {
        default: [],
        parseHTML: element => {
          const conditions = element.getAttribute('data-conditions');
          return conditions ? JSON.parse(conditions) : [];
        },
        renderHTML: attributes => {
          return {
            'data-conditions': JSON.stringify(attributes.conditions),
          };
        },
      },
      description: {
        default: '',
        parseHTML: element => element.getAttribute('data-description'),
        renderHTML: attributes => {
          return {
            'data-description': attributes.description,
          };
        },
      },
      blockId: {
        default: null,
        parseHTML: element => element.getAttribute('data-block-id'),
        renderHTML: attributes => {
          return {
            'data-block-id': attributes.blockId,
          };
        },
      },
      visible: {
        default: true,
        parseHTML: element => element.getAttribute('data-visible') !== 'false',
        renderHTML: attributes => {
          return {
            'data-visible': attributes.visible,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-conditional-block]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-conditional-block': 'true' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ConditionalBlockView);
  },

  addCommands() {
    return {
      setConditionalBlock:
        (attributes = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Nội dung điều kiện...' }],
              },
            ],
          });
        },
    };
  },
});