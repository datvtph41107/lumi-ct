"use client";

import type React from "react";
import { useState } from "react";
import classNames from "classnames/bind";
import styles from "./StageNotifications.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileContract,
    faChevronLeft,
    faChevronRight,
    faBell,
    faCog,
    faUsers,
    faClock,
    faEnvelope,
    faMobile,
    faDesktop,
    faBellSlash,
} from "@fortawesome/free-solid-svg-icons";
import Button from "~/components/Button";
import { ProgressSidebar } from "../../Sidebar/ProgressSidebar";
import { ContractSummary } from "../../Sidebar/ContractSummary";
import { useContractForm } from "~/hooks/useContractForm";
import { useNavigate } from "react-router-dom";
import NotificationRuleManager from "./NotificationRuleManager";
import GlobalNotificationSettings from "./GlobalNotificationSettings";
import type {
    NotificationSettings,
    ContractNotificationRule,
    MilestoneNotificationRule,
    TaskNotificationRule,
} from "~/types/notifications.types";

const cx = classNames.bind(styles);

const StageNotifications: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"contract" | "milestone" | "task" | "global">("contract");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const { formData, setStep1Data, validateStep, nextStep } = useContractForm();
    const navigate = useNavigate();

    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(
        formData.notificationSettings || {
            contractNotifications: [],
            milestoneNotifications: [],
            taskNotifications: [],
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
                    workingDays: [1, 2, 3, 4, 5], // Monday to Friday
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
        },
    );

    const handleUpdateContractNotifications = (rules: ContractNotificationRule[]) => {
        setNotificationSettings((prev) => ({
            ...prev,
            contractNotifications: rules,
        }));
    };

    const handleUpdateMilestoneNotifications = (rules: MilestoneNotificationRule[]) => {
        setNotificationSettings((prev) => ({
            ...prev,
            milestoneNotifications: rules,
        }));
    };

    const handleUpdateTaskNotifications = (rules: TaskNotificationRule[]) => {
        setNotificationSettings((prev) => ({
            ...prev,
            taskNotifications: rules,
        }));
    };

    const handleUpdateGlobalSettings = (settings: typeof notificationSettings.globalSettings) => {
        setNotificationSettings((prev) => ({
            ...prev,
            globalSettings: settings,
        }));
    };

    const handleFormSubmit = () => {
        // Validate notification settings
        const hasActiveRules =
            notificationSettings.contractNotifications.some((r) => r.isActive) ||
            notificationSettings.milestoneNotifications.some((r) => r.isActive) ||
            notificationSettings.taskNotifications.some((r) => r.isActive);

        if (!hasActiveRules && notificationSettings.globalSettings.enableEmailNotifications) {
            const confirm = window.confirm("Bạn chưa thiết lập quy tắc thông báo nào. Bạn có muốn tiếp tục không?");
            if (!confirm) return;
        }

        // Save notification settings
        setStep1Data({ notificationSettings });

        if (validateStep(3)) {
            console.log("Step 3 validation passed, moving to step 4");
            nextStep();
            navigate("/page/create/daft?stage=4");
        } else {
            console.log("Step 3 validation failed");
        }
    };

    const getTabIcon = (tab: string) => {
        switch (tab) {
            case "contract":
                return faFileContract;
            case "milestone":
                return faClock;
            case "task":
                return faUsers;
            case "global":
                return faCog;
            default:
                return faBell;
        }
    };

    const getActiveRulesCount = (type: "contract" | "milestone" | "task") => {
        switch (type) {
            case "contract":
                return notificationSettings.contractNotifications.filter((r) => r.isActive).length;
            case "milestone":
                return notificationSettings.milestoneNotifications.filter((r) => r.isActive).length;
            case "task":
                return notificationSettings.taskNotifications.filter((r) => r.isActive).length;
            default:
                return 0;
        }
    };

    return (
        <div className={cx("container")}>
            <div className={cx("wrapper")}>
                <div className={cx("form-header")}>
                    <h2>
                        <FontAwesomeIcon icon={faBell} /> Tạo hợp đồng mới - Giai đoạn 3
                    </h2>
                    <p>Thiết lập thông báo và nhắc nhở cho hợp đồng, mốc thời gian và công việc</p>
                </div>

                <div className={cx("mainGrid", { sidebarCollapsed })}>
                    <div className={cx("card")}>
                        <div className={cx("cardHeader")}>
                            <div className={cx("tabNavigation")}>
                                {[
                                    { key: "contract", label: "Hợp đồng", count: getActiveRulesCount("contract") },
                                    { key: "milestone", label: "Mốc thời gian", count: getActiveRulesCount("milestone") },
                                    { key: "task", label: "Công việc", count: getActiveRulesCount("task") },
                                    { key: "global", label: "Cài đặt chung", count: null },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        className={cx("tabButton", { active: activeTab === tab.key })}
                                        onClick={() => setActiveTab(tab.key as any)}
                                    >
                                        <FontAwesomeIcon icon={getTabIcon(tab.key)} />
                                        <span>{tab.label}</span>
                                        {tab.count !== null && tab.count > 0 && <span className={cx("badge")}>{tab.count}</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={cx("cardContent")}>
                            {activeTab === "contract" && (
                                <NotificationRuleManager
                                    type="contract"
                                    rules={notificationSettings.contractNotifications}
                                    onRulesChange={handleUpdateContractNotifications}
                                    availableEvents={[
                                        { value: "start", label: "Bắt đầu hợp đồng" },
                                        { value: "end", label: "Kết thúc hợp đồng" },
                                        { value: "renewal", label: "Gia hạn hợp đồng" },
                                        { value: "termination", label: "Chấm dứt hợp đồng" },
                                        { value: "milestone_due", label: "Mốc thời gian sắp đến hạn" },
                                    ]}
                                    globalSettings={notificationSettings.globalSettings}
                                />
                            )}

                            {activeTab === "milestone" && (
                                <NotificationRuleManager
                                    type="milestone"
                                    rules={notificationSettings.milestoneNotifications}
                                    onRulesChange={handleUpdateMilestoneNotifications}
                                    availableEvents={[
                                        { value: "start", label: "Bắt đầu mốc thời gian" },
                                        { value: "end", label: "Kết thúc mốc thời gian" },
                                        { value: "overdue", label: "Quá hạn mốc thời gian" },
                                        { value: "completed", label: "Hoàn thành mốc thời gian" },
                                        { value: "task_completed", label: "Hoàn thành công việc trong mốc" },
                                    ]}
                                    globalSettings={notificationSettings.globalSettings}
                                    milestones={formData.milestones}
                                />
                            )}

                            {activeTab === "task" && (
                                <NotificationRuleManager
                                    type="task"
                                    rules={notificationSettings.taskNotifications}
                                    onRulesChange={handleUpdateTaskNotifications}
                                    availableEvents={[
                                        { value: "start", label: "Bắt đầu công việc" },
                                        { value: "end", label: "Kết thúc công việc" },
                                        { value: "overdue", label: "Quá hạn công việc" },
                                        { value: "completed", label: "Hoàn thành công việc" },
                                        { value: "assigned", label: "Được giao công việc" },
                                    ]}
                                    globalSettings={notificationSettings.globalSettings}
                                    tasks={formData.milestones.flatMap((m) => m.tasks)}
                                />
                            )}

                            {activeTab === "global" && (
                                <GlobalNotificationSettings
                                    settings={notificationSettings.globalSettings}
                                    onSettingsChange={handleUpdateGlobalSettings}
                                />
                            )}
                        </div>
                    </div>

                    <div className={cx("card")}>
                        <div className={cx("cardHeader")}>
                            <h2>
                                <FontAwesomeIcon icon={faBell} className={cx("icon", "iconLarge")} />
                                Tổng quan thông báo
                            </h2>
                        </div>

                        <div className={cx("cardContent")}>
                            <div className={cx("notificationSummary")}>
                                <div className={cx("summaryItem")}>
                                    <div className={cx("summaryIcon", "contract")}>
                                        <FontAwesomeIcon icon={faFileContract} />
                                    </div>
                                    <div className={cx("summaryContent")}>
                                        <h4>Thông báo hợp đồng</h4>
                                        <p>{getActiveRulesCount("contract")} quy tắc đang hoạt động</p>
                                    </div>
                                </div>

                                <div className={cx("summaryItem")}>
                                    <div className={cx("summaryIcon", "milestone")}>
                                        <FontAwesomeIcon icon={faClock} />
                                    </div>
                                    <div className={cx("summaryContent")}>
                                        <h4>Thông báo mốc thời gian</h4>
                                        <p>{getActiveRulesCount("milestone")} quy tắc đang hoạt động</p>
                                    </div>
                                </div>

                                <div className={cx("summaryItem")}>
                                    <div className={cx("summaryIcon", "task")}>
                                        <FontAwesomeIcon icon={faUsers} />
                                    </div>
                                    <div className={cx("summaryContent")}>
                                        <h4>Thông báo công việc</h4>
                                        <p>{getActiveRulesCount("task")} quy tắc đang hoạt động</p>
                                    </div>
                                </div>

                                <div className={cx("summaryItem")}>
                                    <div className={cx("summaryIcon", "global")}>
                                        <FontAwesomeIcon icon={faCog} />
                                    </div>
                                    <div className={cx("summaryContent")}>
                                        <h4>Cài đặt chung</h4>
                                        <div className={cx("globalStatus")}>
                                            {notificationSettings.globalSettings.enableEmailNotifications && (
                                                <span className={cx("statusBadge", "email")}>
                                                    <FontAwesomeIcon icon={faEnvelope} /> Email
                                                </span>
                                            )}
                                            {notificationSettings.globalSettings.enableSMSNotifications && (
                                                <span className={cx("statusBadge", "sms")}>
                                                    <FontAwesomeIcon icon={faMobile} /> SMS
                                                </span>
                                            )}
                                            {notificationSettings.globalSettings.enableInAppNotifications && (
                                                <span className={cx("statusBadge", "inapp")}>
                                                    <FontAwesomeIcon icon={faDesktop} /> In-App
                                                </span>
                                            )}
                                            {notificationSettings.globalSettings.enablePushNotifications && (
                                                <span className={cx("statusBadge", "push")}>
                                                    <FontAwesomeIcon icon={faBell} /> Push
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={cx("quickActions")}>
                                <h4>Hành động nhanh</h4>
                                <div className={cx("actionButtons")}>
                                    <Button
                                        small
                                        outline
                                        onClick={() => {
                                            // Tạo template thông báo cơ bản
                                            const basicRules = [
                                                {
                                                    id: Date.now().toString(),
                                                    name: "Nhắc nhở hợp đồng sắp hết hạn",
                                                    description: "Thông báo trước 7 ngày khi hợp đồng sắp hết hạn",
                                                    isActive: true,
                                                    types: ["email", "in-app"] as const,
                                                    trigger: "before" as const,
                                                    timing: { value: 7, unit: "days" as const },
                                                    frequency: "once" as const,
                                                    recipients: notificationSettings.globalSettings.defaultRecipients,
                                                    events: ["end"] as const,
                                                },
                                            ];
                                            handleUpdateContractNotifications(basicRules);
                                            setActiveTab("contract");
                                        }}
                                    >
                                        Tạo template cơ bản
                                    </Button>

                                    <Button
                                        small
                                        outline
                                        onClick={() => {
                                            // Disable tất cả thông báo
                                            setNotificationSettings((prev) => ({
                                                ...prev,
                                                contractNotifications: prev.contractNotifications.map((r) => ({ ...r, isActive: false })),
                                                milestoneNotifications: prev.milestoneNotifications.map((r) => ({ ...r, isActive: false })),
                                                taskNotifications: prev.taskNotifications.map((r) => ({ ...r, isActive: false })),
                                            }));
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faBellSlash} />
                                        Tắt tất cả
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={cx("footerBar")}>
                    <div className={cx("footerActions")}>
                        <Button outline medium onClick={() => window.history.back()}>
                            <FontAwesomeIcon icon={faChevronLeft} /> Quay lại
                        </Button>

                        <Button primary medium onClick={handleFormSubmit}>
                            <FontAwesomeIcon icon={faFileContract} />
                            Lưu và tiếp tục đến giai đoạn 4
                        </Button>
                    </div>
                </div>

                <div className={cx("form-sidebar", { collapsed: sidebarCollapsed })}>
                    <button
                        className={cx("sidebar-toggle")}
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        title={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                    >
                        <FontAwesomeIcon icon={sidebarCollapsed ? faChevronLeft : faChevronRight} />
                    </button>

                    <div className={cx("sidebar-content")}>
                        {!sidebarCollapsed && (
                            <>
                                <ProgressSidebar />
                                <ContractSummary />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StageNotifications;
