import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('system_notification_settings')
export class SystemNotificationSettings extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'boolean', default: true })
	enable_email_notifications: boolean;

	@Column({ type: 'boolean', default: false })
	enable_sms_notifications: boolean;

	@Column({ type: 'boolean', default: true })
	enable_inapp_notifications: boolean;

	@Column({ type: 'boolean', default: true })
	enable_push_notifications: boolean;

	@Column({ type: 'json', nullable: true })
	working_hours?: { start: string; end: string; timezone: string; workingDays: number[] };

	@Column({ type: 'json', nullable: true })
	quiet_hours?: { enabled: boolean; start: string; end: string };

	@Column({ type: 'json', nullable: true })
	escalation_rules?: { enabled: boolean; escalateAfter: { value: number; unit: string }; escalateTo: string[] };

	@Column({ type: 'json', nullable: true })
	default_recipients?: string[];
}