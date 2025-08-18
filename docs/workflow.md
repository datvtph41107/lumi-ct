## Quy trình Hợp đồng (Workflow)

Stages chính (UI):
1. StageDraft: chọn mode (basic/editor/upload), tạo draft (server: `contract-drafts`)
2. StageMilestones: milestones/tasks (entity `Milestone`, `Task`)
3. StageNotifications: rule-based nhắc hạn (reminders/notifications)
4. StagePreview: xem trước, chuẩn bị export/print
5. Export/Print: `/contracts/:id/export/pdf|docx`, `/contracts/:id/print`

Lưu Draft:
- Tạo: `POST /contract-drafts` — lưu `initialData` + hợp đồng `is_draft=true`
- Cập nhật: `PATCH /contract-drafts/:id` — lưu stage hiện tại vào `contract_drafts`
- Lấy: `GET /contract-drafts`, `GET /contract-drafts/:id`

Ghi chú:
- Server hiện chưa expose đầy đủ endpoints milestones/tasks trong `ContractController`; logic nền tảng đã có entity + notification cron.
