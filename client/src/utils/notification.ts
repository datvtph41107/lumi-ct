import type {
    NotificationSettings,
    NotificationRule,
    ContractNotificationRule,
    MilestoneNotificationRule,
    TaskNotificationRule,
} from "~/types/notifications.types";
import type { ContractFormData } from "~/types/contract/contract.types";

export const validateNotificationSettings = (settings: NotificationSettings): string[] => {
    const errors: string[] = [];

    // Check if at least one notification type is enabled
    const hasEnabledTypes =
        settings.globalSettings.enableEmailNotifications ||
        settings.globalSettings.enableSMSNotifications ||
        settings.globalSettings.enableInAppNotifications ||
        settings.globalSettings.enablePushNotifications;

    if (!hasEnabledTypes) {
        errors.push("Vui lòng bật ít nhất một loại thông báo");
    }

    // Check if there are active rules
    const hasActiveRules =
        settings.contractNotifications.some((r) => r.isActive) ||
        settings.milestoneNotifications.some((r) => r.isActive) ||
        settings.taskNotifications.some((r) => r.isActive);

    if (!hasActiveRules) {
        errors.push("Vui lòng tạo ít nhất một quy tắc thông báo hoạt động");
    }

    // Validate working hours
    if (settings.globalSettings.workingHours.workingDays.length === 0) {
        errors.push("Vui lòng chọn ít nhất một ngày làm việc");
    }

    // Validate default recipients for email notifications
    if (settings.globalSettings.enableEmailNotifications && settings.globalSettings.defaultRecipients.length === 0) {
        errors.push("Vui lòng thêm ít nhất một người nhận email mặc định");
    }

    return errors;
};

export const generateNotificationPreview = (rule: NotificationRule, contractData: ContractFormData): string => {
    const { name, trigger, timing, events } = rule;
    const timeText = `${timing.value} ${timing.unit}`;
    const triggerText = trigger === "before" ? "trước" : trigger === "on" ? "đúng lúc" : "sau";

    return `Quy tắc "${name}" sẽ gửi thông báo ${triggerText} ${timeText} khi xảy ra các sự kiện: ${events.join(", ")}`;
};

export const createDefaultNotificationRules = (contractData: ContractFormData): NotificationSettings => {
    const contractRules: ContractNotificationRule[] = [
        {
            id: "contract-end-reminder",
            name: "Nhắc nhở hợp đồng sắp hết hạn",
            description: "Thông báo trước 7 ngày khi hợp đồng sắp hết hạn",
            isActive: true,
            types: ["email", "in-app"],
            trigger: "before",
            timing: { value: 7, unit: "days" },
            frequency: "once",
            recipients: [],
            events: ["end"],
        },
        {
            id: "contract-start-reminder",
            name: "Thông báo bắt đầu hợp đồng",
            description: "Thông báo khi hợp đồng bắt đầu có hiệu lực",
            isActive: true,
            types: ["email", "in-app"],
            trigger: "on",
            timing: { value: 0, unit: "days" },
            frequency: "once",
            recipients: [],
            events: ["start"],
        },
    ];

    const milestoneRules: MilestoneNotificationRule[] = [
        {
            id: "milestone-due-reminder",
            name: "Nhắc nhở mốc thời gian sắp đến hạn",
            description: "Thông báo trước 3 ngày khi mốc thời gian sắp đến hạn",
            isActive: true,
            types: ["email", "in-app"],
            trigger: "before",
            timing: { value: 3, unit: "days" },
            frequency: "once",
            recipients: [],
            events: ["end"],
        },
    ];

    const taskRules: TaskNotificationRule[] = [
        {
            id: "task-overdue-alert",
            name: "Cảnh báo công việc quá hạn",
            description: "Thông báo khi công việc bị quá hạn",
            isActive: true,
            types: ["email", "in-app"],
            trigger: "after",
            timing: { value: 1, unit: "days" },
            frequency: "daily",
            recipients: [],
            events: ["overdue"],
        },
    ];

    return {
        contractNotifications: contractRules,
        milestoneNotifications: milestoneRules,
        taskNotifications: taskRules,
        globalSettings: {
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
        },
    };
};

export const formatNotificationTime = (timing: { value: number; unit: string }): string => {
    const unitMap = {
        minutes: "phút",
        hours: "giờ",
        days: "ngày",
        weeks: "tuần",
    };

    return `${timing.value} ${unitMap[timing.unit as keyof typeof unitMap] || timing.unit}`;
};

export const getNotificationTypeIcon = (type: string): string => {
    const iconMap = {
        email: "faEnvelope",
        sms: "faMobile",
        "in-app": "faDesktop",
        push: "faBell",
    };

    return iconMap[type as keyof typeof iconMap] || "faBell";
};
