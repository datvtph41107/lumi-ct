# TÀI LIỆU API & CHỨC NĂNG HỆ THỐNG QUẢN LÝ HỢP ĐỒNG NỘI BỘ

## 📋 TỔNG QUAN HỆ THỐNG

### Mục tiêu
Hệ thống quản lý hợp đồng nội bộ phục vụ 2 phòng ban: **Hành chính** và **Kế toán**, với 2 vai trò: **Quản lý** và **Nhân viên**.

### Kiến trúc
- **Frontend**: React TypeScript + Redux Toolkit + Zustand
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Authentication**: JWT + HTTPOnly Cookies
- **Authorization**: RBAC (Role-Based Access Control)

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Base URL
```
Production: https://api.contract-system.com
Development: http://localhost:3001
```

### Authentication Flow
1. **Login** → Nhận access token (15 phút) + refresh token (7 ngày)
2. **Auto Refresh** → Tự động refresh token khi gần hết hạn
3. **Session Management** → Auto logout sau 15 phút không hoạt động

---

## 📚 API ENDPOINTS

### 🔑 Authentication API

#### 1. Đăng nhập
```http
POST /auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "rememberMe": boolean
}

Response:
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "full_name": "string",
      "role": "ADMIN|MANAGER|STAFF|USER",
      "department": {
        "id": "number",
        "name": "string",
        "code": "string"
      },
      "permissions": {
        "contracts_create": boolean,
        "contracts_read": boolean,
        "contracts_update": boolean,
        "contracts_delete": boolean,
        "user_management": boolean,
        "admin_access": boolean
      }
    },
    "accessToken": "string",
    "tokenExpiry": "number",
    "sessionId": "string"
  }
}
```

#### 2. Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "string"
}

Response:
{
  "success": true,
  "message": "Token đã được làm mới",
  "data": {
    "accessToken": "string",
    "tokenExpiry": "number",
    "user": {...}
  }
}
```

#### 3. Đăng xuất
```http
POST /auth/logout
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

#### 4. Lấy thông tin user hiện tại
```http
GET /auth/me
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "full_name": "string",
    "role": "string",
    "permissions": {...}
  }
}
```

---

## 👥 USER MANAGEMENT API

### Base Path: `/admin/users`

#### 1. Lấy danh sách users
```http
GET /admin/users?search=string&role=string&status=string&department_id=number&page=number&limit=number
Authorization: Bearer {access_token}

Query Parameters:
- search: Tìm kiếm theo tên, username, email
- role: Lọc theo vai trò (ADMIN, MANAGER, STAFF, USER)
- status: Lọc theo trạng thái (active, inactive, suspended)
- department_id: Lọc theo phòng ban
- page: Trang hiện tại (default: 1)
- limit: Số lượng per page (default: 10)

Response:
{
  "success": true,
  "message": "Lấy danh sách người dùng thành công",
  "data": {
    "users": [
      {
        "id": "string",
        "username": "string",
        "email": "string",
        "full_name": "string",
        "role": "string",
        "status": "string",
        "department": {
          "id": "number",
          "name": "string",
          "code": "string"
        },
        "created_at": "datetime",
        "updated_at": "datetime"
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
}
```

#### 2. Lấy thông tin user
```http
GET /admin/users/{userId}
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Lấy thông tin người dùng thành công",
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "full_name": "string",
    "role": "string",
    "status": "string",
    "department": {...},
    "permissions": {...},
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

#### 3. Tạo user mới
```http
POST /admin/users
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "email": "string",
  "full_name": "string",
  "role": "string",
  "department_id": "number",
  "is_active": boolean
}

Response:
{
  "success": true,
  "message": "Tạo người dùng thành công",
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "full_name": "string",
    "role": "string",
    "status": "string"
  }
}
```

#### 4. Cập nhật user
```http
PUT /admin/users/{userId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "full_name": "string",
  "role": "string",
  "department_id": "number",
  "is_active": boolean
}

Response:
{
  "success": true,
  "message": "Cập nhật người dùng thành công",
  "data": {...}
}
```

#### 5. Xóa user
```http
DELETE /admin/users/{userId}
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Xóa người dùng thành công"
}
```

#### 6. Bulk delete users
```http
POST /admin/users/bulk-delete
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "userIds": ["string"]
}

Response:
{
  "success": true,
  "message": "Xóa 5 người dùng thành công"
}
```

#### 7. Kích hoạt user
```http
PATCH /admin/users/{userId}/activate
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Kích hoạt người dùng thành công",
  "data": {...}
}
```

#### 8. Vô hiệu hóa user
```http
PATCH /admin/users/{userId}/deactivate
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Vô hiệu hóa người dùng thành công",
  "data": {...}
}
```

#### 9. Reset password
```http
POST /admin/users/{userId}/reset-password
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công",
  "data": {
    "temporaryPassword": "string"
  }
}
```

#### 10. Gán vai trò
```http
POST /admin/users/{userId}/assign-role
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "role": "string"
}

Response:
{
  "success": true,
  "message": "Phân quyền thành công"
}
```

#### 11. Export users
```http
GET /admin/users/export?format=csv&search=string&role=string&status=string
Authorization: Bearer {access_token}

Query Parameters:
- format: csv | excel
- search, role, status: Các filter tương tự

Response: File download (CSV/Excel)
```

---

## 🔐 PERMISSION MANAGEMENT API

### Base Path: `/admin/roles`

#### 1. Lấy danh sách roles
```http
GET /admin/roles
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Lấy danh sách vai trò thành công",
  "data": [
    {
      "id": "string",
      "name": "string",
      "display_name": "string",
      "description": "string",
      "is_system": boolean,
      "permissions": [
        {
          "id": "string",
          "resource": "string",
          "action": "string",
          "description": "string"
        }
      ],
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ]
}
```

#### 2. Tạo role mới
```http
POST /admin/roles
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "string",
  "display_name": "string",
  "description": "string",
  "permissions": ["string"]
}

Response:
{
  "success": true,
  "message": "Tạo vai trò thành công",
  "data": {...}
}
```

#### 3. Cập nhật role
```http
PUT /admin/roles/{roleId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "string",
  "display_name": "string",
  "description": "string",
  "permissions": ["string"]
}

Response:
{
  "success": true,
  "message": "Cập nhật vai trò thành công",
  "data": {...}
}
```

#### 4. Xóa role
```http
DELETE /admin/roles/{roleId}
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Xóa vai trò thành công"
}
```

### Base Path: `/admin/permissions`

#### 1. Lấy danh sách permissions
```http
GET /admin/permissions
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Lấy danh sách quyền thành công",
  "data": [
    {
      "id": "string",
      "resource": "string",
      "action": "string",
      "description": "string",
      "created_at": "datetime"
    }
  ]
}
```

---

## ⚙️ SYSTEM SETTINGS API

### Base Path: `/admin/settings`

#### 1. Lấy system settings
```http
GET /admin/settings
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Lấy cài đặt hệ thống thành công",
  "data": {
    "notification": {
      "email": {
        "enabled": boolean,
        "smtp": {
          "host": "string",
          "port": "number",
          "secure": boolean,
          "username": "string"
        },
        "from": "string",
        "replyTo": "string"
      },
      "push": {
        "enabled": boolean,
        "vapidPublicKey": "string"
      },
      "sms": {
        "enabled": boolean,
        "provider": "string",
        "apiKey": "string"
      },
      "workingHours": {
        "start": "string",
        "end": "string",
        "timezone": "string"
      },
      "quietHours": {
        "enabled": boolean,
        "start": "string",
        "end": "string"
      }
    },
    "security": {
      "passwordPolicy": {
        "minLength": "number",
        "requireUppercase": boolean,
        "requireLowercase": boolean,
        "requireNumbers": boolean,
        "requireSpecialChars": boolean,
        "maxAge": "number"
      },
      "sessionPolicy": {
        "maxConcurrentSessions": "number",
        "sessionTimeout": "number",
        "rememberMeDuration": "number"
      },
      "loginPolicy": {
        "maxFailedAttempts": "number",
        "lockoutDuration": "number",
        "requireTwoFactor": boolean
      }
    }
  }
}
```

#### 2. Cập nhật system settings
```http
PUT /admin/settings
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "notification": {...},
  "security": {...}
}

Response:
{
  "success": true,
  "message": "Cập nhật cài đặt hệ thống thành công",
  "data": {...}
}
```

---

## 📊 AUDIT LOG API

### Base Path: `/admin/audit-logs`

#### 1. Lấy audit logs
```http
GET /admin/audit-logs?user_id=string&action=string&resource_type=string&resource_id=string&start_date=string&end_date=string&page=number&limit=number
Authorization: Bearer {access_token}

Query Parameters:
- user_id: Lọc theo user
- action: Lọc theo hành động
- resource_type: Lọc theo loại resource
- resource_id: Lọc theo ID resource
- start_date, end_date: Khoảng thời gian
- page, limit: Phân trang

Response:
{
  "success": true,
  "message": "Lấy nhật ký hoạt động thành công",
  "data": {
    "logs": [
      {
        "id": "string",
        "user": {
          "id": "string",
          "username": "string",
          "full_name": "string"
        },
        "action": "string",
        "resource_type": "string",
        "resource_id": "string",
        "details": "object",
        "ip_address": "string",
        "user_agent": "string",
        "timestamp": "datetime"
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
}
```

#### 2. Lấy chi tiết audit log
```http
GET /admin/audit-logs/{logId}
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Lấy chi tiết nhật ký thành công",
  "data": {...}
}
```

---

## 📈 DASHBOARD API

### Base Path: `/admin/dashboard`

#### 1. Lấy thống kê dashboard
```http
GET /admin/dashboard/stats
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Lấy thống kê dashboard thành công",
  "data": {
    "totalUsers": "number",
    "activeUsers": "number",
    "totalContracts": "number",
    "pendingContracts": "number",
    "systemHealth": "string",
    "lastBackup": "datetime"
  }
}
```

#### 2. Lấy hoạt động gần đây
```http
GET /admin/dashboard/activity?limit=number&user_id=string&resource_type=string
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Lấy hoạt động gần đây thành công",
  "data": [
    {
      "id": "string",
      "user": {...},
      "action": "string",
      "resource_type": "string",
      "resource_id": "string",
      "timestamp": "datetime"
    }
  ]
}
```

---

## 📄 CONTRACT MANAGEMENT API

### Base Path: `/contracts`

#### 1. Lấy danh sách hợp đồng
```http
GET /contracts?status=string&type=string&search=string&page=number&limit=number
Authorization: Bearer {access_token}

Query Parameters:
- status: draft, pending_review, active, completed, cancelled
- type: service, purchase, employment, nda, partnership, rental, custom
- search: Tìm kiếm theo tên, mã hợp đồng
- page, limit: Phân trang

Response:
{
  "success": true,
  "message": "Lấy danh sách hợp đồng thành công",
  "data": {
    "contracts": [
      {
        "id": "string",
        "name": "string",
        "contract_code": "string",
        "contract_type": "string",
        "category": "string",
        "status": "string",
        "priority": "string",
        "drafter": {
          "id": "string",
          "name": "string"
        },
        "manager": {
          "id": "string",
          "name": "string"
        },
        "start_date": "datetime",
        "end_date": "datetime",
        "created_at": "datetime",
        "updated_at": "datetime"
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
}
```

#### 2. Lấy chi tiết hợp đồng
```http
GET /contracts/{contractId}
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Lấy chi tiết hợp đồng thành công",
  "data": {
    "id": "string",
    "name": "string",
    "contract_code": "string",
    "contract_type": "string",
    "category": "string",
    "status": "string",
    "priority": "string",
    "drafter": {...},
    "manager": {...},
    "content": {
      "mode": "basic|editor|upload",
      "data": "object"
    },
    "milestones": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "start_date": "datetime",
        "end_date": "datetime",
        "status": "string",
        "assigned_to": {...},
        "tasks": [...]
      }
    ],
    "collaborators": [
      {
        "id": "string",
        "user": {...},
        "role": "owner|editor|reviewer|viewer",
        "permissions": [...]
      }
    ],
    "attachments": [...],
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

#### 3. Tạo hợp đồng mới
```http
POST /contracts
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "string",
  "contract_type": "string",
  "category": "string",
  "priority": "string",
  "manager_id": "string",
  "template_id": "string",
  "mode": "basic|editor|upload",
  "content": "object"
}

Response:
{
  "success": true,
  "message": "Tạo hợp đồng thành công",
  "data": {
    "id": "string",
    "name": "string",
    "contract_code": "string",
    "status": "draft"
  }
}
```

#### 4. Cập nhật hợp đồng
```http
PUT /contracts/{contractId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "string",
  "contract_type": "string",
  "category": "string",
  "priority": "string",
  "content": "object"
}

Response:
{
  "success": true,
  "message": "Cập nhật hợp đồng thành công",
  "data": {...}
}
```

#### 5. Xóa hợp đồng
```http
DELETE /contracts/{contractId}
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Xóa hợp đồng thành công"
}
```

#### 6. Export hợp đồng
```http
GET /contracts/{contractId}/export?format=pdf|docx|html
Authorization: Bearer {access_token}

Response: File download
```

#### 7. Print hợp đồng
```http
GET /contracts/{contractId}/print
Authorization: Bearer {access_token}

Response: HTML for printing
```

---

## 📋 CONTRACT DRAFT API

### Base Path: `/contracts/drafts`

#### 1. Lấy danh sách drafts
```http
GET /contracts/drafts?mode=string&status=string&page=number&limit=number
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Lấy danh sách bản nháp thành công",
  "data": {
    "drafts": [
      {
        "id": "string",
        "name": "string",
        "mode": "basic|editor|upload",
        "status": "string",
        "current_stage": "string",
        "template": {...},
        "created_at": "datetime",
        "updated_at": "datetime"
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number"
  }
}
```

#### 2. Lấy chi tiết draft
```http
GET /contracts/drafts/{draftId}
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Lấy chi tiết bản nháp thành công",
  "data": {
    "id": "string",
    "name": "string",
    "mode": "string",
    "status": "string",
    "current_stage": "string",
    "template": {...},
    "form_data": "object",
    "content": "object",
    "milestones": [...],
    "notifications": [...],
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

#### 3. Tạo draft mới
```http
POST /contracts/drafts
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "string",
  "mode": "basic|editor|upload",
  "template_id": "string"
}

Response:
{
  "success": true,
  "message": "Tạo bản nháp thành công",
  "data": {
    "id": "string",
    "name": "string",
    "mode": "string",
    "current_stage": "template_selection"
  }
}
```

#### 4. Cập nhật draft
```http
PUT /contracts/drafts/{draftId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "string",
  "form_data": "object",
  "content": "object",
  "current_stage": "string"
}

Response:
{
  "success": true,
  "message": "Cập nhật bản nháp thành công",
  "data": {...}
}
```

#### 5. Xóa draft
```http
DELETE /contracts/drafts/{draftId}
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Xóa bản nháp thành công"
}
```

#### 6. Chuyển draft thành contract
```http
POST /contracts/drafts/{draftId}/publish
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Xuất bản hợp đồng thành công",
  "data": {
    "contract_id": "string"
  }
}
```

---

## 🎯 CONTRACT TEMPLATES API

### Base Path: `/contracts/templates`

#### 1. Lấy danh sách templates
```http
GET /contracts/templates?type=string&category=string&page=number&limit=number
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Lấy danh sách template thành công",
  "data": {
    "templates": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "type": "string",
        "category": "string",
        "version": "number",
        "is_active": boolean,
        "structure": "object",
        "created_at": "datetime",
        "updated_at": "datetime"
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number"
  }
}
```

#### 2. Lấy chi tiết template
```http
GET /contracts/templates/{templateId}
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Lấy chi tiết template thành công",
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "type": "string",
    "category": "string",
    "version": "number",
    "is_active": boolean,
    "structure": {
      "sections": [...],
      "fields": [...],
      "content": "object"
    },
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

#### 3. Tạo template mới
```http
POST /contracts/templates
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "type": "string",
  "category": "string",
  "structure": "object"
}

Response:
{
  "success": true,
  "message": "Tạo template thành công",
  "data": {...}
}
```

#### 4. Cập nhật template
```http
PUT /contracts/templates/{templateId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "structure": "object"
}

Response:
{
  "success": true,
  "message": "Cập nhật template thành công",
  "data": {...}
}
```

#### 5. Xóa template
```http
DELETE /contracts/templates/{templateId}
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Xóa template thành công"
}
```

---

## 🔔 NOTIFICATION API

### Base Path: `/notifications`

#### 1. Lấy danh sách notifications
```http
GET /notifications?type=string&status=string&page=number&limit=number
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Lấy danh sách thông báo thành công",
  "data": {
    "notifications": [
      {
        "id": "string",
        "type": "email|push|sms|in_app",
        "title": "string",
        "message": "string",
        "status": "pending|sent|failed",
        "recipient": {...},
        "contract": {...},
        "scheduled_at": "datetime",
        "sent_at": "datetime",
        "created_at": "datetime"
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number"
  }
}
```

#### 2. Tạo notification
```http
POST /notifications
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "type": "email|push|sms|in_app",
  "title": "string",
  "message": "string",
  "recipient_id": "string",
  "contract_id": "string",
  "scheduled_at": "datetime"
}

Response:
{
  "success": true,
  "message": "Tạo thông báo thành công",
  "data": {...}
}
```

#### 3. Cập nhật notification
```http
PUT /notifications/{notificationId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "string",
  "message": "string",
  "scheduled_at": "datetime"
}

Response:
{
  "success": true,
  "message": "Cập nhật thông báo thành công",
  "data": {...}
}
```

#### 4. Xóa notification
```http
DELETE /notifications/{notificationId}
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Xóa thông báo thành công"
}
```

---

## 📁 FILE UPLOAD API

### Base Path: `/upload`

#### 1. Upload file
```http
POST /upload
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

Form Data:
- file: File
- type: contract|template|attachment
- contract_id: string (optional)

Response:
{
  "success": true,
  "message": "Upload file thành công",
  "data": {
    "id": "string",
    "filename": "string",
    "original_name": "string",
    "mime_type": "string",
    "size": "number",
    "url": "string",
    "uploaded_at": "datetime"
  }
}
```

#### 2. Parse file content (for contract upload)
```http
POST /upload/parse
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "file_id": "string"
}

Response:
{
  "success": true,
  "message": "Parse file thành công",
  "data": {
    "content": "string",
    "structure": "object",
    "metadata": "object"
  }
}
```

---

## 🔍 SEARCH API

### Base Path: `/search`

#### 1. Tìm kiếm tổng hợp
```http
GET /search?q=string&type=contracts|users|templates&page=number&limit=number
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Tìm kiếm thành công",
  "data": {
    "contracts": [...],
    "users": [...],
    "templates": [...],
    "total": "number"
  }
}
```

---

## 📊 REPORTS API

### Base Path: `/reports`

#### 1. Báo cáo hợp đồng
```http
GET /reports/contracts?start_date=string&end_date=string&type=string&status=string
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Lấy báo cáo thành công",
  "data": {
    "summary": {
      "total": "number",
      "active": "number",
      "completed": "number",
      "cancelled": "number"
    },
    "by_type": [...],
    "by_status": [...],
    "by_month": [...],
    "by_department": [...]
  }
}
```

#### 2. Báo cáo user activity
```http
GET /reports/user-activity?start_date=string&end_date=string&user_id=string
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Lấy báo cáo hoạt động thành công",
  "data": {
    "user_activity": [...],
    "login_stats": {...},
    "action_stats": {...}
  }
}
```

---

## 🚨 ERROR RESPONSES

### Standard Error Format
```json
{
  "success": false,
  "message": "Mô tả lỗi",
  "errors": ["Chi tiết lỗi 1", "Chi tiết lỗi 2"],
  "code": "ERROR_CODE",
  "timestamp": "datetime"
}
```

### Common Error Codes
- `AUTH_REQUIRED`: Yêu cầu đăng nhập
- `PERMISSION_DENIED`: Không có quyền truy cập
- `RESOURCE_NOT_FOUND`: Không tìm thấy tài nguyên
- `VALIDATION_ERROR`: Lỗi validation
- `DUPLICATE_ENTRY`: Dữ liệu trùng lặp
- `INTERNAL_ERROR`: Lỗi hệ thống

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Validation Error
- `500`: Internal Server Error

---

## 🔧 TECHNICAL SPECIFICATIONS

### Request Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
Accept: application/json
```

### Response Headers
```
Content-Type: application/json
X-Request-ID: {request_id}
X-Rate-Limit-Remaining: {remaining_requests}
```

### Pagination
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Filtering
```
?field=value&field2=value2&field3[gte]=value3&field4[in]=value4,value5
```

### Sorting
```
?sort=field1:asc&sort=field2:desc
```

---

## 📱 CLIENT INTEGRATION

### Authentication Flow
```typescript
// 1. Login
const loginResponse = await authService.login(credentials);

// 2. Store tokens (handled by HTTPOnly cookies)
// 3. Set authorization header
axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

// 4. Handle token refresh
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await authService.refreshToken();
      return axios.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

### Permission Checking
```typescript
// Using PermissionGuard component
<PermissionGuard 
  permissions={['contracts_create']} 
  roles={['MANAGER', 'ADMIN']}
  fallback={<AccessDenied />}
>
  <CreateContractButton />
</PermissionGuard>

// Using usePermission hook
const { hasPermission, hasRole } = usePermission();
if (hasPermission('contracts_delete') && hasRole('ADMIN')) {
  // Show delete button
}
```

### Error Handling
```typescript
try {
  const response = await apiService.createContract(data);
  // Handle success
} catch (error) {
  if (error.response?.status === 401) {
    // Handle unauthorized
  } else if (error.response?.status === 403) {
    // Handle forbidden
  } else if (error.response?.status === 422) {
    // Handle validation errors
    const errors = error.response.data.errors;
  } else {
    // Handle other errors
  }
}
```

---

## 🔒 SECURITY CONSIDERATIONS

### Authentication
- JWT tokens với thời gian sống ngắn (15 phút)
- Refresh tokens với thời gian sống dài hơn (7 ngày)
- HTTPOnly cookies để lưu trữ tokens
- Auto logout sau 15 phút không hoạt động

### Authorization
- Role-based access control (RBAC)
- Permission-based access control
- Resource-level permissions
- API endpoint protection

### Data Protection
- Input validation và sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

### Audit Logging
- Tất cả user actions được log
- Sensitive operations tracking
- Security event monitoring
- Compliance reporting

---

## 📈 PERFORMANCE OPTIMIZATION

### Caching
- Redis cache cho frequently accessed data
- API response caching
- User session caching
- Template caching

### Database Optimization
- Indexed queries
- Pagination for large datasets
- Efficient joins
- Query optimization

### API Optimization
- Response compression
- Lazy loading
- Batch operations
- Async processing

---

## 🧪 TESTING

### Unit Tests
- Service layer testing
- Controller testing
- Guard testing
- Utility function testing

### Integration Tests
- API endpoint testing
- Database integration testing
- Authentication flow testing
- Permission testing

### E2E Tests
- User workflow testing
- Contract creation flow
- Admin management flow
- Error handling testing

---

## 📚 ADDITIONAL RESOURCES

### Documentation
- [API Reference](./API_REFERENCE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

### SDKs & Libraries
- [JavaScript SDK](./sdk/javascript/README.md)
- [React Hooks](./hooks/README.md)
- [TypeScript Types](./types/README.md)

### Examples
- [Authentication Examples](./examples/auth.md)
- [Contract Management Examples](./examples/contracts.md)
- [Admin Management Examples](./examples/admin.md)