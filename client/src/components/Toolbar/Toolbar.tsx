"use client";

import type React from "react";

import classNames from "classnames/bind";
import { faBold, faItalic, faUnderline, faUndo, faRedo, faStrikethrough } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Toolbar.module.scss";
import { useEditorStore } from "~/store/editor-store";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Editor, FloatingMenu } from "@tiptap/react";

import {
    HeadingLevelButton,
    LineHeightButton,
    AlignButton,
    ListButton,
    TextColorButton,
    LinkButton,
    ImageButton,
    TextDecorationButton,
    TextStyleButton,
} from "./EditorButton/EditorButton";
import { useEffect, useRef } from "react";
import { NodeSelection } from "prosemirror-state";

const cx = classNames.bind(styles);

interface ToolbarButtonProps {
    onClick?: () => void;
    isActive?: boolean;
    icon: IconProp;
}

const ToolbarButton = ({ onClick, isActive, icon }: ToolbarButtonProps) => {
    const { setInteractingWithToolbar, setInteractionTimeoutId } = useEditorStore();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        setInteractingWithToolbar(true);
        onClick?.();

        // Set timeout for resetting interaction state
        const timeoutId = setTimeout(() => {
            setInteractingWithToolbar(false);
        }, 300);
        setInteractionTimeoutId(timeoutId);
    };

    return (
        <button
            className={cx("toolbar-btn", { active: isActive })}
            onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setInteractingWithToolbar(true);
            }}
            onClick={handleClick}
        >
            <FontAwesomeIcon icon={icon} className={cx("icon")} />
        </button>
    );
};

// Helper function to check if current selection is on an image
const isImageSelected = (editor: Editor): boolean => {
    const { state } = editor;
    const { from, to } = state.selection;

    // Check if selection is a NodeSelection (single node selected)
    if (state.selection instanceof NodeSelection) {
        const node = state.selection.node;
        return !!node && node.type.name === "image";
    }

    // Check if cursor is positioned at an image node
    const nodeAtFrom = state.doc.nodeAt(from);
    const nodeAtTo = state.doc.nodeAt(to);

    if (nodeAtFrom?.type.name === "image") return true;
    if (nodeAtTo?.type.name === "image") return true;

    // Check if adjacent nodes are images
    const $pos = state.doc.resolve(from);
    const nodeBefore = $pos.nodeBefore;
    const nodeAfter = $pos.nodeAfter;

    if (nodeBefore?.type.name === "image") return true;
    if (nodeAfter?.type.name === "image") return true;

    return false;
};

const Toolbar = () => {
    const { editor, isToolbarVisible, setInteractingWithToolbar, setInteractionTimeoutId } = useEditorStore();
    const toolbarRef = useRef<HTMLDivElement>(null);

    const sections: {
        label: string;
        icon: IconProp;
        onClick: () => void;
        isActive?: boolean;
    }[][] = [
        [
            {
                label: "Undo",
                icon: faUndo,
                onClick: () => editor?.chain().focus().undo().run(),
            },
            {
                label: "Redo",
                icon: faRedo,
                onClick: () => editor?.chain().focus().redo().run(),
            },
        ],
        [
            {
                label: "Bold",
                icon: faBold,
                isActive: editor?.isActive("bold"),
                onClick: () => editor?.chain().focus().toggleBold().run(),
            },
            {
                label: "Italic",
                icon: faItalic,
                isActive: editor?.isActive("italic"),
                onClick: () => editor?.chain().focus().toggleItalic().run(),
            },
            // {
            //     label: "Underline",
            //     icon: faUnderline,
            //     isActive: editor?.isActive("underline"),
            //     onClick: () => editor?.chain().focus().toggleUnderline().run(),
            // },
            // {
            //     label: "Strikethrough",
            //     icon: faStrikethrough,
            //     isActive: editor?.isActive("strike"),
            //     onClick: () => editor?.chain().focus().toggleStrike().run(),
            // },
        ],
    ];

    // Handle right-click on toolbar
    const handleToolbarContextMenu = (e: MouseEvent) => {
        if (toolbarRef.current?.contains(e.target as Node)) {
            e.preventDefault();
            e.stopPropagation();
            // Optionally show custom context menu or do nothing
        }
    };

    useEffect(() => {
        document.addEventListener("contextmenu", handleToolbarContextMenu);
        return () => document.removeEventListener("contextmenu", handleToolbarContextMenu);
    }, []);

    if (!editor) return null;

    return (
        <FloatingMenu
            editor={editor}
            className={cx("wrapper", {
                visible: isToolbarVisible,
                hidden: !isToolbarVisible,
            })}
            shouldShow={({ editor }) => {
                const { from, to } = editor.state.selection;
                const isEmpty = from === to;
                const hasFocus = editor.view.hasFocus();

                // Don't show toolbar if image is selected
                if (isImageSelected(editor)) {
                    return false;
                }

                return hasFocus;
            }}
            tippyOptions={{
                placement: "bottom-start",
                offset: [-40, 8],
                appendTo: "parent",
                animation: "fade",
                duration: [200, 150],
                interactive: true,
                hideOnClick: false,
                trigger: "manual",
            }}
        >
            <div
                ref={toolbarRef}
                data-toolbar="true"
                onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onClick={(e) => {
                    e.stopPropagation();
                }}
                onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onMouseEnter={() => {
                    setInteractingWithToolbar(true);
                }}
                onMouseLeave={() => {
                    // Delay before setting interaction to false
                    const timeoutId = setTimeout(() => {
                        setInteractingWithToolbar(false);
                    }, 150);
                    setInteractionTimeoutId(timeoutId);
                }}
                className={cx("contain")}
            >
                <TextStyleButton />
                <div className={cx("vertical-block")} />

                <TextColorButton />
                <div className={cx("vertical-block")} />
                {sections[1].map((item) => (
                    <ToolbarButton key={item.label} {...item} />
                ))}
                <TextDecorationButton />
                <div className={cx("vertical-block")} />

                <LinkButton />
                <ImageButton />
                <div className={cx("vertical-block")} />

                <AlignButton />
                <ListButton />
                <LineHeightButton />

                {sections[0].map((item) => (
                    <ToolbarButton key={item.label} {...item} />
                ))}
            </div>
        </FloatingMenu>
    );
};

Toolbar.displayName = "Toolbar";

export default Toolbar;
