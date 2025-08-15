import { useState } from 'react';
import GlobalNotificationSettings from '~/page/Contract/components/stages/Notification/GlobalNotificationSettings';
import type { GlobalNotificationSettings as Settings } from '~/types/notifications.types';

const SystemNotifications = () => {
	const [settings, setSettings] = useState<Settings>({
		enableEmailNotifications: true,
		enableSMSNotifications: false,
		enableInAppNotifications: true,
		enablePushNotifications: true,
		defaultRecipients: [],
		workingHours: { start: '09:00', end: '17:00', timezone: 'Asia/Ho_Chi_Minh', workingDays: [1, 2, 3, 4, 5] },
		quietHours: { enabled: false, start: '22:00', end: '08:00' },
		escalationRules: { enabled: false, escalateAfter: { value: 24, unit: 'hours' }, escalateTo: [] },
	});

	return (
		<div style={{ padding: 24 }}>
			<h2>System Notification Settings</h2>
			<GlobalNotificationSettings settings={settings} onSettingsChange={setSettings} />
		</div>
	);
};

export default SystemNotifications;