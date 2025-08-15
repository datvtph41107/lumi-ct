import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faClock, faSignOutAlt, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import styles from './IdleWarningModal.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface IdleWarningModalProps {
    timeUntilLogout: number;
    onContinue: () => void;
    onLogout: () => void;
}

const InactiveSessionAlert: React.FC<IdleWarningModalProps> = ({ timeUntilLogout, onContinue, onLogout }) => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const timeLeftSeconds = Math.ceil(Math.max(0, timeUntilLogout) / 1000);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getProgressPercentage = () => {
        const totalTime = 5 * 60; // 5 minutes in seconds (matches SessionManager warning window)
        const remainingTime = timeLeftSeconds;
        return ((totalTime - remainingTime) / totalTime) * 100;
    };

    const handleContinue = () => {
        onContinue();
    };

    const handleLogout = () => {
        setIsLoggingOut(true);
        onLogout();
    };

    return (
        <div className={cx('idle-warning-overlay')}>
            <div className={cx('idle-warning-modal')}>
                <div className={cx('modal-header')}>
                    <FontAwesomeIcon icon={faExclamationTriangle} className={cx('warning-icon')} />
                    <h3>Phiên đăng nhập sắp hết hạn</h3>
                </div>

                <div className={cx('modal-body')}>
                    <p>Bạn đã không hoạt động trong một thời gian. Phiên đăng nhập sẽ tự động kết thúc trong:</p>

                    <div className={cx('countdown')}>
                        <FontAwesomeIcon icon={faClock} />
                        <span className={cx('time-display')}>{formatTime(timeLeftSeconds)}</span>
                    </div>

                    <div className={cx('progress-bar')}>
                        <div className={cx('progress-fill')} style={{ width: `${getProgressPercentage()}%` }} />
                    </div>

                    <div className={cx('warning-message')}>
                        <p>
                            <strong>Lưu ý:</strong> Khi phiên đăng nhập kết thúc, bạn sẽ cần đăng nhập lại và có thể mất dữ liệu chưa lưu.
                        </p>
                    </div>
                </div>

                <div className={cx('modal-actions')}>
                    <button className={cx('continue-btn')} onClick={handleContinue} disabled={isLoggingOut}>
                        <FontAwesomeIcon icon={faCheckCircle} />
                        Tiếp tục phiên đăng nhập
                    </button>

                    <button className={cx('logout-btn')} onClick={handleLogout} disabled={isLoggingOut}>
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        Đăng xuất ngay
                    </button>
                </div>

                {isLoggingOut && (
                    <div className={cx('logout-overlay')}>
                        <div className={cx('logout-spinner')}></div>
                        <p>Đang đăng xuất...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InactiveSessionAlert;
