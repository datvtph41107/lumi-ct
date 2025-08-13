"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Image from "@tiptap/extension-image";
import ImageResize from "tiptap-extension-resize-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { Color } from "@tiptap/extension-color";
import HighLight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import FontFamily from "@tiptap/extension-font-family";
import Toolbar from "../Toolbar";
import classNames from "classnames/bind";
import style from "./Editor.module.scss";
import { useEditorStore } from "~/store/editor-store";
import { FontSizeExtension } from "./extensions/font-size";
import { LineHeightExtension } from "./extensions/line-height";
import { useEffect, useRef } from "react";

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

    const editorRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    // Helper function to check if current selection is on an image
    const isImageSelected = (editor: any) => {
        const { state } = editor;
        const { from, to, $from } = state.selection;

        // Check if selection is a NodeSelection (single node selected)
        if (state.selection.constructor.name === "NodeSelection") {
            const node = state.selection.node;
            return node && node.type.name === "image";
        }

        // Check if cursor is positioned at an image node
        const nodeAtFrom = state.doc.nodeAt(from);
        const nodeAtTo = state.doc.nodeAt(to);

        // Check if we're at the position of an image
        if (nodeAtFrom && nodeAtFrom.type.name === "image") {
            return true;
        }

        if (nodeAtTo && nodeAtTo.type.name === "image") {
            return true;
        }

        // Check if we're adjacent to an image
        const $pos = state.doc.resolve(from);
        const nodeBefore = $pos.nodeBefore;
        const nodeAfter = $pos.nodeAfter;

        if (nodeBefore && nodeBefore.type.name === "image") {
            return true;
        }

        if (nodeAfter && nodeAfter.type.name === "image") {
            return true;
        }

        return false;
    };

    const editor = useEditor({
        immediatelyRender: false,
        onCreate({ editor }) {
            setEditor(editor);
        },
        onDestroy() {
            setEditor(null);
        },
        onUpdate({ editor }) {
            // setEditor(editor);

            // Check if image is selected and hide toolbar if so
            if (isImageSelected(editor)) {
                setToolbarVisible(false);
                return;
            }

            // Only hide toolbar when typing and not interacting with toolbar
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
                if (manualToggleOnly) return; // ⚠️ Không bật toolbar nếu đang ở chế độ khóa thủ công

                if (hasSelection) {
                    setToolbarVisible(true);
                }
            }
        },
        onTransaction({ editor }) {
            // setEditor(editor);
        },
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
            // setEditor(editor);

            // Use a longer delay and check interaction state
            setTimeout(() => {
                const currentState = useEditorStore.getState();
                if (!currentState.isInteractingWithToolbar && currentState.autoToggleEnabled) {
                    setToolbarVisible(false);
                }
            }, 200);
        },
        onContentError({ editor }) {
            // setEditor(editor);
        },
        editorProps: {
            attributes: {
                style: "padding-left: 56px; padding-right: 56px",
                class: cx("editor-content"),
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
                types: ["heading", "paragraph"],
            }),
            TaskItem.configure({ nested: true }),
            Table.configure({
                resizable: true,
            }),
            Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
            TableRow,
            TableHeader,
            TableCell,
            Underline,
        ],
        content: `
            <p>Welcome to the editor</p>
        `,
    });

    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            if (editorRef.current?.contains(e.target as Node)) {
                e.preventDefault();

                const { isToolbarVisible, setToolbarVisible, setAutoToggleEnabled, setManualToggleOnly } = useEditorStore.getState();

                if (isToolbarVisible) {
                    setToolbarVisible(false);
                    setAutoToggleEnabled(false);
                    setManualToggleOnly(true); // chỉ mở lại bằng chuột phải
                } else {
                    setToolbarVisible(true);
                    setAutoToggleEnabled(true);
                    setManualToggleOnly(false); // cho phép auto-toggle lại
                }
            }
        };

        document.addEventListener("contextmenu", handleContextMenu);
        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            // Cleanup timeouts
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            clearInteractionTimeout();
        };
    }, [clearInteractionTimeout]);

    return (
        <div className={cx("editor-wrapper")} ref={editorRef}>
            <EditorContent editor={editor} />
            {editor && <Toolbar />}
        </div>
    );
};
