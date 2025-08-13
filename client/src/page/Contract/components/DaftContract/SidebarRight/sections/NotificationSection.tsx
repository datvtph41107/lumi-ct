"use client";

import type React from "react";
import classNames from "classnames/bind";
import styles from "../SidebarRight.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faChevronUp, faChevronDown, faFlag, faTasks, faCheck, faClock } from "@fortawesome/free-solid-svg-icons";
import type { Notification } from "~/types/milestones";

const cx = classNames.bind(styles);

interface NotificationsSectionProps {
    isExpanded: boolean;
    onToggle: () => void;
    notifications: Notification[];
    markNotificationAsRead: (id: number) => void;
}

const NotificationsSection: React.FC<NotificationsSectionProps> = ({ isExpanded, onToggle, notifications, markNotificationAsRead }) => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    const recentNotifications = notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10);

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) {
            return `${diffMins} phút trước`;
        } else if (diffHours < 24) {
            return `${diffHours} giờ trước`;
        } else {
            return `${diffDays} ngày trước`;
        }
    };

    return (
        <div className={cx("section")}>
            <div className={cx("header_right")} onClick={onToggle}>
                <div className={cx("header_right-layer")}>
                    <h4>
                        <FontAwesomeIcon icon={faBell} /> Thông báo
                        {unreadNotifications.length > 0 && <span className={cx("notification-badge")}>{unreadNotifications.length}</span>}
                    </h4>
                    <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
                </div>
                <p className={cx("subtext")}>Nhắc nhở về mốc thời gian và công việc sắp đến hạn</p>
            </div>

            {isExpanded && (
                <div className={cx("section-content")}>
                    {recentNotifications.length > 0 ? (
                        <div className={cx("notifications-list")}>
                            {recentNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cx("notification-item", { unread: !notification.isRead })}
                                    onClick={() => markNotificationAsRead(notification.id)}
                                >
                                    <div className={cx("notification-icon")}>
                                        <FontAwesomeIcon
                                            icon={notification.type === "milestone" ? faFlag : faTasks}
                                            style={{ color: notification.type === "milestone" ? "#e74c3c" : "#3498db" }}
                                        />
                                    </div>

                                    <div className={cx("notification-content")}>
                                        <div className={cx("notification-title")}>{notification.title}</div>
                                        <div className={cx("notification-message")}>{notification.message}</div>
                                        <div className={cx("notification-time")}>
                                            <FontAwesomeIcon icon={faClock} />
                                            {formatTimeAgo(notification.createdAt)}
                                        </div>
                                    </div>

                                    {!notification.isRead && <div className={cx("unread-indicator")} />}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={cx("empty-state")}>
                            <FontAwesomeIcon icon={faCheck} />
                            <p>Không có thông báo mới</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationsSection;
