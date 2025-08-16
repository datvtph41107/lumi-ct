## Kiến trúc & Tổng quan hệ thống

### Mục tiêu
- Quản lý hợp đồng nội bộ cho 2 phòng ban: Hành chính, Kế toán
- Vai trò: Quản lý (Manager) và Nhân viên (Staff)
- Quy trình: Soạn thảo → Mốc & Công việc → Thông báo → Xem trước/Phê duyệt → Lưu trữ/Xuất bản

### Công nghệ
- Frontend: React + TypeScript, Redux Toolkit, Zustand
- Backend: NestJS + TypeORM (Entities không dùng quan hệ), Cron/Schedule
- Auth: JWT Access + Refresh (HTTPOnly), Quản lý phiên (session) + Inactivity

---

## Phân quyền & Xác thực

### Nguyên tắc
- Không có đăng ký tài khoản người dùng (được quản lý tạo)
- Đăng nhập bằng Username/Password
- Cookies HTTPOnly lưu refresh token, sessionId; Access Token ở memory
- Idle 15 phút: cảnh báo/auto-logout; đóng tab -> logout

### UI Guards (Client)
- `src/core/auth/PermissionGuard.tsx`: render theo quyền
- Helper guard theo resource/action: ContractCreate/Read/Update/Delete/Approve/Reject, TemplateManage, DashboardView/Analytics
- Role guard: ContractManager, AccountingStaff, HRStaff

### Server Guards
- `AuthGuardAccess` (JWT)
- `PermissionsGuard` (có thể áp cho các endpoint nhạy cảm: export, delete, transfer ownership)

---

## Quy trình Soạn thảo (Client)

### Dòng chảy màn hình
1) CreateContract.tsx (Chọn mode: Basic | Editor | Upload)
2) ContractCollection.tsx (Chọn template hoặc tiếp tục bản nháp)
3) ContractDaft.tsx (Chuyển stage):
   - Stage 1: `StageDraft.tsx` (Soạn thảo nội dung)
   - Stage 2: `Milestones/StageMilestones.tsx` (Mốc & công việc)
   - Stage 3: `Notification/StageNotifications.tsx` (Quy tắc thông báo)
   - Stage 4: `Preview/StagePreview.tsx` (Xem trước/print/export)

### Soạn thảo Editor
- `components/DaftContract/EditorPage.tsx` (nội dung)
- `components/DaftContract/HeaderBar/HeaderBar.tsx`
  - Download PDF/DOCX/HTML, Print, Share URL
  - PDF/DOCX gọi API server
  - HTML export tại client từ nội dung editor
- `components/DaftContract/SidebarLeft/*`, `SidebarRight/*`
  - `SidebarRight` tích hợp `CollaboratorManagement` và hoạt động (audit)

### Milestones & Tasks
- `StageMilestones.tsx` dùng `useContractForm` + `useContractStore`
- Kiểm tra dữ liệu (date range, tasks ≥ 1)
- Cập nhật state, next stage

### Thông báo (Rules)
- `StageNotifications.tsx` quản lý rule cho hợp đồng/mốc/task
- Truyền `GlobalNotificationSettings` vào `NotificationRuleManager`
- Lưu rule (gọi API hệ thống/thông báo hợp đồng)

### Xem trước / In ấn
- `Preview/StagePreview.tsx` render HTML từ editor
- In: `window.print()` (ẩn sidebar bằng CSS `editor-print`)
- Export HTML: client-side, PDF/DOCX: server endpoint

---

## API Server (Hợp đồng)
- `GET /contracts` (lọc/paging)
- `POST /contracts` (tạo)
- `GET /contracts/:id` (chi tiết)
- Cập nhật/xoá mềm hợp đồng
- Versioning: `/contracts/:id/versions` (list/create/publish/rollback)
- Milestones/Tasks: CRUD theo `/contracts/:id/milestones`, `/milestones/:mid/tasks`, ...
- Collaborators: `/contracts/:id/collaborators` (thêm/sửa/xoá, transfer owner)
- Export/Print:
  - `/contracts/:id/export/pdf`
  - `/contracts/:id/export/docx`
  - `/contracts/:id/print` (HTML view)
- Audit: `/contracts/:id/audit`, `/contracts/:id/audit/summary`, `/contracts/audit/user`, `/contracts/audit/system`
- Template: `/contracts/templates` CRUD
- Thông báo/Nhắc hạn: `/contracts/:id/notifications`, `/contracts/:id/reminders`

Lưu ý: Entities không dùng quan hệ; mọi truy vấn join cần refactor về query builder hoặc truy vấn riêng biệt theo `*_id`.

---

## API Server (Auth)
- `POST /auth/login`
- `POST /auth/refresh-token` (hoặc `/auth/refresh`)
- `POST /auth/logout`, `POST /auth/logout-all`
- `GET /auth/me`
- `GET /auth/verify-session`
- `POST /auth/update-activity`
- Không có `register` (user do quản lý tạo) ✔

Phiên (UserSession): quản lý `session_id`, `refresh_token`, `access_token_hash`, `last_activity`, `expires_at`, ...

---

## Thông báo & Cron/Queue
- Module `cron-task`: dọn dẹp session/token, nhắc hạn (có thể mở rộng)
- Module `notification`: gửi notification, tạo reminder theo hợp đồng/mốc/task
- Đề xuất dùng queue (Bull/BullMQ + Redis) cho:
  - Gửi email/push hàng loạt, retry, backoff
  - Lịch nhắc hạn theo cron/timer per job
  - Escalation pipeline (gửi nhắc bậc 2 khi quá hạn)

---

## Entities (Không dùng quan hệ)
- Thay vì `@ManyToOne`/`@OneToMany`/`@ManyToMany`, dùng khoá ngoại `*_id`
- Ưu điểm: đơn giản hoá mapping, giảm lazy-loading bug, truy vấn rõ ràng
- Nhược: cần tự truy vấn bổ sung khi hiển thị dữ liệu liên quan

Các file đã điều chỉnh (ví dụ):
- `core/domain/permission/role.entity.ts`: bỏ ManyToMany `permissions`
- `core/domain/permission/user-role.entity.ts`: bỏ ManyToOne tới `Role`/`User`
- `core/domain/user/user-session.entity.ts`: bỏ quan hệ tới `User`

---

## Trạng thái hiện tại (Repo)

### Đã có
- UI Stages & Components (Create/Collection/Draft/Milestones/Notifications/Preview)
- Services API (contracts, audit, collaborators, notification settings) ở client
- Modules server: contract, notification, cron-task (sẵn khung)

### Khoảng trống/gai góc cần đồng bộ (ưu tiên)
1) Đồng bộ types/slices (client) để build xanh
   - Chuẩn hoá type Milestone/Task: dùng `ContractMilestone/ContractTask` hoặc alias trùng shape UI (`Milestone/Task`)
   - Bổ sung `MilestoneFormData` vào `types/contract/contract.types.ts` (đã tồn tại) và dùng thống nhất
   - Rà soát `useContractForm` vs `contract-draft-store` (shape `contractData`) để khớp `milestones`
   - Loại imports không tồn tại (`~/types/milestone.types`, `template.service`, v.v.)
   - `contract.service` (client) dùng `BaseService.request.private/public` thay vì `this.get/post/...`
2) Loại bỏ `register` bên client
   - Xoá method `register` khỏi `AuthManager`, `AuthContext`, không gọi ở UI
   - Giữ `authService.login/getCurrentUser/logout/refresh-token/update-activity`
3) Export/Print
   - HeaderBar gọi endpoints `/contracts/:id/export/pdf|docx`, `/contracts/:id/print`
   - CSS in ấn: ẩn sidebar khi `@media print`
4) Notifications
   - `StageNotifications` lưu rule; server mapping sang `notification/reminder` endpoints
   - Bổ sung trang Admin: quản lý thông báo hệ thống (system-wide)
5) Collaborator & Audit
   - `SidebarRight` tích hợp `CollaboratorManagement` + hoạt động gần đây (audit service)
6) RBAC UI
   - Áp `PermissionGuard` cho nút Export/Delete/Transfer Ownership…
7) Queue
   - Triển khai Bull/BullMQ + Redis cho email/push và nhắc hạn quy mô lớn

---

## Kế hoạch hoàn thiện (đề xuất tuần tự)

- Bước 1: Sửa client build
  - Loại bỏ đăng ký (UI + services)
  - Sửa `contract.service` dùng `this.request.*`
  - Thống nhất type Milestone/Task; xoá import tới file type không tồn tại
  - Fix các tham chiếu route/config không hợp lệ (ví dụ `routePrivate.dashboard`)
- Bước 2: RBAC UI
  - Áp `PermissionGuard` cho hành động nhạy cảm
- Bước 3: Notifications & Admin System Notifications
  - Trang quản lý rule hệ thống, lưu config, áp dụng cron/queue
- Bước 4: Export/Print polishing
  - CSS print, tải HTML, tối ưu template
- Bước 5: E2E
  - Luồng Create → Draft → Milestones → Notifications → Export/Print
  - Kiểm thử quyền theo vai trò/phòng ban

---

## Ghi chú triển khai
- Server đã được mô tả “đúng”; khi refactor entities về no-relations cần rà lại các service dùng `relations` (đã thay thế dần) và tự truy vấn dữ liệu liên quan theo `*_id`
- Nếu cần bật lại lazy-loading, cân nhắc giới hạn ở nơi cần thiết, nhưng mặc định giữ no-relations để đơn giản hoá