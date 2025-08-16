import type React from 'react';
import classNames from 'classnames/bind';
import styles from './LoadingSpinner.module.scss';

const cx = classNames.bind(styles);

interface LoadingSpinnerProps {
    size?: 'xs' | 'small' | 'medium' | 'large' | 'xl';
    message?: string;
    className?: string;
    overlay?: boolean;
    fullScreen?: boolean;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    size = 'medium', 
    message, 
    className = '',
    overlay = false,
    fullScreen = false,
    color = 'primary'
}) => {
    const containerClasses = cx(
        'loading-spinner-container',
        {
            'loading-spinner-container--overlay': overlay,
            'loading-spinner-container--fullscreen': fullScreen,
        },
        className
    );

    const spinnerClasses = cx(
        'loading-spinner',
        `loading-spinner--${size}`,
        `loading-spinner--${color}`
    );

    return (
        <div 
            className={containerClasses}
            role="status"
            aria-live="polite"
            aria-label={message || "Loading"}
        >
            <div className={spinnerClasses}>
                <div className={cx('spinner')}></div>
                {message && (
                    <p className={cx('message', 'mt-3', 'text-sm', 'text-gray-600', 'text-center')}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LoadingSpinner;
