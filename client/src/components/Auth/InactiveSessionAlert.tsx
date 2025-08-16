import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faClock, faSignOutAlt, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

interface IdleWarningModalProps {
    timeUntilLogout: number;
    onContinue: () => void;
    onLogout: () => void;
}

const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
};

const modalStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: 8,
    padding: 20,
    width: 420,
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
};

const headerStyle: React.CSSProperties = { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 };
const actionsStyle: React.CSSProperties = { display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' };
const progressWrap: React.CSSProperties = {
    width: '100%',
    height: 6,
    background: '#eee',
    borderRadius: 999,
    overflow: 'hidden',
};

const InactiveSessionAlert: React.FC<IdleWarningModalProps> = ({ timeUntilLogout, onContinue, onLogout }) => {
    const [timeLeft, setTimeLeft] = useState(Math.ceil(timeUntilLogout / 1000));
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setIsLoggingOut(true);
                    onLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [onLogout]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getProgressPercentage = () => {
        const totalTime = 5 * 60; // 5 minutes in seconds
        const remainingTime = timeLeft;
        return ((totalTime - remainingTime) / totalTime) * 100;
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <FontAwesomeIcon icon={faExclamationTriangle} color="#d97706" />
                    <h3 style={{ margin: 0 }}>Phiên đăng nhập sắp hết hạn</h3>
                </div>
                <p>Bạn đã không hoạt động trong một thời gian. Phiên đăng nhập sẽ tự động kết thúc trong:</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
                    <FontAwesomeIcon icon={faClock} />
                    <strong>{formatTime(timeLeft)}</strong>
                </div>
                <div style={progressWrap}>
                    <div style={{ width: `${getProgressPercentage()}%`, height: '100%', background: '#ef4444' }} />
                </div>
                <div style={actionsStyle}>
                    <button onClick={onContinue} disabled={isLoggingOut} style={{ padding: '8px 12px' }}>
                        <FontAwesomeIcon icon={faCheckCircle} /> Tiếp tục
                    </button>
                    <button
                        onClick={() => {
                            setIsLoggingOut(true);
                            onLogout();
                        }}
                        disabled={isLoggingOut}
                        style={{ padding: '8px 12px' }}
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} /> Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InactiveSessionAlert;
