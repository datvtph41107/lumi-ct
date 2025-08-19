## Thiết kế Hệ thống Role & Collaborator

### 1. Mục tiêu
- **Phân tách tầng quyền rõ ràng**: System Role (truy cập hệ thống) và Contract Collaborator (hành động theo hợp đồng).
- **Phù hợp server hiện tại**: Bám sát `Role` trong `base.enums`, `CollaboratorRole` trong `permission`, `CollaboratorGuard` và `RolesGuard`, `Contract.is_public`.
- **Dễ maintain/mở rộng**: Chuẩn hóa types, tránh dư thừa, tái sử dụng service/guard.

### 2. Kiến trúc tầng quyền
- **System Role (toàn hệ thống)**
  - Enum: `Role` với các giá trị: `MANAGER`, `STAFF` (file `server/src/core/shared/enums/base.enums.ts`).
  - Dùng cho kiểm soát truy cập trang/module, tính năng chung (dashboard, admin, audit, template...).
  - Áp dụng qua `@Roles(...)` và `RolesGuard` (`server/src/modules/auth/guards/role.guard.ts`).

- **Contract Collaborator (theo hợp đồng)**
  - Enum: `CollaboratorRole` với các giá trị: `owner`, `editor`, `reviewer`, `viewer` (file `server/src/core/domain/permission/collaborator-role.enum.ts`).
  - Dùng cho hành động chi tiết trên hợp đồng (xem/chỉnh sửa/review/xuất file/trao quyền...).
  - Áp dụng qua `@CollaboratorRoles(...)` và `CollaboratorGuard` (`server/src/modules/auth/guards/collaborator.guard.ts`).

### 3. Nguyên tắc tổng quát
- Mỗi user có **1 System Role**: `MANAGER` hoặc `STAFF` (lưu trong `User.role`).
- **Manager bypass collaborator**: `CollaboratorGuard` cho phép `MANAGER` bỏ qua kiểm tra collaborator.
- **Hợp đồng public**: với request `GET/HEAD`, nếu `Contract.is_public = true` thì được xem không cần collaborator.
- **Hành động hợp đồng**: phải thỏa cả 2 lớp khi cần
  - Truy cập API/module: qua `RolesGuard` (ví dụ: trang quản trị chỉ cho `MANAGER`).
  - Hành động trên 1 hợp đồng cụ thể: qua `CollaboratorGuard` (ví dụ: chỉnh sửa cần `owner`/`editor`).
- **Granular Permission**: vẫn tồn tại ở service `AuthService` để cấp quyền hệ thống (dashboard, template, audit...). Không dùng granular permission cho hành động chi tiết trên hợp đồng, thay bằng collaborator roles.

### 4. Data model chính (TypeORM)
- `roles` (`server/src/core/domain/permission/role.entity.ts`)
  - Trường chính: `id`, `name` (`MANAGER|STAFF`), `is_active`.
  - Gợi ý sử dụng như danh mục tham chiếu; quyền gán thực tế đang lưu ở `User.role`.

- `collaborators` (`server/src/core/domain/permission/collaborator.entity.ts`)
  - Khóa chính tổng hợp: `contract_id` (char(36)), `user_id` (int).
  - `role`: `owner|editor|reviewer|viewer` (theo `CollaboratorRole`).
  - `active`: boolean.
  - Tùy chọn quyền phụ: `can_export`, `can_manage_collaborators` để mở rộng tinh chỉnh theo hợp đồng.

- `contracts` (`server/src/core/domain/contract/contract.entity.ts`)
  - Trường nổi bật: `status`, `is_public`, `created_by`, `updated_by`...
  - `is_public` mặc định `false`. Khi `true`, cho phép xem công khai (GET/HEAD) theo `CollaboratorGuard`.

### 5. Types & DTO chuẩn hóa
- System Role: dùng `Role` từ `base.enums`.
- Collaborator Role: dùng `CollaboratorRole` (lowercase) từ `permission`.
- Sửa `CollaboratorData.role` trong `server/src/core/shared/types/contract.types.ts` thành `'owner' | 'editor' | 'reviewer' | 'viewer'` để đồng bộ với enum.
- DTO sử dụng `class-validator` cho dữ liệu vào/ra; join dữ liệu qua service/repository, tránh quan hệ trực tiếp ở DTO.

### 6. Guards & Decorators
- `@Roles(...roles: Role|AdminRole[])` + `RolesGuard`: kiểm soát truy cập module/trang.
- `@CollaboratorRoles(...roles: CollaboratorRole[])` + `CollaboratorGuard`:
  - Lấy `contractId` từ `params.id`.
  - Cho phép `MANAGER` bỏ qua kiểm tra collaborator.
  - Cho phép xem GET/HEAD nếu `is_public = true`.
  - Mặc định nếu không chỉ định metadata, coi như quyền xem (`owner|editor|reviewer|viewer`).

Ví dụ áp dụng trong controller:
```ts
@Roles(Role.MANAGER)
@Get('admin/contracts')
findAllByDepartment() { /* ... */ }

@UseGuards(CollaboratorGuard)
@CollaboratorRoles(CollaboratorRole.OWNER, CollaboratorRole.EDITOR)
@Put('contracts/:id')
updateContract() { /* ... */ }
```

### 7. Hành vi theo vai trò
- **Manager**
  - Truy cập các trang quản trị: quản lý người dùng, cấp/thu hồi role, dashboard tổng, audit-log toàn phòng ban, thiết lập thông báo chung, quản trị template.
  - Trên hợp đồng: luôn có quyền phê duyệt, chỉnh sửa, thiết lập nhắc hạn, cấp/thu hồi collaborator cho staff.

- **Staff**
  - Truy cập chức năng cơ bản của hệ thống (ví dụ: tạo hợp đồng nếu chính sách cho phép qua `AuthService`).
  - Trên hợp đồng cụ thể: hành vi phụ thuộc collaborator role được gán:
    - `owner`: toàn quyền; thêm/gỡ collaborator; chuyển owner; chỉnh sửa nội dung; thiết lập nhắc hạn; quản lý version.
    - `editor`: xem + chỉnh sửa nội dung, milestone, notification, thiết lập nhắc hạn.
    - `reviewer`: xem + review, nộp báo cáo; không chỉnh sửa nội dung hợp đồng.
    - `viewer`: chỉ xem.

### 8. Quy trình & Workflow hợp đồng
1) Tạo hợp đồng (owner) → `status = pending` chờ phê duyệt.
2) Gán collaborator: `owner` thêm `editor/reviewer/viewer`.
3) Manager phê duyệt → hợp đồng có hiệu lực.
4) Chỉnh sửa/cập nhật: `owner`, `manager` luôn có quyền; `editor` khi được gán.
5) Thiết lập nhắc hạn: `owner` và `manager`.
6) Audit-log: ghi mọi thao tác; người liên quan xem log hợp đồng; manager có trang tổng.

### 9. Dịch vụ & tái sử dụng
- `CollaboratorService` (`server/src/modules/contract/collaborator.service.ts`): thêm/cập nhật/xóa, kiểm tra quyền (`hasRole`, `canEdit`, `canReview`, `canView`), chuyển owner, ghi audit, gửi notification.
- `AuditLogService`: ghi log hành vi ở mọi thao tác quan trọng.
- `NotificationService`: gửi thông báo rule-based, in-app (và có thể mở rộng kênh).
- `ContractService`: CRUD + workflow hợp đồng, dùng chung guards và collaborator.
- `CronTaskService`: nhắc hạn, overdue, escalation theo `NotificationType`.

### 10. Ma trận quyền hành động (rút gọn)
- **Xem hợp đồng**: `viewer|reviewer|editor|owner` hoặc public (`is_public=true`) hoặc `MANAGER`.
- **Chỉnh sửa nội dung**: `editor|owner` hoặc `MANAGER`.
- **Review/Nộp báo cáo**: `reviewer|editor|owner` hoặc `MANAGER`.
- **Xuất file**: `owner` hoặc `editor` hoặc `MANAGER` hoặc theo cờ `can_export` tại collaborator.
- **Quản lý collaborator**: `owner` hoặc `MANAGER` hoặc theo cờ `can_manage_collaborators`.
- **Phê duyệt**: `MANAGER` (theo chính sách) và/hoặc `owner` tùy workflow.

### 11. Nguyên tắc maintainability
- **Không dư thừa dữ liệu**: 1 user ↔ 1 system role; collaborator per-contract rõ ràng.
- **Refactor type**: đồng bộ union type với enum (đã chỉ ra ở mục 5).
- **Tái sử dụng service**: tất cả hành vi trên hợp đồng đi qua `ContractService`/`CollaboratorService` để tránh duplicate.
- **Guard rõ ràng**: page/module qua `RolesGuard`, per-contract qua `CollaboratorGuard`.
- **Audit & Observability**: mọi hành động quan trọng đều ghi log; dễ tra cứu và báo cáo.
- **Cron & Notifications**: nhắc hạn theo collaborator và trạng thái hợp đồng, dùng `NotificationType` chuẩn hóa.

### 12. Tác vụ refactor khuyến nghị (an toàn, tương thích ngược)
- Cập nhật `CollaboratorData.role` thêm `'reviewer'` để trùng enum.
- Rà soát controller API contract để:
  - Thêm `@UseGuards(CollaboratorGuard)` và `@CollaboratorRoles(...)` cho các hành động cập nhật/xóa/xuất file.
  - Dùng `@Roles(Role.MANAGER)` cho trang/quy trình quản trị.
- Chuẩn hóa logic export và quản trị collaborator dựa trên `can_export`, `can_manage_collaborators` nếu đã bật.
- Giảm dần sử dụng granular permission cho thao tác hợp đồng; giữ granular cho tài nguyên hệ thống (dashboard, template, audit...).

### 13. Test & xác nhận
- Unit test cho `CollaboratorService`: `add/updateRole/remove/list/transferOwnership/hasRole/canEdit/canView`.
- E2E test cho guard:
  - `MANAGER` truy cập mọi hợp đồng (bỏ qua collaborator).
  - `GET` hợp đồng public không cần collaborator; `PUT` cần `owner|editor`.
  - Staff không phải collaborator bị chặn.
- Kiểm thử audit-log và notification khi thêm/xóa/chuyển owner.

### 14. Ví dụ áp dụng nhanh
```ts
// Chỉ Manager mới xem trang quản trị hợp đồng
@Roles(Role.MANAGER)
@Get('admin/contracts')
getAdminContracts() {}

// Cần quyền collaborator ở mức edit
@UseGuards(CollaboratorGuard)
@CollaboratorRoles(CollaboratorRole.OWNER, CollaboratorRole.EDITOR)
@Put('contracts/:id')
updateContract() {}

// Xem hợp đồng: nếu public => ai cũng xem được; nếu private => cần bất kỳ collaborator role
@UseGuards(CollaboratorGuard)
@Get('contracts/:id')
getContract() {}
```

### 15. Kết luận
- Hai tầng quyền tách bạch: **Role (truy cập hệ thống)** và **Collaborator (hành động hợp đồng)**.
- Đồng bộ enum/type, tái sử dụng service/guard, đảm bảo audit/notification đầy đủ.
- Thiết kế hiện tại tương thích với mã nguồn, dễ mở rộng và bảo trì lâu dài.

