"use client";

import type React from "react";
import { useState } from "react";
import classNames from "classnames/bind";
import styles from "./GlobalNotificationSettings.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faToggleOn,
    faToggleOff,
    faEnvelope,
    faMobile,
    faDesktop,
    faBell,
    faClock,
    faUsers,
    faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import Button from "~/components/Button";
import Input from "~/components/Input";
import ControllerDropdown from "~/components/Form/ControllerValid/ControllerDropdown";
import type { GlobalNotificationSettings } from "~/types/notifications.types";

const cx = classNames.bind(styles);

interface GlobalNotificationSettingsProps {
    settings: GlobalNotificationSettings;
    onSettingsChange: (settings: GlobalNotificationSettings) => void;
}

const NotificationSettings: React.FC<GlobalNotificationSettingsProps> = ({ settings, onSettingsChange }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    // Keep local state in sync when parent updates settings (e.g., after load)
    React.useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const timezoneOptions = [
        { value: "Asia/Ho_Chi_Minh", label: "Việt Nam (UTC+7)" },
        { value: "Asia/Bangkok", label: "Bangkok (UTC+7)" },
        { value: "Asia/Singapore", label: "Singapore (UTC+8)" },
        { value: "Asia/Tokyo", label: "Tokyo (UTC+9)" },
        { value: "UTC", label: "UTC (UTC+0)" },
    ];

    const timeUnitOptions = [
        { value: "minutes", label: "Phút" },
        { value: "hours", label: "Giờ" },
        { value: "days", label: "Ngày" },
    ];

    const weekDays = [
        { value: 0, label: "Chủ nhật" },
        { value: 1, label: "Thứ hai" },
        { value: 2, label: "Thứ ba" },
        { value: 3, label: "Thứ tư" },
        { value: 4, label: "Thứ năm" },
        { value: 5, label: "Thứ sáu" },
        { value: 6, label: "Thứ bảy" },
    ];

    const handleToggle = (field: keyof GlobalNotificationSettings) => {
        const newSettings = {
            ...localSettings,
            [field]: !localSettings[field],
        };
        setLocalSettings(newSettings);
        onSettingsChange(newSettings);
    };

    const handleNestedToggle = (parent: string, field: string) => {
        const newSettings = {
            ...localSettings,
            [parent]: {
                ...localSettings[parent as keyof GlobalNotificationSettings],
                [field]: !localSettings[parent as keyof GlobalNotificationSettings][field],
            },
        };
        setLocalSettings(newSettings);
        onSettingsChange(newSettings);
    };

    const handleInputChange = (field: string, value: any, parent?: string) => {
        if (parent) {
            const newSettings = {
                ...localSettings,
                [parent]: {
                    ...localSettings[parent as keyof GlobalNotificationSettings],
                    [field]: value,
                },
            };
            setLocalSettings(newSettings);
            onSettingsChange(newSettings);
        } else {
            const newSettings = {
                ...localSettings,
                [field]: value,
            };
            setLocalSettings(newSettings);
            onSettingsChange(newSettings);
        }
    };

    const handleWorkingDaysChange = (day: number) => {
        const currentDays = localSettings.workingHours.workingDays;
        const newDays = currentDays.includes(day) ? currentDays.filter((d) => d !== day) : [...currentDays, day].sort();

        handleInputChange("workingDays", newDays, "workingHours");
    };

    const handleRecipientsChange = (value: string) => {
        const recipients = value
            .split(",")
            .map((email) => email.trim())
            .filter((email) => email);
        handleInputChange("defaultRecipients", recipients);
    };

    return (
        <div className={cx("global-settings")}>
            <div className={cx("settings-section")}>
                <h3>
                    <FontAwesomeIcon icon={faBell} />
                    Loại thông báo
                </h3>
                <p>Chọn các kênh thông báo bạn muốn sử dụng</p>

                <div className={cx("toggle-group")}>
                    <div className={cx("toggle-item")}>
                        <div className={cx("toggle-info")}>
                            <FontAwesomeIcon icon={faEnvelope} className={cx("toggle-icon", "email")} />
                            <div>
                                <h4>Email</h4>
                                <p>Gửi thông báo qua email</p>
                            </div>
                        </div>
                        <button className={cx("toggle-button")} onClick={() => handleToggle("enableEmailNotifications")}>
                            <FontAwesomeIcon
                                icon={localSettings.enableEmailNotifications ? faToggleOn : faToggleOff}
                                className={cx({ active: localSettings.enableEmailNotifications })}
                            />
                        </button>
                    </div>

                    <div className={cx("toggle-item")}>
                        <div className={cx("toggle-info")}>
                            <FontAwesomeIcon icon={faMobile} className={cx("toggle-icon", "sms")} />
                            <div>
                                <h4>SMS</h4>
                                <p>Gửi tin nhắn SMS</p>
                            </div>
                        </div>
                        <button className={cx("toggle-button")} onClick={() => handleToggle("enableSMSNotifications")}>
                            <FontAwesomeIcon
                                icon={localSettings.enableSMSNotifications ? faToggleOn : faToggleOff}
                                className={cx({ active: localSettings.enableSMSNotifications })}
                            />
                        </button>
                    </div>

                    <div className={cx("toggle-item")}>
                        <div className={cx("toggle-info")}>
                            <FontAwesomeIcon icon={faDesktop} className={cx("toggle-icon", "inapp")} />
                            <div>
                                <h4>In-App</h4>
                                <p>Hiển thị thông báo trong ứng dụng</p>
                            </div>
                        </div>
                        <button className={cx("toggle-button")} onClick={() => handleToggle("enableInAppNotifications")}>
                            <FontAwesomeIcon
                                icon={localSettings.enableInAppNotifications ? faToggleOn : faToggleOff}
                                className={cx({ active: localSettings.enableInAppNotifications })}
                            />
                        </button>
                    </div>

                    <div className={cx("toggle-item")}>
                        <div className={cx("toggle-info")}>
                            <FontAwesomeIcon icon={faBell} className={cx("toggle-icon", "push")} />
                            <div>
                                <h4>Push Notification</h4>
                                <p>Gửi thông báo đẩy</p>
                            </div>
                        </div>
                        <button className={cx("toggle-button")} onClick={() => handleToggle("enablePushNotifications")}>
                            <FontAwesomeIcon
                                icon={localSettings.enablePushNotifications ? faToggleOn : faToggleOff}
                                className={cx({ active: localSettings.enablePushNotifications })}
                            />
                        </button>
                    </div>
                </div>
            </div>

            <div className={cx("settings-section")}>
                <h3>
                    <FontAwesomeIcon icon={faUsers} />
                    Người nhận mặc định
                </h3>
                <p>Danh sách email người nhận thông báo mặc định (cách nhau bằng dấu phẩy)</p>

                <Input
                    name="defaultRecipients"
                    placeholder="email1@example.com, email2@example.com"
                    value={localSettings.defaultRecipients.join(", ")}
                    onChange={handleRecipientsChange}
                />
            </div>

            <div className={cx("settings-section")}>
                <h3>
                    <FontAwesomeIcon icon={faClock} />
                    Giờ làm việc
                </h3>
                <p>Thiết lập giờ làm việc để tối ưu hóa thời gian gửi thông báo</p>

                <div className={cx("grid-cols-3")}>
                    <Input
                        name="workingStart"
                        label="Giờ bắt đầu"
                        type="time"
                        value={localSettings.workingHours.start}
                        onChange={(value) => handleInputChange("start", value, "workingHours")}
                    />

                    <Input
                        name="workingEnd"
                        label="Giờ kết thúc"
                        type="time"
                        value={localSettings.workingHours.end}
                        onChange={(value) => handleInputChange("end", value, "workingHours")}
                    />

                    <ControllerDropdown
                        name="timezone"
                        label="Múi giờ"
                        options={timezoneOptions}
                        value={localSettings.workingHours.timezone}
                        onChange={(value) => handleInputChange("timezone", value, "workingHours")}
                    />
                </div>

                <div className={cx("working-days")}>
                    <label>Ngày làm việc</label>
                    <div className={cx("days-grid")}>
                        {weekDays.map((day) => (
                            <label key={day.value} className={cx("day-checkbox")}>
                                <input
                                    type="checkbox"
                                    // checked={localSettings.workingHours.workingDays.includes(day.value) ?? false}
                                    onChange={() => handleWorkingDaysChange(day.value)}
                                />
                                {day.label}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className={cx("settings-section")}>
                <h3>
                    <FontAwesomeIcon icon={faClock} />
                    Giờ yên tĩnh
                </h3>
                <p>Không gửi thông báo trong khoảng thời gian này</p>

                <div className={cx("quiet-hours")}>
                    <div className={cx("toggle-item")}>
                        <div className={cx("toggle-info")}>
                            <h4>Bật giờ yên tĩnh</h4>
                        </div>
                        <button className={cx("toggle-button")} onClick={() => handleNestedToggle("quietHours", "enabled")}>
                            <FontAwesomeIcon
                                icon={localSettings.quietHours?.enabled ? faToggleOn : faToggleOff}
                                className={cx({ active: localSettings.quietHours?.enabled })}
                            />
                        </button>
                    </div>

                    {localSettings.quietHours?.enabled && (
                        <div className={cx("grid-cols-2")}>
                            <Input
                                name="quietStart"
                                label="Bắt đầu"
                                type="time"
                                value={localSettings.quietHours.start}
                                onChange={(value) => handleInputChange("start", value, "quietHours")}
                            />

                            <Input
                                name="quietEnd"
                                label="Kết thúc"
                                type="time"
                                value={localSettings.quietHours.end}
                                onChange={(value) => handleInputChange("end", value, "quietHours")}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className={cx("settings-section")}>
                <h3>
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    Quy tắc leo thang
                </h3>
                <p>Tự động leo thang thông báo khi không có phản hồi</p>

                <div className={cx("escalation-rules")}>
                    <div className={cx("toggle-item")}>
                        <div className={cx("toggle-info")}>
                            <h4>Bật leo thang tự động</h4>
                        </div>
                        <button className={cx("toggle-button")} onClick={() => handleNestedToggle("escalationRules", "enabled")}>
                            <FontAwesomeIcon
                                icon={localSettings.escalationRules?.enabled ? faToggleOn : faToggleOff}
                                className={cx({ active: localSettings.escalationRules?.enabled })}
                            />
                        </button>
                    </div>

                    {localSettings.escalationRules?.enabled && (
                        <div className={cx("escalation-config")}>
                            <div className={cx("grid-cols-2")}>
                                <Input
                                    name="escalateValue"
                                    label="Leo thang sau"
                                    type="number"
                                    min="1"
                                    value={localSettings.escalationRules.escalateAfter.value}
                                    onChange={(value) => handleInputChange("value", Number(value), "escalationRules.escalateAfter")}
                                />

                                <ControllerDropdown
                                    name="escalateUnit"
                                    label="Đơn vị"
                                    options={timeUnitOptions}
                                    value={localSettings.escalationRules.escalateAfter.unit}
                                    onChange={(value) => handleInputChange("unit", value, "escalationRules.escalateAfter")}
                                />
                            </div>

                            <Input
                                name="escalateTo"
                                label="Leo thang đến (email, cách nhau bằng dấu phẩy)"
                                placeholder="manager@example.com, admin@example.com"
                                value={localSettings.escalationRules.escalateTo.join(", ")}
                                onChange={(value) => {
                                    const emails = value
                                        .split(",")
                                        .map((email) => email.trim())
                                        .filter((email) => email);
                                    handleInputChange("escalateTo", emails, "escalationRules");
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className={cx("settings-actions")}>
                <Button
                    outline
                    onClick={() => {
                        // Reset to default settings
                        const defaultSettings: GlobalNotificationSettings = {
                            enableEmailNotifications: true,
                            enableSMSNotifications: false,
                            enableInAppNotifications: true,
                            enablePushNotifications: true,
                            defaultRecipients: [],
                            workingHours: {
                                start: "09:00",
                                end: "17:00",
                                timezone: "Asia/Ho_Chi_Minh",
                                workingDays: [1, 2, 3, 4, 5],
                            },
                            quietHours: {
                                enabled: false,
                                start: "22:00",
                                end: "08:00",
                            },
                            escalationRules: {
                                enabled: false,
                                escalateAfter: {
                                    value: 24,
                                    unit: "hours",
                                },
                                escalateTo: [],
                            },
                        };
                        setLocalSettings(defaultSettings);
                        onSettingsChange(defaultSettings);
                    }}
                >
                    Khôi phục mặc định
                </Button>
            </div>
        </div>
    );
};

export default NotificationSettings;
