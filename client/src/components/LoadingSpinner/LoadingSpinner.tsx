import type React from 'react';
import classNames from 'classnames/bind';
import styles from './LoadingSpinner.module.scss';

const cx = classNames.bind(styles);

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    message?: string;
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', message, className = '' }) => {
    return (
        <div className={cx('loading-spinner-container', className)}>
            <div className={cx('loading-spinner', `loading-spinner--${size}`)}>
                <div className={cx('spinner')}></div>
                {message && <p className="mt-3 text-sm text-gray-600 text-center">{message}</p>}
            </div>
        </div>
    );
};

export default LoadingSpinner;
