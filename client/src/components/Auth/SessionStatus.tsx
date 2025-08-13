import type React from "react";
import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { useAppSelector } from "~/redux/hooks";
import { SessionManager } from "~/core/http/settings/SessionManager";
import styles from "./SessionStatus.module.scss";

const cx = classNames.bind(styles);

const SessionStatus: React.FC = () => {
    const { isAuthenticated, sessionId, tokenExpiry } = useAppSelector((state) => state.auth);
    const [activityStatus, setActivityStatus] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState(Date.now());

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Update activity status every 5 seconds
    useEffect(() => {
        if (!isAuthenticated) return;

        const updateStatus = () => {
            const status = SessionManager.getInstance().getActivityStatus();
            setActivityStatus(status);
        };

        updateStatus();
        const timer = setInterval(updateStatus, 5000);

        return () => clearInterval(timer);
    }, [isAuthenticated]);

    if (!isAuthenticated || !activityStatus) return null;

    const formatTime = (timestamp: number): string => {
        const seconds = Math.floor((currentTime - timestamp) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}m ago`;
    };

    const getTokenTimeRemaining = (): string => {
        if (!tokenExpiry) return "Unknown";
        const remaining = tokenExpiry * 1000 - currentTime;
        if (remaining <= 0) return "Expired";
        const minutes = Math.floor(remaining / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const getStatusIndicator = () => {
        const browserIdle = currentTime - activityStatus.lastBrowserActivity;
        const apiIdle = currentTime - activityStatus.lastApiActivity;

        if (browserIdle > 30 * 60 * 1000 || apiIdle > 25 * 60 * 1000) {
            return { type: "warning", label: "Idle Warning" };
        }
        if (browserIdle > 45 * 60 * 1000) {
            return { type: "inactive", label: "Inactive" };
        }
        return { type: "active", label: "Active" };
    };

    const status = getStatusIndicator();

    return (
        <div className={cx("container")}>
            <div className={cx("status")}>
                <div className={cx("indicator", status.type)} />
                <span className={cx("label")}>{status.label}</span>
            </div>
            <div className={cx("details")}>
                <div>Session: {sessionId?.slice(-8)}</div>
                <div>Browser: {formatTime(activityStatus.lastBrowserActivity)}</div>
                <div>API: {formatTime(activityStatus.lastApiActivity)}</div>
                <div className={cx("time")}>Token: {getTokenTimeRemaining()}</div>
            </div>
        </div>
    );
};

export default SessionStatus;
