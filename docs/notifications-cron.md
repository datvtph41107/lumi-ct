## Thông báo & Cron-jobs

Endpoints (NotificationController):
- GET `/notifications/settings` | PUT `/notifications/settings`
- GET `/notifications/pending` | GET `/notifications/failed` | POST `/notifications/:id/retry`

Endpoints (ContractController):
- POST `/contracts/:id/notifications` | GET `/contracts/:id/notifications`
- POST `/contracts/:id/reminders` | GET `/contracts/:id/reminders`

Cron (trong `NotificationService`):
- EVERY_MINUTE: xử lý pending/failed notifications (retry backoff)
- EVERY_5_MINUTES: xử lý active reminders (trigger theo frequency)
- EVERY_DAY_AT_9AM: check milestone due/overdue, task due/overdue, contract expiring/expired → tạo reminders tương ứng

Kênh gửi (stub): Email, SMS, Push, In-app, Webhook. Hiện tại log giả lập, có thể tích hợp provider thực tế.
