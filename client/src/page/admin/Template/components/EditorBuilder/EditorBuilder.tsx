import { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './EditorBuilder.module.scss';
import { FileText, Smartphone, Settings, Eye, Undo, Redo } from 'lucide-react';
import EditorCanvas from './components/EditorCanvas';
import Dropdown from '~/page/Contract/components/Dropdown/Dropdown';

const cx = classNames.bind(styles);

const EditorBuilder = () => {
    const [selectedFormat, setSelectedFormat] = useState('a4');
    const [isGridEnabled, setIsGridEnabled] = useState(true);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

    const formatOptions = [
        { value: 'a4', label: 'A4', icon: <FileText size={16} /> },
        { value: 'web', label: 'Web', icon: <FileText size={16} /> },
        { value: 'mobile', label: 'Mobile', icon: <Smartphone size={16} /> },
    ];

    return (
        <div className={cx('tp-editor-wrapper')}>
            {/* heading editor */}
            <div className={cx('tp-editor-heading')}>
                <div className={cx('tp-editor-heading__contain')}>
                    <div className={cx('tp-editor-heading__contain_col')}>
                        <h1>Mẫu hợp đồng</h1>
                        <span className={cx('tp-editor-heading__badge')}>v1</span>
                        <span className={cx('tp-editor-heading__badge-save')}>Tự động lưu</span>
                    </div>
                    <div className={cx('tp-editor-heading__contain_col')}>
                        <div className={cx('tp-editor-controls')}>
                            <div className={cx('control-btn-gr')}>
                                <button className={cx('control-btn')} title="Hoàn tác">
                                    <Undo size={16} />
                                </button>
                                <button className={cx('control-btn')} title="Làm lại">
                                    <Redo size={16} />
                                </button>
                            </div>

                            <div className={cx('control-separator')} />
                            <Dropdown
                                options={formatOptions}
                                value={selectedFormat}
                                onChange={setSelectedFormat}
                                className={cx('format-dropdown')}
                            />

                            <div className={cx('control-separator')} />

                            <div className={cx('toggle-control')}>
                                <label className={cx('toggle-label')}>
                                    <input
                                        type="checkbox"
                                        checked={isGridEnabled}
                                        onChange={(e) => setIsGridEnabled(e.target.checked)}
                                        className={cx('toggle-input')}
                                    />
                                    <span className={cx('toggle-slider')}></span>
                                </label>
                                <span className={cx('toggle-text')}>Lưới</span>
                            </div>

                            <button className={cx('control-btn-gear')} title="Cài đặt">
                                <Settings size={16} />
                            </button>

                            <button className={cx('preview-btn')} title="Xem trước">
                                <Eye size={16} />
                                Xem trước
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <EditorCanvas
                isGridEnabled={isGridEnabled}
                selectedSection={selectedSection}
                selectedBlock={selectedBlock}
                onSectionSelect={setSelectedSection}
                onBlockSelect={setSelectedBlock}
            />
        </div>
    );
};

export default EditorBuilder;
