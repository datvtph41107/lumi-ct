import { Node, mergeAttributes } from '@tiptap/core';

export interface LayoutContainerOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    layoutContainer: {
      /**
       * Add a layout container
       */
      setLayoutContainer: (attributes?: { 
        type?: 'two-column' | 'three-column' | 'grid'; 
        gap?: string;
        alignment?: 'left' | 'center' | 'right';
      }) => ReturnType;
      /**
       * Toggle a layout container
       */
      toggleLayoutContainer: (attributes?: { 
        type?: 'two-column' | 'three-column' | 'grid'; 
        gap?: string;
        alignment?: 'left' | 'center' | 'right';
      }) => ReturnType;
    };
  }
}

export const LayoutContainer = Node.create<LayoutContainerOptions>({
  name: 'layoutContainer',

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
      type: {
        default: 'two-column',
        parseHTML: element => element.getAttribute('data-layout-type') || 'two-column',
        renderHTML: attributes => {
          return {
            'data-layout-type': attributes.type,
          };
        },
      },
      gap: {
        default: '20px',
        parseHTML: element => element.getAttribute('data-layout-gap') || '20px',
        renderHTML: attributes => {
          return {
            'data-layout-gap': attributes.gap,
          };
        },
      },
      alignment: {
        default: 'left',
        parseHTML: element => element.getAttribute('data-layout-alignment') || 'left',
        renderHTML: attributes => {
          return {
            'data-layout-alignment': attributes.alignment,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="layout-container"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'layout-container' }), 0];
  },

  addCommands() {
    return {
      setLayoutContainer:
        attributes => ({ commands }) => {
          return commands.setNode(this.name, attributes);
        },
      toggleLayoutContainer:
        attributes => ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph', attributes);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-l': () => this.editor.commands.toggleLayoutContainer(),
    };
  },
});