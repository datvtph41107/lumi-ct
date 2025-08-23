import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import { VariableToken } from './extensions/variable-token';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBold,
    faItalic,
    faUnderline,
    faStrikethrough,
    faListUl,
    faListOl,
    faQuoteLeft,
    faCode,
    faUndo,
    faRedo,
    faAlignLeft,
    faAlignCenter,
    faAlignRight,
    faAlignJustify,
    faHeading,
    faParagraph,
    faTable,
    faLink,
    faUnlink,
    faImage,
    faSave,
    faEye
} from '@fortawesome/free-solid-svg-icons';
import Heading from '@tiptap/extension-heading';
import TextAlign from '@tiptap/extension-text-align';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import styles from './TemplateEditor.module.scss';

type Props = {
    value: string;
    onChange: (html: string, plainText: string) => void;
};

const TemplateEditor = ({ value, onChange }: Props) => {
    const [showFields, setShowFields] = useState(true);
    const [selectedField, setSelectedField] = useState<string>('');

    const editor = useEditor({
        extensions: [
            StarterKit,
            VariableToken,
            Heading.configure({
                levels: [1, 2, 3, 4, 5, 6]
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph']
            }),
            Table.configure({
                resizable: true
            }),
            TableRow,
            TableHeader,
            TableCell,
            Link.configure({
                openOnClick: false
            }),
            Image,
            Highlight,
            Color,
            TextStyle,
            FontFamily
        ],
        content: value || '<p></p>',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            const text = editor.getText();
            onChange(html, text);
        },
        editorProps: {
            attributes: {
                class: styles.editorContent
            }
        }
    });

    useEffect(() => {
        if (!editor) return;
        const current = editor.getHTML();
        if (current !== value) editor.commands.setContent(value || '<p></p>', false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    if (!editor) {
        return <div>Loading editor...</div>;
    }

    const insertField = (key: string, label: string) => {
        editor.chain().focus().insertVariable(key, label).run();
    };

    const addTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    const setLink = () => {
        const url = window.prompt('URL');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const fields = [
        { key: 'partyA.name', label: 'Bên A - Tên', category: 'party' },
        { key: 'partyA.address', label: 'Bên A - Địa chỉ', category: 'party' },
        { key: 'partyA.phone', label: 'Bên A - Điện thoại', category: 'party' },
        { key: 'partyA.email', label: 'Bên A - Email', category: 'party' },
        { key: 'partyB.name', label: 'Bên B - Tên', category: 'party' },
        { key: 'partyB.address', label: 'Bên B - Địa chỉ', category: 'party' },
        { key: 'partyB.phone', label: 'Bên B - Điện thoại', category: 'party' },
        { key: 'partyB.email', label: 'Bên B - Email', category: 'party' },
        { key: 'contract.startDate', label: 'Ngày bắt đầu', category: 'contract' },
        { key: 'contract.endDate', label: 'Ngày kết thúc', category: 'contract' },
        { key: 'contract.amount', label: 'Số tiền hợp đồng', category: 'contract' },
        { key: 'contract.currency', label: 'Đơn vị tiền tệ', category: 'contract' },
        { key: 'signature.date', label: 'Ngày ký', category: 'signature' },
        { key: 'signature.place', label: 'Nơi ký', category: 'signature' }
    ];

    const groupedFields = fields.reduce((acc, field) => {
        if (!acc[field.category]) {
            acc[field.category] = [];
        }
        acc[field.category].push(field);
        return acc;
    }, {} as Record<string, typeof fields>);

    return (
        <div className={styles.container}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.toolbarGroup}>
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`${styles.toolbarButton} ${editor.isActive('bold') ? styles.active : ''}`}
                        title="Bold"
                    >
                        <FontAwesomeIcon icon={faBold} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`${styles.toolbarButton} ${editor.isActive('italic') ? styles.active : ''}`}
                        title="Italic"
                    >
                        <FontAwesomeIcon icon={faItalic} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={`${styles.toolbarButton} ${editor.isActive('underline') ? styles.active : ''}`}
                        title="Underline"
                    >
                        <FontAwesomeIcon icon={faUnderline} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`${styles.toolbarButton} ${editor.isActive('strike') ? styles.active : ''}`}
                        title="Strikethrough"
                    >
                        <FontAwesomeIcon icon={faStrikethrough} />
                    </button>
                </div>

                <div className={styles.toolbarGroup}>
                    <select
                        className={styles.headingSelect}
                        onChange={(e) => {
                            const level = parseInt(e.target.value);
                            if (level === 0) {
                                editor.chain().focus().setParagraph().run();
                            } else {
                                editor.chain().focus().toggleHeading({ level }).run();
                            }
                        }}
                        value={
                            editor.isActive('heading', { level: 1 }) ? '1' :
                            editor.isActive('heading', { level: 2 }) ? '2' :
                            editor.isActive('heading', { level: 3 }) ? '3' :
                            editor.isActive('heading', { level: 4 }) ? '4' :
                            editor.isActive('heading', { level: 5 }) ? '5' :
                            editor.isActive('heading', { level: 6 }) ? '6' : '0'
                        }
                    >
                        <option value="0">Paragraph</option>
                        <option value="1">Heading 1</option>
                        <option value="2">Heading 2</option>
                        <option value="3">Heading 3</option>
                        <option value="4">Heading 4</option>
                        <option value="5">Heading 5</option>
                        <option value="6">Heading 6</option>
                    </select>
                </div>

                <div className={styles.toolbarGroup}>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'left' }) ? styles.active : ''}`}
                        title="Align Left"
                    >
                        <FontAwesomeIcon icon={faAlignLeft} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'center' }) ? styles.active : ''}`}
                        title="Align Center"
                    >
                        <FontAwesomeIcon icon={faAlignCenter} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'right' }) ? styles.active : ''}`}
                        title="Align Right"
                    >
                        <FontAwesomeIcon icon={faAlignRight} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'justify' }) ? styles.active : ''}`}
                        title="Justify"
                    >
                        <FontAwesomeIcon icon={faAlignJustify} />
                    </button>
                </div>

                <div className={styles.toolbarGroup}>
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`${styles.toolbarButton} ${editor.isActive('bulletList') ? styles.active : ''}`}
                        title="Bullet List"
                    >
                        <FontAwesomeIcon icon={faListUl} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`${styles.toolbarButton} ${editor.isActive('orderedList') ? styles.active : ''}`}
                        title="Numbered List"
                    >
                        <FontAwesomeIcon icon={faListOl} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`${styles.toolbarButton} ${editor.isActive('blockquote') ? styles.active : ''}`}
                        title="Quote"
                    >
                        <FontAwesomeIcon icon={faQuoteLeft} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        className={`${styles.toolbarButton} ${editor.isActive('codeBlock') ? styles.active : ''}`}
                        title="Code Block"
                    >
                        <FontAwesomeIcon icon={faCode} />
                    </button>
                </div>

                <div className={styles.toolbarGroup}>
                    <button
                        onClick={addTable}
                        className={styles.toolbarButton}
                        title="Insert Table"
                    >
                        <FontAwesomeIcon icon={faTable} />
                    </button>
                    <button
                        onClick={setLink}
                        className={`${styles.toolbarButton} ${editor.isActive('link') ? styles.active : ''}`}
                        title="Insert Link"
                    >
                        <FontAwesomeIcon icon={faLink} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().unsetLink().run()}
                        className={styles.toolbarButton}
                        title="Remove Link"
                    >
                        <FontAwesomeIcon icon={faUnlink} />
                    </button>
                </div>

                <div className={styles.toolbarGroup}>
                    <button
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        className={styles.toolbarButton}
                        title="Undo"
                    >
                        <FontAwesomeIcon icon={faUndo} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        className={styles.toolbarButton}
                        title="Redo"
                    >
                        <FontAwesomeIcon icon={faRedo} />
                    </button>
                </div>
            </div>

            <div className={styles.mainContent}>
                {/* Editor */}
                <div className={styles.editorWrapper}>
                    <div className={styles.editorHeader}>
                        <h3>Soạn thảo template</h3>
                        <div className={styles.editorActions}>
                            <button className={styles.actionButton}>
                                <FontAwesomeIcon icon={faSave} />
                                Lưu
                            </button>
                            <button className={styles.actionButton}>
                                <FontAwesomeIcon icon={faEye} />
                                Xem trước
                            </button>
                        </div>
                    </div>
                    <div className={styles.editorContainer}>
                        <EditorContent editor={editor} />
                    </div>
                </div>

                {/* Fields Panel */}
                <div className={`${styles.fieldsPanel} ${showFields ? styles.show : ''}`}>
                    <div className={styles.fieldsHeader}>
                        <h3>Trường dữ liệu</h3>
                        <button
                            className={styles.toggleButton}
                            onClick={() => setShowFields(!showFields)}
                        >
                            {showFields ? '−' : '+'}
                        </button>
                    </div>
                    
                    {showFields && (
                        <div className={styles.fieldsContent}>
                            {Object.entries(groupedFields).map(([category, categoryFields]) => (
                                <div key={category} className={styles.fieldCategory}>
                                    <h4 className={styles.categoryTitle}>
                                        {category === 'party' ? 'Thông tin bên' :
                                         category === 'contract' ? 'Thông tin hợp đồng' :
                                         category === 'signature' ? 'Chữ ký' : category}
                                    </h4>
                                    <div className={styles.fieldList}>
                                        {categoryFields.map((field) => (
                                            <button
                                                key={field.key}
                                                className={`${styles.fieldButton} ${selectedField === field.key ? styles.selected : ''}`}
                                                onClick={() => {
                                                    insertField(field.key, field.label);
                                                    setSelectedField(field.key);
                                                }}
                                                title={field.label}
                                            >
                                                {field.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TemplateEditor;
