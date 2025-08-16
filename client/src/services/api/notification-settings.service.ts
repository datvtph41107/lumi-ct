import { BaseService } from './base.service';
import type { GlobalNotificationSettings } from '~/types/notifications.types';
import type { ApiResponse } from '~/core/types/api.types';

class NotificationSettingsService extends BaseService {
    async getSettings(): Promise<ApiResponse<GlobalNotificationSettings>> {
        return this.request.private.get<GlobalNotificationSettings>('/notifications/settings');
    }

    async updateSettings(settings: GlobalNotificationSettings): Promise<ApiResponse<GlobalNotificationSettings>> {
        return this.request.private.put<GlobalNotificationSettings, GlobalNotificationSettings>(
            '/notifications/settings',
            settings,
        );
    }
}

export const notificationSettingsService = new NotificationSettingsService();