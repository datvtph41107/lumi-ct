import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { SignatureBlockView } from '../components/SignatureBlockView';

export interface SignatureBlockOptions {
  HTMLAttributes: Record<string, any>;
}

export const SignatureBlock = Node.create<SignatureBlockOptions>({
  name: 'signatureBlock',
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
      parties: {
        default: ['A', 'B'],
        parseHTML: element => {
          const parties = element.getAttribute('data-signature-parties');
          return parties ? JSON.parse(parties) : ['A', 'B'];
        },
        renderHTML: attributes => {
          return {
            'data-signature-parties': JSON.stringify(attributes.parties),
          };
        },
      },
      signatureType: {
        default: 'digital', // 'digital' | 'manual' | 'both'
        parseHTML: element => element.getAttribute('data-signature-type'),
        renderHTML: attributes => {
          return {
            'data-signature-type': attributes.signatureType,
          };
        },
      },
      date: {
        default: null,
        parseHTML: element => element.getAttribute('data-signature-date'),
        renderHTML: attributes => {
          if (!attributes.date) {
            return {};
          }
          return {
            'data-signature-date': attributes.date,
          };
        },
      },
      location: {
        default: null,
        parseHTML: element => element.getAttribute('data-signature-location'),
        renderHTML: attributes => {
          if (!attributes.location) {
            return {};
          }
          return {
            'data-signature-location': attributes.location,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-signature-block]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-signature-block': 'true',
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SignatureBlockView);
  },

  addCommands() {
    return {
      setSignatureBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
      updateSignatureBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attributes);
        },
    };
  },
});