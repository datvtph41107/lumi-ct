import axios from 'axios';
import { ConfigManager } from './ConfigManager';

export class SessionManager {
    private static instance: SessionManager;
    private broadcastChannel: BroadcastChannel;
    private browserIdleTimer: NodeJS.Timeout | null = null;
    private apiIdleTimer: NodeJS.Timeout | null = null;
    private warningTimer: NodeJS.Timeout | null = null;
    private activityUpdateTimer: NodeJS.Timeout | null = null;
    private sessionId: string | null = null;
    private lastBrowserActivity: number = Date.now();
    private lastApiActivity: number = Date.now();
    private isWarningShown = false;

    private readonly BROWSER_IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes - browser events
    private readonly API_IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes - API calls
    private readonly WARNING_BEFORE_LOGOUT = 60 * 1000; // 1 minute warning
    private readonly ACTIVITY_UPDATE_INTERVAL = 3 * 60 * 1000; // 3 minutes

    private constructor() {
        this.broadcastChannel = new BroadcastChannel('auth-channel');
        this.setupEventListeners();
        this.startIdleDetection();
    }

    static getInstance(): SessionManager {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }

    setSessionId(sessionId: string): void {
        this.sessionId = sessionId;
        this.resetAllActivity();
        this.startActivityUpdates();
        console.log('[SessionManager] Session started:', sessionId);
    }

    getSessionId(): string | null {
        return this.sessionId;
    }

    clearSession(): void {
        this.sessionId = null;
        this.stopAllTimers();
        this.isWarningShown = false;
        console.log('[SessionManager] Session cleared');
    }

    // ✅ Method để track API activity
    trackApiActivity(): void {
        this.lastApiActivity = Date.now();
        this.resetApiIdleTimer();

        // Nếu có API activity, cũng reset browser idle
        this.resetBrowserIdleTimer();

        console.log('[SessionManager] API activity tracked');
    }

    // ✅ Method để track browser activity
    trackBrowserActivity(): void {
        this.lastBrowserActivity = Date.now();
        this.resetBrowserIdleTimer();

        // Clear warning nếu user active trở lại
        if (this.isWarningShown) {
            this.clearIdleWarning();
        }

        console.log('[SessionManager] Browser activity tracked');
    }

    // ✅ Broadcast methods
    broadcastLogout(reason: 'manual' | 'idle' | 'api-timeout' | 'browser-timeout' = 'manual'): void {
        this.broadcastChannel.postMessage({
            type: 'LOGOUT',
            reason,
            timestamp: Date.now(),
        });
        console.log('[SessionManager] Logout broadcasted:', reason);
    }

    broadcastLogin(sessionId: string): void {
        this.broadcastChannel.postMessage({
            type: 'LOGIN',
            sessionId,
            timestamp: Date.now(),
        });
        console.log('[SessionManager] Login broadcasted:', sessionId);
    }

    // ✅ Warning system
    private showIdleWarning(timeoutType: 'browser' | 'api'): void {
        if (this.isWarningShown) return;

        this.isWarningShown = true;
        const message =
            timeoutType === 'api'
                ? "You haven't performed any actions recently. You'll be logged out in 5 minutes for security."
                : "You appear to be inactive. You'll be logged out in 5 minutes for security.";

        // Dispatch custom event for UI to show warning
        window.dispatchEvent(
            new CustomEvent('auth:idle-warning', {
                detail: { message, timeoutType, remainingTime: this.WARNING_BEFORE_LOGOUT },
            }),
        );

        // Set final logout timer
        this.warningTimer = setTimeout(() => {
            this.handleIdleTimeout(timeoutType);
        }, this.WARNING_BEFORE_LOGOUT);

        console.log('[SessionManager] Idle warning shown:', timeoutType);
    }

    private clearIdleWarning(): void {
        if (!this.isWarningShown) return;

        this.isWarningShown = false;
        if (this.warningTimer) {
            clearTimeout(this.warningTimer);
            this.warningTimer = null;
        }

        // Dispatch event to hide warning
        window.dispatchEvent(new CustomEvent('auth:idle-warning-cleared'));
        console.log('[SessionManager] Idle warning cleared');
    }

    private setupEventListeners(): void {
        // ✅ Listen for messages from other tabs
        this.broadcastChannel.addEventListener('message', (event) => {
            const { type, sessionId, reason } = event.data;

            switch (type) {
                case 'LOGOUT':
                    console.log('[SessionManager] Received logout broadcast:', reason);
                    window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason } }));
                    break;

                case 'LOGIN':
                    console.log('[SessionManager] Received login broadcast:', sessionId);
                    this.setSessionId(sessionId);
                    break;
            }
        });

        // ✅ Browser activity events
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'focus', 'blur'];

        const throttledBrowserActivity = this.throttle(() => {
            this.trackBrowserActivity();
        }, 1000); // Throttle to once per second

        activityEvents.forEach((event) => {
            document.addEventListener(event, throttledBrowserActivity, { passive: true });
        });

        // ✅ Page visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.trackBrowserActivity();
            }
        });

        // ✅ Before unload cleanup
        window.addEventListener('beforeunload', () => {
            try {
                const baseURL = ConfigManager.getInstance().getApiConfig().baseURL;
                const url = `${baseURL.replace(/\/$/, '')}/auth/logout`;
                navigator.sendBeacon?.(url, JSON.stringify({ reason: 'tab-close' }));
            } catch (err) {
                console.error('[SessionManager] Logout beacon error:', err);
                // optional fallback luôn
                try {
                    fetch('/auth/logout', {
                        method: 'POST',
                        body: JSON.stringify({ reason: 'tab-close' }),
                        headers: { 'Content-Type': 'application/json' },
                        keepalive: true,
                    });
                } catch (fallbackErr) {
                    console.error('[SessionManager] Final fallback logout failed:', fallbackErr);
                }
            } finally {
                this.cleanup();
            }
        });
    }

    private startIdleDetection(): void {
        this.resetAllActivity();
    }

    private resetAllActivity(): void {
        const now = Date.now();
        this.lastBrowserActivity = now;
        this.lastApiActivity = now;
        this.resetBrowserIdleTimer();
        this.resetApiIdleTimer();
        this.clearIdleWarning();
    }

    private resetBrowserIdleTimer(): void {
        if (this.browserIdleTimer) {
            clearTimeout(this.browserIdleTimer);
        }

        this.browserIdleTimer = setTimeout(() => {
            console.log('[SessionManager] Browser idle timeout detected');
            this.showIdleWarning('browser');
        }, this.BROWSER_IDLE_TIMEOUT - this.WARNING_BEFORE_LOGOUT);
    }

    private resetApiIdleTimer(): void {
        if (this.apiIdleTimer) {
            clearTimeout(this.apiIdleTimer);
        }

        this.apiIdleTimer = setTimeout(() => {
            console.log('[SessionManager] API idle timeout detected');
            this.showIdleWarning('api');
        }, this.API_IDLE_TIMEOUT - this.WARNING_BEFORE_LOGOUT);
    }

    private stopAllTimers(): void {
        const timers = [this.browserIdleTimer, this.apiIdleTimer, this.warningTimer, this.activityUpdateTimer];

        timers.forEach((timer) => {
            if (timer) clearTimeout(timer);
        });

        this.browserIdleTimer = null;
        this.apiIdleTimer = null;
        this.warningTimer = null;
        this.activityUpdateTimer = null;
    }

    private startActivityUpdates(): void {
        this.stopActivityUpdates();

        this.activityUpdateTimer = setInterval(async () => {
            try {
                await this.updateServerActivity();
            } catch (error) {
                console.error('[SessionManager] Failed to update server activity:', error);
            }
        }, this.ACTIVITY_UPDATE_INTERVAL);
    }

    private stopActivityUpdates(): void {
        if (this.activityUpdateTimer) {
            clearInterval(this.activityUpdateTimer);
            this.activityUpdateTimer = null;
        }
    }

    private async updateServerActivity(): Promise<void> {
        try {
            const config = ConfigManager.getInstance().getApiConfig();

            console.log('[AuthManager] Sending updateServerActivity request');

            const res = await axios.post(
                `${config.baseURL}auth/update-activity`,
                {
                    lastBrowserActivity: this.lastBrowserActivity,
                    lastApiActivity: this.lastApiActivity,
                },
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' },
                    timeout: config.timeout,
                },
            );

            console.log('[SessionManager] Server activity updated', res.data);
        } catch (error) {
            console.error('[SessionManager] Activity update failed:', error);
        }
    }

    private handleIdleTimeout(type: 'browser' | 'api'): void {
        const reason = type === 'api' ? 'api-timeout' : 'browser-timeout';
        this.broadcastLogout(reason);
        window.dispatchEvent(
            new CustomEvent('auth:idle-timeout', {
                detail: { type, reason },
            }),
        );
    }

    private cleanup(): void {
        this.stopAllTimers();
        this.broadcastChannel.close();
    }

    // ✅ Utility method
    private throttle<T extends (...args: unknown[]) => void>(func: T, limit: number): T {
        let inThrottle = false;

        return function (this: unknown, ...args: Parameters<T>): void {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        } as T;
    }

    // ✅ Public methods for manual control
    extendSession(): void {
        this.resetAllActivity();
        console.log('[SessionManager] Session manually extended');
    }

    getActivityStatus(): {
        lastBrowserActivity: number;
        lastApiActivity: number;
        timeSinceLastBrowser: number;
        timeSinceLastApi: number;
    } {
        const now = Date.now();
        return {
            lastBrowserActivity: this.lastBrowserActivity,
            lastApiActivity: this.lastApiActivity,
            timeSinceLastBrowser: now - this.lastBrowserActivity,
            timeSinceLastApi: now - this.lastApiActivity,
        };
    }
}
