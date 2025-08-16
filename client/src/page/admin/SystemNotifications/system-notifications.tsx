import { useEffect, useState } from 'react';
import GlobalNotificationSettings from '~/page/Contract/components/stages/Notification/GlobalNotificationSettings';
import type { GlobalNotificationSettings as Settings } from '~/types/notifications.types';
import { notificationSettingsService } from '~/services/api/notification-settings.service';

const SystemNotifications = () => {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await notificationSettingsService.getSettings();
                setSettings(res.data as any);
            } catch {
                setSettings({
                    enableEmailNotifications: true,
                    enableSMSNotifications: false,
                    enableInAppNotifications: true,
                    enablePushNotifications: true,
                    defaultRecipients: [],
                    workingHours: { start: '09:00', end: '17:00', timezone: 'Asia/Ho_Chi_Minh', workingDays: [1, 2, 3, 4, 5] },
                    quietHours: { enabled: false, start: '22:00', end: '08:00' },
                    escalationRules: { enabled: false, escalateAfter: { value: 24, unit: 'hours' }, escalateTo: [] },
                });
            }
        })();
    }, []);

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            await notificationSettingsService.updateSettings(settings);
            alert('Đã lưu cài đặt hệ thống');
        } catch {
            alert('Lưu cài đặt thất bại');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <h2>System Notification Settings</h2>
            {settings && (
                <>
                    <GlobalNotificationSettings settings={settings} onSettingsChange={setSettings} />
                    <div style={{ marginTop: 16 }}>
                        <button onClick={handleSave} disabled={saving}>
                            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default SystemNotifications;
