import { useEffect, useState } from "react";
import { notificationSettingsService } from "~/services/api/notification-settings.service";

interface NotificationItem {
	id: string;
	contract_id: string;
	title: string;
	message: string;
	channel: string;
	status: string;
	scheduled_at?: string;
	sent_at?: string;
	retry_count?: number;
	next_retry_at?: string;
}

const SystemNotificationsQueue = () => {
	const [pending, setPending] = useState<NotificationItem[]>([]);
	const [failed, setFailed] = useState<NotificationItem[]>([]);
	const [loading, setLoading] = useState(false);

	const load = async () => {
		setLoading(true);
		try {
			const [p, f] = await Promise.all([
				notificationSettingsService.listPendingNotifications(),
				notificationSettingsService.listFailedNotifications(),
			]);
			setPending((p.data as any) || []);
			setFailed((f.data as any) || []);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void load();
	}, []);

	const retry = async (id: string) => {
		await notificationSettingsService.retryNotification(id);
		await load();
	};

	return (
		<div style={{ padding: 24 }}>
			<h2>System Notifications Queue</h2>
			{loading ? (
				<p>Đang tải...</p>
			) : (
				<div style={{ display: "grid", gap: 24 }}>
					<section>
						<h3>Pending</h3>
						<table width="100%" cellPadding={6} style={{ borderCollapse: "collapse" }}>
							<thead>
								<tr style={{ textAlign: "left" }}>
									<th>ID</th>
									<th>Contract</th>
									<th>Channel</th>
									<th>Title</th>
									<th>Scheduled</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{pending.map((n) => (
									<tr key={n.id} style={{ borderTop: "1px solid #eee" }}>
										<td>{n.id}</td>
										<td>{n.contract_id}</td>
										<td>{n.channel}</td>
										<td>{n.title}</td>
										<td>{n.scheduled_at || "-"}</td>
										<td>
											<button onClick={() => retry(n.id)}>Retry</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</section>
					<section>
						<h3>Failed</h3>
						<table width="100%" cellPadding={6} style={{ borderCollapse: "collapse" }}>
							<thead>
								<tr style={{ textAlign: "left" }}>
									<th>ID</th>
									<th>Contract</th>
									<th>Channel</th>
									<th>Title</th>
									<th>Retry</th>
									<th>Next retry</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{failed.map((n) => (
									<tr key={n.id} style={{ borderTop: "1px solid #eee" }}>
										<td>{n.id}</td>
										<td>{n.contract_id}</td>
										<td>{n.channel}</td>
										<td>{n.title}</td>
										<td>{n.retry_count}</td>
										<td>{n.next_retry_at || "-"}</td>
										<td>
											<button onClick={() => retry(n.id)}>Retry</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</section>
				</div>
			)}
		</div>
	);
};

export default SystemNotificationsQueue;