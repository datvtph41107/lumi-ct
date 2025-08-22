import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBell, 
    faTimes, 
    faEnvelope, 
    faExclamationTriangle,
    faCheckCircle,
    faInfoCircle,
    faClock,
    faUser,
    faEye,
    faTrash,
    faCheck,
    faTimes as faTimesSolid
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './NotificationModal.module.scss';
import type { Notification, NotificationType } from '~/types/notifications.types';
import { Logger } from '~/core/Logger';

const cx = classNames.bind(styles);
const logger = Logger.getInstance();

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    notifications?: Notification[];
    onMarkAsRead?: (notificationId: string) => void;
    onDeleteNotification?: (notificationId: string) => void;
    onViewNotification?: (notification: Notification) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
    isOpen,
    onClose,
    notifications = [],
    onMarkAsRead,
    onDeleteNotification,
    onViewNotification
}) => {
    const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (isOpen) {
            filterNotifications();
        }
    }, [isOpen, notifications, activeTab]);

    const filterNotifications = () => {
        let filtered = [...notifications];
        
        switch (activeTab) {
            case 'unread':
                filtered = filtered.filter(n => !n.isRead);
                break;
            case 'read':
                filtered = filtered.filter(n => n.isRead);
                break;
            default:
                break;
        }
        
        // Sort by created date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setFilteredNotifications(filtered);
    };

    const handleMarkAsRead = (notificationId: string) => {
        if (onMarkAsRead) {
            onMarkAsRead(notificationId);
        }
    };

    const handleDeleteNotification = (notificationId: string) => {
        if (onDeleteNotification) {
            onDeleteNotification(notificationId);
        }
    };

    const handleViewNotification = (notification: Notification) => {
        if (onViewNotification) {
            onViewNotification(notification);
        }
        if (!notification.isRead && onMarkAsRead) {
            onMarkAsRead(notification.id);
        }
    };

    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return faCheckCircle;
            case 'warning':
                return faExclamationTriangle;
            case 'error':
                return faExclamationTriangle;
            case 'info':
                return faInfoCircle;
            default:
                return faBell;
        }
    };

    const getNotificationColor = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return 'var(--success-color)';
            case 'warning':
                return 'var(--warning-color)';
            case 'error':
                return 'var(--danger-color)';
            case 'info':
                return 'var(--primary-color)';
            default:
                return 'var(--text-secondary)';
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'Vừa xong';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} phút trước`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} giờ trước`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} ngày trước`;
        }
    };

    const getUnreadCount = () => {
        return notifications.filter(n => !n.isRead).length;
    };

    if (!isOpen) return null;

    return (
        <div className={cx('notification-modal-overlay')} onClick={onClose}>
            <div className={cx('notification-modal')} onClick={(e) => e.stopPropagation()}>
                <div className={cx('modal-header')}>
                    <div className={cx('header-content')}>
                        <h3>
                            <FontAwesomeIcon icon={faBell} />
                            Thông báo
                        </h3>
                        {getUnreadCount() > 0 && (
                            <span className={cx('unread-badge')}>{getUnreadCount()}</span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={cx('close-btn')}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className={cx('modal-tabs')}>
                    <button
                        type="button"
                        className={cx('tab-btn', { active: activeTab === 'all' })}
                        onClick={() => setActiveTab('all')}
                    >
                        Tất cả ({notifications.length})
                    </button>
                    <button
                        type="button"
                        className={cx('tab-btn', { active: activeTab === 'unread' })}
                        onClick={() => setActiveTab('unread')}
                    >
                        Chưa đọc ({getUnreadCount()})
                    </button>
                    <button
                        type="button"
                        className={cx('tab-btn', { active: activeTab === 'read' })}
                        onClick={() => setActiveTab('read')}
                    >
                        Đã đọc ({notifications.length - getUnreadCount()})
                    </button>
                </div>

                <div className={cx('modal-content')}>
                    {filteredNotifications.length === 0 ? (
                        <div className={cx('empty-state')}>
                            <FontAwesomeIcon icon={faBell} />
                            <p>Không có thông báo nào</p>
                        </div>
                    ) : (
                        <div className={cx('notifications-list')}>
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cx('notification-item', {
                                        unread: !notification.isRead,
                                        read: notification.isRead
                                    })}
                                >
                                    <div className={cx('notification-icon')}>
                                        <FontAwesomeIcon 
                                            icon={getNotificationIcon(notification.type)}
                                            style={{ color: getNotificationColor(notification.type) }}
                                        />
                                    </div>

                                    <div className={cx('notification-content')}>
                                        <div className={cx('notification-header')}>
                                            <h4>{notification.title}</h4>
                                            <div className={cx('notification-actions')}>
                                                {!notification.isRead && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className={cx('action-btn', 'mark-read')}
                                                        title="Đánh dấu đã đọc"
                                                    >
                                                        <FontAwesomeIcon icon={faCheck} />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteNotification(notification.id)}
                                                    className={cx('action-btn', 'delete')}
                                                    title="Xóa thông báo"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </div>

                                        <p className={cx('notification-message')}>
                                            {notification.message}
                                        </p>

                                        <div className={cx('notification-meta')}>
                                            <div className={cx('meta-left')}>
                                                {notification.sender && (
                                                    <span className={cx('sender')}>
                                                        <FontAwesomeIcon icon={faUser} />
                                                        {notification.sender}
                                                    </span>
                                                )}
                                                <span className={cx('time')}>
                                                    <FontAwesomeIcon icon={faClock} />
                                                    {formatTimeAgo(notification.createdAt)}
                                                </span>
                                            </div>

                                            {notification.actions && notification.actions.length > 0 && (
                                                <div className={cx('notification-actions-list')}>
                                                    {notification.actions.map((action, index) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            onClick={() => {
                                                                if (action.onClick) {
                                                                    action.onClick(notification);
                                                                }
                                                                if (action.type === 'view') {
                                                                    handleViewNotification(notification);
                                                                }
                                                            }}
                                                            className={cx('action-link', action.type)}
                                                        >
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {notification.data && (
                                            <div className={cx('notification-data')}>
                                                {notification.data.contractName && (
                                                    <span className={cx('data-item')}>
                                                        Hợp đồng: {notification.data.contractName}
                                                    </span>
                                                )}
                                                {notification.data.milestoneName && (
                                                    <span className={cx('data-item')}>
                                                        Mốc: {notification.data.milestoneName}
                                                    </span>
                                                )}
                                                {notification.data.taskName && (
                                                    <span className={cx('data-item')}>
                                                        Công việc: {notification.data.taskName}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={cx('modal-footer')}>
                    <button
                        type="button"
                        onClick={() => {
                            // Mark all as read
                            filteredNotifications
                                .filter(n => !n.isRead)
                                .forEach(n => handleMarkAsRead(n.id));
                        }}
                        className={cx('footer-btn')}
                    >
                        Đánh dấu tất cả đã đọc
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            // Clear all notifications
                            filteredNotifications.forEach(n => handleDeleteNotification(n.id));
                        }}
                        className={cx('footer-btn', 'clear-all')}
                    >
                        Xóa tất cả
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;