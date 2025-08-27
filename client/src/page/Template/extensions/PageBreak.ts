import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { PageBreakView } from '../components/PageBreakView';

export interface PageBreakOptions {
  HTMLAttributes: Record<string, any>;
}

export const PageBreak = Node.create<PageBreakOptions>({
  name: 'pageBreak',
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
      type: {
        default: 'page', // 'page' | 'section'
        parseHTML: element => element.getAttribute('data-break-type'),
        renderHTML: attributes => {
          return {
            'data-break-type': attributes.type,
          };
        },
      },
      title: {
        default: null,
        parseHTML: element => element.getAttribute('data-break-title'),
        renderHTML: attributes => {
          if (!attributes.title) {
            return {};
          }
          return {
            'data-break-title': attributes.title,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-page-break]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-page-break': 'true',
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PageBreakView);
  },

  addCommands() {
    return {
      setPageBreak:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
      updatePageBreak:
        (attributes) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attributes);
        },
    };
  },
});