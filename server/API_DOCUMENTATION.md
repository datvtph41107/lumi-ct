# Contract Management API Documentation

## Tổng quan

Hệ thống API quản lý hợp đồng cung cấp đầy đủ các tính năng để quản lý vòng đời hợp đồng từ tạo mới, soạn thảo, phê duyệt đến lưu trữ. Hệ thống được xây dựng bằng NestJS với TypeScript và sử dụng MySQL làm cơ sở dữ liệu.

## Base URL

```
http://localhost:3000/api
```

**Swagger Documentation:** `http://localhost:3000/api`

## Authentication

Tất cả API đều yêu cầu JWT token trong header:

```
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
    "username": "user@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenExpiry": "2024-01-01T12:00:00Z",
    "sessionId": "session-uuid",
    "message": "Login successful"
}
```

#### Refresh Token
```http
POST /auth/refresh
```

**Response:**
```json
{
    "accessToken": "new-jwt-token",
    "tokenExpiry": "2024-01-01T12:00:00Z",
    "sessionId": "session-uuid",
    "message": "Token refreshed successfully"
}
```

#### Logout
```http
POST /auth/logout
```

**Response:**
```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

#### Get Current User
```http
GET /auth/me
```

**Response:**
```json
{
    "userData": {
        "id": 1,
        "username": "user@example.com",
        "full_name": "Nguyễn Văn A",
        "role": "manager",
        "department": "legal"
    },
    "message": "User data retrieved successfully"
}
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
- `status`: Trạng thái hợp đồng (draft, pending_review, active, completed, cancelled, expired)
- `priority`: Độ ưu tiên (low, medium, high, critical)
- `category`: Danh mục
- `contract_type`: Loại hợp đồng
- `drafter_id`: ID người soạn thảo
- `manager_id`: ID người quản lý
- `search`: Tìm kiếm theo tên, mã, ghi chú
- `created_from`: Ngày tạo từ (YYYY-MM-DD)
- `created_to`: Ngày tạo đến (YYYY-MM-DD)
- `effective_from`: Ngày hiệu lực từ (YYYY-MM-DD)
- `effective_to`: Ngày hiệu lực đến (YYYY-MM-DD)
- `sort_by`: Sắp xếp theo field (default: created_at)
- `sort_order`: asc/desc (default: desc)

### 1.3 Lấy chi tiết hợp đồng

```http
GET /contracts/{id}
```

### 1.4 Cập nhật hợp đồng

```http
PATCH /contracts/{id}
```

**Request Body:**
```json
{
    "name": "Hợp đồng lao động cập nhật",
    "priority": "high",
    "category": "employment"
}
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

**Request Body:**
```json
{
    "stage": "content",
    "data": {
        "content": "Nội dung hợp đồng...",
        "terms": ["Điều khoản 1", "Điều khoản 2"]
    }
}
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

**Request Body:**
```json
{
    "name": "Ký kết hợp đồng cập nhật",
    "due_date": "2024-01-20",
    "priority": "critical"
}
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

**Request Body:**
```json
{
    "name": "Chuẩn bị tài liệu cập nhật",
    "status": "completed",
    "priority": "high"
}
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

**Request Body:**
```json
{
    "role": "editor",
    "permissions": ["read", "write", "comment"]
}
```

### 5.4 Xóa collaborator

```http
DELETE /contracts/collaborators/{cid}
```

### 5.5 Chuyển quyền sở hữu

```http
POST /contracts/{id}/transfer-ownership
```

**Request Body:**
```json
{
    "to_user_id": 123
}
```

### 5.6 Lấy quyền hạn

```http
GET /contracts/{id}/permissions
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

### 7.2 Từ chối hợp đồng

```http
POST /contracts/{id}/reject
```

**Request Body:**
```json
{
    "reason": "Thiếu thông tin quan trọng"
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

## 9. AUDIT & ANALYTICS

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

### 9.3 Audit logs

```http
GET /contracts/{id}/audit?page=1&limit=50&action=contract_created
```

**Query Parameters:**
- `action`: Loại hành động
- `user_id`: ID người dùng
- `date_from`: Ngày từ (YYYY-MM-DD)
- `date_to`: Ngày đến (YYYY-MM-DD)
- `search`: Tìm kiếm
- `page`: Số trang
- `limit`: Số lượng per page

### 9.4 Audit summary

```http
GET /contracts/{id}/audit/summary
```

### 9.5 User audit logs

```http
GET /contracts/audit/user?page=1&limit=50
```

### 9.6 System audit logs

```http
GET /contracts/audit/system?page=1&limit=50
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

## 12. USER MANAGEMENT

### 12.1 Lấy thông tin profile

```http
GET /me
```

### 12.2 Tạo nhân viên mới (Manager only)

```http
POST /manager/staff
```

**Request Body:**
```json
{
    "username": "newuser@company.com",
    "password": "password123",
    "full_name": "Nguyễn Văn B",
    "role": "staff",
    "department": "legal"
}
```

### 12.3 Lấy danh sách nhân viên (Manager only)

```http
GET /manager/staff
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

### Contract Mode

- `form`: Form-based
- `editor`: Rich text editor
- `hybrid`: Kết hợp

### File Types

- `contract_document`: Tài liệu hợp đồng
- `attachment`: Tệp đính kèm
- `template`: Template
- `signature`: Chữ ký

### User Roles

- `staff`: Nhân viên
- `manager`: Quản lý
- `admin`: Quản trị viên
- `super_admin`: Siêu quản trị viên

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

---

## CORS Configuration

API hỗ trợ CORS với cấu hình:

- **Origin:** `http://localhost:5173` (client URL)
- **Credentials:** true (cho phép cookies)
- **Methods:** GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Headers:** Content-Type, Authorization, X-Requested-With

---

## Development

### Chạy development server

```bash
npm run start:dev
```

### Build production

```bash
npm run build
npm run start:prod
```

### Database migrations

```bash
npm run migration:generate
npm run migration:run
npm run migration:revert
```

### Seeding data

```bash
npm run seed
```

---

## Technologies Used

- **Backend:** NestJS, TypeScript, TypeORM
- **Database:** MySQL
- **Authentication:** JWT, Passport
- **Documentation:** Swagger/OpenAPI
- **Validation:** class-validator, class-transformer
- **Logging:** Winston
- **Testing:** Jest
