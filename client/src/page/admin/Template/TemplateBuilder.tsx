import classNames from 'classnames/bind';
import style from './TemplateBuilder.module.scss';
import Button from '~/components/Button';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FileText, Redo, Save, Undo, Upload } from 'lucide-react';
import Sidebar from './components/Sidebar/Sidebar';
import EditorBuilder from './components/EditorBuilder/EditorBuilder';

const cx = classNames.bind(style);

function TemplateBuilder() {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('tb-h')}>
                <div className={cx('tb-h-gr')}>
                    <div className={cx('tb-h-gr-inline')}>
                        <Button small transparent leftIcon={<FontAwesomeIcon icon={faArrowLeft} />}>
                            Danh sách mẫu
                        </Button>
                        <FileText className={cx('tb-h-ic-title')} />
                        <h1 className={cx('tb-h-title')}>A4 Contract Builder</h1>
                        <span className={cx('tb-h-title-catalog')}>
                            {/* {currentTemplate ? currentTemplate.name : 'Untitled Contract'} */}
                            Untitled Contract
                        </span>
                        {/* {currentTemplate && (
                            <>
                                <Separator orientation="vertical" className="h-6" />
                                <span className="text-xs text-muted-foreground">{currentTemplate.version}</span>
                                
                            </>
                        )} */}
                        <span className={cx('tb-h-bd-v')}>v1.0</span>
                    </div>
                    <div className={cx('tb-h-gr-inline')}>
                        <button className={cx('tb-btn')}>
                            <Undo className={cx('tb-bt-ic')} />
                        </button>
                        <button className={cx('tb-btn')}>
                            <Redo className={cx('tb-bt-ic')} />
                        </button>
                        <Button
                            className={cx('tb-bt-save')}
                            leftIcon={<Save className={cx('tb-bt-ic', 'mr-2')} />}
                            outline
                            small
                        >
                            Lưu
                        </Button>
                        <Button
                            small
                            primary
                            leftIcon={<Upload className={cx('tb-bt-ic', 'mr-2')} />}
                            className={cx('tb-bt-upload')}
                        >
                            Xuất bản
                        </Button>
                    </div>
                </div>
            </div>
            <div className={cx('container')}>
                <Sidebar />
                <EditorBuilder />
            </div>
        </div>
    );
}

export default TemplateBuilder;
