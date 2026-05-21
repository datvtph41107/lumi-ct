import classNames from 'classnames/bind';
import styles from './PropertyPannel.module.scss';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

const cx = classNames.bind(styles);

const PropertyPanel = ({
    selectedSection,
    selectedBlock,
    selectedSectionData,
    selectedBlockData,
    onUpdateBlockStyle,
    onUpdateSectionStyle,
}) => {
    if (!selectedSection && !selectedBlock) {
        return null;
    }

    return (
        <div className={cx('property-panel')}>
            <div className={cx('property-panel__header')}>
                <h3 className={cx('property-panel__title')}>Thuộc tính</h3>
                <p className={cx('property-panel__subtitle')}>{selectedBlock ? 'Khối được chọn' : 'Mục được chọn'}</p>
            </div>
        </div>
    );
};

export default PropertyPanel;
