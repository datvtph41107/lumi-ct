import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        variableToken: {
            insertVariable: (key: string, label?: string) => ReturnType;
        };
    }
}

export const VariableToken = Node.create({
    name: 'variableToken',
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,
    draggable: false,

    addAttributes() {
        return {
            key: {
                default: '',
                parseHTML: (el) => (el as HTMLElement).getAttribute('data-var') || '',
                renderHTML: (attrs) => ({ 'data-var': attrs.key }),
            },
            label: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-var]',
            },
        ];
    },

    renderHTML({ HTMLAttributes, node }) {
        const key = node.attrs.key as string;
        const label = (node.attrs.label as string) || key;
        return [
            'span',
            mergeAttributes(HTMLAttributes, {
                class: 'var-chip',
                'data-var': key,
                style: 'display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:6px;background:#eef2ff;color:#3730a3;font-size:12px;border:1px solid #c7d2fe;',
            }),
            `{{${label}}}`,
        ];
    },

    addCommands() {
        return {
            insertVariable:
                (key: string, label?: string) =>
                ({ chain }) => {
                    return chain()
                        .focus()
                        .insertContent({ type: this.name, attrs: { key, label: label || key } })
                        .run();
                },
        };
    },
});
