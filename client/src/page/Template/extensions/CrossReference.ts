import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CrossReferenceView } from '../components/CrossReferenceView';

export interface CrossReferenceOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    crossReference: {
      setCrossReference: (attributes: { 
        targetId: string;
        targetType: 'clause' | 'table' | 'section';
        text?: string;
        customText?: string;
      }) => ReturnType;
    };
  }
}

export const CrossReference = Node.create<CrossReferenceOptions>({
  name: 'crossReference',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      targetId: {
        default: null,
        parseHTML: element => element.getAttribute('data-target-id'),
        renderHTML: attributes => {
          return {
            'data-target-id': attributes.targetId,
          };
        },
      },
      targetType: {
        default: 'clause',
        parseHTML: element => element.getAttribute('data-target-type') || 'clause',
        renderHTML: attributes => {
          return {
            'data-target-type': attributes.targetType,
          };
        },
      },
      text: {
        default: '',
        parseHTML: element => element.getAttribute('data-text'),
        renderHTML: attributes => {
          return {
            'data-text': attributes.text,
          };
        },
      },
      customText: {
        default: '',
        parseHTML: element => element.getAttribute('data-custom-text'),
        renderHTML: attributes => {
          return {
            'data-custom-text': attributes.customText,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-cross-reference]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-cross-reference': 'true' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CrossReferenceView);
  },

  addCommands() {
    return {
      setCrossReference:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },
});