import React, { useState, useEffect } from 'react';
import { useContractDraftStore } from '~/store/contract-draft-store';
import type { NotificationSettings, ReminderSchedule } from '~/types/notifications.types';
import { Logger } from '~/core/Logger';
import Button from '~/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBell, 
    faPlus, 
    faEdit, 
    faTrash, 
    faClock,
    faUser,
    faEnvelope,
    faSms,
    faCalendarAlt,
    faToggleOn,
    faToggleOff
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './StageNotifications.module.scss';

const cx = classNames.bind(styles);
const logger = Logger.getInstance();

interface NotificationRecipient {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
}

const StageNotifications: React.FC = () => {
    const { currentDraft, updateDraftData } = useContractDraftStore();
    
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        enabled: true,
        emailNotifications: true,
        smsNotifications: false,
        inAppNotifications: true,
        recipients: [],
        reminders: [],
        customSettings: {}
    });

    const [recipients] = useState<NotificationRecipient[]>([
        { id: '1', name: 'Nguyễn Văn A', email: 'nguyenvana@company.com', role: 'Manager', department: 'Sales' },
        { id: '2', name: 'Trần Thị B', email: 'tranthib@company.com', role: 'Staff', department: 'Legal' },
        { id: '3', name: 'Lê Văn C', email: 'levanc@company.com', role: 'Admin', department: 'Finance' },
    ]);

    const [showReminderForm, setShowReminderForm] = useState(false);
    const [editingReminder, setEditingReminder] = useState<ReminderSchedule | null>(null);
    const [reminderForm, setReminderForm] = useState({
        name: '',
        type: 'milestone' as 'milestone' | 'task' | 'custom',
        triggerType: 'before' as 'before' | 'after' | 'on',
        triggerValue: 1,
        triggerUnit: 'days' as 'minutes' | 'hours' | 'days' | 'weeks',
        channels: ['email'] as string[],
        message: '',
        enabled: true
    });

    useEffect(() => {
        if (currentDraft?.contractData.notificationSettings) {
            setNotificationSettings(currentDraft.contractData.notificationSettings);
        }
    }, [currentDraft]);

    const handleToggleNotification = (type: keyof NotificationSettings) => {
        const updatedSettings = {
            ...notificationSettings,
            [type]: !notificationSettings[type]
        };
        setNotificationSettings(updatedSettings);
        updateNotificationSettings(updatedSettings);
    };

    const handleAddRecipient = (recipientId: string) => {
        const recipient = recipients.find(r => r.id === recipientId);
        if (!recipient) return;

        const updatedSettings = {
            ...notificationSettings,
            recipients: [...notificationSettings.recipients, recipient]
        };
        setNotificationSettings(updatedSettings);
        updateNotificationSettings(updatedSettings);
    };

    const handleRemoveRecipient = (recipientId: string) => {
        const updatedSettings = {
            ...notificationSettings,
            recipients: notificationSettings.recipients.filter(r => r.id !== recipientId)
        };
        setNotificationSettings(updatedSettings);
        updateNotificationSettings(updatedSettings);
    };

    const handleAddReminder = () => {
        setEditingReminder(null);
        setReminderForm({
            name: '',
            type: 'milestone',
            triggerType: 'before',
            triggerValue: 1,
            triggerUnit: 'days',
            channels: ['email'],
            message: '',
            enabled: true
        });
        setShowReminderForm(true);
    };

    const handleEditReminder = (reminder: ReminderSchedule) => {
        setEditingReminder(reminder);
        setReminderForm({
            name: reminder.name,
            type: reminder.type,
            triggerType: reminder.triggerType,
            triggerValue: reminder.triggerValue,
            triggerUnit: reminder.triggerUnit,
            channels: reminder.channels,
            message: reminder.message,
            enabled: reminder.enabled
        });
        setShowReminderForm(true);
    };

    const handleDeleteReminder = (reminderId: string) => {
        const updatedSettings = {
            ...notificationSettings,
            reminders: notificationSettings.reminders.filter(r => r.id !== reminderId)
        };
        setNotificationSettings(updatedSettings);
        updateNotificationSettings(updatedSettings);
    };

    const handleSaveReminder = () => {
        if (!reminderForm.name.trim()) {
            alert('Vui lòng nhập tên nhắc nhở');
            return;
        }

        const newReminder: ReminderSchedule = {
            id: editingReminder?.id || `reminder-${Date.now()}`,
            ...reminderForm
        };

        let updatedReminders: ReminderSchedule[];
        if (editingReminder) {
            updatedReminders = notificationSettings.reminders.map(r => 
                r.id === editingReminder.id ? newReminder : r
            );
        } else {
            updatedReminders = [...notificationSettings.reminders, newReminder];
        }

        const updatedSettings = {
            ...notificationSettings,
            reminders: updatedReminders
        };

        setNotificationSettings(updatedSettings);
        updateNotificationSettings(updatedSettings);
        setShowReminderForm(false);
        setEditingReminder(null);
    };

    const updateNotificationSettings = async (settings: NotificationSettings) => {
        try {
            if (currentDraft) {
                await updateDraftData('review_preview', {
                    notificationSettings: settings
                });
            }
        } catch (error) {
            logger.error('Failed to update notification settings:', error);
        }
    };

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case 'email': return faEnvelope;
            case 'sms': return faSms;
            case 'in-app': return faBell;
            default: return faBell;
        }
    };

    const getChannelLabel = (channel: string) => {
        switch (channel) {
            case 'email': return 'Email';
            case 'sms': return 'SMS';
            case 'in-app': return 'Trong ứng dụng';
            default: return channel;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'milestone': return 'Mốc thời gian';
            case 'task': return 'Công việc';
            case 'custom': return 'Tùy chỉnh';
            default: return type;
        }
    };

    return (
        <div className={cx('stage-notifications')}>
            <div className={cx('header')}>
                <h2>Cấu hình thông báo và nhắc nhở</h2>
                <p>Thiết lập hệ thống thông báo và lịch nhắc nhở cho hợp đồng</p>
            </div>

            <div className={cx('content')}>
                {/* General Notification Settings */}
                <div className={cx('section')}>
                    <div className={cx('section-header')}>
                        <h3>
                            <FontAwesomeIcon icon={faBell} />
                            Cài đặt thông báo chung
                        </h3>
                    </div>

                    <div className={cx('settings-grid')}>
                        <div className={cx('setting-item')}>
                            <div className={cx('setting-info')}>
                                <h4>Bật thông báo</h4>
                                <p>Kích hoạt hệ thống thông báo cho hợp đồng này</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleToggleNotification('enabled')}
                                className={cx('toggle-btn', { active: notificationSettings.enabled })}
                            >
                                <FontAwesomeIcon icon={notificationSettings.enabled ? faToggleOn : faToggleOff} />
                            </button>
                        </div>

                        <div className={cx('setting-item')}>
                            <div className={cx('setting-info')}>
                                <h4>Thông báo qua Email</h4>
                                <p>Gửi thông báo qua email</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleToggleNotification('emailNotifications')}
                                className={cx('toggle-btn', { active: notificationSettings.emailNotifications })}
                            >
                                <FontAwesomeIcon icon={notificationSettings.emailNotifications ? faToggleOn : faToggleOff} />
                            </button>
                        </div>

                        <div className={cx('setting-item')}>
                            <div className={cx('setting-info')}>
                                <h4>Thông báo qua SMS</h4>
                                <p>Gửi thông báo qua tin nhắn SMS</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleToggleNotification('smsNotifications')}
                                className={cx('toggle-btn', { active: notificationSettings.smsNotifications })}
                            >
                                <FontAwesomeIcon icon={notificationSettings.smsNotifications ? faToggleOn : faToggleOff} />
                            </button>
                        </div>

                        <div className={cx('setting-item')}>
                            <div className={cx('setting-info')}>
                                <h4>Thông báo trong ứng dụng</h4>
                                <p>Hiển thị thông báo trong hệ thống</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleToggleNotification('inAppNotifications')}
                                className={cx('toggle-btn', { active: notificationSettings.inAppNotifications })}
                            >
                                <FontAwesomeIcon icon={notificationSettings.inAppNotifications ? faToggleOn : faToggleOff} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recipients */}
                <div className={cx('section')}>
                    <div className={cx('section-header')}>
                        <h3>
                            <FontAwesomeIcon icon={faUser} />
                            Người nhận thông báo
                        </h3>
                    </div>

                    <div className={cx('recipients-section')}>
                        <div className={cx('add-recipient')}>
                            <select
                                onChange={(e) => {
                                    if (e.target.value) {
                                        handleAddRecipient(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                                defaultValue=""
                            >
                                <option value="">Thêm người nhận...</option>
                                {recipients
                                    .filter(r => !notificationSettings.recipients.find(nr => nr.id === r.id))
                                    .map(recipient => (
                                        <option key={recipient.id} value={recipient.id}>
                                            {recipient.name} - {recipient.role} ({recipient.department})
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                        <div className={cx('recipients-list')}>
                            {notificationSettings.recipients.map((recipient) => (
                                <div key={recipient.id} className={cx('recipient-item')}>
                                    <div className={cx('recipient-info')}>
                                        <h4>{recipient.name}</h4>
                                        <p>{recipient.email}</p>
                                        <span className={cx('recipient-role')}>
                                            {recipient.role} • {recipient.department}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveRecipient(recipient.id)}
                                        className={cx('remove-btn')}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Reminders */}
                <div className={cx('section')}>
                    <div className={cx('section-header')}>
                        <h3>
                            <FontAwesomeIcon icon={faClock} />
                            Lịch nhắc nhở ({notificationSettings.reminders.length})
                        </h3>
                        <Button
                            type="button"
                            primary
                            onClick={handleAddReminder}
                            leftIcon={<FontAwesomeIcon icon={faPlus} />}
                        >
                            Thêm nhắc nhở
                        </Button>
                    </div>

                    <div className={cx('reminders-grid')}>
                        {notificationSettings.reminders.map((reminder) => (
                            <div key={reminder.id} className={cx('reminder-card')}>
                                <div className={cx('reminder-header')}>
                                    <div className={cx('reminder-info')}>
                                        <h4>{reminder.name}</h4>
                                        <div className={cx('reminder-meta')}>
                                            <span className={cx('type')}>
                                                {getTypeLabel(reminder.type)}
                                            </span>
                                            <span className={cx('trigger')}>
                                                {reminder.triggerType === 'before' ? 'Trước' : 
                                                 reminder.triggerType === 'after' ? 'Sau' : 'Vào'} 
                                                {reminder.triggerValue} {reminder.triggerUnit}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={cx('reminder-actions')}>
                                        <button
                                            type="button"
                                            onClick={() => handleEditReminder(reminder)}
                                            className={cx('action-btn', 'edit')}
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteReminder(reminder.id)}
                                            className={cx('action-btn', 'delete')}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </div>

                                <div className={cx('reminder-channels')}>
                                    {reminder.channels.map((channel) => (
                                        <span key={channel} className={cx('channel-badge')}>
                                            <FontAwesomeIcon icon={getChannelIcon(channel)} />
                                            {getChannelLabel(channel)}
                                        </span>
                                    ))}
                                </div>

                                {reminder.message && (
                                    <p className={cx('reminder-message')}>{reminder.message}</p>
                                )}

                                <div className={cx('reminder-status')}>
                                    <span className={cx('status', { active: reminder.enabled })}>
                                        {reminder.enabled ? 'Đang hoạt động' : 'Đã tắt'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reminder Form Modal */}
            {showReminderForm && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal')}>
                        <div className={cx('modal-header')}>
                            <h3>{editingReminder ? 'Chỉnh sửa nhắc nhở' : 'Thêm nhắc nhở mới'}</h3>
                            <button
                                type="button"
                                onClick={() => setShowReminderForm(false)}
                                className={cx('close-btn')}
                            >
                                ×
                            </button>
                        </div>

                        <div className={cx('modal-content')}>
                            <div className={cx('form-group')}>
                                <label>Tên nhắc nhở *</label>
                                <input
                                    type="text"
                                    value={reminderForm.name}
                                    onChange={(e) => setReminderForm({ ...reminderForm, name: e.target.value })}
                                    placeholder="Nhập tên nhắc nhở"
                                />
                            </div>

                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Loại nhắc nhở</label>
                                    <select
                                        value={reminderForm.type}
                                        onChange={(e) => setReminderForm({ ...reminderForm, type: e.target.value as any })}
                                    >
                                        <option value="milestone">Mốc thời gian</option>
                                        <option value="task">Công việc</option>
                                        <option value="custom">Tùy chỉnh</option>
                                    </select>
                                </div>
                                <div className={cx('form-group')}>
                                    <label>Thời điểm kích hoạt</label>
                                    <select
                                        value={reminderForm.triggerType}
                                        onChange={(e) => setReminderForm({ ...reminderForm, triggerType: e.target.value as any })}
                                    >
                                        <option value="before">Trước</option>
                                        <option value="after">Sau</option>
                                        <option value="on">Vào</option>
                                    </select>
                                </div>
                            </div>

                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Số lượng</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={reminderForm.triggerValue}
                                        onChange={(e) => setReminderForm({ ...reminderForm, triggerValue: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label>Đơn vị thời gian</label>
                                    <select
                                        value={reminderForm.triggerUnit}
                                        onChange={(e) => setReminderForm({ ...reminderForm, triggerUnit: e.target.value as any })}
                                    >
                                        <option value="minutes">Phút</option>
                                        <option value="hours">Giờ</option>
                                        <option value="days">Ngày</option>
                                        <option value="weeks">Tuần</option>
                                    </select>
                                </div>
                            </div>

                            <div className={cx('form-group')}>
                                <label>Kênh thông báo</label>
                                <div className={cx('channels-checkboxes')}>
                                    <label className={cx('checkbox-item')}>
                                        <input
                                            type="checkbox"
                                            checked={reminderForm.channels.includes('email')}
                                            onChange={(e) => {
                                                const channels = e.target.checked
                                                    ? [...reminderForm.channels, 'email']
                                                    : reminderForm.channels.filter(c => c !== 'email');
                                                setReminderForm({ ...reminderForm, channels });
                                            }}
                                        />
                                        <FontAwesomeIcon icon={faEnvelope} />
                                        Email
                                    </label>
                                    <label className={cx('checkbox-item')}>
                                        <input
                                            type="checkbox"
                                            checked={reminderForm.channels.includes('sms')}
                                            onChange={(e) => {
                                                const channels = e.target.checked
                                                    ? [...reminderForm.channels, 'sms']
                                                    : reminderForm.channels.filter(c => c !== 'sms');
                                                setReminderForm({ ...reminderForm, channels });
                                            }}
                                        />
                                        <FontAwesomeIcon icon={faSms} />
                                        SMS
                                    </label>
                                    <label className={cx('checkbox-item')}>
                                        <input
                                            type="checkbox"
                                            checked={reminderForm.channels.includes('in-app')}
                                            onChange={(e) => {
                                                const channels = e.target.checked
                                                    ? [...reminderForm.channels, 'in-app']
                                                    : reminderForm.channels.filter(c => c !== 'in-app');
                                                setReminderForm({ ...reminderForm, channels });
                                            }}
                                        />
                                        <FontAwesomeIcon icon={faBell} />
                                        Trong ứng dụng
                                    </label>
                                </div>
                            </div>

                            <div className={cx('form-group')}>
                                <label>Nội dung thông báo</label>
                                <textarea
                                    value={reminderForm.message}
                                    onChange={(e) => setReminderForm({ ...reminderForm, message: e.target.value })}
                                    placeholder="Nhập nội dung thông báo (tùy chọn)"
                                />
                            </div>
                        </div>

                        <div className={cx('modal-actions')}>
                            <Button
                                type="button"
                                onClick={() => setShowReminderForm(false)}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="button"
                                primary
                                onClick={handleSaveReminder}
                            >
                                {editingReminder ? 'Cập nhật' : 'Thêm'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StageNotifications;