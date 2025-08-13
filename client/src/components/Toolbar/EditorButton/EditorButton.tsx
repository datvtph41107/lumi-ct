import { useState, useRef, useEffect } from "react";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import type { Level } from "@tiptap/extension-heading";
import { SketchPicker, type ColorResult } from "react-color";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAlignLeft,
    faAlignCenter,
    faAlignRight,
    faAlignJustify,
    faChevronDown,
    faList,
    faListOl,
    faImage,
    faUpload,
    faMagnifyingGlass,
    faLink,
    faTextHeight,
    faChevronUp,
    faStrikethrough,
    faUnderline,
    faFont,
    faHeading,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import { useEditorStore } from "~/store/editor-store";
import classNames from "classnames/bind";
import styles from "./EditorButton.module.scss";
import { DropdownToolbar } from "../DropdownToolbar/DropdownToolbar";

const cx = classNames.bind(styles);
const IconButton = ({ icon }: { icon: IconProp }) => <FontAwesomeIcon icon={icon} className={cx("icon")} />;

// Hook được cải thiện để tránh xung đột timeout
const useToolbarInteraction = () => {
    const { setInteractingWithToolbar } = useEditorStore();

    const handleInteraction = (callback?: () => void) => {
        // Chỉ thực hiện callback, không set interaction state
        // vì DropdownToolbar sẽ quản lý state này
        callback?.();
    };

    const handleNonDropdownInteraction = (callback?: () => void) => {
        // Dành cho các button không phải dropdown
        setInteractingWithToolbar(true);
        callback?.();
        setTimeout(() => {
            setInteractingWithToolbar(false);
        }, 300);
    };

    return { handleInteraction, handleNonDropdownInteraction };
};

export const LineHeightButton = () => {
    const { editor } = useEditorStore();
    const { handleInteraction } = useToolbarInteraction();

    const lineHeights = [
        { label: "Default", value: "normal" },
        { label: "Single", value: "1" },
        { label: "1.15", value: "1.15" },
        { label: "1.5", value: "1.5" },
        { label: "Double", value: "2" },
    ];
    const currentLineHeight = editor?.getAttributes("paragraph").lineHeight || "normal";

    return (
        <DropdownToolbar
            trigger={
                <button className={cx("trigger")}>
                    <FontAwesomeIcon icon={faTextHeight} />
                    <IconButton icon={faChevronDown} />
                </button>
            }
            size="sm"
        >
            {lineHeights.map(({ label, value }) => (
                <div
                    key={value}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleInteraction(() => {
                            editor?.chain().focus().setLineHeight(value).run();
                        });
                    }}
                    className={cx("dropdown-item", { active: currentLineHeight === value })}
                >
                    {label}
                </div>
            ))}
        </DropdownToolbar>
    );
};

export const ListButton = () => {
    const { editor } = useEditorStore();
    const { handleInteraction } = useToolbarInteraction();

    const lists = [
        {
            label: "Bullet List",
            icon: faList,
            isActive: () => editor?.isActive("bulletList"),
            onClick: () => editor?.chain().focus().toggleBulletList().run(),
        },
        {
            label: "Ordered List",
            icon: faListOl,
            isActive: () => editor?.isActive("orderedList"),
            onClick: () => editor?.chain().focus().toggleOrderedList().run(),
        },
    ];

    return (
        <DropdownToolbar
            trigger={
                <button className={cx("trigger")}>
                    <IconButton icon={faList} />
                    <IconButton icon={faChevronDown} />
                </button>
            }
            size="smx"
        >
            {lists.map(({ label, icon, onClick, isActive }) => (
                <div
                    key={label}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleInteraction(onClick);
                    }}
                    className={cx("dropdown-item", { active: isActive() })}
                >
                    <IconButton icon={icon} />
                    <span>{label}</span>
                </div>
            ))}
        </DropdownToolbar>
    );
};

export const AlignButton = () => {
    const { editor } = useEditorStore();
    const { handleInteraction } = useToolbarInteraction();

    const alignments = [
        { label: "Align Left", value: "left", icon: faAlignLeft },
        { label: "Align Center", value: "center", icon: faAlignCenter },
        { label: "Align Right", value: "right", icon: faAlignRight },
        { label: "Align Justify", value: "justify", icon: faAlignJustify },
    ];

    return (
        <DropdownToolbar
            trigger={
                <button className={cx("trigger")}>
                    <IconButton icon={faAlignLeft} />
                    <IconButton icon={faChevronDown} />
                </button>
            }
            size="smx"
        >
            {alignments.map(({ label, value, icon }) => (
                <div
                    key={value}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleInteraction(() => {
                            editor?.chain().focus().setTextAlign(value).run();
                        });
                    }}
                    className={cx("dropdown-item", { active: editor?.isActive({ textAlign: value }) })}
                >
                    <IconButton icon={icon} />
                    <span>{label}</span>
                </div>
            ))}
        </DropdownToolbar>
    );
};

export const ImageButton = () => {
    const { editor } = useEditorStore();
    const { handleNonDropdownInteraction } = useToolbarInteraction();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState("");

    const onChange = (src: string) => {
        editor?.chain().focus().setImage({ src }).run();
    };

    const onUpload = () => {
        handleNonDropdownInteraction(() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";

            input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                    const imageUrl = URL.createObjectURL(file);
                    onChange(imageUrl);
                }
            };

            input.click();
        });
    };

    const handleImageUrlSubmit = () => {
        handleNonDropdownInteraction(() => {
            if (imageUrl) {
                onChange(imageUrl);
                setImageUrl("");
                setIsDialogOpen(false);
            }
        });
    };

    return (
        <>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    <button
                        className={cx("toolbar-btn")}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNonDropdownInteraction();
                        }}
                    >
                        <IconButton icon={faImage} />
                    </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Content sideOffset={4} className={cx("dropdown")}>
                    <DropdownMenu.Item onClick={onUpload} className={cx("dropdown-item")} onSelect={(e) => e.preventDefault()}>
                        <IconButton icon={faUpload} />
                        Upload
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNonDropdownInteraction(() => setIsDialogOpen(true));
                        }}
                        className={cx("dropdown-item")}
                        onSelect={(e) => e.preventDefault()}
                    >
                        <IconButton icon={faMagnifyingGlass} /> Paste image URL
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>

            <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className={cx("dialog-overlay")} />
                    <Dialog.Content className={cx("dialog-content")}>
                        <Dialog.Title className={cx("dialog-title")}>Insert image URL</Dialog.Title>

                        <input
                            placeholder="Insert image URL"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleImageUrlSubmit();
                            }}
                            className={cx("input")}
                        />

                        <div className={cx("dialog-footer")}>
                            <button onClick={handleImageUrlSubmit} className={cx("btn")}>
                                Insert
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
};

export const LinkButton = () => {
    const { editor, setInteractingWithToolbar, clearInteractionTimeout } = useEditorStore();
    const [value, setValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const onChange = (href: string) => {
        if (href.trim()) {
            editor?.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
        }
        setValue("");
        setIsOpen(false);
    };

    // Handle input focus to prevent toolbar from hiding
    const handleInputFocus = () => {
        clearInteractionTimeout();
        setInteractingWithToolbar(true);
    };

    const handleInputBlur = () => {
        // Small delay to allow for other interactions
        setTimeout(() => {
            if (!isOpen) {
                setInteractingWithToolbar(false);
            }
        }, 100);
    };

    useEffect(() => {
        if (isOpen && inputRef.current) {
            // Focus input after dropdown opens
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    return (
        <DropdownMenu.Root
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                if (open) {
                    clearInteractionTimeout();
                    setInteractingWithToolbar(true);
                    setValue(editor?.getAttributes("link").href || "");
                } else {
                    setTimeout(() => {
                        setInteractingWithToolbar(false);
                    }, 200);
                }
            }}
        >
            <DropdownMenu.Trigger asChild>
                <button
                    className={cx("link-trigger")}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <FontAwesomeIcon icon={faLink} />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
                sideOffset={4}
                className={cx("dropdown")}
                onCloseAutoFocus={(e) => {
                    // Prevent auto focus back to trigger
                    e.preventDefault();
                }}
            >
                <div className={cx("link-container")} onClick={(e) => e.stopPropagation()}>
                    <input
                        ref={inputRef}
                        type="text"
                        className={cx("link-input")}
                        placeholder="https://example.com"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === "Enter") {
                                e.preventDefault();
                                onChange(value);
                            }
                            if (e.key === "Escape") {
                                e.preventDefault();
                                setIsOpen(false);
                            }
                        }}
                        onMouseDown={(e) => {
                            // Allow normal input interaction
                            e.stopPropagation();
                        }}
                    />
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange(value);
                        }}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        className={cx("link-apply")}
                    >
                        Apply
                    </button>
                    {value && <p className={cx("link-preview")}>{value}</p>}
                </div>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
};

export const TextColorButton = () => {
    const { editor } = useEditorStore();
    const { handleInteraction } = useToolbarInteraction();

    const value = editor?.getAttributes("textStyle").color || "black";

    const onChange = (color: ColorResult) => {
        handleInteraction(() => {
            editor?.chain().focus().setColor(color.hex).run();
        });
    };

    return (
        <DropdownToolbar
            trigger={
                <button className={cx("color-trigger")}>
                    <span className={cx("color-label")}>A</span>
                    <div className={cx("color-preview")} style={{ backgroundColor: value }} />
                </button>
            }
        >
            <div onClick={(e) => e.stopPropagation()}>
                <SketchPicker color={value} onChange={onChange} />
            </div>
        </DropdownToolbar>
    );
};

export const HeadingLevelButton = () => {
    const { editor } = useEditorStore();
    const { handleInteraction } = useToolbarInteraction();

    const headings = [
        { label: "Normal text", value: 0, fontSize: "16px" },
        { label: "Heading 1", value: 1, fontSize: "20px" },
        { label: "Heading 2", value: 2, fontSize: "18px" },
        { label: "Heading 3", value: 3, fontSize: "16px" },
        { label: "Heading 4", value: 4, fontSize: "14px" },
        { label: "Heading 5", value: 5, fontSize: "13px" },
    ];

    const getCurrentHeading = () => {
        for (let level = 1; level <= 5; level++) {
            if (editor?.isActive("heading", { level })) {
                return `Heading ${level}`;
            }
        }
        return "Normal text";
    };

    const handleSelect = (value: number) => {
        handleInteraction(() => {
            if (value === 0) {
                editor?.chain().setParagraph().run();
            } else {
                editor
                    ?.chain()
                    .toggleHeading({ level: value as Level })
                    .focus()
                    .run();
            }
        });
    };

    return (
        <DropdownToolbar
            trigger={
                <button className={cx("trigger")}>
                    <span>{getCurrentHeading()}</span>
                    <FontAwesomeIcon icon={faChevronDown} />
                </button>
            }
            size="smx"
        >
            <ul className={cx("dropdown-menu")}>
                {headings.map(({ label, value, fontSize }) => (
                    <li
                        key={value}
                        style={{ fontSize }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(value);
                        }}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        className={cx("dropdown-item", {
                            active: (value === 0 && !editor?.isActive("heading")) || editor?.isActive("heading", { level: value }),
                        })}
                    >
                        {label}
                    </li>
                ))}
            </ul>
        </DropdownToolbar>
    );
};

export const FontSizeButton = () => {
    const { editor } = useEditorStore();
    const { handleInteraction } = useToolbarInteraction();

    const predefinedSizes = [
        { label: "8", value: "8px" },
        { label: "9", value: "9px" },
        { label: "10", value: "10px" },
        { label: "11", value: "11px" },
        { label: "12", value: "12px" },
        { label: "14", value: "14px" },
        { label: "16", value: "16px" },
        { label: "18", value: "18px" },
        { label: "20", value: "20px" },
        { label: "24", value: "24px" },
        { label: "28", value: "28px" },
        { label: "32", value: "32px" },
        { label: "36", value: "36px" },
        { label: "48", value: "48px" },
        { label: "72", value: "72px" },
    ];

    // Improved function to get current font size
    const getCurrentFontSize = () => {
        if (!editor) return "16px";

        // First check if there's a direct fontSize in textStyle
        const textStyleFontSize = editor.getAttributes("textStyle").fontSize;
        if (textStyleFontSize) {
            return textStyleFontSize;
        }

        // Check if we're in a heading and get its computed font size
        for (let level = 1; level <= 6; level++) {
            if (editor.isActive("heading", { level })) {
                // Try to get computed style from the actual DOM element
                const { from } = editor.state.selection;
                const dom = editor.view.domAtPos(from);
                if (dom.node && dom.node.nodeType === Node.ELEMENT_NODE) {
                    const element = dom.node as Element;
                    const headingElement = element.closest(`h${level}`) || element.querySelector(`h${level}`);
                    if (headingElement) {
                        const computedStyle = window.getComputedStyle(headingElement);
                        const fontSize = computedStyle.fontSize;
                        if (fontSize) {
                            return fontSize;
                        }
                    }
                }

                // Fallback to predefined heading sizes
                const headingSizes = {
                    1: "32px", // h1
                    2: "24px", // h2
                    3: "20px", // h3
                    4: "18px", // h4
                    5: "16px", // h5
                    6: "14px", // h6
                };
                return headingSizes[level as keyof typeof headingSizes] || "16px";
            }
        }

        // Try to get computed style from current selection
        try {
            const { from } = editor.state.selection;
            const dom = editor.view.domAtPos(from);
            if (dom.node) {
                let element: Element | null = null;

                if (dom.node.nodeType === Node.ELEMENT_NODE) {
                    element = dom.node as Element;
                } else if (dom.node.parentElement) {
                    element = dom.node.parentElement;
                }

                if (element) {
                    const computedStyle = window.getComputedStyle(element);
                    const fontSize = computedStyle.fontSize;
                    if (fontSize && fontSize !== "16px") {
                        return fontSize;
                    }
                }
            }
        } catch (error) {
            console.warn("Could not get computed font size:", error);
        }

        // Default fallback
        return "16px";
    };

    const currentFontSize = getCurrentFontSize();

    const handleFontSizeChange = (size: string) => {
        handleInteraction(() => {
            if (size) {
                // Ensure the size has a unit (px, em, rem, etc.)
                const sizeWithUnit = /^\d+$/.test(size) ? `${size}px` : size;
                editor?.chain().focus().setFontSize(sizeWithUnit).run();
            }
        });
    };

    // Function to get numeric value from font size string
    const getFontSizeNumber = (fontSize: string): number => {
        const match = fontSize.match(/(\d+(?:\.\d+)?)/);
        return match ? Number.parseFloat(match[1]) : 16;
    };

    // Function to get unit from font size string
    const getFontSizeUnit = (fontSize: string): string => {
        const match = fontSize.match(/\d+(?:\.\d+)?(\w+)/);
        return match ? match[1] : "px";
    };

    // Increment font size
    const incrementFontSize = () => {
        const currentSize = getFontSizeNumber(currentFontSize);
        const unit = getFontSizeUnit(currentFontSize);

        let newSize: number;

        // Smart increment based on current size
        if (currentSize < 12) {
            newSize = currentSize + 1;
        } else if (currentSize < 24) {
            newSize = currentSize + 2;
        } else if (currentSize < 48) {
            newSize = currentSize + 4;
        } else {
            newSize = currentSize + 8;
        }

        // Cap at maximum size
        newSize = Math.min(newSize, 144);

        handleFontSizeChange(`${newSize}${unit}`);
    };

    // Decrement font size
    const decrementFontSize = () => {
        const currentSize = getFontSizeNumber(currentFontSize);
        const unit = getFontSizeUnit(currentFontSize);

        let newSize: number;

        // Smart decrement based on current size
        if (currentSize <= 12) {
            newSize = currentSize - 1;
        } else if (currentSize <= 24) {
            newSize = currentSize - 2;
        } else if (currentSize <= 48) {
            newSize = currentSize - 4;
        } else {
            newSize = currentSize - 8;
        }

        // Cap at minimum size
        newSize = Math.max(newSize, 8);

        handleFontSizeChange(`${newSize}${unit}`);
    };

    const getCurrentSizeLabel = () => {
        const predefined = predefinedSizes.find((size) => size.value === currentFontSize);
        return predefined ? predefined.label : getFontSizeNumber(currentFontSize).toString();
    };

    return (
        <DropdownToolbar
            trigger={
                <button className={cx("trigger")}>
                    <span className={cx("font-size-label")}>{getCurrentSizeLabel()}</span>
                    <FontAwesomeIcon icon={faChevronDown} />
                </button>
            }
        >
            <div className={cx("font-size-dropdown")}>
                {/* Current size indicator */}
                <div className={cx("current-size-indicator")}>
                    <span className={cx("current-size-text")}>Current: {currentFontSize}</span>
                </div>

                {/* Size adjustment controls */}
                <div className={cx("size-controls")}>
                    <div className={cx("size-display")}>
                        <span className={cx("size-number")}>{getFontSizeNumber(currentFontSize)}</span>
                        <span className={cx("size-unit")}>{getFontSizeUnit(currentFontSize)}</span>
                    </div>
                    <div className={cx("control-buttons")}>
                        <button
                            className={cx("control-btn")}
                            onClick={(e) => {
                                e.stopPropagation();
                                incrementFontSize();
                            }}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            disabled={getFontSizeNumber(currentFontSize) >= 144}
                        >
                            <FontAwesomeIcon icon={faChevronUp} />
                        </button>
                        <button
                            className={cx("control-btn")}
                            onClick={(e) => {
                                e.stopPropagation();
                                decrementFontSize();
                            }}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            disabled={getFontSizeNumber(currentFontSize) <= 8}
                        >
                            <FontAwesomeIcon icon={faChevronDown} />
                        </button>
                    </div>
                </div>

                <div className={cx("divider")} />

                {/* Predefined sizes */}
                <div className={cx("predefined-sizes")}>
                    {predefinedSizes.map(({ label, value }) => (
                        <div
                            key={value}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleFontSizeChange(value);
                            }}
                            className={cx("dropdown-item", { active: currentFontSize === value })}
                            style={{ fontSize: value }}
                        >
                            {label}px
                        </div>
                    ))}
                </div>
            </div>
        </DropdownToolbar>
    );
};

export const TextDecorationButton = () => {
    const { editor } = useEditorStore();
    const { handleInteraction } = useToolbarInteraction();

    const decorations = [
        {
            label: "None",
            value: "none",
            icon: null,
            isActive: () => !editor?.isActive("underline") && !editor?.isActive("strike"),
            onClick: () => {
                // Remove both underline and strikethrough
                editor?.chain().focus().unsetUnderline().unsetStrike().run();
            },
        },
        {
            label: "Underline",
            value: "underline",
            icon: faUnderline,
            isActive: () => editor?.isActive("underline"),
            onClick: () => {
                // If underline is active, remove it. Otherwise, add underline and remove strikethrough
                if (editor?.isActive("underline")) {
                    editor?.chain().focus().unsetUnderline().run();
                } else {
                    editor?.chain().focus().unsetStrike().setUnderline().run();
                }
            },
        },
        {
            label: "Strikethrough",
            value: "strikethrough",
            icon: faStrikethrough,
            isActive: () => editor?.isActive("strike"),
            onClick: () => {
                // If strikethrough is active, remove it. Otherwise, add strikethrough and remove underline
                if (editor?.isActive("strike")) {
                    editor?.chain().focus().unsetStrike().run();
                } else {
                    editor?.chain().focus().unsetUnderline().setStrike().run();
                }
            },
        },
    ];

    const getCurrentDecoration = () => {
        if (editor?.isActive("underline")) return decorations[1];
        if (editor?.isActive("strike")) return decorations[2];
        return decorations[0];
    };

    const currentDecoration = getCurrentDecoration();

    return (
        <DropdownToolbar
            trigger={
                <button className={cx("trigger", "text-decoration-trigger")}>
                    {currentDecoration.icon ? (
                        <FontAwesomeIcon icon={currentDecoration.icon} />
                    ) : (
                        <span className={cx("none-decoration")}>T</span>
                    )}
                    <IconButton icon={faChevronDown} />
                </button>
            }
            size="smx"
        >
            {decorations.map(({ label, value, icon, onClick, isActive }) => (
                <div
                    key={value}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleInteraction(onClick);
                    }}
                    className={cx("dropdown-item", { active: isActive() })}
                >
                    <div className={cx("decoration-item")}>
                        {icon ? (
                            <FontAwesomeIcon icon={icon} className={cx("decoration-icon")} />
                        ) : (
                            <span className={cx("none-icon")}>T</span>
                        )}
                        <span className={cx("decoration-label")}>{label}</span>
                    </div>
                </div>
            ))}
        </DropdownToolbar>
    );
};

export const FontFamilyButton = () => {
    const { editor } = useEditorStore();
    const { handleInteraction } = useToolbarInteraction();

    const fontFamilies = [
        {
            label: "Default",
            value: "",
            category: "System",
        },
        {
            label: "Arial",
            value: "Arial, sans-serif",
            category: "Sans Serif",
        },
        {
            label: "Helvetica",
            value: "Helvetica, Arial, sans-serif",
            category: "Sans Serif",
        },
        {
            label: "Times New Roman",
            value: "Times New Roman, Times, serif",
            category: "Serif",
        },
        {
            label: "Georgia",
            value: "Georgia, serif",
            category: "Serif",
        },
        {
            label: "Courier New",
            value: "Courier New, Courier, monospace",
            category: "Monospace",
        },
        {
            label: "Verdana",
            value: "Verdana, Geneva, sans-serif",
            category: "Sans Serif",
        },
        {
            label: "Trebuchet MS",
            value: "Trebuchet MS, Helvetica, sans-serif",
            category: "Sans Serif",
        },
        {
            label: "Comic Sans MS",
            value: "Comic Sans MS, cursive",
            category: "Cursive",
        },
        {
            label: "Impact",
            value: "Impact, Charcoal, sans-serif",
            category: "Display",
        },
        {
            label: "Palatino",
            value: "Palatino, Palatino Linotype, serif",
            category: "Serif",
        },
        {
            label: "Tahoma",
            value: "Tahoma, Geneva, sans-serif",
            category: "Sans Serif",
        },
    ];

    const getCurrentFontFamily = () => {
        if (!editor) return "Default";

        const fontFamily = editor.getAttributes("textStyle").fontFamily;
        if (!fontFamily) return "Default";

        // Find matching font family
        const matchedFont = fontFamilies.find((font) => font.value === fontFamily);
        return matchedFont ? matchedFont.label : "Custom";
    };

    const handleFontFamilyChange = (fontFamily: string) => {
        handleInteraction(() => {
            if (fontFamily === "") {
                // Remove font family (use default)
                editor?.chain().focus().unsetFontFamily().run();
            } else {
                editor?.chain().focus().setFontFamily(fontFamily).run();
            }
        });
    };

    const currentFontFamily = getCurrentFontFamily();

    // Group fonts by category
    const groupedFonts = fontFamilies.reduce((acc, font) => {
        if (!acc[font.category]) {
            acc[font.category] = [];
        }
        acc[font.category].push(font);
        return acc;
    }, {} as Record<string, typeof fontFamilies>);

    return (
        <DropdownToolbar
            size="lg"
            trigger={
                <button className={cx("trigger", "font-family-trigger")}>
                    <FontAwesomeIcon icon={faFont} />
                    <span className={cx("font-family-label")}>{currentFontFamily}</span>
                    <IconButton icon={faChevronDown} />
                </button>
            }
        >
            <div className={cx("font-family-dropdown")}>
                {Object.entries(groupedFonts).map(([category, fonts]) => (
                    <div key={category} className={cx("font-category")}>
                        <div className={cx("category-header")}>{category}</div>
                        {fonts.map(({ label, value }) => (
                            <div
                                key={value || "default"}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleFontFamilyChange(value);
                                }}
                                className={cx("dropdown-item", "font-item", {
                                    active: currentFontFamily === label,
                                })}
                                style={{ fontFamily: value || "inherit" }}
                            >
                                <span className={cx("font-name")}>{label}</span>
                                <span className={cx("font-preview")}>Aa</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </DropdownToolbar>
    );
};

export const TextStyleButton = () => {
    const { editor } = useEditorStore();
    const { handleInteraction } = useToolbarInteraction();

    // Collapse state for sections
    const [collapsedSections, setCollapsedSections] = useState({
        headings: false, // Default expanded
        fonts: false, // Default expanded
    });

    // Toggle section collapse
    const toggleSection = (section: "headings" | "fonts") => {
        setCollapsedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    // Heading levels
    const headings = [
        { label: "Normal text", value: 0, fontSize: "16px", type: "heading" },
        { label: "Heading 1", value: 1, fontSize: "20px", type: "heading" },
        { label: "Heading 2", value: 2, fontSize: "18px", type: "heading" },
        { label: "Heading 3", value: 3, fontSize: "16px", type: "heading" },
        { label: "Heading 4", value: 4, fontSize: "14px", type: "heading" },
        { label: "Heading 5", value: 5, fontSize: "13px", type: "heading" },
    ];

    // Font families
    const fontFamilies = [
        {
            label: "Default",
            value: "",
            category: "System",
            type: "font",
        },
        {
            label: "Arial",
            value: "Arial, sans-serif",
            category: "Sans Serif",
            type: "font",
        },
        {
            label: "Helvetica",
            value: "Helvetica, Arial, sans-serif",
            category: "Sans Serif",
            type: "font",
        },
        {
            label: "Times New Roman",
            value: "Times New Roman, Times, serif",
            category: "Serif",
            type: "font",
        },
        {
            label: "Georgia",
            value: "Georgia, serif",
            category: "Serif",
            type: "font",
        },
        {
            label: "Courier New",
            value: "Courier New, Courier, monospace",
            category: "Monospace",
            type: "font",
        },
        {
            label: "Verdana",
            value: "Verdana, Geneva, sans-serif",
            category: "Sans Serif",
            type: "font",
        },
        {
            label: "Trebuchet MS",
            value: "Trebuchet MS, Helvetica, sans-serif",
            category: "Sans Serif",
            type: "font",
        },
    ];

    const getCurrentHeading = () => {
        for (let level = 1; level <= 5; level++) {
            if (editor?.isActive("heading", { level })) {
                return `H${level}`;
            }
        }
        return "P";
    };

    const getCurrentFontFamily = () => {
        if (!editor) return "Default";

        const fontFamily = editor.getAttributes("textStyle").fontFamily;
        if (!fontFamily) return "Default";

        const matchedFont = fontFamilies.find((font) => font.value === fontFamily);
        return matchedFont ? matchedFont.label : "Custom";
    };

    const handleHeadingSelect = (value: number) => {
        handleInteraction(() => {
            if (value === 0) {
                editor?.chain().setParagraph().run();
            } else {
                editor
                    ?.chain()
                    .toggleHeading({ level: value as Level })
                    .focus()
                    .run();
            }
        });
    };

    const handleFontFamilyChange = (fontFamily: string) => {
        handleInteraction(() => {
            if (fontFamily === "") {
                editor?.chain().focus().unsetFontFamily().run();
            } else {
                editor?.chain().focus().setFontFamily(fontFamily).run();
            }
        });
    };

    const currentHeading = getCurrentHeading();
    const currentFontFamily = getCurrentFontFamily();

    // Group fonts by category
    const groupedFonts = fontFamilies.reduce((acc, font) => {
        if (!acc[font.category]) {
            acc[font.category] = [];
        }
        acc[font.category].push(font);
        return acc;
    }, {} as Record<string, typeof fontFamilies>);

    return (
        <DropdownToolbar
            size="lg"
            trigger={
                <button className={cx("trigger", "text-style-trigger")}>
                    <div className={cx("text-style-info")}>
                        <span className={cx("heading-indicator")}>{currentHeading}</span>
                        <span className={cx("font-indicator")}>{currentFontFamily}</span>
                    </div>
                    <IconButton icon={faChevronDown} />
                </button>
            }
        >
            <div className={cx("text-style-dropdown")}>
                {/* Text Styles Section */}
                <div className={cx("style-section")}>
                    <div
                        className={cx("section-header", "collapsible-header")}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleSection("headings");
                        }}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <FontAwesomeIcon
                            icon={collapsedSections.headings ? faChevronRight : faChevronDown}
                            className={cx("collapse-icon")}
                        />
                        <FontAwesomeIcon icon={faHeading} className={cx("section-icon")} />
                        <span>Text Styles</span>
                        <span className={cx("section-count")}>({headings.length})</span>
                    </div>
                    <div className={cx("section-content", { collapsed: collapsedSections.headings })}>
                        {!collapsedSections.headings &&
                            headings.map(({ label, value, fontSize }) => (
                                <div
                                    key={value}
                                    style={{ fontSize }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleHeadingSelect(value);
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    className={cx("dropdown-item", "heading-item", {
                                        active:
                                            (value === 0 && !editor?.isActive("heading")) || editor?.isActive("heading", { level: value }),
                                    })}
                                >
                                    {label}
                                </div>
                            ))}
                    </div>
                </div>

                <div className={cx("section-divider")} />

                {/* Font Families Section */}
                <div className={cx("style-section")}>
                    <div
                        className={cx("section-header", "collapsible-header")}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleSection("fonts");
                        }}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <FontAwesomeIcon icon={collapsedSections.fonts ? faChevronRight : faChevronDown} className={cx("collapse-icon")} />
                        <FontAwesomeIcon icon={faFont} className={cx("section-icon")} />
                        <span>Font Families</span>
                        <span className={cx("section-count")}>({fontFamilies.length})</span>
                    </div>
                    <div className={cx("section-content", { collapsed: collapsedSections.fonts })}>
                        {!collapsedSections.fonts &&
                            Object.entries(groupedFonts).map(([category, fonts]) => (
                                <div key={category} className={cx("font-category")}>
                                    <div className={cx("category-label")}>{category}</div>
                                    {fonts.map(({ label, value }) => (
                                        <div
                                            key={value || "default"}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleFontFamilyChange(value);
                                            }}
                                            className={cx("dropdown-item", "font-item", {
                                                active: currentFontFamily === label,
                                            })}
                                            style={{ fontFamily: value || "inherit" }}
                                        >
                                            <span className={cx("font-name")}>{label}</span>
                                            <span className={cx("font-preview")}>Aa</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </DropdownToolbar>
    );
};
