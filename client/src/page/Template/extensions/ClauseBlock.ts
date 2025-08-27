import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ClauseBlockView } from '../components/ClauseBlockView';

export interface ClauseBlockOptions {
  HTMLAttributes: Record<string, any>;
}

export const ClauseBlock = Node.create<ClauseBlockOptions>({
  name: 'clauseBlock',
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
      title: {
        default: 'Điều khoản',
        parseHTML: element => element.getAttribute('data-clause-title'),
        renderHTML: attributes => {
          return {
            'data-clause-title': attributes.title,
          };
        },
      },
      number: {
        default: null,
        parseHTML: element => element.getAttribute('data-clause-number'),
        renderHTML: attributes => {
          if (!attributes.number) {
            return {};
          }
          return {
            'data-clause-number': attributes.number,
          };
        },
      },
      visibleIf: {
        default: null,
        parseHTML: element => element.getAttribute('data-clause-visible-if'),
        renderHTML: attributes => {
          if (!attributes.visibleIf) {
            return {};
          }
          return {
            'data-clause-visible-if': attributes.visibleIf,
          };
        },
      },
      collapsed: {
        default: false,
        parseHTML: element => element.getAttribute('data-clause-collapsed') === 'true',
        renderHTML: attributes => {
          return {
            'data-clause-collapsed': attributes.collapsed,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-clause-block]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-clause-block': 'true',
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ClauseBlockView);
  },

  addCommands() {
    return {
      setClauseBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Nội dung điều khoản...',
                  },
                ],
              },
            ],
          });
        },
      updateClauseBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attributes);
        },
      toggleClauseCollapse:
        () =>
        ({ commands, editor }) => {
          const { selection } = editor.state;
          const node = editor.state.doc.nodeAt(selection.from);
          
          if (node && node.type.name === this.name) {
            const currentCollapsed = node.attrs.collapsed;
            return commands.updateAttributes(this.name, {
              collapsed: !currentCollapsed,
            });
          }
          
          return false;
        },
    };
  },
});