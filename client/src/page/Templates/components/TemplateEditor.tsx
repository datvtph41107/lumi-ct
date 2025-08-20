import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import { VariableToken } from './extensions/variable-token';

type Props = {
    value: string;
    onChange: (html: string, plainText: string) => void;
};

const TemplateEditor = ({ value, onChange }: Props) => {
    const editor = useEditor({
        extensions: [StarterKit, VariableToken],
        content: value || '<p></p>',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            const text = editor.getText();
            onChange(html, text);
        },
    });

    useEffect(() => {
        if (!editor) return;
        const current = editor.getHTML();
        if (current !== value) editor.commands.setContent(value || '<p></p>', false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (
        <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                <EditorContent editor={editor} />
            </div>
            <div style={{ width: 300 }}>
                <PlaceholderPanel editor={editor} />
            </div>
        </div>
    );
};

export default TemplateEditor;

// Minimal placeholder panel; will be replaced by full-featured designer
const PlaceholderPanel = ({ editor }: { editor: any }) => {
    const fields = [
        { key: 'partyA.name', label: 'Bên A - Tên' },
        { key: 'partyB.name', label: 'Bên B - Tên' },
    ];
    const insert = (key: string, label?: string) => {
        if (!editor) return;
        editor.chain().focus().insertVariable(key, label).run();
    };
    return (
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Fields</div>
            {fields.map((f) => (
                <button key={f.key} onClick={() => insert(f.key, f.label)} style={{ display: 'block', width: '100%' }}>
                    {f.label || f.key}
                </button>
            ))}
        </div>
    );
};
