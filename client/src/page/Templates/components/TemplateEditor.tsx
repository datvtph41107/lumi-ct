import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import { VariableToken } from './extensions/variable-token';
import { ClauseBlock } from './extensions/clause-block';
import { SignatureBlock } from './extensions/signature-block';
import { LayoutContainer } from './extensions/layout-container';
import { PlaceholderPanel } from './PlaceholderPanel';
import { Toolbar } from './Toolbar';
import styles from './TemplateEditor.module.scss';

type Props = {
    value: string;
    onChange: (html: string, plainText: string) => void;
    fields?: Array<{ key: string; label: string; type: string }>;
    onSave?: () => void;
    onPreview?: () => void;
};

const TemplateEditor = ({ value, onChange, fields = [], onSave, onPreview }: Props) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            VariableToken,
            ClauseBlock,
            SignatureBlock,
            LayoutContainer,
        ],
        content: value || '<p></p>',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            const text = editor.getText();
            onChange(html, text);
        },
        editorProps: {
            attributes: {
                class: styles.editorContent,
            },
        },
    });

    useEffect(() => {
        if (!editor) return;
        const current = editor.getHTML();
        if (current !== value) {
            editor.commands.setContent(value || '<p></p>', false);
        }
    }, [value, editor]);

    const insertVariable = (key: string, label?: string) => {
        if (!editor) return;
        editor.chain().focus().insertVariable(key, label).run();
    };

    const insertClause = () => {
        if (!editor) return;
        editor.chain().focus().setClauseBlock({
            id: `clause-${Date.now()}`,
            title: 'Điều khoản mới',
            locked: false,
            required: false,
        }).run();
    };

    const insertSignature = () => {
        if (!editor) return;
        editor.chain().focus().setSignatureBlock({
            sides: ['partyA', 'partyB'],
            labels: ['Bên A', 'Bên B'],
            positions: ['left', 'right'],
            showDate: true,
        }).run();
    };

    const insertLayout = (type: 'two-column' | 'three-column' | 'grid' = 'two-column') => {
        if (!editor) return;
        editor.chain().focus().setLayoutContainer({
            type,
            gap: '20px',
            alignment: 'left',
        }).run();
    };

    if (!editor) {
        return <div>Loading editor...</div>;
    }

    return (
        <div className={`${styles.templateEditor} ${isFullscreen ? styles.fullscreen : ''}`}>
            {/* Toolbar */}
            <Toolbar 
                editor={editor}
                onSave={onSave}
                onPreview={onPreview}
                onFullscreen={() => setIsFullscreen(!isFullscreen)}
                isFullscreen={isFullscreen}
                onInsertClause={insertClause}
                onInsertSignature={insertSignature}
                onInsertLayout={insertLayout}
            />

            <div className={styles.editorContainer}>
                {/* Main Editor */}
                <div className={styles.editorMain}>
                    <EditorContent editor={editor} />
                </div>

                {/* Right Sidebar */}
                <div className={styles.editorSidebar}>
                    <PlaceholderPanel 
                        fields={fields}
                        onInsertVariable={insertVariable}
                        onInsertClause={insertClause}
                        onInsertSignature={insertSignature}
                        onInsertLayout={insertLayout}
                    />
                </div>
            </div>
        </div>
    );
};

export default TemplateEditor;
