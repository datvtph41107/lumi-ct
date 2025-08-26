import classNames from 'classnames/bind';
import styles from './EditorBuilder.module.scss';

const cx = classNames.bind(styles);

const EditorBuilder = () => {
    return (
        <div className={cx('tp-editor-wrapper')}>
            <div></div>
        </div>
    );
};

export default EditorBuilder;
