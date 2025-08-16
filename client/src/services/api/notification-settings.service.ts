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

    // Contract-level notifications
    async createContractNotification(contractId: string, payload: any) {
        return this.request.private.post<any, any>(`/contracts/${contractId}/notifications`, payload);
    }

    async listContractNotifications(contractId: string) {
        return this.request.private.get<any>(`/contracts/${contractId}/notifications`);
    }

    async createContractReminder(contractId: string, payload: any) {
        return this.request.private.post<any, any>(`/contracts/${contractId}/reminders`, payload);
    }

    async listContractReminders(contractId: string) {
        return this.request.private.get<any>(`/contracts/${contractId}/reminders`);
    }

    // System notifications queue
    async listPendingNotifications() {
        return this.request.private.get<any>('/notifications/pending');
    }

    async listFailedNotifications() {
        return this.request.private.get<any>('/notifications/failed');
    }

    async retryNotification(id: string) {
        return this.request.private.post<{ success: boolean }>(`/notifications/${id}/retry`);
    }
}

export const notificationSettingsService = new NotificationSettingsService();
