import { useState, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './EditorCanvas.module.scss';
import { FileText, GripVertical, ChevronUp, ChevronDown, Copy, Trash2, Plus } from 'lucide-react';
import PropertyPanel from './PropertyPannel';
import Button from '~/components/Button';

const cx = classNames.bind(styles);

interface EditorCanvasProps {
    isGridEnabled: boolean;
    selectedSection: string | null;
    selectedBlock: string | null;
    onSectionSelect: (sectionId: string | null) => void;
    onBlockSelect: (blockId: string | null) => void;
}

const EditorCanvas = ({
    isGridEnabled,
    selectedSection,
    selectedBlock,
    onSectionSelect,
    onBlockSelect,
}: EditorCanvasProps) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [mode] = useState<'edit' | 'preview'>('edit');

    const [document] = useState({
        layout: {
            margins: { top: 40, right: 40, bottom: 40, left: 40 },
        },
        sections: [
            {
                id: 'section-1',
                title: 'Tiêu đề hợp đồng',
                order: 1,
                isLocked: false,
                style: {
                    marginTop: 0,
                    marginBottom: 20,
                    paddingLeft: 0,
                    paddingRight: 0,
                    backgroundColor: 'transparent',
                    borderColor: '#e5e7eb',
                    borderWidth: 0,
                },
                blocks: [
                    {
                        id: 'block-1',
                        type: 'text',
                        content: 'HỢP ĐỒNG DỊCH VỤ',
                        order: 1,
                        style: {
                            fontSize: 18,
                            textAlign: 'center' as const,
                            color: '#000000',
                        },
                    },
                ],
            },
        ],
    });

    const currentMode = {
        width: 794,
        height: 1123,
        scale: 1,
    };

    const CustomButton = ({ children, size, variant, onClick, disabled, title, className }: any) => (
        <button
            className={cx('custom-button', `custom-button--${size}`, `custom-button--${variant}`, className)}
            onClick={onClick}
            disabled={disabled}
            title={title}
        >
            {children}
        </button>
    );

    const CustomBadge = ({ children, variant, className }: any) => (
        <span className={cx('custom-badge', `custom-badge--${variant}`, className)}>{children}</span>
    );

    const handleSectionSelect = (sectionId: string) => {
        onSectionSelect(sectionId);
        onBlockSelect(null);
    };

    const handleBlockSelect = (blockId: string) => {
        onBlockSelect(blockId);
    };

    const renderBlock = (block: any, sectionId: string) => (
        <div
            key={block.id}
            className={cx('block', { 'block--selected': selectedBlock === block.id })}
            onClick={(e) => {
                e.stopPropagation();
                handleBlockSelect(block.id);
            }}
            style={{
                fontSize: block.style.fontSize,
                textAlign: block.style.textAlign,
                color: block.style.color,
            }}
        >
            {block.content}
        </div>
    );

    return (
        <div className={cx('editor-canvas-wrapper')}>
            <div className={cx('editor-canvas')}>
                <div className={cx('canvas-container')}>
                    <div
                        ref={canvasRef}
                        className={cx('canvas')}
                        style={{
                            width: currentMode.width * currentMode.scale,
                            minHeight: currentMode.height * currentMode.scale,
                            transform: `scale(${currentMode.scale})`,
                            transformOrigin: 'top center',
                        }}
                    >
                        {/* Grid overlay */}
                        {mode === 'edit' && isGridEnabled && (
                            <div
                                className={cx('grid-overlay')}
                                style={{
                                    backgroundImage: `
                    linear-gradient(to right, #059669 1px, transparent 1px),
                    linear-gradient(to bottom, #059669 1px, transparent 1px)
                  `,
                                    backgroundSize: `8px 8px`,
                                }}
                            />
                        )}

                        {/* Margin guides */}
                        {mode === 'edit' && (
                            <div
                                className={cx('margin-guides')}
                                style={{
                                    left: document.layout.margins.left,
                                    top: document.layout.margins.top,
                                    width:
                                        currentMode.width * currentMode.scale -
                                        document.layout.margins.left -
                                        document.layout.margins.right,
                                    height:
                                        currentMode.height * currentMode.scale -
                                        document.layout.margins.top -
                                        document.layout.margins.bottom,
                                }}
                            />
                        )}

                        {/* Document Sections */}
                        <div
                            className={cx('document-content')}
                            style={{
                                padding: `${document.layout.margins.top}px ${document.layout.margins.right}px ${document.layout.margins.bottom}px ${document.layout.margins.left}px`,
                            }}
                        >
                            {document.sections.map((section: any, index: number) => (
                                <div
                                    key={section.id}
                                    className={cx('section', {
                                        'section--selected': selectedSection === section.id,
                                        'section--edit-mode': mode === 'edit',
                                    })}
                                    style={{
                                        marginTop: section.style.marginTop,
                                        marginBottom: section.style.marginBottom,
                                        paddingLeft: section.style.paddingLeft,
                                        paddingRight: section.style.paddingRight,
                                        backgroundColor: section.style.backgroundColor,
                                        borderColor: section.style.borderColor,
                                        borderWidth: section.style.borderWidth,
                                    }}
                                    onClick={() => mode === 'edit' && handleSectionSelect(section.id)}
                                >
                                    {/* Section Header */}
                                    {mode === 'edit' && (
                                        <div className={cx('section-header')}>
                                            <div className={cx('section-header__info')}>
                                                <GripVertical className={cx('section-header__grip')} />
                                                <span className={cx('section-header__title')}>{section.title}</span>
                                                {section.isLocked && (
                                                    <CustomBadge
                                                        variant="secondary"
                                                        className={cx('section-header__badge')}
                                                    >
                                                        Khóa
                                                    </CustomBadge>
                                                )}
                                            </div>
                                            <div className={cx('section-header__actions')}>
                                                <CustomButton size="sm" variant="ghost" title="Di chuyển lên">
                                                    <ChevronUp className={cx('section-header__icon')} />
                                                </CustomButton>
                                                <CustomButton size="sm" variant="ghost" title="Di chuyển xuống">
                                                    <ChevronDown className={cx('section-header__icon')} />
                                                </CustomButton>
                                                <CustomButton size="sm" variant="ghost" title="Nhân bản">
                                                    <Copy className={cx('section-header__icon')} />
                                                </CustomButton>
                                                {!section.isLocked && (
                                                    <CustomButton size="sm" variant="ghost" title="Xóa">
                                                        <Trash2 className={cx('section-header__icon')} />
                                                    </CustomButton>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Section Content */}
                                    <div className={cx('section-content')}>
                                        {section.blocks.map((block: any) => renderBlock(block, section.id))}
                                    </div>

                                    {/* Add Block Button */}
                                    {mode === 'edit' && selectedSection === section.id && (
                                        <div className={cx('add-block-container')}>
                                            <CustomButton size="sm" variant="outline" className={cx('add-block-btn')}>
                                                <Plus className={cx('add-block-icon')} />
                                                Thêm khối nội dung
                                            </CustomButton>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Empty state */}
                            {document.sections.length === 0 && (
                                <div className={cx('empty-state')}>
                                    <FileText className={cx('empty-state__icon')} />
                                    <h3 className={cx('empty-state__title')}>Tài liệu trống</h3>
                                    <p className={cx('empty-state__description')}>
                                        Bắt đầu bằng cách thêm một mục từ thư viện bên trái hoặc kéo thả các khối nội
                                        dung vào đây
                                    </p>
                                    <div className={cx('empty-state__actions')}>
                                        <Button outline small leftIcon={<FileText size={16} />}>
                                            Tiêu đề hợp đồng
                                        </Button>
                                        <Button outline small leftIcon={<FileText size={16} />}>
                                            Thông tin các bên
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <PropertyPanel
                selectedSection={selectedSection}
                selectedBlock={selectedBlock}
                selectedSectionData={document.sections.find((s) => s.id === selectedSection)}
                selectedBlockData={document.sections.flatMap((s) => s.blocks).find((b) => b.id === selectedBlock)}
                onUpdateBlockStyle={(blockId, style) => {
                    console.log('[v0] Update block style:', blockId, style);
                }}
                onUpdateSectionStyle={(sectionId, style) => {
                    console.log('[v0] Update section style:', sectionId, style);
                }}
            />
        </div>
    );
};

export default EditorCanvas;
