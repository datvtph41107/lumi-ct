import type React from 'react';
import classNames from 'classnames/bind';
import styles from '../UserLogDetail.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

interface EmptyStateProps {
    icon: IconDefinition;
    message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, message }) => {
    return (
        <div className={cx('empty-state')}>
            <div className={cx('empty-icon')}>
                <FontAwesomeIcon icon={icon} />
            </div>
            <p>{message}</p>
        </div>
    );
};

export default EmptyState;
