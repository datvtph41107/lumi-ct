## API: Notifications

Base: `/notifications` (Bearer)

- GET `/settings` → cấu hình hệ thống
- PUT `/settings` → cập nhật cấu hình hệ thống
- GET `/pending` → danh sách thông báo pending
- GET `/failed` → danh sách thông báo failed (đủ điều kiện retry)
- POST `/:id/retry` → thử gửi lại

Contract scope:
- POST `/contracts/:id/notifications` → tạo notification cho hợp đồng
- GET `/contracts/:id/notifications` → danh sách notification theo hợp đồng
- POST `/contracts/:id/reminders` → tạo reminder
- GET `/contracts/:id/reminders` → danh sách reminder theo hợp đồng
