# Contract Management API Documentation

## Overview

Hệ thống API quản lý hợp đồng phục vụ 2 phòng ban (Hành chính/ Kế toán) với 2 vai trò (Manager/Staff), hỗ trợ soạn thảo, workflow, collaborator, thông báo (cron + queue) và audit-log. Tất cả API trả về chuẩn Success/Error thông qua ResponseInterceptor.

Base prefix: `${PREFIX}` (ví dụ `/api`), tất cả route bên dưới giả định đã thêm prefix.

Auth: JWT RS256 access token (15m) + refresh token (cookie HttpOnly, HS256, 7d). Session được quản lý trong bảng `user_sessions` với cơ chế idle và revoke.

---

## 0. Authentication

### POST /auth/login
- Body:
```json
{ "username": "admin", "password": "***", "is_manager_login": true }
```
- Response: `{ success, data: { access_token, user } }` (refreshToken + sessionId set via cookie)

### POST /auth/refresh-token
- Lấy access token mới từ cookie refreshToken

### POST /auth/logout
- Thu hồi session, xóa cookies

### GET /auth/me
- Trả về payload user hiện tại

### GET /auth/verify-session
- Kiểm tra session còn hợp lệ

### POST /auth/update-activity
- Cập nhật last_activity của session

---

## 1. Users

Yêu cầu AuthGuardAccess. Một số route yêu cầu RolesGuard/PermissionsGuard.

### GET /me
- Lấy thông tin user hiện tại

### POST /manager/staff
- Roles: MANAGER hoặc SUPER_ADMIN
- Body: `CreateUserRequest { name, username, password, department_id, ... }`
- Tạo mới nhân viên trong phòng ban của manager

### GET /manager/staff
- Liệt kê toàn bộ staff của phòng ban của manager

---

## 2. Admin

Yêu cầu AuthGuardAccess.

### GET /admin/departments
### GET /admin/departments/:id
### PUT /admin/departments/:id
### POST /admin/departments/manager

### GET /admin/users
### POST /admin/users
### PUT /admin/users/:id
### DELETE /admin/users/:id

### GET /admin/users/:id/roles
### POST /admin/users/:id/roles

### GET /admin/users/:id/permissions

### GET /admin/roles
### POST /admin/roles
### PUT /admin/roles/:id
### DELETE /admin/roles/:id
### GET /admin/roles/:id/permissions
### PUT /admin/roles/:id/permissions

### GET /admin/permissions/catalog

---

## 3. Contracts

Yêu cầu AuthGuardAccess, một số route cần CollaboratorGuard.

### POST /contracts
- Body: `CreateContractDto { name, contract_code?, contract_type?, category?, priority?, mode, template_id? }`

### GET /contracts
- Query: `page, limit, status?, priority?, category?, search?, created_from?, created_to?, sort_by?, sort_order?`

### GET /contracts/:id
### PATCH /contracts/:id
### DELETE /contracts/:id

### GET /contracts/:id/preview
### GET /contracts/:id/audit
### GET /contracts/:id/audit/summary

### GET /contracts/:id/export/pdf
### GET /contracts/:id/export/docx
### GET /contracts/:id/print

### POST /contracts/:id/notifications
- Body: `CreateNotificationDto { type, channel, title, message, scheduled_at?, metadata? }`

### GET /contracts/:id/notifications

### POST /contracts/:id/reminders
- Body: `CreateReminderDto { type, frequency, title, message, trigger_date, advance_days?, notification_channels?, recipients?, milestone_id?, task_id?, metadata? }`

### GET /contracts/:id/reminders

---

## 4. Contract Drafts

### GET /contract-drafts
- Query: `search?, mode?, status?, page?, limit?`

### GET /contract-drafts/:id

### POST /contract-drafts
- Body (client flow payload giản lược):
```json
{
  "contractData": { "name": "...", "contractCode": "...", "contractType": "custom", "category": "business", "priority": "medium", "content": { "mode": "basic", "templateId": "..." } },
  "flow": { "selectedMode": "basic" }
}
```

### PATCH /contract-drafts/:id
- Body: cập nhật contractData/flow, auto-save stage

### DELETE /contract-drafts/:id

---

## 5. Templates

### GET /contracts/templates
### GET /contracts/templates/:id
### POST /contracts/templates
### PATCH /contracts/templates/:id
### DELETE /contracts/templates/:id

---

## 6. Collaborators

### POST /contracts/:id/collaborators
- Body: `{ user_id: number, role: 'OWNER'|'EDITOR'|'REVIEWER'|'VIEWER' }`

### GET /contracts/:id/collaborators
### PATCH /contracts/collaborators/:collaboratorId
- Body: `{ role?: ..., active?: boolean }`

### DELETE /contracts/collaborators/:collaboratorId
### POST /contracts/:id/transfer-ownership
- Body: `{ from_user_id: number, to_user_id: number }`

### GET /contracts/:id/permissions
- Trả về `{ permissions: { is_owner, can_edit, can_review, can_view } }`

---

## 7. Notifications (System)

### GET /notifications/settings
### PUT /notifications/settings
- Body:
```json
{
  "enableEmailNotifications": true,
  "enableSMSNotifications": false,
  "enableInAppNotifications": true,
  "enablePushNotifications": true,
  "workingHours": { "start": "09:00", "end": "17:00", "timezone": "Asia/Ho_Chi_Minh", "workingDays": [1,2,3,4,5] },
  "quietHours": { "enabled": false, "start": "22:00", "end": "08:00" },
  "escalationRules": { "enabled": false, "escalateAfter": { "value": 24, "unit": "hours" }, "escalateTo": [] },
  "defaultRecipients": []
}
```

### GET /notifications/pending
### GET /notifications/failed
### POST /notifications/:id/retry

Cronjobs: xử lý pending/failed notifications mỗi phút; xử lý reminders mỗi 5 phút; check milestones/tasks/contract expiry 9h hằng ngày.

---

## 8. Upload

### POST /upload/file
- FormData: `file` (PDF/DOCX)
- Validation: size <= 5MB, mimetype PDF/DOCX

---

## 9. Response format

Thành công:
```json
{ "success": true, "message": "Request successful", "data": { /* payload */ } }
```

Lỗi:
```json
{ "success": false, "message": "...", "error": { "name": "...", "details": "..." } }
```

---

## 10. Entities (tóm tắt, không dùng relation trực tiếp)
- `contracts`: hợp đồng, trường `mode`, `status`, `template_id`, v.v.
- `contract_reminders`: nhắc hạn theo `type`, `frequency`, `trigger_date`, `recipients`, `notification_channels`
- `notifications`: thông báo `type`, `channel`, `status`
- `milestones`, `tasks`: quản lý tiến độ
- `collaborators`: composite key (`contract_id`, `user_id`) + `role`
- `audit_logs`: lưu hành động
- `user_sessions`, `revoked_tokens`
- `departments`, `users`, `user_permissions`, `roles`, `permissions`, `user_roles`

---

## 11. Authorization

- Access: JWT guard + token revoke check
- Admin path `/admin` yêu cầu role Admin/Super Admin
- CollaboratorGuard bắt buộc cho sửa/xóa contract, thêm collaborator
- Fine-grained check thông qua `AuthCoreService` với context: ownerId, status, type, assignedUsers, scope, role

---

Ghi chú: Một số phần gửi thông báo bên ngoài (email/SMS/push/webhook) ở dạng placeholder; cần tích hợp provider thực tế. Audit interceptor ghi lại các thao tác đột biến (POST/PATCH/PUT/DELETE).

## Tổng quan

Hệ thống API quản lý hợp đồng cung cấp đầy đủ các tính năng để quản lý vòng đời hợp đồng từ tạo mới, soạn thảo, phê duyệt đến lưu trữ.

## Base URL

```
http://localhost:3000/api/contracts
```

## Authentication

Tất cả API đều yêu cầu JWT token trong header:

```
Authorization: Bearer <jwt_token>
```

---

## 1. CONTRACT CRUD

### 1.1 Tạo hợp đồng mới

```http
POST /contracts
```

**Request Body:**

```json
{
    "name": "Hợp đồng lao động",
    "contract_code": "HDLD-2024-001",
    "contract_type": "employment",
    "category": "labor",
    "priority": "medium",
    "mode": "form",
    "template_id": "uuid-template-id"
}
```

**Response:**

```json
{
    "success": true,
    "data": {
        "id": "uuid-contract-id",
        "name": "Hợp đồng lao động",
        "status": "draft",
        "created_at": "2024-01-01T00:00:00Z"
    }
}
```

### 1.2 Lấy danh sách hợp đồng

```http
GET /contracts?page=1&limit=10&status=active&search=keyword
```

**Query Parameters:**

- `page`: Số trang (default: 1)
- `limit`: Số lượng per page (default: 10)
- `status`: Trạng thái hợp đồng
- `priority`: Độ ưu tiên
- `category`: Danh mục
- `search`: Tìm kiếm theo tên, mã, ghi chú
- `created_from`: Ngày tạo từ
- `created_to`: Ngày tạo đến
- `sort_by`: Sắp xếp theo field
- `sort_order`: asc/desc

### 1.3 Lấy chi tiết hợp đồng

```http
GET /contracts/{id}
```

### 1.4 Cập nhật hợp đồng

```http
PATCH /contracts/{id}
```

### 1.5 Xóa hợp đồng (soft delete)

```http
DELETE /contracts/{id}
```

---

## 2. DRAFT & STAGE MANAGEMENT

### 2.1 Auto save stage

```http
PATCH /contracts/{id}/autosave
```

**Request Body:**

```json
{
    "stage": "info",
    "data": {
        "contract_name": "Hợp đồng lao động",
        "parties": ["Công ty ABC", "Nguyễn Văn A"],
        "effective_date": "2024-01-01"
    }
}
```

### 2.2 Lưu stage

```http
PATCH /contracts/{id}/stage/{stage}/save
```

### 2.3 Lấy dữ liệu stage

```http
GET /contracts/{id}/stage/{stage}
```

### 2.4 Chuyển stage

```http
POST /contracts/{id}/transition
```

**Request Body:**

```json
{
    "from": "info",
    "to": "content"
}
```

### 2.5 Xem trước hợp đồng

```http
GET /contracts/{id}/preview
```

---

## 3. VERSIONING

### 3.1 Tạo version mới

```http
POST /contracts/{id}/versions
```

**Request Body:**

```json
{
    "version_name": "v2.0",
    "description": "Cập nhật điều khoản lương"
}
```

### 3.2 Lấy danh sách versions

```http
GET /contracts/{id}/versions
```

### 3.3 Lấy chi tiết version

```http
GET /contracts/{id}/versions/{vid}
```

### 3.4 Publish version

```http
POST /contracts/{id}/versions/{vid}/publish
```

### 3.5 Rollback version

```http
POST /contracts/{id}/versions/{vid}/rollback
```

---

## 4. MILESTONE & TASK MANAGEMENT

### 4.1 Tạo milestone

```http
POST /contracts/{id}/milestones
```

**Request Body:**

```json
{
    "name": "Ký kết hợp đồng",
    "description": "Hai bên ký kết hợp đồng chính thức",
    "due_date": "2024-01-15",
    "priority": "high"
}
```

### 4.2 Lấy danh sách milestones

```http
GET /contracts/{id}/milestones
```

### 4.3 Cập nhật milestone

```http
PATCH /contracts/milestones/{mid}
```

### 4.4 Xóa milestone

```http
DELETE /contracts/milestones/{mid}
```

### 4.5 Tạo task

```http
POST /contracts/milestones/{mid}/tasks
```

**Request Body:**

```json
{
    "name": "Chuẩn bị tài liệu",
    "description": "Chuẩn bị các tài liệu cần thiết",
    "assigned_to": "user-id",
    "due_date": "2024-01-10",
    "priority": "medium"
}
```

### 4.6 Lấy danh sách tasks

```http
GET /contracts/milestones/{mid}/tasks
```

### 4.7 Cập nhật task

```http
PATCH /contracts/tasks/{tid}
```

### 4.8 Xóa task

```http
DELETE /contracts/tasks/{tid}
```

---

## 5. COLLABORATOR MANAGEMENT

### 5.1 Thêm collaborator

```http
POST /contracts/{id}/collaborators
```

**Request Body:**

```json
{
    "user_id": "user-id",
    "role": "reviewer",
    "permissions": ["read", "comment", "approve"]
}
```

### 5.2 Lấy danh sách collaborators

```http
GET /contracts/{id}/collaborators
```

### 5.3 Cập nhật collaborator

```http
PATCH /contracts/collaborators/{cid}
```

### 5.4 Xóa collaborator

```http
DELETE /contracts/collaborators/{cid}
```

---

## 6. FILE MANAGEMENT

### 6.1 Upload file

```http
POST /contracts/{id}/files
```

**Request Body:**

```json
{
    "filename": "contract-document.pdf",
    "original_name": "Hợp đồng lao động.pdf",
    "mime_type": "application/pdf",
    "file_path": "/uploads/contracts/contract-document.pdf",
    "description": "Bản hợp đồng chính thức",
    "file_type": "contract_document"
}
```

### 6.2 Lấy danh sách files

```http
GET /contracts/{id}/files
```

### 6.3 Xóa file

```http
DELETE /contracts/files/{fid}
```

---

## 7. APPROVAL WORKFLOW

### 7.1 Phê duyệt hợp đồng

```http
POST /contracts/{id}/approve
```

**Request Body:**

```json
{
    "comment": "Hợp đồng đã được phê duyệt"
}
```

### 7.2 Từ chối hợp đồng

```http
POST /contracts/{id}/reject
```

**Request Body:**

```json
{
    "reason": "Thiếu thông tin quan trọng",
    "comment": "Cần bổ sung thông tin về lương và phụ cấp"
}
```

### 7.3 Yêu cầu chỉnh sửa

```http
POST /contracts/{id}/request-changes
```

**Request Body:**

```json
{
    "changes": ["Cập nhật mức lương", "Bổ sung điều khoản bảo mật"]
}
```

---

## 8. EXPORT & PRINT

### 8.1 Export PDF

```http
GET /contracts/{id}/export/pdf
```

### 8.2 Export DOCX

```http
GET /contracts/{id}/export/docx
```

### 8.3 Print view

```http
GET /contracts/{id}/print
```

---

## 9. ANALYTICS & DASHBOARD

### 9.1 Analytics hợp đồng

```http
GET /contracts/{id}/analytics
```

**Response:**

```json
{
    "contract_id": "uuid",
    "milestones": {
        "total": 5,
        "completed": 3,
        "pending": 2,
        "completion_rate": 60
    },
    "tasks": {
        "total": 10,
        "completed": 7,
        "pending": 3,
        "completion_rate": 70
    },
    "files": {
        "total": 3,
        "types": {
            "contract_document": 1,
            "attachment": 2
        }
    },
    "timeline": {
        "created_at": "2024-01-01T00:00:00Z",
        "effective_date": "2024-01-15T00:00:00Z",
        "expiration_date": "2025-01-15T00:00:00Z",
        "days_until_expiry": 365
    }
}
```

### 9.2 Dashboard stats

```http
GET /contracts/dashboard/stats
```

**Response:**

```json
{
  "overview": {
    "total_contracts": 25,
    "active_contracts": 15,
    "pending_review": 5,
    "expiring_soon": 3
  },
  "status_distribution": {
    "draft": 5,
    "pending_review": 5,
    "active": 15
  },
  "priority_distribution": {
    "low": 5,
    "medium": 15,
    "high": 5
  },
  "recent_contracts": [...],
  "upcoming_milestones": [...]
}
```

---

## 10. TEMPLATE MANAGEMENT

### 10.1 Lấy danh sách templates

```http
GET /contracts/templates?type=form&category=employment
```

### 10.2 Lấy chi tiết template

```http
GET /contracts/templates/{tid}
```

### 10.3 Tạo template

```http
POST /contracts/templates
```

**Request Body:**

```json
{
    "name": "Hợp đồng lao động chuẩn",
    "description": "Template cho hợp đồng lao động",
    "type": "form",
    "category": "employment",
    "structure": {
        "fields": [
            {
                "name": "employee_name",
                "label": "Tên nhân viên",
                "type": "text",
                "required": true
            },
            {
                "name": "salary",
                "label": "Mức lương",
                "type": "number",
                "required": true
            }
        ]
    },
    "tags": ["employment", "standard"]
}
```

### 10.4 Cập nhật template

```http
PATCH /contracts/templates/{tid}
```

### 10.5 Xóa template

```http
DELETE /contracts/templates/{tid}
```

---

## 11. NOTIFICATION & REMINDERS

### 11.1 Tạo notification

```http
POST /contracts/{id}/notifications
```

**Request Body:**

```json
{
    "title": "Hợp đồng cần phê duyệt",
    "message": "Hợp đồng HDLD-2024-001 đang chờ phê duyệt",
    "type": "contract_approval",
    "priority": "high",
    "recipient_ids": ["user1", "user2"],
    "action_url": "/contracts/uuid"
}
```

### 11.2 Lấy danh sách notifications

```http
GET /contracts/{id}/notifications
```

### 11.3 Tạo reminder

```http
POST /contracts/{id}/reminders
```

**Request Body:**

```json
{
    "title": "Nhắc nhở ký hợp đồng",
    "message": "Hợp đồng cần được ký trước ngày 15/01/2024",
    "due_date": "2024-01-15T00:00:00Z",
    "recipient_ids": ["user1"],
    "milestone_id": "milestone-uuid",
    "repeat_pattern": "daily"
}
```

### 11.4 Lấy danh sách reminders

```http
GET /contracts/{id}/reminders
```

---

## 12. AUDIT LOG

### 12.1 Lấy audit logs

```http
GET /contracts/{id}/audit
```

**Response:**

```json
{
    "logs": [
        {
            "id": "log-uuid",
            "action": "contract_created",
            "user_id": "user-uuid",
            "user_name": "Nguyễn Văn A",
            "timestamp": "2024-01-01T00:00:00Z",
            "details": {
                "contract_name": "Hợp đồng lao động",
                "contract_id": "contract-uuid"
            }
        }
    ]
}
```

---

## Error Responses

### 400 Bad Request

```json
{
    "statusCode": 400,
    "message": "Validation failed",
    "errors": [
        {
            "field": "name",
            "message": "Name is required"
        }
    ]
}
```

### 401 Unauthorized

```json
{
    "statusCode": 401,
    "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
    "statusCode": 403,
    "message": "Insufficient permissions"
}
```

### 404 Not Found

```json
{
    "statusCode": 404,
    "message": "Contract not found"
}
```

### 500 Internal Server Error

```json
{
    "statusCode": 500,
    "message": "Internal server error"
}
```

---

## Status Codes

### Contract Status

- `draft`: Bản nháp
- `pending_review`: Chờ phê duyệt
- `active`: Đang hoạt động
- `completed`: Hoàn thành
- `cancelled`: Đã hủy
- `expired`: Hết hạn

### Priority Levels

- `low`: Thấp
- `medium`: Trung bình
- `high`: Cao
- `critical`: Khẩn cấp

### Template Types

- `form`: Form-based
- `editor`: Rich text editor
- `hybrid`: Kết hợp

### File Types

- `contract_document`: Tài liệu hợp đồng
- `attachment`: Tệp đính kèm
- `template`: Template
- `signature`: Chữ ký

---

## Rate Limiting

API có giới hạn rate limiting:

- 100 requests per minute cho authenticated users
- 10 requests per minute cho unauthenticated users

---

## Pagination

Tất cả API trả về danh sách đều hỗ trợ pagination:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
```
