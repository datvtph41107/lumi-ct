import classNames from 'classnames/bind';
import styles from './EditorPage.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faCopy, faUpDownLeftRight, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { Editor } from "~/components/Editor/Editor";

const cx = classNames.bind(styles);

const EditorPage = () => {
    return (
        <>
            {/* Tag Page */}
            <div className={cx('editor-control-group')}>
                <div className={cx('page-tag')}>Page 1</div>
                <div className={cx('page-control')}>
                    <div className={cx('page-control_box', 'box_left')}>
                        <FontAwesomeIcon icon={faCirclePlus} />
                    </div>
                    <div className={cx('page-control_box')}>
                        <FontAwesomeIcon icon={faCopy} />
                    </div>
                    <div className={cx('page-control_box')}>
                        <FontAwesomeIcon icon={faUpDownLeftRight} />
                    </div>
                    <div className={cx('page-control_box', 'box_right')}>
                        <FontAwesomeIcon icon={faTrashCan} />
                    </div>
                </div>
            </div>
            <div className={cx('page-wrapper')}>
                <Editor />
            </div>
        </>
    );
};

export default EditorPage;
