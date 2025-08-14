import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Code from '@tiptap/extension-code';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Blockquote from '@tiptap/extension-blockquote';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBold, 
    faItalic, 
    faStrikethrough,
    faCode,
    faListUl,
    faListOl,
    faQuoteLeft,
    faMinus,
    faTable,
    faUndo,
    faRedo,
    faSave,
    faEye,
    faPrint,
    faDownload,
    faLightbulb,
    faBook,
    faMagic,
    faCog,
    faHistory,
    faComments
} from '@fortawesome/free-solid-svg-icons';
import { useContractDraftStore } from '~/store/contract-draft-store';
import { useAutoSave } from '~/hooks/useAutoSave';
import SidebarLeft from './SidebarLeft/SidebarLeft';
import SidebarRight from './SidebarRight/SidebarRight';
import styles from './EditorPage.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface EditorPageProps {
    contractId: string;
    currentUserId: number;
}

const EditorPage: React.FC<EditorPageProps> = ({ contractId, currentUserId }) => {
    const { currentDraft, updateDraftData, performAutoSave } = useContractDraftStore();
    const [showLeftSidebar, setShowLeftSidebar] = useState(true);
    const [showRightSidebar, setShowRightSidebar] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [currentSuggestion, setCurrentSuggestion] = useState<string>('');

    // Auto-save hook
    useAutoSave();

    // TipTap Editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            Document,
            Paragraph,
            Text,
            Heading.configure({
                levels: [1, 2, 3, 4, 5, 6],
            }),
            Bold,
            Italic,
            Strike,
            Code,
            BulletList,
            OrderedList,
            ListItem,
            Blockquote,
            HorizontalRule,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: currentDraft?.content || '',
        onUpdate: ({ editor }) => {
            const content = editor.getHTML();
            updateDraftData('content', content);
        },
        editorProps: {
            attributes: {
                class: cx('editor-content'),
            },
        },
    });

    // Contract structure suggestions
    const contractSuggestions = [
        {
            title: 'Phần mở đầu',
            content: `
                <h1>HỢP ĐỒNG LAO ĐỘNG</h1>
                <p>Số: <strong>__/__/____</strong></p>
                <p>Ngày: <strong>__/__/____</strong></p>
            `
        },
        {
            title: 'Thông tin các bên',
            content: `
                <h2>ĐIỀU 1: THÔNG TIN CÁC BÊN</h2>
                <h3>1.1. Bên A (Người sử dụng lao động):</h3>
                <p>Tên công ty: <strong>________________</strong></p>
                <p>Địa chỉ: <strong>________________</strong></p>
                <p>Mã số thuế: <strong>________________</strong></p>
                <p>Người đại diện: <strong>________________</strong></p>
                
                <h3>1.2. Bên B (Người lao động):</h3>
                <p>Họ và tên: <strong>________________</strong></p>
                <p>Ngày sinh: <strong>________________</strong></p>
                <p>CMND/CCCD: <strong>________________</strong></p>
                <p>Địa chỉ: <strong>________________</strong></p>
            `
        },
        {
            title: 'Nội dung công việc',
            content: `
                <h2>ĐIỀU 2: NỘI DUNG CÔNG VIỆC</h2>
                <p>Bên B được thuê làm công việc: <strong>________________</strong></p>
                <p>Mô tả công việc:</p>
                <ul>
                    <li>________________</li>
                    <li>________________</li>
                    <li>________________</li>
                </ul>
            `
        },
        {
            title: 'Thời gian làm việc',
            content: `
                <h2>ĐIỀU 3: THỜI GIAN LÀM VIỆC</h2>
                <p>Thời gian thử việc: <strong>________________</strong></p>
                <p>Thời gian làm việc chính thức: <strong>________________</strong></p>
                <p>Giờ làm việc: <strong>________________</strong></p>
            `
        },
        {
            title: 'Lương và phụ cấp',
            content: `
                <h2>ĐIỀU 4: LƯƠNG VÀ PHỤ CẤP</h2>
                <p>Mức lương cơ bản: <strong>________________</strong></p>
                <p>Phụ cấp: <strong>________________</strong></p>
                <p>Hình thức trả lương: <strong>________________</strong></p>
            `
        },
        {
            title: 'Quyền và nghĩa vụ',
            content: `
                <h2>ĐIỀU 5: QUYỀN VÀ NGHĨA VỤ</h2>
                <h3>5.1. Quyền và nghĩa vụ của Bên A:</h3>
                <ul>
                    <li>________________</li>
                    <li>________________</li>
                </ul>
                
                <h3>5.2. Quyền và nghĩa vụ của Bên B:</h3>
                <ul>
                    <li>________________</li>
                    <li>________________</li>
                </ul>
            `
        },
        {
            title: 'Điều khoản chung',
            content: `
                <h2>ĐIỀU 6: ĐIỀU KHOẢN CHUNG</h2>
                <p>Hợp đồng này có hiệu lực từ ngày <strong>________________</strong></p>
                <p>Hợp đồng được lập thành <strong>____</strong> bản, mỗi bên giữ <strong>____</strong> bản có giá trị pháp lý như nhau.</p>
                
                <p><strong>BÊN A (Người sử dụng lao động)</strong></p>
                <p>Chữ ký: ________________</p>
                
                <p><strong>BÊN B (Người lao động)</strong></p>
                <p>Chữ ký: ________________</p>
            `
        }
    ];

    // Smart suggestions based on current content
    const getSmartSuggestions = useCallback(() => {
        if (!editor) return [];
        
        const content = editor.getHTML();
        const suggestions = [];
        
        if (!content.includes('HỢP ĐỒNG')) {
            suggestions.push(contractSuggestions[0]);
        }
        
        if (!content.includes('THÔNG TIN CÁC BÊN')) {
            suggestions.push(contractSuggestions[1]);
        }
        
        if (!content.includes('NỘI DUNG CÔNG VIỆC')) {
            suggestions.push(contractSuggestions[2]);
        }
        
        if (!content.includes('THỜI GIAN LÀM VIỆC')) {
            suggestions.push(contractSuggestions[3]);
        }
        
        if (!content.includes('LƯƠNG VÀ PHỤ CẤP')) {
            suggestions.push(contractSuggestions[4]);
        }
        
        return suggestions;
    }, [editor]);

    const insertSuggestion = (suggestion: any) => {
        if (editor) {
            editor.commands.insertContent(suggestion.content);
            setShowSuggestions(false);
        }
    };

    const insertTable = () => {
        if (editor) {
            editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true });
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        if (!isFullscreen) {
            setShowLeftSidebar(false);
            setShowRightSidebar(false);
        }
    };

    const handleSave = async () => {
        try {
            await performAutoSave();
        } catch (error) {
            console.error('Error saving:', error);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        if (editor) {
            const content = editor.getHTML();
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `contract-${contractId}.html`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    if (!editor) {
        return <div className={cx('loading')}>Đang tải editor...</div>;
    }

    return (
        <div className={cx('editor-page', { fullscreen: isFullscreen })}>
            {/* Top Toolbar */}
            <div className={cx('top-toolbar')}>
                <div className={cx('toolbar-left')}>
                    <button
                        className={cx('toolbar-btn')}
                        onClick={() => setShowLeftSidebar(!showLeftSidebar)}
                        title="Toggle left sidebar"
                    >
                        <FontAwesomeIcon icon={faBook} />
                    </button>
                    
                    <button
                        className={cx('toolbar-btn')}
                        onClick={() => setShowSuggestions(!showSuggestions)}
                        title="Smart suggestions"
                    >
                        <FontAwesomeIcon icon={faLightbulb} />
                    </button>
                    
                    <button
                        className={cx('toolbar-btn')}
                        onClick={handleSave}
                        title="Save (Ctrl+S)"
                    >
                        <FontAwesomeIcon icon={faSave} />
                    </button>
                </div>
                
                <div className={cx('toolbar-center')}>
                    <button
                        className={cx('toolbar-btn', { active: editor.isActive('bold') })}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        title="Bold (Ctrl+B)"
                    >
                        <FontAwesomeIcon icon={faBold} />
                    </button>
                    
                    <button
                        className={cx('toolbar-btn', { active: editor.isActive('italic') })}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        title="Italic (Ctrl+I)"
                    >
                        <FontAwesomeIcon icon={faItalic} />
                    </button>
                    
                    <button
                        className={cx('toolbar-btn', { active: editor.isActive('strike') })}
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        title="Strikethrough"
                    >
                        <FontAwesomeIcon icon={faStrikethrough} />
                    </button>
                    
                    <button
                        className={cx('toolbar-btn', { active: editor.isActive('code') })}
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        title="Code"
                    >
                        <FontAwesomeIcon icon={faCode} />
                    </button>
                    
                    <div className={cx('toolbar-separator')}></div>
                    
                    <button
                        className={cx('toolbar-btn')}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        title="Bullet list"
                    >
                        <FontAwesomeIcon icon={faListUl} />
                    </button>
                    
                    <button
                        className={cx('toolbar-btn')}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        title="Numbered list"
                    >
                        <FontAwesomeIcon icon={faListOl} />
                    </button>
                    
                    <button
                        className={cx('toolbar-btn')}
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        title="Quote"
                    >
                        <FontAwesomeIcon icon={faQuoteLeft} />
                    </button>
                    
                    <button
                        className={cx('toolbar-btn')}
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        title="Horizontal rule"
                    >
                        <FontAwesomeIcon icon={faMinus} />
                    </button>
                    
                    <button
                        className={cx('toolbar-btn')}
                        onClick={insertTable}
                        title="Insert table"
                    >
                        <FontAwesomeIcon icon={faTable} />
                    </button>
                    
                    <div className={cx('toolbar-separator')}></div>
                    
                    <button
                        className={cx('toolbar-btn')}
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Undo (Ctrl+Z)"
                    >
                        <FontAwesomeIcon icon={faUndo} />
                    </button>
                    
                    <button
                        className={cx('toolbar-btn')}
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Redo (Ctrl+Y)"
                    >
                        <FontAwesomeIcon icon={faRedo} />
                    </button>
                </div>
                
                <div className={cx('toolbar-right')}>
                    <button
                        className={cx('toolbar-btn')}
                        onClick={handlePrint}
                        title="Print"
                    >
                        <FontAwesomeIcon icon={faPrint} />
                    </button>
                    
                    <button
                        className={cx('toolbar-btn')}
                        onClick={handleExport}
                        title="Export"
                    >
                        <FontAwesomeIcon icon={faDownload} />
                    </button>
                    
                    <button
                        className={cx('toolbar-btn')}
                        onClick={() => setShowRightSidebar(!showRightSidebar)}
                        title="Toggle right sidebar"
                    >
                        <FontAwesomeIcon icon={faCog} />
                    </button>
                    
                    <button
                        className={cx('toolbar-btn')}
                        onClick={toggleFullscreen}
                        title="Toggle fullscreen"
                    >
                        <FontAwesomeIcon icon={faEye} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className={cx('main-content')}>
                {/* Left Sidebar */}
                {showLeftSidebar && (
                    <SidebarLeft
                        suggestions={getSmartSuggestions()}
                        onInsertSuggestion={insertSuggestion}
                        onToggleSuggestions={() => setShowSuggestions(!showSuggestions)}
                    />
                )}

                {/* Editor Area */}
                <div className={cx('editor-area')}>
                    <div className={cx('editor-container')}>
                        <EditorContent editor={editor} />
                    </div>
                    
                    {/* Smart Suggestions Panel */}
                    {showSuggestions && (
                        <div className={cx('suggestions-panel')}>
                            <div className={cx('suggestions-header')}>
                                <h3>
                                    <FontAwesomeIcon icon={faMagic} />
                                    Gợi ý thông minh
                                </h3>
                                <button
                                    className={cx('close-suggestions')}
                                    onClick={() => setShowSuggestions(false)}
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className={cx('suggestions-list')}>
                                {getSmartSuggestions().map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className={cx('suggestion-item')}
                                        onClick={() => insertSuggestion(suggestion)}
                                    >
                                        <h4>{suggestion.title}</h4>
                                        <p>Click để chèn vào vị trí con trỏ</p>
                                    </div>
                                ))}
                                
                                {getSmartSuggestions().length === 0 && (
                                    <div className={cx('no-suggestions')}>
                                        <p>Không có gợi ý nào cho nội dung hiện tại</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                {showRightSidebar && (
                    <SidebarRight
                        editor={editor}
                        contractId={contractId}
                        currentUserId={currentUserId}
                    />
                )}
            </div>

            {/* Status Bar */}
            <div className={cx('status-bar')}>
                <div className={cx('status-left')}>
                    <span>Ký tự: {editor.storage.characterCount?.characters() || 0}</span>
                    <span>Từ: {editor.storage.characterCount?.words() || 0}</span>
                </div>
                
                <div className={cx('status-right')}>
                    <span>
                        <FontAwesomeIcon icon={faHistory} />
                        Lưu tự động: {currentDraft?.lastAutoSave ? 
                            new Date(currentDraft.lastAutoSave).toLocaleTimeString() : 
                            'Chưa lưu'
                        }
                    </span>
                </div>
            </div>
        </div>
    );
};

export default EditorPage;
