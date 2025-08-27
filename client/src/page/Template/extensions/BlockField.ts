import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { BlockFieldView } from '../components/BlockFieldView';

export interface BlockFieldOptions {
  HTMLAttributes: Record<string, any>;
}

export const BlockField = Node.create<BlockFieldOptions>({
  name: 'blockField',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      key: {
        default: null,
        parseHTML: element => element.getAttribute('data-field-key'),
        renderHTML: attributes => {
          if (!attributes.key) {
            return {};
          }
          return {
            'data-field-key': attributes.key,
          };
        },
      },
      label: {
        default: null,
        parseHTML: element => element.getAttribute('data-field-label'),
        renderHTML: attributes => {
          if (!attributes.label) {
            return {};
          }
          return {
            'data-field-label': attributes.label,
          };
        },
      },
      type: {
        default: 'text',
        parseHTML: element => element.getAttribute('data-field-type'),
        renderHTML: attributes => {
          return {
            'data-field-type': attributes.type,
          };
        },
      },
      widget: {
        default: 'input',
        parseHTML: element => element.getAttribute('data-field-widget'),
        renderHTML: attributes => {
          return {
            'data-field-widget': attributes.widget,
          };
        },
      },
      format: {
        default: null,
        parseHTML: element => element.getAttribute('data-field-format'),
        renderHTML: attributes => {
          if (!attributes.format) {
            return {};
          }
          return {
            'data-field-format': attributes.format,
          };
        },
      },
      required: {
        default: false,
        parseHTML: element => element.getAttribute('data-field-required') === 'true',
        renderHTML: attributes => {
          return {
            'data-field-required': attributes.required,
          };
        },
      },
      placeholder: {
        default: null,
        parseHTML: element => element.getAttribute('data-field-placeholder'),
        renderHTML: attributes => {
          if (!attributes.placeholder) {
            return {};
          }
          return {
            'data-field-placeholder': attributes.placeholder,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-block-field]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-block-field': 'true',
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BlockFieldView);
  },

  addCommands() {
    return {
      setBlockField:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
      updateBlockField:
        (attributes) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attributes);
        },
    };
  },
});