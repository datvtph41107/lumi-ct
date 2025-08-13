import type React from "react";
import { useState } from "react";
import classNames from "classnames/bind";
import styles from "./NotificationRuleManager.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faEdit,
    faTrash,
    faToggleOn,
    faToggleOff,
    faCopy,
    faEnvelope,
    faMobile,
    faDesktop,
    faBell,
} from "@fortawesome/free-solid-svg-icons";
import Button from "~/components/Button";
import Input from "~/components/Input";
import TextArea from "~/components/TextArea";
import ControllerDropdown from "~/components/Form/ControllerValid/ControllerDropdown";
import Form from "~/components/Form";
import type {
    ContractNotificationRule,
    MilestoneNotificationRule,
    TaskNotificationRule,
    NotificationType,
    NotificationTrigger,
    NotificationFrequency,
    TimeUnit,
    GlobalNotificationSettings,
} from "~/types/notifications.types";
import type { Milestone, Task } from "~/types/contract/contract.types";

const cx = classNames.bind(styles);

interface NotificationRuleManagerProps {
    type: "contract" | "milestone" | "task";
    rules: (ContractNotificationRule | MilestoneNotificationRule | TaskNotificationRule)[];
    onRulesChange: (rules: any[]) => void;
    availableEvents: Array<{ value: string; label: string }>;
    globalSettings: GlobalNotificationSettings;
    milestones?: Milestone[];
    tasks?: Task[];
}

interface RuleFormData {
    name: string;
    description: string;
    isActive: boolean;
    types: NotificationType[];
    trigger: NotificationTrigger;
    timingValue: number;
    timingUnit: TimeUnit;
    frequency: NotificationFrequency;
    recipients: string[];
    events: string[];
    customMessage: string;
    targetIds: string[];
}

const NotificationRuleManager: React.FC<NotificationRuleManagerProps> = ({
    type,
    rules,
    onRulesChange,
    availableEvents,
    globalSettings,
    milestones = [],
    tasks = [],
}) => {
    const [editingRule, setEditingRule] = useState<any | null>(null);
    const [showRuleForm, setShowRuleForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    const notificationTypeOptions = [
        { value: "email", label: "Email", icon: faEnvelope, enabled: globalSettings.enableEmailNotifications },
        { value: "sms", label: "SMS", icon: faMobile, enabled: globalSettings.enableSMSNotifications },
        { value: "in-app", label: "In-App", icon: faDesktop, enabled: globalSettings.enableInAppNotifications },
        { value: "push", label: "Push", icon: faBell, enabled: globalSettings.enablePushNotifications },
    ].filter((option) => option.enabled);

    const triggerOptions = [
        { value: "before", label: "Trước khi" },
        { value: "on", label: "Đúng lúc" },
        { value: "after", label: "Sau khi" },
    ];

    const timeUnitOptions = [
        { value: "minutes", label: "Phút" },
        { value: "hours", label: "Giờ" },
        { value: "days", label: "Ngày" },
        { value: "weeks", label: "Tuần" },
    ];

    const frequencyOptions = [
        { value: "once", label: "Một lần" },
        { value: "daily", label: "Hàng ngày" },
        { value: "weekly", label: "Hàng tuần" },
        { value: "monthly", label: "Hàng tháng" },
    ];

    const getTargetOptions = () => {
        if (type === "milestone") {
            return milestones.map((m) => ({ value: m.id!, label: m.name }));
        }
        if (type === "task") {
            return tasks.map((t) => ({ value: t.id, label: t.name }));
        }
        return [];
    };

    const defaultFormData: RuleFormData = {
        name: "",
        description: "",
        isActive: true,
        types: ["email"],
        trigger: "before",
        timingValue: 1,
        timingUnit: "days",
        frequency: "once",
        recipients: [...globalSettings.defaultRecipients],
        events: [],
        customMessage: "",
        targetIds: [],
    };

    const handleCreateRule = (data: RuleFormData) => {
        const newRule: any = {
            id: Date.now().toString(),
            name: data.name,
            description: data.description,
            isActive: data.isActive,
            types: data.types,
            trigger: data.trigger,
            timing: {
                value: data.timingValue,
                unit: data.timingUnit,
            },
            frequency: data.frequency,
            recipients: data.recipients,
            events: data.events,
            customMessage: data.customMessage,
        };

        if (type === "milestone" && data.targetIds.length > 0) {
            newRule.milestoneIds = data.targetIds;
        }
        if (type === "task" && data.targetIds.length > 0) {
            newRule.taskIds = data.targetIds;
        }

        onRulesChange([...rules, newRule]);
        setShowRuleForm(false);
    };

    const handleUpdateRule = (data: RuleFormData) => {
        if (!editingRule) return;

        const updatedRule = {
            ...editingRule,
            name: data.name,
            description: data.description,
            isActive: data.isActive,
            types: data.types,
            trigger: data.trigger,
            timing: {
                value: data.timingValue,
                unit: data.timingUnit,
            },
            frequency: data.frequency,
            recipients: data.recipients,
            events: data.events,
            customMessage: data.customMessage,
        };

        if (type === "milestone") {
            updatedRule.milestoneIds = data.targetIds;
        }
        if (type === "task") {
            updatedRule.taskIds = data.targetIds;
        }

        onRulesChange(rules.map((rule) => (rule.id === editingRule.id ? updatedRule : rule)));
        setEditingRule(null);
        setShowRuleForm(false);
    };

    const handleEditRule = (rule: any) => {
        setEditingRule(rule);
        setShowRuleForm(true);
    };

    const handleDeleteRule = (ruleId: string) => {
        onRulesChange(rules.filter((rule) => rule.id !== ruleId));
        setShowDeleteConfirm(null);
    };

    const handleToggleRule = (ruleId: string) => {
        onRulesChange(rules.map((rule) => (rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule)));
    };

    const handleDuplicateRule = (rule: any) => {
        const duplicatedRule = {
            ...rule,
            id: Date.now().toString(),
            name: `${rule.name} (Copy)`,
        };
        onRulesChange([...rules, duplicatedRule]);
    };

    const getFormDefaultValues = (): RuleFormData => {
        if (editingRule) {
            return {
                name: editingRule.name,
                description: editingRule.description,
                isActive: editingRule.isActive,
                types: editingRule.types,
                trigger: editingRule.trigger,
                timingValue: editingRule.timing.value,
                timingUnit: editingRule.timing.unit,
                frequency: editingRule.frequency,
                recipients: editingRule.recipients,
                events: editingRule.events,
                customMessage: editingRule.customMessage || "",
                targetIds: editingRule.milestoneIds || editingRule.taskIds || [],
            };
        }
        return defaultFormData;
    };

    return (
        <div className={cx("notification-rule-manager")}>
            <div className={cx("section-header")}>
                <h3>Quy tắc thông báo {type === "contract" ? "hợp đồng" : type === "milestone" ? "mốc thời gian" : "công việc"}</h3>
                {!showRuleForm && (
                    <Button
                        medium
                        primary
                        onClick={() => {
                            setEditingRule(null);
                            setShowRuleForm(true);
                        }}
                        leftIcon={<FontAwesomeIcon icon={faPlus} />}
                    >
                        Thêm quy tắc
                    </Button>
                )}
            </div>

            {showRuleForm && (
                <div className={cx("rule-form-wrapper")}>
                    <div className={cx("rule-form")}>
                        <div className={cx("form-header")}>
                            <h4>{editingRule ? "Chỉnh sửa quy tắc" : "Tạo quy tắc mới"}</h4>
                            <Button
                                text
                                onClick={() => {
                                    setEditingRule(null);
                                    setShowRuleForm(false);
                                }}
                            >
                                Hủy
                            </Button>
                        </div>

                        <Form<RuleFormData>
                            defaultValues={getFormDefaultValues()}
                            onSubmit={editingRule ? handleUpdateRule : handleCreateRule}
                        >
                            <Input name="name" label="Tên quy tắc" placeholder="Nhập tên quy tắc" required="Vui lòng nhập tên quy tắc" />

                            <TextArea name="description" label="Mô tả" placeholder="Mô tả chi tiết về quy tắc" rows={2} />

                            <div className={cx("form-row")}>
                                <div className={cx("checkbox-field")}>
                                    <label>
                                        <input type="checkbox" name="isActive" defaultChecked />
                                        Kích hoạt quy tắc này
                                    </label>
                                </div>
                            </div>

                            <div className={cx("grid-cols-2")}>
                                <div className={cx("multi-select-field")}>
                                    <label>Loại thông báo</label>
                                    <div className={cx("checkbox-group")}>
                                        {notificationTypeOptions.map((option) => (
                                            <label key={option.value} className={cx("checkbox-item")}>
                                                <input
                                                    type="checkbox"
                                                    name="types"
                                                    value={option.value}
                                                    defaultChecked={defaultFormData.types.includes(option.value as NotificationType)}
                                                />
                                                <FontAwesomeIcon icon={option.icon} />
                                                {option.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className={cx("multi-select-field")}>
                                    <label>Sự kiện kích hoạt</label>
                                    <div className={cx("checkbox-group")}>
                                        {availableEvents.map((event) => (
                                            <label key={event.value} className={cx("checkbox-item")}>
                                                <input type="checkbox" name="events" value={event.value} />
                                                {event.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={cx("grid-cols-3")}>
                                <ControllerDropdown
                                    name="trigger"
                                    label="Thời điểm"
                                    options={triggerOptions}
                                    placeholder="Chọn thời điểm"
                                />

                                <Input name="timingValue" label="Số lượng" type="number" min="1" placeholder="1" />

                                <ControllerDropdown
                                    name="timingUnit"
                                    label="Đơn vị thời gian"
                                    options={timeUnitOptions}
                                    placeholder="Chọn đơn vị"
                                />
                            </div>

                            <ControllerDropdown name="frequency" label="Tần suất" options={frequencyOptions} placeholder="Chọn tần suất" />

                            {(type === "milestone" || type === "task") && getTargetOptions().length > 0 && (
                                <div className={cx("multi-select-field")}>
                                    <label>
                                        Áp dụng cho {type === "milestone" ? "mốc thời gian" : "công việc"} cụ thể (để trống = tất cả)
                                    </label>
                                    <div className={cx("checkbox-group")}>
                                        {getTargetOptions().map((option) => (
                                            <label key={option.value} className={cx("checkbox-item")}>
                                                <input type="checkbox" name="targetIds" value={option.value} />
                                                {option.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <TextArea
                                name="customMessage"
                                label="Tin nhắn tùy chỉnh (tùy chọn)"
                                placeholder="Nhập tin nhắn tùy chỉnh cho thông báo này"
                                rows={3}
                            />

                            <div className={cx("form-actions")}>
                                <Button type="submit" primary fullWidth>
                                    {editingRule ? "Cập nhật quy tắc" : "Tạo quy tắc"}
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>
            )}

            {rules.length > 0 && (
                <div className={cx("rules-list")}>
                    <h4>Danh sách quy tắc ({rules.length})</h4>
                    {rules.map((rule) => (
                        <div key={rule.id} className={cx("rule-item", { inactive: !rule.isActive })}>
                            <div className={cx("rule-info")}>
                                <div className={cx("rule-header")}>
                                    <div className={cx("rule-title")}>
                                        <h5>{rule.name}</h5>
                                        <div className={cx("rule-status")}>
                                            <button className={cx("toggle-button")} onClick={() => handleToggleRule(rule.id)}>
                                                <FontAwesomeIcon
                                                    icon={rule.isActive ? faToggleOn : faToggleOff}
                                                    className={cx({ active: rule.isActive })}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                    <div className={cx("rule-actions")}>
                                        <Button
                                            small
                                            text
                                            onClick={() => handleEditRule(rule)}
                                            leftIcon={<FontAwesomeIcon icon={faEdit} />}
                                        >
                                            Sửa
                                        </Button>
                                        <Button
                                            small
                                            text
                                            onClick={() => handleDuplicateRule(rule)}
                                            leftIcon={<FontAwesomeIcon icon={faCopy} />}
                                        >
                                            Sao chép
                                        </Button>
                                        <Button
                                            small
                                            text
                                            onClick={() => setShowDeleteConfirm(rule.id)}
                                            leftIcon={<FontAwesomeIcon icon={faTrash} />}
                                            className={cx("danger")}
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                </div>

                                <p className={cx("rule-description")}>{rule.description}</p>

                                <div className={cx("rule-details")}>
                                    <div className={cx("detail-item")}>
                                        <strong>Sự kiện:</strong> {rule.events.join(", ")}
                                    </div>
                                    <div className={cx("detail-item")}>
                                        <strong>Thời điểm:</strong> {rule.trigger} {rule.timing.value} {rule.timing.unit}
                                    </div>
                                    <div className={cx("detail-item")}>
                                        <strong>Loại thông báo:</strong>
                                        <div className={cx("notification-types")}>
                                            {rule.types.map((type: NotificationType) => (
                                                <span key={type} className={cx("type-badge", type)}>
                                                    <FontAwesomeIcon
                                                        icon={
                                                            type === "email"
                                                                ? faEnvelope
                                                                : type === "sms"
                                                                ? faMobile
                                                                : type === "in-app"
                                                                ? faDesktop
                                                                : faBell
                                                        }
                                                    />
                                                    {type.toUpperCase()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showDeleteConfirm && (
                <div className={cx("modal-overlay")}>
                    <div className={cx("modal")}>
                        <h3>Xác nhận xóa quy tắc</h3>
                        <p>Bạn có chắc chắn muốn xóa quy tắc thông báo này? Hành động này không thể hoàn tác.</p>
                        <div className={cx("modal-actions")}>
                            <Button primary small onClick={() => handleDeleteRule(showDeleteConfirm)}>
                                Xóa
                            </Button>
                            <Button outline small onClick={() => setShowDeleteConfirm(null)}>
                                Hủy
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationRuleManager;
