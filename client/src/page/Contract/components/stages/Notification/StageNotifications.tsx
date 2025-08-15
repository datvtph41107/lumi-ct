import type React from "react";
import { useState } from "react";
import classNames from "classnames/bind";
import styles from "./StageMilestones.module.scss";
import Button from "~/components/Button";
import NotificationRuleManager from "./NotificationRuleManager";
import GlobalNotificationSettings from "./GlobalNotificationSettings";
import type {
	ContractNotificationRule,
	MilestoneNotificationRule,
	TaskNotificationRule,
	GlobalNotificationSettings as GlobalSettings,
} from "~/types/notifications.types";
import { useContractStore } from "~/store/contract-store";

const cx = classNames.bind(styles);

const defaultGlobal: GlobalSettings = {
	enableEmailNotifications: true,
	enableSMSNotifications: false,
	enableInAppNotifications: true,
	enablePushNotifications: true,
	defaultRecipients: [],
	workingHours: { start: "09:00", end: "17:00", timezone: "Asia/Ho_Chi_Minh", workingDays: [1, 2, 3, 4, 5] },
	quietHours: { enabled: false, start: "22:00", end: "08:00" },
	escalationRules: { enabled: false, escalateAfter: { value: 24, unit: "hours" }, escalateTo: [] },
};

const StageNotifications: React.FC = () => {
	const { currentStep, goToStep } = useContractStore();
	const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(defaultGlobal);
	const [contractRules, setContractRules] = useState<ContractNotificationRule[]>([]);
	const [milestoneRules, setMilestoneRules] = useState<MilestoneNotificationRule[]>([]);
	const [taskRules, setTaskRules] = useState<TaskNotificationRule[]>([]);

	const availableContractEvents = [
		{ value: "start", label: "Bắt đầu hợp đồng" },
		{ value: "end", label: "Kết thúc hợp đồng" },
		{ value: "renewal", label: "Gia hạn" },
		{ value: "termination", label: "Chấm dứt" },
	];
	const availableMilestoneEvents = [
		{ value: "start", label: "Bắt đầu mốc" },
		{ value: "end", label: "Kết thúc mốc" },
		{ value: "overdue", label: "Quá hạn" },
		{ value: "completed", label: "Hoàn thành" },
	];
	const availableTaskEvents = [
		{ value: "start", label: "Bắt đầu task" },
		{ value: "end", label: "Kết thúc task" },
		{ value: "overdue", label: "Quá hạn" },
		{ value: "completed", label: "Hoàn thành" },
		{ value: "assigned", label: "Được giao" },
	];

	return (
		<div className={cx("container")}> 
			<div className={cx("wrapper")}> 
				<div className={cx("form-header")}>
					<h2>Giai đoạn 3: Quy tắc thông báo</h2>
					<p>Thiết lập quy tắc nhắc hạn và kênh thông báo</p>
				</div>

				<div className={cx("card")}> 
					<div className={cx("cardHeader")}><h3>Cài đặt chung</h3></div>
					<div className={cx("cardContent")}>
						<GlobalNotificationSettings settings={globalSettings} onSettingsChange={setGlobalSettings} />
					</div>
				</div>

				<div className={cx("card")}> 
					<div className={cx("cardHeader")}><h3>Thông báo theo hợp đồng</h3></div>
					<div className={cx("cardContent")}>
						<NotificationRuleManager
							type="contract"
							rules={contractRules}
							onRulesChange={setContractRules}
							availableEvents={availableContractEvents}
							globalSettings={globalSettings}
						/>
					</div>
				</div>

				<div className={cx("card")}> 
					<div className={cx("cardHeader")}><h3>Thông báo theo mốc</h3></div>
					<div className={cx("cardContent")}>
						<NotificationRuleManager
							type="milestone"
							rules={milestoneRules}
							onRulesChange={setMilestoneRules}
							availableEvents={availableMilestoneEvents}
							globalSettings={globalSettings}
						/>
					</div>
				</div>

				<div className={cx("card")}> 
					<div className={cx("cardHeader")}><h3>Thông báo theo công việc</h3></div>
					<div className={cx("cardContent")}>
						<NotificationRuleManager
							type="task"
							rules={taskRules}
							onRulesChange={setTaskRules}
							availableEvents={availableTaskEvents}
							globalSettings={globalSettings}
						/>
					</div>
				</div>

				<div className={cx("footerBar")}>
					<div className={cx("footerActions")}>
						<Button outline onClick={() => goToStep(Math.max(1, currentStep - 1))}>Quay lại</Button>
						<Button primary onClick={() => goToStep(currentStep + 1)}>Lưu và xem trước</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StageNotifications;
