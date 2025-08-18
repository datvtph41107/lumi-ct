# Contract Management API Documentation

## Tổng quan

Hệ thống API quản lý hợp đồng cung cấp đầy đủ các tính năng để quản lý vòng đời hợp đồng từ tạo mới, soạn thảo, phê duyệt đến lưu trữ.

## Base URL

```
http://localhost:3000/${PREFIX}
```

## Authentication

- Sử dụng JWT Bearer cho mọi request (trừ login/refresh)
- Access token trả về trong body; Refresh token và Session ID lưu ở HttpOnly cookies

### Login

```http
POST /auth/login
```

Body:

```json
{ "username": "manager01", "password": "secret", "is_manager_login": true }
```

Response đặt cookies: `refreshToken` (HttpOnly), `sessionId` (HttpOnly). Trả `access_token` và thông tin user.

### Refresh Token

```http
POST /auth/refresh-token
```

Đọc cookie `refreshToken` và trả về `access_token` mới.

### Logout

```http
POST /auth/logout
```

Xóa cookies và revoke phiên.

---

## 1. CONTRACT CRUD

### 1.1 Tạo hợp đồng mới

```http
POST /contracts
```

Body:

```json
{
    "name": "Hợp đồng lao động",
    "contract_code": "HDLD-2024-001",
    "contract_type": "employment",
    "category": "labor",
    "priority": "medium",
    "mode": "basic",
    "template_id": "uuid-template-id"
}
```

### 1.2 Lấy danh sách hợp đồng

```http
GET /contracts?page=1&limit=10&status=active&search=keyword
```

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

### 1.6 Preview / Export / Print

```http
GET /contracts/{id}/preview
GET /contracts/{id}/export/docx
GET /contracts/{id}/print
```

---

## 2. DRAFT & STAGE MANAGEMENT

Endpoints:

```http
GET /contract-drafts
POST /contract-drafts
GET /contract-drafts/{id}
PATCH /contract-drafts/{id}
DELETE /contract-drafts/{id}
```

Body (create):

```json
{
  "contractData": {
    "name": "Untitled Contract",
    "contractType": "custom",
    "category": "business",
    "priority": "medium",
    "content": { "mode": "basic", "templateId": "uuid" }
  },
  "flow": { "selectedMode": "basic" },
  "selectedTemplate": { "id": "uuid" }
}
```

---

## 3. Collaborators & Audit Log

- Collaborators: Owner, Editor, Reviewer, Viewer
- Audit log: Ghi nhận CREATE/UPDATE/DELETE hợp đồng qua global interceptor trong module `contract`

---

## 4. Notifications & Reminders

System settings:

```http
GET /notifications/settings
PUT /notifications/settings
GET /notifications/pending
GET /notifications/failed
POST /notifications/{id}/retry
```

Theo hợp đồng:

```http
POST /contracts/{id}/notifications
GET /contracts/{id}/notifications
POST /contracts/{id}/reminders
GET /contracts/{id}/reminders
```

- Types theo `core/shared/enums/base.enums.ts` (`NotificationType`)
- Reminder theo `core/domain/contract/contract-reminder.entity.ts` (`ReminderType`, `ReminderFrequency`)

---

## 5. Admin & User Management

### Departments

```http
GET /admin/departments
GET /admin/departments/{id}
PUT /admin/departments/{id}
POST /admin/departments/manager
```

### Users (Admin)

```http
GET /admin/users
POST /admin/users
PUT /admin/users/{id}
DELETE /admin/users/{id}
GET /admin/users/{id}/roles
POST /admin/users/{id}/roles
GET /admin/users/{id}/permissions
```

### Manager tạo staff / list staff

```http
POST /manager/staff
GET /manager/staff
```

Tất cả yêu cầu `Authorization: Bearer <access_token>` và qua guard roles/permissions.

---

## 6. Response Format

Tất cả response được bọc bởi global interceptor:

```json
{ "success": true, "message": "Request successful", "data": { } }
```

Lỗi được chuẩn hóa: `{ "success": false, "message": string, "error": { "name": string, "details": any } }`.

---

## 7. Status & Enums

- Contract status: draft, in_review, active, cancelled, expired
- Priority: low, medium, high
- Modes: basic, editor, upload
- NotificationType: CONTRACT_CREATED, CONTRACT_REMINDER, CONTRACT_OVERDUE, PHASE_REMINDER, PHASE_OVERDUE, TASK_REMINDER, TASK_OVERDUE, SYSTEM_ANNOUNCEMENT
- ReminderType: milestone_due, milestone_overdue, task_due, task_overdue, contract_expiring, contract_expired, approval_required, review_required

---

## 8. Pagination

Danh sách trả về dạng:

```json
{ "data": [ ... ], "total": 100, "page": 1, "limit": 10 }
```