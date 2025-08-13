export type NotificationType = "email" | "sms" | "in-app" | "push";
export type NotificationTrigger = "before" | "on" | "after";
export type NotificationFrequency = "once" | "daily" | "weekly" | "monthly";
export type TimeUnit = "minutes" | "hours" | "days" | "weeks";

export interface NotificationRule {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    types: NotificationType[];
    trigger: NotificationTrigger;
    timing: {
        value: number;
        unit: TimeUnit;
    };
    frequency: NotificationFrequency;
    recipients: string[];
    customMessage?: string;
}

export interface ContractNotificationRule extends NotificationRule {
    events: ("start" | "end" | "renewal" | "termination" | "milestone_due")[];
}

export interface MilestoneNotificationRule extends NotificationRule {
    events: ("start" | "end" | "overdue" | "completed" | "task_completed")[];
    milestoneIds?: string[]; // Nếu empty thì áp dụng cho tất cả milestones
}

export interface TaskNotificationRule extends NotificationRule {
    events: ("start" | "end" | "overdue" | "completed" | "assigned")[];
    taskIds?: string[]; // Nếu empty thì áp dụng cho tất cả tasks
}

export interface WorkingHours {
    start: string; // HH:mm format
    end: string; // HH:mm format
    timezone: string;
    workingDays: number[]; // 0-6, 0 = Sunday
}

export interface GlobalNotificationSettings {
    enableEmailNotifications: boolean;
    enableSMSNotifications: boolean;
    enableInAppNotifications: boolean;
    enablePushNotifications: boolean;
    defaultRecipients: string[];
    workingHours: WorkingHours;
    quietHours: {
        enabled: boolean;
        start: string; // HH:mm
        end: string; // HH:mm
    };
    escalationRules: {
        enabled: boolean;
        escalateAfter: {
            value: number;
            unit: TimeUnit;
        };
        escalateTo: string[];
    };
}

export interface NotificationSettings {
    contractNotifications: ContractNotificationRule[];
    milestoneNotifications: MilestoneNotificationRule[];
    taskNotifications: TaskNotificationRule[];
    globalSettings: GlobalNotificationSettings;
}

export interface NotificationTemplate {
    id: string;
    name: string;
    type: "contract" | "milestone" | "task";
    event: string;
    subject: string;
    body: string;
    variables: string[];
}
