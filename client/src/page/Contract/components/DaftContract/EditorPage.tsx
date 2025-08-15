// import classNames from "classnames/bind";
// import styles from "./EditorPage.module.scss";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faCirclePlus, faCopy, faUpDownLeftRight, faTrashCan } from "@fortawesome/free-solid-svg-icons";
// import { Editor } from "~/components/Editor/Editor";

// const cx = classNames.bind(styles);

// const EditorPage = () => {
//     return (
//         <>
//             {/* Tag Page */}
//             <div className={cx("editor-control-group")}>
//                 <div className={cx("page-tag")}>Page 1</div>
//                 <div className={cx("page-control")}>
//                     <div className={cx("page-control_box", "box_left")}>
//                         <FontAwesomeIcon icon={faCirclePlus} />
//                     </div>
//                     <div className={cx("page-control_box")}>
//                         <FontAwesomeIcon icon={faCopy} />
//                     </div>
//                     <div className={cx("page-control_box")}>
//                         <FontAwesomeIcon icon={faUpDownLeftRight} />
//                     </div>
//                     <div className={cx("page-control_box", "box_right")}>
//                         <FontAwesomeIcon icon={faTrashCan} />
//                     </div>
//                 </div>
//             </div>
//             <div className={cx("page-wrapper")}>
//                 <Editor />
//             </div>
//         </>
//     );
// };

// export default EditorPage;
import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
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
    faLink,
    faUnlink,
    faImage,
    faTable,
    faUndo,
    faRedo,
    faSave,
    faPrint,
    faDownload,
    faEye,
    faSpinner,
    faLightbulb,
    faCheckCircle,
    faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { useAutoSave } from '~/hooks/useAutoSave';
import { useContractDraftStore } from '~/store/contract-draft-store';
import { contractService } from '~/services/api/contract.service';
// TODO: Wire real toolbar and sidebar once available
const EditorToolbar: React.FC<{ editor: any }> = () => null;
const EditorSidebar: React.FC<{ template?: any; onInsertSection: (t: string) => void; onInsertTemplate: (c: string) => void }> = () => null;
const SmartSuggestions: React.FC<{ suggestions: string[]; onApply: (s: string) => void }> = () => null;
const ExportModal: React.FC<{ onExport: (f: string) => void; onClose: () => void }> = () => null;
const PrintModal: React.FC<{ content: string; onClose: () => void }> = () => null;
import styles from './EditorPage.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface EditorPageProps {
    initialContent?: string;
    template?: any;
    onSave?: (content: string) => void;
    onExport?: (format: string) => void;
}

const EditorPage: React.FC<EditorPageProps> = ({ initialContent = '', template, onSave, onExport }) => {
    const { setDirty, currentDraft } = useContractDraftStore();
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Auto-save hook
    useAutoSave(currentDraft?.id, undefined, { enabled: !!currentDraft });

    // TipTap Editor Configuration
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Bắt đầu soạn thảo hợp đồng của bạn...',
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Link.configure({
                openOnClick: false,
            }),
            Image,
        ],
        content: initialContent,
        onUpdate: ({ editor }) => {
            setDirty(true);
            setHasUnsavedChanges(true);
            generateSuggestions(editor.getText());
        },
        editorProps: {
            attributes: {
                class: cx('editor-content'),
            },
        },
    });

    // Generate smart suggestions based on content
    const generateSuggestions = useCallback(
        (text: string) => {
            const suggestions = [];

            // Contract structure suggestions
            if (!text.includes('HỢP ĐỒNG') && !text.includes('hợp đồng')) {
                suggestions.push('Thêm tiêu đề hợp đồng');
            }

            if (!text.includes('THÔNG TIN CÁC BÊN') && !text.includes('BÊN A') && !text.includes('BÊN B')) {
                suggestions.push('Thêm thông tin các bên tham gia');
            }

            if (!text.includes('ĐIỀU KHOẢN') && !text.includes('điều khoản')) {
                suggestions.push('Thêm các điều khoản chính');
            }

            if (!text.includes('CHỮ KÝ') && !text.includes('chữ ký')) {
                suggestions.push('Thêm phần chữ ký các bên');
            }

            // Legal compliance suggestions
            if (text.includes('lương') && !text.includes('VNĐ') && !text.includes('đồng')) {
                suggestions.push('Thêm đơn vị tiền tệ cho mức lương');
            }

            if (
                text.includes('thời hạn') &&
                !text.includes('ngày') &&
                !text.includes('tháng') &&
                !text.includes('năm')
            ) {
                suggestions.push('Làm rõ thời hạn hợp đồng');
            }

            // Employment contract specific
            if (template?.category === 'employment') {
                if (!text.includes('vị trí') && !text.includes('chức vụ')) {
                    suggestions.push('Thêm vị trí công việc');
                }
                if (!text.includes('thử việc') && !text.includes('probation')) {
                    suggestions.push('Thêm điều khoản thử việc');
                }
            }

            setSuggestions(suggestions.slice(0, 5)); // Limit to 5 suggestions
        },
        [template],
    );

    // Save content
    const handleSave = async () => {
        if (!editor) return;

        setIsSaving(true);
        try {
            const content = editor.getHTML();

            if (currentDraft?.id) {
                await contractService.saveStage(currentDraft.id as any, 'editor', {
                    data: { content },
                } as any);
            }

            onSave?.(content);
            setLastSaved(new Date());
            setHasUnsavedChanges(false);
            setDirty(false);
        } catch (error) {
            console.error('Error saving content:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Export content
    const handleExport = (format: string) => {
        if (!editor) return;

        const content = editor.getHTML();
        onExport?.(format);
        setShowExportModal(false);
    };

    // Print content
    const handlePrint = () => {
        if (!editor) return;
        setShowPrintModal(true);
    };

    // Insert template content
    const insertTemplateContent = (templateContent: string) => {
        if (!editor) return;

        editor.commands.setContent(templateContent);
        setDirty(true);
    };

    // Insert common contract sections
    const insertSection = (sectionType: string) => {
        if (!editor) return;

        const sections = {
            header: `
                <h1 style="text-align: center; margin-bottom: 20px;">
                    <strong>HỢP ĐỒNG LAO ĐỘNG</strong>
                </h1>
                <p style="text-align: center; margin-bottom: 30px;">
                    <strong>Số hợp đồng:</strong> _______________<br>
                    <strong>Ngày ký:</strong> ${new Date().toLocaleDateString('vi-VN')}
                </p>
            `,
            parties: `
                <h2 style="margin-top: 30px; margin-bottom: 15px;">
                    <strong>THÔNG TIN CÁC BÊN</strong>
                </h2>
                <h3 style="margin-top: 20px; margin-bottom: 10px;">
                    <strong>BÊN A (NGƯỜI SỬ DỤNG LAO ĐỘNG)</strong>
                </h3>
                <p>Tên công ty: _______________</p>
                <p>Địa chỉ: _______________</p>
                <p>Điện thoại: _______________</p>
                <p>Người đại diện: _______________</p>
                
                <h3 style="margin-top: 20px; margin-bottom: 10px;">
                    <strong>BÊN B (NGƯỜI LAO ĐỘNG)</strong>
                </h3>
                <p>Họ và tên: _______________</p>
                <p>Ngày sinh: _______________</p>
                <p>CMND/CCCD: _______________</p>
                <p>Địa chỉ: _______________</p>
            `,
            terms: `
                <h2 style="margin-top: 30px; margin-bottom: 15px;">
                    <strong>ĐIỀU KHOẢN CHÍNH</strong>
                </h2>
                <h3 style="margin-top: 20px; margin-bottom: 10px;">
                    <strong>Điều 1: Vị trí công việc</strong>
                </h3>
                <p>Bên B được thuê làm việc tại vị trí: _______________</p>
                
                <h3 style="margin-top: 20px; margin-bottom: 10px;">
                    <strong>Điều 2: Thời hạn hợp đồng</strong>
                </h3>
                <p>Thời hạn hợp đồng: _______________</p>
                
                <h3 style="margin-top: 20px; margin-bottom: 10px;">
                    <strong>Điều 3: Mức lương</strong>
                </h3>
                <p>Mức lương cơ bản: _______________ VNĐ/tháng</p>
            `,
            signature: `
                <h2 style="margin-top: 30px; margin-bottom: 15px;">
                    <strong>CHỮ KÝ CÁC BÊN</strong>
                </h2>
                <div style="display: flex; justify-content: space-between; margin-top: 50px;">
                    <div style="text-align: center;">
                        <p><strong>BÊN A</strong></p>
                        <p>Chữ ký: _______________</p>
                    </div>
                    <div style="text-align: center;">
                        <p><strong>BÊN B</strong></p>
                        <p>Chữ ký: _______________</p>
                    </div>
                </div>
            `,
        };

        const content = sections[sectionType as keyof typeof sections];
        if (content) {
            editor.commands.insertContent(content);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                handlePrint();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [editor]);

    if (!editor) {
        return (
            <div className={cx('editor-loading')}>
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>Đang tải editor...</span>
            </div>
        );
    }

    return (
        <div className={cx('editor-page')}>
            {/* Header */}
            <div className={cx('editor-header')}>
                <div className={cx('header-left')}>
                    <h3>Soạn thảo hợp đồng</h3>
                    {lastSaved && (
                        <span className={cx('last-saved')}>Lưu lần cuối: {lastSaved.toLocaleTimeString()}</span>
                    )}
                </div>

                <div className={cx('header-actions')}>
                    <button
                        className={cx('suggestions-btn', { active: showSuggestions })}
                        onClick={() => setShowSuggestions(!showSuggestions)}
                        title="Gợi ý thông minh"
                    >
                        <FontAwesomeIcon icon={faLightbulb} />
                        Gợi ý ({suggestions.length})
                    </button>

                    <button
                        className={cx('save-btn', { 'has-changes': hasUnsavedChanges })}
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                        Lưu
                    </button>

                    <button className={cx('preview-btn')} onClick={() => setShowPrintModal(true)}>
                        <FontAwesomeIcon icon={faEye} />
                        Xem trước
                    </button>

                    <button className={cx('export-btn')} onClick={() => setShowExportModal(true)}>
                        <FontAwesomeIcon icon={faDownload} />
                        Xuất file
                    </button>

                    <button className={cx('print-btn')} onClick={handlePrint}>
                        <FontAwesomeIcon icon={faPrint} />
                        In
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className={cx('editor-main')}>
                {/* Toolbar */}
                <EditorToolbar editor={editor} />

                {/* Editor Area */}
                <div className={cx('editor-area')}>
                    <EditorContent editor={editor} />

                    {/* Smart Suggestions */}
                                        {showSuggestions && suggestions.length > 0 && (
                        <SmartSuggestions
                            suggestions={suggestions}
                            onApply={(suggestion) => {
                                if (!editor) return;
                                // naive apply: insert new paragraph with suggestion text
                                editor.commands.insertContent(`<p>${suggestion}</p>`);
                            }}
                        />
                    )}
</div>

                {/* Sidebar */}
                <EditorSidebar
                    template={template}
                    onInsertSection={insertSection}
                    onInsertTemplate={insertTemplateContent}
                />
            </div>

            {/* Modals */}
            {showExportModal && <ExportModal onExport={handleExport} onClose={() => setShowExportModal(false)} />}

            {showPrintModal && <PrintModal content={editor.getHTML()} onClose={() => setShowPrintModal(false)} />}
        </div>
    );
};

export default EditorPage;
