import { Node, mergeAttributes } from '@tiptap/core';

export interface ClauseBlockOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    clauseBlock: {
      /**
       * Add a clause block
       */
      setClauseBlock: (attributes?: { id?: string; title?: string; locked?: boolean; required?: boolean }) => ReturnType;
      /**
       * Toggle a clause block
       */
      toggleClauseBlock: (attributes?: { id?: string; title?: string; locked?: boolean; required?: boolean }) => ReturnType;
    };
  }
}

export const ClauseBlock = Node.create<ClauseBlockOptions>({
  name: 'clauseBlock',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  content: 'block+',

  defining: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-clause-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {};
          }

          return {
            'data-clause-id': attributes.id,
          };
        },
      },
      title: {
        default: 'Điều khoản',
        parseHTML: element => element.getAttribute('data-clause-title'),
        renderHTML: attributes => {
          return {
            'data-clause-title': attributes.title,
          };
        },
      },
      locked: {
        default: false,
        parseHTML: element => element.getAttribute('data-clause-locked') === 'true',
        renderHTML: attributes => {
          return {
            'data-clause-locked': attributes.locked,
          };
        },
      },
      required: {
        default: false,
        parseHTML: element => element.getAttribute('data-clause-required') === 'true',
        renderHTML: attributes => {
          return {
            'data-clause-required': attributes.required,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="clause-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'clause-block' }), 0];
  },

  addCommands() {
    return {
      setClauseBlock:
        attributes => ({ commands }) => {
          return commands.setNode(this.name, attributes);
        },
      toggleClauseBlock:
        attributes => ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph', attributes);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-c': () => this.editor.commands.toggleClauseBlock(),
    };
  },
});