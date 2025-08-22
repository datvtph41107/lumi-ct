import { Node, mergeAttributes } from '@tiptap/core';

export interface SignatureBlockOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    signatureBlock: {
      /**
       * Add a signature block
       */
      setSignatureBlock: (attributes?: { 
        sides?: string[]; 
        labels?: string[]; 
        positions?: string[];
        showDate?: boolean;
      }) => ReturnType;
      /**
       * Toggle a signature block
       */
      toggleSignatureBlock: (attributes?: { 
        sides?: string[]; 
        labels?: string[]; 
        positions?: string[];
        showDate?: boolean;
      }) => ReturnType;
    };
  }
}

export const SignatureBlock = Node.create<SignatureBlockOptions>({
  name: 'signatureBlock',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  content: '',

  defining: true,

  addAttributes() {
    return {
      sides: {
        default: ['partyA', 'partyB'],
        parseHTML: element => {
          const sides = element.getAttribute('data-signature-sides');
          return sides ? sides.split(',') : ['partyA', 'partyB'];
        },
        renderHTML: attributes => {
          return {
            'data-signature-sides': attributes.sides.join(','),
          };
        },
      },
      labels: {
        default: ['Bên A', 'Bên B'],
        parseHTML: element => {
          const labels = element.getAttribute('data-signature-labels');
          return labels ? labels.split(',') : ['Bên A', 'Bên B'];
        },
        renderHTML: attributes => {
          return {
            'data-signature-labels': attributes.labels.join(','),
          };
        },
      },
      positions: {
        default: ['left', 'right'],
        parseHTML: element => {
          const positions = element.getAttribute('data-signature-positions');
          return positions ? positions.split(',') : ['left', 'right'];
        },
        renderHTML: attributes => {
          return {
            'data-signature-positions': attributes.positions.join(','),
          };
        },
      },
      showDate: {
        default: true,
        parseHTML: element => element.getAttribute('data-signature-show-date') === 'true',
        renderHTML: attributes => {
          return {
            'data-signature-show-date': attributes.showDate,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="signature-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'signature-block' }), 0];
  },

  addCommands() {
    return {
      setSignatureBlock:
        attributes => ({ commands }) => {
          return commands.setNode(this.name, attributes);
        },
      toggleSignatureBlock:
        attributes => ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph', attributes);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-s': () => this.editor.commands.toggleSignatureBlock(),
    };
  },
});