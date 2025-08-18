# Comprehensive Contract Management API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)
8. [Examples](#examples)

## Overview

Hệ thống Contract Management API là một RESTful API được xây dựng bằng NestJS, cung cấp đầy đủ các tính năng để quản lý vòng đời hợp đồng từ tạo mới, soạn thảo, phê duyệt đến lưu trữ.

### Key Features

- **Contract Lifecycle Management**: Tạo, chỉnh sửa, phê duyệt, và lưu trữ hợp đồng
- **Version Control**: Quản lý phiên bản hợp đồng với khả năng rollback
- **Collaboration**: Hỗ trợ nhiều người dùng làm việc trên cùng một hợp đồng
- **Workflow Management**: Quản lý quy trình phê duyệt và milestone
- **File Management**: Upload và quản lý tài liệu đính kèm
- **Audit Trail**: Ghi lại toàn bộ lịch sử thay đổi
- **Analytics**: Thống kê và báo cáo

### Technology Stack

- **Backend Framework**: NestJS 11.x
- **Language**: TypeScript
- **Database**: MySQL 8.x
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **Logging**: Winston

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- MySQL 8.x
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd server
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Run database migrations:
   ```bash
   npm run migration:run
   ```

5. Start the development server:
   ```bash
   npm run start:dev
   ```

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=contract_management

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3000
PREFIX=api
CLIENT_URL=http://localhost:5173

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

## Authentication

### JWT Token Structure

```json
{
  "sub": "123",
  "username": "user@example.com",
  "role": "manager",
  "department": "legal",
  "iat": 1640995200,
  "exp": 1640998800
}
```

### Authentication Flow

1. **Login**: POST `/auth/login`
2. **Use Access Token**: Include in Authorization header
3. **Refresh Token**: POST `/auth/refresh` when token expires
4. **Logout**: POST `/auth/logout`

### Token Management

```javascript
// Example: Setting Authorization header
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};

// Example: Handling token refresh
if (response.status === 401) {
  const refreshResponse = await fetch('/auth/refresh', {
    method: 'POST',
    credentials: 'include'
  });
  const { accessToken } = await refreshResponse.json();
  // Retry original request with new token
}
```

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Swagger Documentation
```
http://localhost:3000/api
```

### Endpoint Categories

#### 1. Authentication (`/auth`)
- `POST /auth/login` - Đăng nhập
- `POST /auth/refresh` - Làm mới token
- `POST /auth/logout` - Đăng xuất
- `GET /auth/me` - Lấy thông tin user hiện tại

#### 2. Contracts (`/contracts`)
- `POST /contracts` - Tạo hợp đồng mới
- `GET /contracts` - Lấy danh sách hợp đồng
- `GET /contracts/{id}` - Lấy chi tiết hợp đồng
- `PATCH /contracts/{id}` - Cập nhật hợp đồng
- `DELETE /contracts/{id}` - Xóa hợp đồng

#### 3. Contract Stages (`/contracts/{id}/stage`)
- `PATCH /contracts/{id}/autosave` - Auto save stage
- `PATCH /contracts/{id}/stage/{stage}/save` - Lưu stage
- `GET /contracts/{id}/stage/{stage}` - Lấy dữ liệu stage
- `POST /contracts/{id}/transition` - Chuyển stage
- `GET /contracts/{id}/preview` - Xem trước hợp đồng

#### 4. Versioning (`/contracts/{id}/versions`)
- `POST /contracts/{id}/versions` - Tạo version mới
- `GET /contracts/{id}/versions` - Lấy danh sách versions
- `GET /contracts/{id}/versions/{vid}` - Lấy chi tiết version
- `POST /contracts/{id}/versions/{vid}/publish` - Publish version
- `POST /contracts/{id}/versions/{vid}/rollback` - Rollback version

#### 5. Milestones (`/contracts/{id}/milestones`)
- `POST /contracts/{id}/milestones` - Tạo milestone
- `GET /contracts/{id}/milestones` - Lấy danh sách milestones
- `PATCH /contracts/milestones/{mid}` - Cập nhật milestone
- `DELETE /contracts/milestones/{mid}` - Xóa milestone

#### 6. Tasks (`/contracts/milestones/{mid}/tasks`)
- `POST /contracts/milestones/{mid}/tasks` - Tạo task
- `GET /contracts/milestones/{mid}/tasks` - Lấy danh sách tasks
- `PATCH /contracts/tasks/{tid}` - Cập nhật task
- `DELETE /contracts/tasks/{tid}` - Xóa task

#### 7. Collaborators (`/contracts/{id}/collaborators`)
- `POST /contracts/{id}/collaborators` - Thêm collaborator
- `GET /contracts/{id}/collaborators` - Lấy danh sách collaborators
- `PATCH /contracts/collaborators/{cid}` - Cập nhật collaborator
- `DELETE /contracts/collaborators/{cid}` - Xóa collaborator
- `POST /contracts/{id}/transfer-ownership` - Chuyển quyền sở hữu
- `GET /contracts/{id}/permissions` - Lấy quyền hạn

#### 8. Files (`/contracts/{id}/files`)
- `POST /contracts/{id}/files` - Upload file
- `GET /contracts/{id}/files` - Lấy danh sách files
- `DELETE /contracts/files/{fid}` - Xóa file

#### 9. Approval Workflow (`/contracts/{id}`)
- `POST /contracts/{id}/approve` - Phê duyệt hợp đồng
- `POST /contracts/{id}/reject` - Từ chối hợp đồng
- `POST /contracts/{id}/request-changes` - Yêu cầu chỉnh sửa

#### 10. Export (`/contracts/{id}/export`)
- `GET /contracts/{id}/export/pdf` - Export PDF
- `GET /contracts/{id}/export/docx` - Export DOCX
- `GET /contracts/{id}/print` - Print view

#### 11. Analytics (`/contracts`)
- `GET /contracts/{id}/analytics` - Analytics hợp đồng
- `GET /contracts/dashboard/stats` - Dashboard stats

#### 12. Audit (`/contracts/{id}/audit`)
- `GET /contracts/{id}/audit` - Audit logs
- `GET /contracts/{id}/audit/summary` - Audit summary
- `GET /contracts/audit/user` - User audit logs
- `GET /contracts/audit/system` - System audit logs

#### 13. Templates (`/contracts/templates`)
- `GET /contracts/templates` - Lấy danh sách templates
- `GET /contracts/templates/{tid}` - Lấy chi tiết template
- `POST /contracts/templates` - Tạo template
- `PATCH /contracts/templates/{tid}` - Cập nhật template
- `DELETE /contracts/templates/{tid}` - Xóa template

#### 14. Notifications (`/contracts/{id}/notifications`)
- `POST /contracts/{id}/notifications` - Tạo notification
- `GET /contracts/{id}/notifications` - Lấy danh sách notifications

#### 15. Reminders (`/contracts/{id}/reminders`)
- `POST /contracts/{id}/reminders` - Tạo reminder
- `GET /contracts/{id}/reminders` - Lấy danh sách reminders

#### 16. User Management (`/`)
- `GET /me` - Lấy thông tin profile
- `POST /manager/staff` - Tạo nhân viên mới (Manager only)
- `GET /manager/staff` - Lấy danh sách nhân viên (Manager only)

## Data Models

### Contract

```typescript
interface Contract {
  id: string;
  name: string;
  contract_code?: string;
  contract_type?: string;
  category?: string;
  priority: ContractPriority;
  mode: ContractMode;
  template_id?: string;
  status: ContractStatus;
  drafter_id: number;
  manager_id?: number;
  effective_date?: Date;
  expiration_date?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
```

### Contract Status Enum

```typescript
enum ContractStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}
```

### Contract Priority Enum

```typescript
enum ContractPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}
```

### Contract Mode Enum

```typescript
enum ContractMode {
  FORM = 'form',
  EDITOR = 'editor',
  HYBRID = 'hybrid'
}
```

### User

```typescript
interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: UserRole;
  department: string;
  created_at: Date;
  updated_at: Date;
}
```

### User Role Enum

```typescript
enum UserRole {
  STAFF = 'staff',
  MANAGER = 'manager',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}
```

### Milestone

```typescript
interface Milestone {
  id: string;
  contract_id: string;
  name: string;
  description?: string;
  due_date: Date;
  priority: ContractPriority;
  status: MilestoneStatus;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}
```

### Task

```typescript
interface Task {
  id: string;
  milestone_id: string;
  name: string;
  description?: string;
  assigned_to?: number;
  due_date: Date;
  priority: ContractPriority;
  status: TaskStatus;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}
```

### Collaborator

```typescript
interface Collaborator {
  id: string;
  contract_id: string;
  user_id: number;
  role: CollaboratorRole;
  permissions: string[];
  created_at: Date;
  updated_at: Date;
}
```

## Error Handling

### Standard Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/contracts"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

### Common Error Messages

```typescript
// Validation Errors
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [...]
}

// Authentication Errors
{
  "statusCode": 401,
  "message": "Unauthorized"
}

// Permission Errors
{
  "statusCode": 403,
  "message": "Insufficient permissions"
}

// Not Found Errors
{
  "statusCode": 404,
  "message": "Contract not found"
}

// Conflict Errors
{
  "statusCode": 409,
  "message": "Contract already exists"
}
```

## Best Practices

### 1. Authentication

- Always include JWT token in Authorization header
- Handle token refresh automatically
- Use secure HTTP-only cookies for refresh tokens

### 2. Request Headers

```javascript
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};
```

### 3. Pagination

Always use pagination for list endpoints:

```javascript
// Request
GET /contracts?page=1&limit=10

// Response
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

### 4. Error Handling

```javascript
try {
  const response = await fetch('/contracts', {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
} catch (error) {
  console.error('API Error:', error);
  // Handle error appropriately
}
```

### 5. Rate Limiting

- Respect rate limits (100 requests/minute for authenticated users)
- Implement exponential backoff for retries
- Cache responses when appropriate

### 6. File Upload

```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('description', 'Contract document');

const response = await fetch('/contracts/123/files', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});
```

## Examples

### 1. Complete Contract Creation Flow

```javascript
// 1. Login
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'user@example.com',
    password: 'password123'
  })
});

const { accessToken } = await loginResponse.json();

// 2. Create Contract
const contractResponse = await fetch('/contracts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Employment Contract',
    contract_code: 'EMP-2024-001',
    contract_type: 'employment',
    category: 'labor',
    priority: 'medium',
    mode: 'form',
    template_id: 'template-uuid'
  })
});

const contract = await contractResponse.json();

// 3. Add Collaborator
await fetch(`/contracts/${contract.id}/collaborators`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: 456,
    role: 'reviewer',
    permissions: ['read', 'comment', 'approve']
  })
});

// 4. Create Milestone
await fetch(`/contracts/${contract.id}/milestones`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Contract Signing',
    description: 'Both parties sign the contract',
    due_date: '2024-01-15',
    priority: 'high'
  })
});
```

### 2. Contract Approval Workflow

```javascript
// 1. Submit for Review
await fetch(`/contracts/${contractId}/transition`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'draft',
    to: 'pending_review'
  })
});

// 2. Approve Contract
await fetch(`/contracts/${contractId}/approve`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// 3. Activate Contract
await fetch(`/contracts/${contractId}/transition`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'pending_review',
    to: 'active'
  })
});
```

### 3. File Management

```javascript
// 1. Upload File
const formData = new FormData();
formData.append('file', file);
formData.append('description', 'Contract document');
formData.append('file_type', 'contract_document');

const uploadResponse = await fetch(`/contracts/${contractId}/files`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

// 2. List Files
const filesResponse = await fetch(`/contracts/${contractId}/files`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const files = await filesResponse.json();
```

### 4. Analytics and Reporting

```javascript
// 1. Get Contract Analytics
const analyticsResponse = await fetch(`/contracts/${contractId}/analytics`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const analytics = await analyticsResponse.json();

// 2. Get Dashboard Stats
const statsResponse = await fetch('/contracts/dashboard/stats', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const stats = await statsResponse.json();

// 3. Get Audit Logs
const auditResponse = await fetch(`/contracts/${contractId}/audit?page=1&limit=50`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const auditLogs = await auditResponse.json();
```

### 5. Template Management

```javascript
// 1. Create Template
const templateResponse = await fetch('/contracts/templates', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Standard Employment Contract',
    description: 'Template for employment contracts',
    type: 'form',
    category: 'employment',
    structure: {
      fields: [
        {
          name: 'employee_name',
          label: 'Employee Name',
          type: 'text',
          required: true
        },
        {
          name: 'salary',
          label: 'Salary',
          type: 'number',
          required: true
        },
        {
          name: 'start_date',
          label: 'Start Date',
          type: 'date',
          required: true
        }
      ]
    },
    tags: ['employment', 'standard']
  })
});

// 2. Use Template for New Contract
const contractResponse = await fetch('/contracts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'New Employee Contract',
    template_id: templateResponse.id,
    mode: 'form'
  })
});
```

## Development Commands

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod

# Testing
npm run test
npm run test:watch
npm run test:cov

# Database
npm run migration:generate
npm run migration:run
npm run migration:revert
npm run seed

# Linting and Formatting
npm run lint
npm run format
```

## Support

For API support and questions:

1. Check the Swagger documentation at `http://localhost:3000/api`
2. Review the error logs in the console
3. Check the database connection and migrations
4. Verify environment variables are correctly set

## Version History

- **v1.0.0** - Initial release with basic contract management
- **v1.1.0** - Added versioning and collaboration features
- **v1.2.0** - Added analytics and audit logging
- **v1.3.0** - Added template management and file upload