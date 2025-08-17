'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Image from '@tiptap/extension-image';
import ImageResize from 'tiptap-extension-resize-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import HighLight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import FontFamily from '@tiptap/extension-font-family';
import Toolbar from '../Toolbar';
import classNames from 'classnames/bind';
import style from './Editor.module.scss';
import { useEditorStore } from '~/store/editor-store';
import { FontSizeExtension } from './extensions/font-size';
import { LineHeightExtension } from './extensions/line-height';
import { useEffect, useRef } from 'react';
import { useContractDraftStore } from '~/store/contract-draft-store';

const cx = classNames.bind(style);

export const Editor = () => {
    const {
        setEditor,
        setToolbarVisible,
        isInteractingWithToolbar,
        setInteractingWithToolbar,
        clearInteractionTimeout,
        setInteractionTimeoutId,
        isToolbarVisible,
    } = useEditorStore();
    const { currentDraft, updateDraftData, setDirty } = useContractDraftStore();

    const editorRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    // Helper function to check if current selection is on an image
    const isImageSelected = (editor: any) => {
        const { state } = editor;
        const { from, to, $from } = state.selection;
        if (state.selection.constructor.name === 'NodeSelection') {
            const node = state.selection.node;
            return node && node.type.name === 'image';
        }
        const nodeAtFrom = state.doc.nodeAt(from);
        const nodeAtTo = state.doc.nodeAt(to);
        if (nodeAtFrom && nodeAtFrom.type.name === 'image') {
            return true;
        }
        if (nodeAtTo && nodeAtTo.type.name === 'image') {
            return true;
        }
        const $pos = state.doc.resolve(from);
        const nodeBefore = $pos.nodeBefore;
        const nodeAfter = $pos.nodeAfter;
        if (nodeBefore && nodeBefore.type.name === 'image') {
            return true;
        }
        if (nodeAfter && nodeAfter.type.name === 'image') {
            return true;
        }
        return false;
    };

    const initialHtml = ((): string => {
        const content = (currentDraft?.contractData as any)?.content;
        if (content?.mode === 'editor' && content?.editorContent?.content) {
            return String(content.editorContent.content);
        }
        return `\n            <h1 style="text-align:center">HỢP ĐỒNG</h1>\n            <p>Vui lòng nhập nội dung hợp đồng...</p>\n        `;
    })();

    const editor = useEditor({
        immediatelyRender: false,
        onCreate({ editor }) {
            setEditor(editor);
        },
        onDestroy() {
            setEditor(null);
        },
        onUpdate({ editor }) {
            // Persist editor content to draft store
            const html = editor.getHTML();
            const text = editor.getText();
            updateDraftData('content_draft', {
                mode: 'editor',
                content: {
                    mode: 'editor',
                    editorContent: {
                        content: html,
                        plainText: text,
                        metadata: {
                            wordCount: text.trim().split(/\s+/).filter(Boolean).length,
                            characterCount: text.length,
                            lastEditedAt: new Date().toISOString(),
                            version:
                                ((currentDraft?.contractData as any)?.content?.editorContent?.metadata?.version || 0) +
                                1,
                        },
                    },
                },
            } as any);
            setDirty(true);

            // Check if image is selected and hide toolbar if so
            if (isImageSelected(editor)) {
                setToolbarVisible(false);
                return;
            }
            if (!isInteractingWithToolbar) {
                const { autoToggleEnabled } = useEditorStore.getState();
                if (!autoToggleEnabled) return;
                setToolbarVisible(false);
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
                typingTimeoutRef.current = setTimeout(() => {
                    const currentState = useEditorStore.getState();
                    if (currentState.autoToggleEnabled && !currentState.isInteractingWithToolbar) {
                        setToolbarVisible(true);
                    }
                }, 600);
            }
        },

        onSelectionUpdate({ editor }) {
            if (isImageSelected(editor)) {
                setToolbarVisible(false);
                return;
            }
            if (!isInteractingWithToolbar) {
                const { from, to } = editor.state.selection;
                const hasSelection = from !== to;
                const { manualToggleOnly } = useEditorStore.getState();
                if (manualToggleOnly) return;
                if (hasSelection) {
                    setToolbarVisible(true);
                }
            }
        },
        onTransaction({ editor }) {},
        onFocus({ editor }) {
            setEditor(editor);
            if (isImageSelected(editor)) {
                setToolbarVisible(false);
                return;
            }
            const { manualToggleOnly } = useEditorStore.getState();
            if (!manualToggleOnly && !isInteractingWithToolbar) {
                setToolbarVisible(true);
            }
        },
        onBlur({ editor }) {
            setTimeout(() => {
                const currentState = useEditorStore.getState();
                if (!currentState.isInteractingWithToolbar && currentState.autoToggleEnabled) {
                    setToolbarVisible(false);
                }
            }, 200);
        },
        onContentError({ editor }) {},
        editorProps: {
            attributes: {
                style: 'padding-left: 56px; padding-right: 56px',
                class: cx('editor-content'),
            },
        },
        extensions: [
            StarterKit,
            TaskList,
            Color,
            FontSizeExtension,
            LineHeightExtension,
            HighLight.configure({
                multicolor: true,
            }),
            FontFamily,
            Image,
            ImageResize,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TaskItem.configure({ nested: true }),
            Table.configure({
                resizable: true,
            }),
            Link.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' }),
            TableRow,
            TableHeader,
            TableCell,
            Underline,
        ],
        content: initialHtml,
    });

    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            if (editorRef.current?.contains(e.target as Node)) {
                e.preventDefault();
                const { isToolbarVisible, setToolbarVisible, setAutoToggleEnabled, setManualToggleOnly } =
                    useEditorStore.getState();
                if (isToolbarVisible) {
                    setToolbarVisible(false);
                    setAutoToggleEnabled(false);
                    setManualToggleOnly(true);
                } else {
                    setToolbarVisible(true);
                    setAutoToggleEnabled(true);
                    setManualToggleOnly(false);
                }
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            clearInteractionTimeout();
        };
    }, [clearInteractionTimeout]);

    return (
        <div className={cx('editor-wrapper')} ref={editorRef}>
            <EditorContent editor={editor} />
            {editor && <Toolbar />}
        </div>
    );
};
