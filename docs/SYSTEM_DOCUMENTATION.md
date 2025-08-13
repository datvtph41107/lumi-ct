# Hệ Thống Quản Lý Hợp Đồng - Documentation

## 📋 Mục Lục

1. [Tổng Quan Hệ Thống](#tổng-quan-hệ-thống)
2. [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
3. [Authentication & Authorization](#authentication--authorization)
4. [Contract Management System](#contract-management-system)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [Frontend Architecture](#frontend-architecture)
8. [Deployment Guide](#deployment-guide)
9. [Security Considerations](#security-considerations)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Tổng Quan Hệ Thống

### Mục Tiêu
Hệ thống quản lý hợp đồng toàn diện với khả năng soạn thảo, quản lý và theo dõi hợp đồng theo quy trình chuyên nghiệp.

### Tính Năng Chính
- **Soạn thảo hợp đồng**: 3 phương thức (Basic Form, Editor, Upload File)
- **Quản lý template**: Hệ thống template đa dạng
- **Workflow theo giai đoạn**: 4 giai đoạn rõ ràng
- **Collaboration**: Quản lý cộng tác viên
- **Audit Trail**: Theo dõi lịch sử thay đổi
- **Notification System**: Hệ thống thông báo thông minh

---

## 🏗️ Kiến Trúc Hệ Thống

### Backend (NestJS)
```
server/
├── src/
│   ├── modules/
│   │   ├── contract/           # Contract management
│   │   ├── auth/              # Authentication
│   │   ├── notification/      # Notification system
│   │   └── user/              # User management
│   ├── core/
│   │   ├── domain/            # Domain entities
│   │   ├── guards/            # Authorization guards
│   │   └── interceptors/      # Cross-cutting concerns
│   └── app.module.ts
```

### Frontend (React + TypeScript)
```
client/
├── src/
│   ├── page/Contract/         # Contract pages
│   ├── components/            # Reusable components
│   ├── services/api/          # API services
│   ├── store/                 # State management
│   ├── types/                 # TypeScript types
│   └── contexts/              # React contexts
```

---

## 🔐 Authentication & Authorization

### Authentication Flow
1. **Login**: User đăng nhập với email/password
2. **Token Generation**: Server tạo JWT access token và refresh token
3. **HttpOnly Cookies**: Tokens được lưu trong httpOnly cookies
4. **Auto Refresh**: Token tự động refresh trước khi hết hạn
5. **Session Management**: Quản lý session an toàn

### Authorization Levels
```typescript
enum UserRole {
    ADMIN = 'admin',      // Toàn quyền
    MANAGER = 'manager',  // Quản lý
    USER = 'user'         // Người dùng thường
}
```

### Protected Routes
```typescript
// Route với role requirement
<ProtectedRoute requiredRole={['admin', 'manager']}>
    <AdminDashboard />
</ProtectedRoute>
```

### Core Authentication Components

#### AuthContext
```typescript
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
}
```

#### AuthManager (Singleton)
```typescript
class AuthManager {
    // Quản lý authentication state
    // Auto token refresh
    // Role-based access control
    // Session management
}
```

---

## 📄 Contract Management System

### Workflow Stages
1. **Stage 1 - Draft**: Chọn phương thức tạo hợp đồng
2. **Stage 2 - Editor**: Soạn thảo nội dung
3. **Stage 3 - Milestones**: Thiết lập mốc thời gian
4. **Stage 4 - Review**: Xem lại và hoàn thành

### Creation Methods

#### 1. Basic Form
- Form-based contract creation
- Pre-defined fields
- Auto-structure generation
- Best for: Simple contracts

#### 2. Editor (TipTap)
- Rich text editor
- Smart suggestions
- Template integration
- Best for: Complex contracts

#### 3. Upload File
- File upload (Word, PDF)
- Content extraction
- Convert to editor
- Best for: Existing documents

### Template System

#### Template Types
```typescript
interface ContractTemplate {
    id: string;
    name: string;
    description: string;
    type: 'basic' | 'editor';
    category: string;
    fields?: TemplateField[];
    content?: string;
    variables?: string[];
    is_public: boolean;
}
```

#### Template Management
- Create/Edit templates
- Field configuration
- Content templates
- Variable system
- Public/Private templates

### Collaboration Features

#### Collaborator Roles
```typescript
enum CollaboratorRole {
    OWNER = 'owner',      // Chủ sở hữu
    EDITOR = 'editor',    // Chỉnh sửa
    REVIEWER = 'reviewer', // Xem lại
    VIEWER = 'viewer'     // Chỉ xem
}
```

#### Permission System
- Role-based permissions
- Action-based access control
- Ownership transfer
- Audit logging

---

## 🗄️ Database Schema

### Core Entities

#### Contract
```sql
CREATE TABLE contracts (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    content JSONB,
    data JSONB,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### ContractDraft
```sql
CREATE TABLE contract_drafts (
    id UUID PRIMARY KEY,
    contract_id UUID REFERENCES contracts(id),
    stage VARCHAR(50) NOT NULL,
    data JSONB,
    version INTEGER DEFAULT 1,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Collaborator
```sql
CREATE TABLE collaborators (
    id UUID PRIMARY KEY,
    contract_id UUID REFERENCES contracts(id),
    user_id INTEGER NOT NULL,
    role VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### AuditLog
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    contract_id UUID REFERENCES contracts(id),
    user_id INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    meta JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Notification & Reminder
```sql
CREATE TABLE contract_notifications (
    id UUID PRIMARY KEY,
    contract_id UUID REFERENCES contracts(id),
    user_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    message TEXT,
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP
);

CREATE TABLE contract_reminders (
    id UUID PRIMARY KEY,
    contract_id UUID REFERENCES contracts(id),
    user_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    trigger_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL
);
```

---

## 🌐 API Documentation

### Authentication Endpoints

#### POST /auth/login
```typescript
// Request
{
    email: string;
    password: string;
    remember_me?: boolean;
}

// Response
{
    user: User;
    message: string;
}
```

#### POST /auth/register
```typescript
// Request
{
    username: string;
    email: string;
    password: string;
    confirm_password: string;
    full_name: string;
}
```

#### POST /auth/refresh
```typescript
// Response
{
    user: User;
    message: string;
}
```

### Contract Endpoints

#### GET /contracts
```typescript
// Query Parameters
{
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
}

// Response
{
    data: Contract[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
```

#### POST /contracts
```typescript
// Request
{
    name: string;
    description?: string;
    type: string;
    content?: string;
    data?: object;
}
```

#### PUT /contracts/:id
```typescript
// Request
{
    name?: string;
    description?: string;
    content?: string;
    data?: object;
}
```

### Draft Management

#### GET /contracts/:id/drafts
```typescript
// Response
{
    data: ContractDraft[];
}
```

#### POST /contracts/:id/drafts
```typescript
// Request
{
    stage: string;
    data: object;
}
```

### Collaboration

#### GET /contracts/:id/collaborators
```typescript
// Response
{
    data: Collaborator[];
}
```

#### POST /contracts/:id/collaborators
```typescript
// Request
{
    user_id: number;
    role: string;
}
```

### Audit Logs

#### GET /contracts/:id/audit
```typescript
// Query Parameters
{
    page?: number;
    limit?: number;
    action?: string;
    user_id?: number;
    date_from?: string;
    date_to?: string;
}

// Response
{
    data: AuditLog[];
    pagination: PaginationInfo;
}
```

---

## 🎨 Frontend Architecture

### State Management

#### Zustand Store
```typescript
interface ContractDraftStore {
    // Current draft state
    currentDraft: ContractDraft | null;
    currentStage: string;
    creationMethod: ContractCreationMethod | null;
    
    // UI state
    hasUnsavedChanges: boolean;
    isLoading: boolean;
    
    // Actions
    setCurrentDraft: (draft: ContractDraft) => void;
    nextStage: () => void;
    previousStage: () => void;
    saveStage: () => Promise<void>;
    performAutoSave: () => Promise<void>;
}
```

#### Auto-save Hook
```typescript
const useAutoSave = () => {
    // Auto-save on content change
    // Keyboard shortcuts (Ctrl+S)
    // Before unload warning
    // Periodic auto-save
};
```

### Component Structure

#### Contract Pages
```
page/Contract/
├── CreateContract/          # Method selection
├── ContractCollection/      # Template & draft selection
├── ContractDraft/          # Main drafting interface
└── TemplateManagement/     # Template management
```

#### Components
```
components/
├── stages/                 # Stage components
│   ├── StageDraft/
│   ├── StageMilestones/
│   └── StageReview/
├── DaftContract/          # Editor components
│   ├── EditorPage/
│   ├── SidebarLeft/
│   └── SidebarRight/
└── CollaboratorManagement/
```

### Routing
```typescript
// Public routes
/login
/register
/forgot-password

// Protected routes
/
/contracts
/contracts/collection
/contracts/draft
/contracts/draft/:id
/contracts/templates
/profile
/settings

// Admin routes
/admin
```

---

## 🚀 Deployment Guide

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (for caching)
- Docker (optional)

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/contract_db

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=ws://localhost:3001
```

### Docker Deployment

#### docker-compose.yml
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: contract_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./server
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis
    ports:
      - "3001:3001"

  frontend:
    build: ./client
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Production Checklist
- [ ] SSL/TLS certificates
- [ ] Database backups
- [ ] Environment variables
- [ ] Logging configuration
- [ ] Monitoring setup
- [ ] Security headers
- [ ] Rate limiting
- [ ] CORS configuration

---

## 🔒 Security Considerations

### Authentication Security
- **HttpOnly Cookies**: Prevent XSS attacks
- **CSRF Protection**: CSRF tokens
- **Rate Limiting**: Prevent brute force
- **Password Hashing**: bcrypt with salt
- **Session Management**: Secure session handling

### Authorization Security
- **Role-based Access Control**: Granular permissions
- **Resource-level Authorization**: Contract ownership
- **Audit Logging**: Complete action tracking
- **Input Validation**: Server-side validation

### Data Security
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: Input sanitization
- **File Upload Security**: Type validation
- **Data Encryption**: Sensitive data encryption

### Network Security
- **HTTPS Only**: TLS encryption
- **Security Headers**: CSP, HSTS, etc.
- **CORS Configuration**: Proper origin control
- **API Rate Limiting**: Prevent abuse

---

## 🛠️ Troubleshooting

### Common Issues

#### Authentication Issues
```bash
# Check JWT token
jwt.decode(token, verify=False)

# Check cookies
document.cookie

# Check network requests
Network tab in DevTools
```

#### Database Issues
```sql
-- Check connections
SELECT * FROM pg_stat_activity;

-- Check locks
SELECT * FROM pg_locks;

-- Check slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC;
```

#### Performance Issues
```bash
# Check memory usage
htop

# Check disk usage
df -h

# Check logs
tail -f logs/app.log
```

### Debug Mode
```typescript
// Enable debug logging
DEBUG=* npm run dev

// Enable SQL logging
LOG_LEVEL=debug
```

### Monitoring
- **Application Metrics**: Response times, error rates
- **Database Metrics**: Query performance, connections
- **System Metrics**: CPU, memory, disk usage
- **User Metrics**: Active users, feature usage

---

## 📚 Additional Resources

### Documentation
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [pgAdmin](https://www.pgadmin.org/) - Database management
- [Redis Commander](https://github.com/joeferner/redis-commander) - Redis management

### Best Practices
- [OWASP Security Guidelines](https://owasp.org/)
- [REST API Design](https://restfulapi.net/)
- [React Best Practices](https://react.dev/learn)

---

## 📞 Support

### Contact Information
- **Email**: support@contractsystem.com
- **Documentation**: https://docs.contractsystem.com
- **GitHub**: https://github.com/contractsystem

### Issue Reporting
1. Check existing issues
2. Create new issue with detailed description
3. Include error logs and steps to reproduce
4. Provide environment information

---

*Last updated: January 2024*
*Version: 1.0.0*