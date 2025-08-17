import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '../../core/domain/system/system-setting.entity';
import { AuditLogService } from './audit-log.service';
import { User } from '../../core/domain/user/user.entity';

@Injectable()
export class SystemSettingsService {
    constructor(
        @InjectRepository(SystemSetting)
        private readonly systemSettingRepository: Repository<SystemSetting>,
        private readonly auditLogService: AuditLogService,
    ) {}

    async getSettings(): Promise<Record<string, any>> {
        const settings = await this.systemSettingRepository.find();
        const settingsMap: Record<string, any> = {};

        for (const setting of settings) {
            settingsMap[setting.key] = this.parseValue(setting.value, setting.type);
        }

        return settingsMap;
    }

    async getSetting(key: string): Promise<any> {
        const setting = await this.systemSettingRepository.findOne({
            where: { key },
        });

        if (!setting) {
            return null;
        }

        return this.parseValue(setting.value, setting.type);
    }

    async updateSettings(settings: Record<string, any>, currentUser: User): Promise<Record<string, any>> {
        const updatedSettings: Record<string, any> = {};

        for (const [key, value] of Object.entries(settings)) {
            const setting = await this.systemSettingRepository.findOne({
                where: { key },
            });

            if (setting) {
                setting.value = this.stringifyValue(value);
                setting.updated_at = new Date();
                setting.updated_by = currentUser.id;
                await this.systemSettingRepository.save(setting);
            } else {
                const newSetting = this.systemSettingRepository.create({
                    key,
                    value: this.stringifyValue(value),
                    type: this.getTypeFromValue(value),
                    created_by: currentUser.id,
                });
                await this.systemSettingRepository.save(newSetting);
            }

            updatedSettings[key] = value;
        }

        // Log audit
        await this.auditLogService.log({
            user_id: currentUser.id,
            action: 'system_settings_updated',
            resource_type: 'system_setting',
            resource_id: null,
            details: { updated_settings: settings },
        });

        return updatedSettings;
    }

    async updateSetting(key: string, value: any, currentUser: User): Promise<any> {
        const setting = await this.systemSettingRepository.findOne({
            where: { key },
        });

        if (setting) {
            setting.value = this.stringifyValue(value);
            setting.updated_at = new Date();
            setting.updated_by = currentUser.id;
            await this.systemSettingRepository.save(setting);
        } else {
            const newSetting = this.systemSettingRepository.create({
                key,
                value: this.stringifyValue(value),
                type: this.getTypeFromValue(value),
                created_by: currentUser.id,
            });
            await this.systemSettingRepository.save(newSetting);
        }

        // Log audit
        await this.auditLogService.log({
            user_id: currentUser.id,
            action: 'system_setting_updated',
            resource_type: 'system_setting',
            resource_id: key,
            details: { key, value },
        });

        return value;
    }

    async deleteSetting(key: string, currentUser: User): Promise<void> {
        const setting = await this.systemSettingRepository.findOne({
            where: { key },
        });

        if (setting) {
            await this.systemSettingRepository.remove(setting);

            // Log audit
            await this.auditLogService.log({
                user_id: currentUser.id,
                action: 'system_setting_deleted',
                resource_type: 'system_setting',
                resource_id: key,
                details: { deleted_setting: { key, value: setting.value } },
            });
        }
    }

    async getDashboardStats(currentUser: User): Promise<any> {
        // This would typically aggregate data from various services
        // For now, return mock data
        return {
            totalUsers: 0,
            activeUsers: 0,
            totalContracts: 0,
            pendingContracts: 0,
            systemHealth: 'good',
            lastBackup: new Date().toISOString(),
        };
    }

    async getNotificationSettings(): Promise<any> {
        return {
            email: {
                enabled: true,
                smtp: {
                    host: await this.getSetting('smtp_host'),
                    port: await this.getSetting('smtp_port'),
                    secure: await this.getSetting('smtp_secure'),
                    username: await this.getSetting('smtp_username'),
                },
                from: await this.getSetting('email_from'),
                replyTo: await this.getSetting('email_reply_to'),
            },
            push: {
                enabled: await this.getSetting('push_notifications_enabled') || false,
                vapidPublicKey: await this.getSetting('vapid_public_key'),
            },
            sms: {
                enabled: await this.getSetting('sms_enabled') || false,
                provider: await this.getSetting('sms_provider'),
                apiKey: await this.getSetting('sms_api_key'),
            },
            workingHours: {
                start: await this.getSetting('working_hours_start') || '08:00',
                end: await this.getSetting('working_hours_end') || '17:00',
                timezone: await this.getSetting('timezone') || 'Asia/Ho_Chi_Minh',
            },
            quietHours: {
                enabled: await this.getSetting('quiet_hours_enabled') || false,
                start: await this.getSetting('quiet_hours_start') || '22:00',
                end: await this.getSetting('quiet_hours_end') || '07:00',
            },
        };
    }

    async updateNotificationSettings(settings: any, currentUser: User): Promise<any> {
        const updatedSettings: Record<string, any> = {};

        // Update email settings
        if (settings.email) {
            if (settings.email.smtp) {
                updatedSettings.smtp_host = settings.email.smtp.host;
                updatedSettings.smtp_port = settings.email.smtp.port;
                updatedSettings.smtp_secure = settings.email.smtp.secure;
                updatedSettings.smtp_username = settings.email.smtp.username;
            }
            updatedSettings.email_from = settings.email.from;
            updatedSettings.email_reply_to = settings.email.replyTo;
        }

        // Update push settings
        if (settings.push) {
            updatedSettings.push_notifications_enabled = settings.push.enabled;
            updatedSettings.vapid_public_key = settings.push.vapidPublicKey;
        }

        // Update SMS settings
        if (settings.sms) {
            updatedSettings.sms_enabled = settings.sms.enabled;
            updatedSettings.sms_provider = settings.sms.provider;
            updatedSettings.sms_api_key = settings.sms.apiKey;
        }

        // Update working hours
        if (settings.workingHours) {
            updatedSettings.working_hours_start = settings.workingHours.start;
            updatedSettings.working_hours_end = settings.workingHours.end;
            updatedSettings.timezone = settings.workingHours.timezone;
        }

        // Update quiet hours
        if (settings.quietHours) {
            updatedSettings.quiet_hours_enabled = settings.quietHours.enabled;
            updatedSettings.quiet_hours_start = settings.quietHours.start;
            updatedSettings.quiet_hours_end = settings.quietHours.end;
        }

        await this.updateSettings(updatedSettings, currentUser);

        return this.getNotificationSettings();
    }

    async getSecuritySettings(): Promise<any> {
        return {
            passwordPolicy: {
                minLength: await this.getSetting('password_min_length') || 8,
                requireUppercase: await this.getSetting('password_require_uppercase') || true,
                requireLowercase: await this.getSetting('password_require_lowercase') || true,
                requireNumbers: await this.getSetting('password_require_numbers') || true,
                requireSpecialChars: await this.getSetting('password_require_special_chars') || false,
                maxAge: await this.getSetting('password_max_age') || 90, // days
            },
            sessionPolicy: {
                maxConcurrentSessions: await this.getSetting('max_concurrent_sessions') || 5,
                sessionTimeout: await this.getSetting('session_timeout') || 15, // minutes
                rememberMeDuration: await this.getSetting('remember_me_duration') || 7, // days
            },
            loginPolicy: {
                maxFailedAttempts: await this.getSetting('max_failed_login_attempts') || 5,
                lockoutDuration: await this.getSetting('lockout_duration') || 15, // minutes
                requireTwoFactor: await this.getSetting('require_two_factor') || false,
            },
        };
    }

    async updateSecuritySettings(settings: any, currentUser: User): Promise<any> {
        const updatedSettings: Record<string, any> = {};

        // Update password policy
        if (settings.passwordPolicy) {
            updatedSettings.password_min_length = settings.passwordPolicy.minLength;
            updatedSettings.password_require_uppercase = settings.passwordPolicy.requireUppercase;
            updatedSettings.password_require_lowercase = settings.passwordPolicy.requireLowercase;
            updatedSettings.password_require_numbers = settings.passwordPolicy.requireNumbers;
            updatedSettings.password_require_special_chars = settings.passwordPolicy.requireSpecialChars;
            updatedSettings.password_max_age = settings.passwordPolicy.maxAge;
        }

        // Update session policy
        if (settings.sessionPolicy) {
            updatedSettings.max_concurrent_sessions = settings.sessionPolicy.maxConcurrentSessions;
            updatedSettings.session_timeout = settings.sessionPolicy.sessionTimeout;
            updatedSettings.remember_me_duration = settings.sessionPolicy.rememberMeDuration;
        }

        // Update login policy
        if (settings.loginPolicy) {
            updatedSettings.max_failed_login_attempts = settings.loginPolicy.maxFailedAttempts;
            updatedSettings.lockout_duration = settings.loginPolicy.lockoutDuration;
            updatedSettings.require_two_factor = settings.loginPolicy.requireTwoFactor;
        }

        await this.updateSettings(updatedSettings, currentUser);

        return this.getSecuritySettings();
    }

    private parseValue(value: string, type: string): any {
        switch (type) {
            case 'boolean':
                return value === 'true';
            case 'number':
                return parseFloat(value);
            case 'json':
                return JSON.parse(value);
            default:
                return value;
        }
    }

    private stringifyValue(value: any): string {
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    }

    private getTypeFromValue(value: any): string {
        if (typeof value === 'boolean') {
            return 'boolean';
        }
        if (typeof value === 'number') {
            return 'number';
        }
        if (typeof value === 'object') {
            return 'json';
        }
        return 'string';
    }
}