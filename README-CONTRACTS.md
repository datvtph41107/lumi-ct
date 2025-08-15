# Hệ thống quản lý hợp đồng nội bộ

## Luồng chức năng chính
- Phòng ban: Hành chính, Kế toán. Vai trò: Quản lý, Nhân viên (RBAC theo resource/action)
- Tạo hợp đồng: Basic Form | Editor (Tiptap) | Upload→Editor
- Workflow: Draft (Stage 1) → Milestones/Tasks (Stage 2) → Notifications (Stage 3) → Preview/Review (Stage 4) → Approval/Archive
- Audit log: ghi mọi hành động chính (create/update/export/print/assign…)
- Collaborators: owner/editor/reviewer/viewer; chuyển quyền, phân quyền theo hợp đồng

## Client (React TS)
- Routes quan trọng: `routes.config.tsx`
  - `/contracts/create` → chọn mode
  - `/contracts/collection` → chọn template hoặc nháp gần đây
  - `/page/create/daft?draftId=...&stage=...` → soạn thảo theo stage
- Stage components
  - Stage 1: `StageDraft.tsx`
    - Editor layout: `HeaderBar` (Export PDF/DOCX/HTML, Print), `SidebarLeft`, `EditorPage`, `SidebarRight` (Collaborator & Audit)
    - Basic/Upload có form tương ứng
  - Stage 2: `Milestones/StageMilestones.tsx` – quản lý mốc/công việc; đồng bộ `useContractForm` + `useContractDraftStore`
  - Stage 3: `Notification/StageNotifications.tsx` – quản lý rule thông báo theo hợp đồng/mốc/task; cấu hình `GlobalNotificationSettings`
  - Stage 4: `Preview/StagePreview.tsx` – xem trước nội dung (dùng TipTap HTML), nút Print và Export HTML
- Store
  - Draft flow: `store/contract-draft-store.ts` (Zustand) – draft, template, stage, auto-save
  - Editor state: `store/editor-store.ts`, `store/contract-editor-store.ts`
  - Form hook: `hooks/useContractForm.ts` – chuẩn hóa Milestone/Task, validate stage
  - Contract store nhẹ: `store/contract-store.ts` – điều hướng step
- Types chuẩn hóa
  - `types/contract/contract.types.ts`: thêm `Milestone`, `Task`, `MilestoneFormData`, `TimeRange` có `startDate/endDate`
  - `types/notifications.types.ts`: rule, global settings

## Export/Print
- Client
  - `HeaderBar.tsx`: Download PDF/DOCX (server), Export HTML (client), Print
  - `GlobalStyles.scss @media print`: ẩn sidebar/toolbar, giữ nội dung editor
  - `Preview/StagePreview.tsx`: in và tải HTML trực tiếp từ TipTap
- Server
  - GET `/contracts/:id/export/pdf|docx` – hiện trả về placeholder (HTML/txt base64). Có thể nâng cấp Puppeteer/DOCX
  - GET `/contracts/:id/print` – trả về HTML print view

## Notifications & Reminders
- Client: `StageNotifications.tsx`, `NotificationRuleManager.tsx`, `GlobalNotificationSettings.tsx`
- Server: `modules/notification/notification.service.ts`
  - Tạo thông báo, nhắc hạn, retry/backoff, cron xử lý batch
  - API (qua `ContractController`) tạo/list notifications, reminders

## Collaborator & Audit Log
- Client: `SidebarRight.tsx` nhúng `CollaboratorManagement` và tab “Hoạt động” (đọc `audit-log.service.ts`)
- Server: `contract.controller.ts` + `contract.service.ts` – thêm/xóa/sửa collaborator; audit endpoints

## RBAC UI & Auth
- UI Guard: `core/auth/PermissionGuard.ts` + `AuthCoreSerivce.ts`
- Dùng cookie HTTPOnly + refresh token (PrivateApiClient interceptors)
- Khóa hành động nhạy cảm (export/delete/transfer) theo permission thực tế

## API Server (NestJS) – Endpoints chính
- Contracts CRUD: POST/GET/PATCH/DELETE `/contracts`
- Stage/Draft: `PATCH /contracts/:id/stage/:stage/save`, `POST /contracts/:id/transition`
- Versions: `POST/GET /contracts/:id/versions`
- Milestones/Tasks: theo `contract.controller.ts`
- Collaborators: `POST/GET/PATCH/DELETE` theo `contract.controller.ts`
- Export/Print: `GET /contracts/:id/export/pdf|docx`, `GET /contracts/:id/print`
- Audit: `GET /contracts/:id/audit`, `GET /contracts/:id/audit/summary`
- Notifications/Reminders: `POST/GET /contracts/:id/notifications|reminders`

## Hàng đợi/Queue (đề xuất)
- Dùng BullMQ/Redis cho gửi thông báo, retry, escalation, batch cron
- Phân nhóm queue: email, sms, push, in-app; đặt rate limit và backoff

## Kiểm thử (đề xuất)
- E2E luồng: Create → Draft → Milestones → Notifications → Preview → Print/Export
- Quyền (quản lý/nhân viên) ở từng stage và hành động nhạy cảm

## Ghi chú đồng bộ
- Đã chuẩn hóa types Milestone/Task/TimeRange và hook `useContractForm`
- Kích hoạt Stage 4 Preview tối giản; có thể gắn Approval sau
- Print CSS đã tối ưu để in nội dung soạn thảo