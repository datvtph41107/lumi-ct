import type React from "react";
import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { SessionManager } from "~/core/http/settings/SessionManager";
import styles from "./SessionWarningModal.module.scss";

const cx = classNames.bind(styles);

interface IdleWarningDetail {
    message: string;
    timeoutType: "browser" | "api";
    remainingTime: number;
}

const SessionWarningModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [warningDetail, setWarningDetail] = useState<IdleWarningDetail | null>(null);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        console.log("handleIdleWarning OPEN");
        const handleIdleWarning = (event: CustomEvent<IdleWarningDetail>) => {
            setWarningDetail(event.detail);
            setCountdown(Math.floor(event.detail.remainingTime / 1000));
            setIsOpen(true);
        };

        const handleWarningCleared = () => {
            setIsOpen(false);
            setWarningDetail(null);
            setCountdown(0);
        };

        window.addEventListener("auth:idle-warning", handleIdleWarning as EventListener);
        window.addEventListener("auth:idle-warning-cleared", handleWarningCleared);

        return () => {
            window.removeEventListener("auth:idle-warning", handleIdleWarning as EventListener);
            window.removeEventListener("auth:idle-warning-cleared", handleWarningCleared);
        };
    }, []);

    // Countdown timer
    useEffect(() => {
        if (!isOpen || countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    setIsOpen(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, countdown]);

    const handleStayLoggedIn = () => {
        SessionManager.getInstance().extendSession();
        setIsOpen(false);
    };

    const handleLogout = () => {
        SessionManager.getInstance().broadcastLogout("manual");
        window.dispatchEvent(new CustomEvent("auth:logout"));
        setIsOpen(false);
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            // Don't allow closing by clicking overlay for security
            return;
        }
    };

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    if (!isOpen || !warningDetail) return null;

    return (
        <div className={cx("overlay")} onClick={handleOverlayClick}>
            <div className={cx("modal")} role="dialog" aria-modal="true" aria-labelledby="idle-warning-title">
                <div className={cx("header")}>
                    <h2 id="idle-warning-title" className={cx("title")}>
                        <span className={cx("warningIcon")}>⚠️</span>
                        Session Timeout Warning
                    </h2>
                    <div className={cx("description")}>
                        <p>{warningDetail.message}</p>
                        <p>
                            {warningDetail.timeoutType === "api"
                                ? "We noticed you haven't interacted with the application recently."
                                : "We detected no browser activity for an extended period."}
                        </p>
                    </div>
                </div>

                <div className={cx("content")}>
                    <div className={cx("countdown")}>
                        <div className={cx("countdownTime")}>{formatTime(countdown)}</div>
                        <div className={cx("countdownLabel")}>Time remaining</div>
                    </div>
                </div>

                <div className={cx("footer")}>
                    <button type="button" className={cx("button", "secondary")} onClick={handleLogout}>
                        Logout Now
                    </button>
                    <button type="button" className={cx("button", "primary")} onClick={handleStayLoggedIn}>
                        Stay Logged In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionWarningModal;
