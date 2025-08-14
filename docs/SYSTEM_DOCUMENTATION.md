# 📋 HỆ THỐNG QUẢN LÝ HỢP ĐỒNG - DOCUMENTATION TOÀN DIỆN

## 🏗️ **KIẾN TRÚC TỔNG QUAN**

### **Backend Architecture**
```
📁 server/src/
├── 📁 core/                          # Core business logic
│   ├── 📁 domain/                    # Database entities
│   │   ├── 📁 auth/                  # Authentication entities
│   │   ├── 📁 contract/              # Contract entities
│   │   └── 📁 user/                  # User entities
│   ├── 📁 services/                  # Core services
│   ├── 📁 guards/                    # Authorization guards
│   └── 📁 decorators/                # Custom decorators
├── 📁 modules/                       # Feature modules
│   ├── 📁 auth/                      # Authentication module
│   ├── 📁 contract/                  # Contract management
│   └── 📁 notification/              # Notification system
└── 📁 app.module.ts                  # Root module
```

### **Frontend Architecture**
```
📁 client/src/
├── 📁 core/                          # Core functionality
│   ├── 📁 auth/                      # Authentication core
│   └── 📁 redux/                     # State management
├── 📁 services/                      # API services
├── 📁 components/                    # Reusable components
├── 📁 page/                          # Page components
│   └── 📁 Contract/                  # Contract pages
└── 📁 types/                         # TypeScript types
```

## 🔐 **AUTHENTICATION & AUTHORIZATION SYSTEM**

### **Backend Auth Core**

#### **1. Entities**
- **User**: Thông tin người dùng
- **UserSession**: Quản lý phiên đăng nhập
- **Role**: Định nghĩa vai trò
- **Permission**: Quyền hạn chi tiết
- **UserRole**: Liên kết user-role với scope

#### **2. AuthCoreService**
```typescript
// Core permission checking
async hasPermission(userId: number, resource: string, action: string, context?: Record<string, any>): Promise<boolean>

// Contract-specific permissions
async canCreateContract(userId: number, contractType?: string): Promise<boolean>
async canReadContract(userId: number, contractId: number, context?: Record<string, any>): Promise<boolean>
async canUpdateContract(userId: number, contractId: number, context?: Record<string, any>): Promise<boolean>
async canDeleteContract(userId: number, contractId: number, context?: Record<string, any>): Promise<boolean>
async canApproveContract(userId: number, contractId: number, context?: Record<string, any>): Promise<boolean>
async canRejectContract(userId: number, contractId: number, context?: Record<string, any>): Promise<boolean>
async canExportContract(userId: number, contractId: number): Promise<boolean>
```

#### **3. PermissionGuard**
```typescript
@RequirePermissions(
  { resource: 'contract', action: 'create' },
  { resource: 'template', action: 'manage' }
)
async createContract() {
  // Implementation
}
```

### **Frontend Auth Core**

#### **1. Redux Auth Slice**
```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastActivity: number;
  idleTimeout: number;
  isIdleWarningShown: boolean;
  redirectPath: string | null;
  
  // Permission management
  userPermissions: UserPermissions | null;
  userRoles: UserRole[];
  permissionCache: Map<string, boolean>;
  isPermissionsLoaded: boolean;
}
```

#### **2. AuthCoreService**
```typescript
// Permission checking
hasPermission(resource: string, action: string, conditions?: Record<string, any>): boolean
hasAnyPermission(permissions: PermissionCheck[]): boolean
hasAllPermissions(permissions: PermissionCheck[]): boolean

// Role checking
hasRole(roleName: string, scope?: string, scopeId?: number): boolean
hasAnyRole(roleNames: string[]): boolean
hasAllRoles(roleNames: string[]): boolean

// Contract-specific helpers
canCreateContract(contractType?: string): boolean
canReadContract(contractId?: number, context?: Record<string, any>): boolean
canUpdateContract(contractId?: number, context?: Record<string, any>): boolean
canDeleteContract(contractId?: number, context?: Record<string, any>): boolean
canApproveContract(contractId?: number, context?: Record<string, any>): boolean
canRejectContract(contractId?: number, context?: Record<string, any>): boolean
canExportContract(contractId?: number): boolean
canManageTemplates(): boolean
canViewDashboard(dashboardType?: string): boolean
canViewAnalytics(analyticsType?: string): boolean
```

#### **3. PermissionGuard Components**
```typescript
// Basic permission guard
<PermissionGuard 
  resource="contract" 
  action="create" 
  context={{ contractType: 'employment' }}
>
  <CreateContractButton />
</PermissionGuard>

// Contract-specific guards
<ContractCreateGuard contractType="employment">
  <CreateEmploymentContract />
</ContractCreateGuard>

<ContractReadGuard contractId={123}>
  <ContractDetails />
</ContractReadGuard>

<ContractUpdateGuard contractId={123}>
  <EditContractButton />
</ContractUpdateGuard>

<ContractDeleteGuard contractId={123}>
  <DeleteContractButton />
</ContractDeleteGuard>

<ContractApproveGuard contractId={123}>
  <ApproveButton />
</ContractApproveGuard>

<ContractRejectGuard contractId={123}>
  <RejectButton />
</ContractRejectGuard>

// Role-based guards
<ContractManagerGuard>
  <AdminPanel />
</ContractManagerGuard>

<AccountingStaffGuard>
  <FinancialReports />
</AccountingStaffGuard>

<HRStaffGuard>
  <EmployeeContracts />
</HRStaffGuard>
```

## 📄 **CONTRACT MANAGEMENT SYSTEM**

### **Backend Contract Service**

#### **1. CRUD Operations**
```typescript
// Create contract with permission check
async createContract(createDto: CreateContractDto, userId: number): Promise<Contract>

// Get contract with permission check
async getContract(id: number, userId: number): Promise<Contract>

// Update contract with permission check
async updateContract(id: number, updateDto: UpdateContractDto, userId: number): Promise<Contract>

// Delete contract with permission check
async deleteContract(id: number, userId: number): Promise<void>

// List contracts with permission-based filtering
async listContracts(filters: ContractFilters, pagination: ContractPagination, userId: number): Promise<{
  data: Contract[];
  total: number;
  page: number;
  limit: number;
}>
```

#### **2. Workflow Operations**
```typescript
// Submit for review
async submitForReview(id: number, userId: number): Promise<Contract>

// Approve contract
async approveContract(id: number, userId: number, comment?: string): Promise<Contract>

// Reject contract
async rejectContract(id: number, userId: number, reason: string): Promise<Contract>

// Request changes
async requestChanges(id: number, userId: number, changes: string): Promise<Contract>
```

#### **3. Milestone & Task Management**
```typescript
// Milestone operations
async createMilestone(contractId: number, milestoneData: any, userId: number): Promise<Milestone>
async updateMilestone(milestoneId: number, updateData: any, userId: number): Promise<Milestone>
async deleteMilestone(milestoneId: number, userId: number): Promise<void>

// Task operations
async createTask(contractId: number, taskData: any, userId: number): Promise<Task>
async updateTask(contractId: number, taskId: number, data: any, userId: number): Promise<Task>
async deleteTask(contractId: number, taskId: number, userId: number): Promise<void>
```

#### **4. File Management**
```typescript
// File operations
async uploadFile(contractId: number, fileData: any, userId: number): Promise<ContractFile>
async deleteFile(fileId: number, userId: number): Promise<void>
```

#### **5. Export & Reporting**
```typescript
// Export operations
async exportContract(id: number, format: string, userId: number): Promise<any>

// Statistics
async getContractStatistics(userId: number): Promise<any>
```

### **Frontend Contract Service**

#### **1. Service with Permission Integration**
```typescript
class ContractService extends BaseService {
  async createContract(data: CreateContractDto): Promise<{ data: Contract }> {
    // Check permission
    if (!authCoreService.canCreateContract(data.type)) {
      throw new Error('Không có quyền tạo hợp đồng');
    }
    const response = await this.post<Contract>('/', data);
    return response;
  }

  async getContract(id: number): Promise<{ data: Contract }> {
    // Check permission
    if (!authCoreService.canReadContract(id)) {
      throw new Error('Không có quyền xem hợp đồng này');
    }
    const response = await this.get<Contract>(`/${id}`);
    return response;
  }

  // Similar pattern for all operations...
}
```

## 🔄 **WORKFLOW SYSTEM**

### **Contract Workflow Stages**
1. **Draft**: Soạn thảo hợp đồng
2. **Review**: Chờ phê duyệt
3. **Changes Requested**: Yêu cầu chỉnh sửa
4. **Approved**: Đã phê duyệt
5. **Rejected**: Từ chối
6. **Active**: Đang hiệu lực
7. **Expired**: Hết hạn
8. **Terminated**: Chấm dứt

### **Workflow Transitions**
```typescript
// Draft -> Review
await contractService.submitForReview(contractId);

// Review -> Approved
await contractService.approveContract(contractId, comment);

// Review -> Rejected
await contractService.rejectContract(contractId, reason);

// Review -> Changes Requested
await contractService.requestChanges(contractId, changes);

// Changes Requested -> Draft
// User updates contract and resubmits
```

## 👥 **COLLABORATOR MANAGEMENT**

### **Collaborator Roles**
- **Owner**: Quyền sở hữu hoàn toàn
- **Editor**: Có thể chỉnh sửa
- **Reviewer**: Có thể phê duyệt
- **Viewer**: Chỉ xem

### **Collaborator Operations**
```typescript
// Add collaborator
async addCollaborator(contractId: number, data: any): Promise<{ data: Collaborator }>

// Update collaborator
async updateCollaborator(contractId: number, collaboratorId: number, data: any): Promise<{ data: Collaborator }>

// Remove collaborator
async removeCollaborator(contractId: number, collaboratorId: number): Promise<{ data: { message: string } }>

// List collaborators
async listCollaborators(contractId: number): Promise<{ data: Collaborator[] }>

// Transfer ownership
async transferOwnership(contractId: number, userId: number): Promise<{ data: { message: string } }>
```

## 📊 **AUDIT & ANALYTICS**

### **Audit Logging**
```typescript
// Every operation is logged
await this.auditLogService.create({
  contract_id: contractId,
  user_id: userId,
  action: 'CREATE_CONTRACT',
  details: { contract_type: createDto.type, template_id: createDto.template_id }
});
```

### **Audit Operations**
```typescript
// Get contract audit logs
async getAuditLogs(contractId: number, filters?: any, pagination?: any): Promise<{ data: { logs: AuditLog[]; total: number } }>

// Get audit summary
async getAuditSummary(contractId: number): Promise<{ data: any }>
```

### **Analytics**
```typescript
// Contract statistics
async getContractStatistics(userId: number): Promise<any>
// Returns: { total, byStatus: { draft, pending, approved, rejected } }
```

## 🔔 **NOTIFICATION SYSTEM**

### **Notification Types**
- **Milestone Due**: Nhắc nhở milestone sắp đến hạn
- **Task Due**: Nhắc nhở task sắp đến hạn
- **Contract Expiring**: Hợp đồng sắp hết hạn
- **Approval Required**: Cần phê duyệt
- **Changes Requested**: Yêu cầu chỉnh sửa

### **Notification Channels**
- **Email**: Gửi email
- **In-App**: Thông báo trong ứng dụng
- **SMS**: Gửi SMS (nếu có)
- **Push**: Push notification

### **Reminder System**
```typescript
// Create milestone reminder
await this.notificationService.createMilestoneReminder(milestone);

// Create task reminder
await this.notificationService.createTaskReminder(task);

// Cancel reminders
await this.notificationService.cancelRemindersByMilestone(milestoneId);
await this.notificationService.cancelRemindersByTask(taskId);
```

## 📁 **FILE MANAGEMENT**

### **File Operations**
```typescript
// Upload file
async uploadFile(contractId: number, file: File): Promise<{ data: ContractFile }>

// Delete file
async deleteFile(contractId: number, fileId: number): Promise<{ data: { message: string } }>

// List files
async listFiles(contractId: number): Promise<{ data: ContractFile[] }>
```

### **File Types Supported**
- **PDF**: Tài liệu PDF
- **DOCX**: Tài liệu Word
- **XLSX**: Bảng tính Excel
- **Images**: Hình ảnh (JPG, PNG, etc.)
- **Other**: Các file khác

## 📋 **TEMPLATE MANAGEMENT**

### **Template Types**
- **Basic**: Template với form fields
- **Editor**: Template với HTML content
- **Mixed**: Kết hợp cả hai

### **Template Operations**
```typescript
// List templates
async listTemplates(filters?: any): Promise<{ data: any[] }>

// Get template
async getTemplate(templateId: number): Promise<{ data: any }>

// Create template
async createTemplate(data: any): Promise<{ data: any }>

// Update template
async updateTemplate(templateId: number, data: any): Promise<{ data: any }>

// Delete template
async deleteTemplate(templateId: number): Promise<{ data: { message: string } }>
```

## 🔄 **VERSION MANAGEMENT**

### **Version Operations**
```typescript
// Create version
async createVersion(contractId: number, data: any): Promise<{ data: any }>

// List versions
async listVersions(contractId: number): Promise<{ data: any[] }>

// Get version
async getVersion(contractId: number, versionId: number): Promise<{ data: any }>
```

### **Version Features**
- **Auto-increment**: Tự động tăng version number
- **Change tracking**: Ghi lại thay đổi
- **Rollback**: Khôi phục version cũ
- **Comparison**: So sánh giữa các version

## 📊 **DASHBOARD & REPORTING**

### **Dashboard Features**
- **Contract Statistics**: Thống kê hợp đồng
- **Recent Activity**: Hoạt động gần đây
- **Pending Approvals**: Chờ phê duyệt
- **Expiring Contracts**: Hợp đồng sắp hết hạn
- **User Activity**: Hoạt động người dùng

### **Reporting**
- **Contract Reports**: Báo cáo hợp đồng
- **User Reports**: Báo cáo người dùng
- **Audit Reports**: Báo cáo audit
- **Export Options**: Tùy chọn xuất báo cáo

## 🔧 **SYSTEM CONFIGURATION**

### **Environment Variables**
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=contract_management
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Session
SESSION_SECRET=your-session-secret
SESSION_MAX_AGE=86400000
```

### **Database Configuration**
```typescript
// TypeORM configuration
{
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
}
```

## 🚀 **DEPLOYMENT**

### **Backend Deployment**
```bash
# Install dependencies
npm install

# Build application
npm run build

# Run migrations
npm run migration:run

# Start application
npm run start:prod
```

### **Frontend Deployment**
```bash
# Install dependencies
npm install

# Build application
npm run build

# Serve static files
npm run serve
```

### **Docker Deployment**
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

## 🔒 **SECURITY CONSIDERATIONS**

### **Authentication Security**
- **HttpOnly Cookies**: Bảo mật token
- **JWT Expiration**: Token có thời hạn
- **Refresh Token Rotation**: Xoay vòng refresh token
- **Session Management**: Quản lý phiên đăng nhập

### **Authorization Security**
- **Permission-based Access**: Kiểm tra quyền hạn
- **Role-based Access**: Kiểm tra vai trò
- **Context-aware Permissions**: Quyền hạn theo ngữ cảnh
- **Audit Logging**: Ghi lại mọi hoạt động

### **Data Security**
- **Input Validation**: Kiểm tra đầu vào
- **SQL Injection Prevention**: Ngăn chặn SQL injection
- **XSS Prevention**: Ngăn chặn XSS
- **CSRF Protection**: Bảo vệ CSRF

## 🧪 **TESTING**

### **Backend Testing**
```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Coverage
npm run test:cov
```

### **Frontend Testing**
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 📈 **PERFORMANCE OPTIMIZATION**

### **Backend Optimization**
- **Database Indexing**: Tạo index cho database
- **Query Optimization**: Tối ưu hóa query
- **Caching**: Cache dữ liệu
- **Connection Pooling**: Pool kết nối database

### **Frontend Optimization**
- **Code Splitting**: Chia nhỏ code
- **Lazy Loading**: Load theo demand
- **Image Optimization**: Tối ưu hóa hình ảnh
- **Bundle Optimization**: Tối ưu hóa bundle

## 🔧 **MAINTENANCE & MONITORING**

### **Logging**
- **Application Logs**: Log ứng dụng
- **Error Logs**: Log lỗi
- **Audit Logs**: Log audit
- **Performance Logs**: Log hiệu suất

### **Monitoring**
- **Health Checks**: Kiểm tra sức khỏe
- **Performance Monitoring**: Giám sát hiệu suất
- **Error Tracking**: Theo dõi lỗi
- **User Analytics**: Phân tích người dùng

## 📚 **API DOCUMENTATION**

### **Authentication Endpoints**
```
POST /auth/login - Đăng nhập
POST /auth/register - Đăng ký
POST /auth/logout - Đăng xuất
POST /auth/refresh - Làm mới token
GET /auth/me - Lấy thông tin user
GET /auth/permissions - Lấy quyền hạn
```

### **Contract Endpoints**
```
GET /contracts - Danh sách hợp đồng
POST /contracts - Tạo hợp đồng
GET /contracts/:id - Chi tiết hợp đồng
PUT /contracts/:id - Cập nhật hợp đồng
DELETE /contracts/:id - Xóa hợp đồng
POST /contracts/:id/submit - Submit phê duyệt
POST /contracts/:id/approve - Phê duyệt
POST /contracts/:id/reject - Từ chối
POST /contracts/:id/request-changes - Yêu cầu chỉnh sửa
```

### **Milestone Endpoints**
```
GET /contracts/:id/milestones - Danh sách milestone
POST /contracts/:id/milestones - Tạo milestone
PUT /contracts/:id/milestones/:milestoneId - Cập nhật milestone
DELETE /contracts/:id/milestones/:milestoneId - Xóa milestone
```

### **Task Endpoints**
```
GET /contracts/:id/tasks - Danh sách task
POST /contracts/:id/tasks - Tạo task
PUT /contracts/:id/tasks/:taskId - Cập nhật task
DELETE /contracts/:id/tasks/:taskId - Xóa task
```

### **File Endpoints**
```
GET /contracts/:id/files - Danh sách file
POST /contracts/:id/files - Upload file
DELETE /contracts/:id/files/:fileId - Xóa file
```

### **Collaborator Endpoints**
```
GET /contracts/:id/collaborators - Danh sách collaborator
POST /contracts/:id/collaborators - Thêm collaborator
PUT /contracts/:id/collaborators/:collaboratorId - Cập nhật collaborator
DELETE /contracts/:id/collaborators/:collaboratorId - Xóa collaborator
POST /contracts/:id/transfer-ownership - Chuyển quyền sở hữu
```

### **Audit Endpoints**
```
GET /contracts/:id/audit - Audit logs
GET /contracts/:id/audit/summary - Audit summary
```

### **Template Endpoints**
```
GET /templates - Danh sách template
POST /templates - Tạo template
GET /templates/:id - Chi tiết template
PUT /templates/:id - Cập nhật template
DELETE /templates/:id - Xóa template
```

## 🎯 **USE CASES**

### **1. Tạo Hợp Đồng Mới**
1. User chọn template
2. Điền thông tin cơ bản
3. Soạn thảo nội dung
4. Thiết lập milestones và tasks
5. Thêm collaborators
6. Submit để phê duyệt

### **2. Phê Duyệt Hợp Đồng**
1. Reviewer nhận thông báo
2. Xem xét hợp đồng
3. Phê duyệt hoặc yêu cầu chỉnh sửa
4. Hệ thống cập nhật trạng thái

### **3. Quản Lý Milestone**
1. Tạo milestone với deadline
2. Gán tasks cho milestone
3. Theo dõi tiến độ
4. Nhận thông báo khi sắp đến hạn

### **4. Export Báo Cáo**
1. Chọn loại báo cáo
2. Thiết lập filters
3. Xuất file (PDF, Excel, etc.)
4. Gửi email hoặc download

## 🔄 **WORKFLOW EXAMPLES**

### **Employment Contract Workflow**
```
Draft -> Review -> Approved -> Active -> Expired
  ↓        ↓         ↓         ↓         ↓
Create   Submit    Approve   Sign     Renew/Terminate
```

### **Financial Contract Workflow**
```
Draft -> Review -> Changes Requested -> Review -> Approved -> Active
  ↓        ↓              ↓              ↓         ↓         ↓
Create   Submit        Request         Resubmit  Approve   Execute
```

## 📊 **PERMISSION MATRIX**

| Role | Create | Read | Update | Delete | Approve | Export | Manage Templates |
|------|--------|------|--------|--------|---------|--------|------------------|
| Contract Manager | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Accounting Staff | ❌ | ✅ | ✅* | ❌ | ✅* | ✅ | ❌ |
| HR Staff | ✅* | ✅ | ✅* | ❌ | ✅* | ✅ | ❌ |
| Contract Creator | ✅ | ✅ | ✅* | ❌ | ❌ | ✅ | ❌ |
| Contract Reviewer | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Contract Viewer | ❌ | ✅* | ❌ | ❌ | ❌ | ❌ | ❌ |

*With conditions (e.g., own contracts, specific types)

## 🚀 **FUTURE ENHANCEMENTS**

### **Planned Features**
- **Mobile App**: Ứng dụng mobile
- **AI Integration**: Tích hợp AI
- **Blockchain**: Blockchain cho hợp đồng
- **Multi-language**: Đa ngôn ngữ
- **Advanced Analytics**: Phân tích nâng cao

### **Performance Improvements**
- **Microservices**: Chuyển sang microservices
- **Caching Layer**: Thêm caching layer
- **CDN**: Content Delivery Network
- **Load Balancing**: Cân bằng tải

---

## 📞 **SUPPORT & CONTACT**

### **Technical Support**
- **Email**: support@contract-management.com
- **Phone**: +84 123 456 789
- **Documentation**: https://docs.contract-management.com

### **Development Team**
- **Backend Lead**: backend@company.com
- **Frontend Lead**: frontend@company.com
- **DevOps Lead**: devops@company.com

---

*Documentation này được cập nhật lần cuối: 2024-01-XX*
*Phiên bản: 1.0.0*