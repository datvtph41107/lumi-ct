import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateLastActivity, logout } from '~/redux/slices/auth.slice';
import { useAppDispatch, useAppSelector } from '~/redux/hooks';
import { SessionManager } from '~/core/http/settings/SessionManager';

interface UseIdleTimeoutOptions {
    onWarning?: () => void;
    onLogout?: () => void;
}

export const useInactiveTimeout = (options: UseIdleTimeoutOptions = {}) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { isAuthenticated } = useAppSelector((state) => state.auth);

    const [isWarningVisible, setIsWarningVisible] = useState(false);
    const [timeUntilLogout, setTimeUntilLogout] = useState<number>(0);

    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const warningDeadlineRef = useRef<number | null>(null);
    const hasLoggedOutRef = useRef<boolean>(false);

    const clearCountdown = useCallback(() => {
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
        warningDeadlineRef.current = null;
        setTimeUntilLogout(0);
    }, []);

    const startCountdown = useCallback(
        (initialRemainingMs: number) => {
            warningDeadlineRef.current = Date.now() + initialRemainingMs;
            setTimeUntilLogout(initialRemainingMs);

            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }
            countdownIntervalRef.current = setInterval(() => {
                const deadline = warningDeadlineRef.current ?? Date.now();
                const remaining = Math.max(0, deadline - Date.now());
                setTimeUntilLogout(remaining);
                if (remaining <= 0) {
                    clearCountdown();
                    // Fallback in case the SessionManager event is missed
                    void performLogout('idle');
                }
            }, 1000);
        },
        [clearCountdown],
    );

    const continueSession = useCallback(() => {
        SessionManager.getInstance().extendSession();
        setIsWarningVisible(false);
        clearCountdown();
        dispatch(updateLastActivity());
        if ('Notification' in window && Notification.permission === 'default') {
            try {
                void Notification.requestPermission();
            } catch {}
        }
    }, [dispatch, clearCountdown]);

    const performLogout = useCallback(
        async (reason: 'idle' | 'manual' | 'broadcast' | 'api-timeout' | 'browser-timeout' = 'manual') => {
            if (hasLoggedOutRef.current) return;
            hasLoggedOutRef.current = true;
            setIsWarningVisible(false);
            clearCountdown();

            try {
                await dispatch(logout()).unwrap();
            } catch {
                // ignore and continue navigation
            } finally {
                options.onLogout?.();
                try {
                    SessionManager.getInstance().clearSession();
                } catch {}
                navigate('/login', {
                    replace: true,
                    state: {
                        message:
                            reason === 'idle' || reason === 'api-timeout' || reason === 'browser-timeout'
                                ? 'Phiên đăng nhập đã hết hạn do không hoạt động'
                                : undefined,
                    },
                });
            }
        },
        [dispatch, navigate, options, clearCountdown],
    );

    const logoutNow = useCallback(() => {
        try {
            SessionManager.getInstance().broadcastLogout('manual');
        } catch {}
        void performLogout('manual');
    }, [performLogout]);

    useEffect(() => {
        if (!isAuthenticated) {
            setIsWarningVisible(false);
            clearCountdown();
            hasLoggedOutRef.current = false;
            return;
        }

        const handleIdleWarning = (ev: Event) => {
            const event = ev as CustomEvent<{
                message: string;
                timeoutType: 'api' | 'browser';
                remainingTime: number;
            }>;
            setIsWarningVisible(true);
            startCountdown(event.detail?.remainingTime ?? 5 * 60 * 1000);
            options.onWarning?.();
            if ('Notification' in window && Notification.permission === 'granted') {
                try {
                    new Notification('Phiên đăng nhập sắp hết hạn', {
                        body: 'Bạn sẽ bị đăng xuất trong ít phút nếu không hoạt động.',
                        tag: 'idle-warning',
                    });
                } catch {}
            }
        };

        const handleIdleWarningCleared = () => {
            setIsWarningVisible(false);
            clearCountdown();
        };

        const handleIdleTimeout = () => {
            void performLogout('idle');
        };

        const handleBroadcastLogout = (ev: Event) => {
            const event = ev as CustomEvent<{ reason: 'manual' | 'idle' | 'api-timeout' | 'browser-timeout' }>;
            const reason = event.detail?.reason ?? 'manual';
            void performLogout(reason);
        };

        window.addEventListener('auth:idle-warning', handleIdleWarning as EventListener);
        window.addEventListener('auth:idle-warning-cleared', handleIdleWarningCleared as EventListener);
        window.addEventListener('auth:idle-timeout', handleIdleTimeout as EventListener);
        window.addEventListener('auth:logout', handleBroadcastLogout as EventListener);

        return () => {
            window.removeEventListener('auth:idle-warning', handleIdleWarning as EventListener);
            window.removeEventListener('auth:idle-warning-cleared', handleIdleWarningCleared as EventListener);
            window.removeEventListener('auth:idle-timeout', handleIdleTimeout as EventListener);
            window.removeEventListener('auth:logout', handleBroadcastLogout as EventListener);
        };
    }, [isAuthenticated, startCountdown, clearCountdown, performLogout, options]);

    return {
        isWarningVisible,
        timeUntilLogout,
        continueSession,
        logoutNow,
    };
};
