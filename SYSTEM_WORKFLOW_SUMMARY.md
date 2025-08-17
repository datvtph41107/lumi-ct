# TÓM TẮT TOÀN BỘ TÁC VỤ, CHỨC NĂNG & LUỒNG HOẠT ĐỘNG HỆ THỐNG

## 📋 TỔNG QUAN HỆ THỐNG

### Mục tiêu
Hệ thống quản lý hợp đồng nội bộ phục vụ 2 phòng ban: **Hành chính** và **Kế toán**, với 2 vai trò: **Quản lý** và **Nhân viên**.

### Kiến trúc tổng thể
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React TS)    │◄──►│   (NestJS)      │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Redux/Zustand │    │   TypeORM       │    │   Audit Logs    │
│   State Mgmt    │    │   JWT Auth      │    │   File Storage  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🔐 LUỒNG XÁC THỰC & PHÂN QUYỀN

### 1. Đăng nhập (Login Flow)
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth API
    participant D as Database
    
    U->>F: Nhập username/password
    F->>A: POST /auth/login
    A->>D: Validate credentials
    D-->>A: User data + permissions
    A->>A: Generate JWT tokens
    A-->>F: Access token + User info
    F->>F: Store in Redux + Set cookies
    F-->>U: Redirect to Dashboard
```

### 2. Phân quyền (Authorization Flow)
```mermaid
graph TD
    A[User Request] --> B{Has Valid Token?}
    B -->|No| C[Redirect to Login]
    B -->|Yes| D{Has Permission?}
    D -->|No| E[Show Access Denied]
    D -->|Yes| F[Allow Access]
    
    F --> G{Resource Level?}
    G -->|Yes| H{Can Access Resource?}
    G -->|No| I[Render Component]
    H -->|No| E
    H -->|Yes| I
```

### 3. Session Management
- **Auto Refresh**: Tự động refresh token trước 5 phút hết hạn
- **Session Timeout**: Logout sau 15 phút không hoạt động
- **Concurrent Sessions**: Tối đa 5 phiên đồng thời
- **Force Logout**: Admin có thể force logout user

---

## 👥 LUỒNG QUẢN LÝ NGƯỜI DÙNG

### 1. Tạo User (Admin Only)
```mermaid
sequenceDiagram
    participant A as Admin
    participant F as Frontend
    participant U as User API
    participant D as Database
    participant L as Audit Log
    
    A->>F: Fill user form
    F->>U: POST /admin/users
    U->>D: Create user record
    U->>D: Assign default role
    U->>L: Log user creation
    D-->>U: Created user data
    U-->>F: Success response
    F-->>A: Show success message
```

### 2. Phân quyền User
```mermaid
graph TD
    A[Admin selects user] --> B[Choose role]
    B --> C[Select permissions]
    C --> D[Set department]
    D --> E[Save changes]
    E --> F[Update user record]
    F --> G[Log permission change]
    G --> H[Notify user]
```

### 3. User Lifecycle Management
- **Creation**: Admin tạo → Assign role → Activate
- **Monitoring**: Track activity → Performance metrics
- **Maintenance**: Update info → Change permissions
- **Deactivation**: Suspend → Archive → Delete

---

## 📄 LUỒNG QUẢN LÝ HỢP ĐỒNG

### 1. Tạo Hợp Đồng Mới
```mermaid
graph TD
    A[User clicks "Tạo hợp đồng"] --> B[Chọn mode]
    B --> C{Mode?}
    C -->|Basic| D[Form cơ bản]
    C -->|Editor| E[Trình soạn thảo]
    C -->|Upload| F[Upload file]
    
    D --> G[Điền thông tin]
    E --> G
    F --> G
    
    G --> H[Thiết lập milestones]
    H --> I[Thiết lập notifications]
    I --> J[Review & Preview]
    J --> K[Publish Contract]
```

### 2. Workflow Hợp Đồng
```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> UnderReview
    UnderReview --> Approved
    UnderReview --> Rejected
    Rejected --> Draft
    Approved --> Active
    Active --> Completed
    Active --> Cancelled
    Completed --> [*]
    Cancelled --> [*]
```

### 3. Quy trình phê duyệt
```mermaid
sequenceDiagram
    participant D as Drafter
    participant S as System
    participant M as Manager
    participant N as Notification
    
    D->>S: Submit for review
    S->>N: Send approval request
    N->>M: Email notification
    M->>S: Review contract
    S->>D: Status update
    alt Approved
        S->>S: Activate contract
        S->>N: Send approval notification
    else Rejected
        S->>D: Return with comments
    end
```

---

## 🎯 LUỒNG SOẠN THẢO HỢP ĐỒNG

### 1. Stage Navigation Flow
```mermaid
graph TD
    A[CreateContract] --> B[ContractCollection]
    B --> C[ContractDraft]
    C --> D[StageDraft]
    D --> E[StageMilestones]
    E --> F[StageNotifications]
    F --> G[StagePreview]
    G --> H[Publish]
    
    D --> I{Mode?}
    I -->|Basic| J[BasicContractForm]
    I -->|Editor| K[EditorPage]
    I -->|Upload| L[FileUploadForm]
```

### 2. Editor Mode Workflow
```mermaid
sequenceDiagram
    participant U as User
    participant E as Editor
    participant S as Store
    participant A as API
    
    U->>E: Open editor
    E->>S: Load draft content
    S->>A: GET /contracts/drafts/{id}
    A-->>S: Draft data
    S-->>E: Content loaded
    
    loop Editing
        U->>E: Make changes
        E->>S: Update content
        S->>A: Auto-save
        A-->>S: Save confirmation
    end
    
    U->>E: Save & Continue
    E->>S: Validate content
    S->>A: PUT /contracts/drafts/{id}
    A-->>S: Updated draft
```

### 3. Auto-save Mechanism
- **Manual Save**: User nhấn Ctrl+S hoặc nút Save
- **Auto-save**: Tự động lưu sau 30 giây không hoạt động
- **Exit Warning**: Cảnh báo khi thoát chưa lưu
- **Stage Change**: Tự động lưu khi chuyển stage

---

## 🔔 LUỒNG THÔNG BÁO

### 1. Notification System Flow
```mermaid
graph TD
    A[Event Trigger] --> B[Check Rules]
    B --> C{Match Rule?}
    C -->|No| D[Skip]
    C -->|Yes| E[Create Notification]
    E --> F[Check Schedule]
    F --> G{Within Hours?}
    G -->|No| H[Queue for later]
    G -->|Yes| I[Send immediately]
    I --> J[Email/Push/SMS]
    H --> K[Cron Job]
    K --> I
```

### 2. Email Notification Flow
```mermaid
sequenceDiagram
    participant S as System
    participant Q as Queue
    participant E as Email Service
    participant U as User
    
    S->>Q: Add email task
    Q->>E: Process email
    E->>E: Apply template
    E->>U: Send email
    E->>S: Update status
    S->>S: Log delivery
```

### 3. Push Notification Flow
```mermaid
sequenceDiagram
    participant S as System
    participant P as Push Service
    participant B as Browser
    participant U as User
    
    S->>P: Send notification
    P->>B: Push message
    B->>U: Show notification
    U->>B: Click notification
    B->>S: Navigate to page
```

---

## 📊 LUỒNG BÁO CÁO & ANALYTICS

### 1. Report Generation Flow
```mermaid
graph TD
    A[User requests report] --> B[Check permissions]
    B --> C{Has access?}
    C -->|No| D[Access denied]
    C -->|Yes| E[Apply filters]
    E --> F[Query database]
    F --> G[Process data]
    G --> H[Generate report]
    H --> I[Format output]
    I --> J[Download/Send]
```

### 2. Dashboard Data Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database
    
    U->>F: Load dashboard
    F->>A: GET /admin/dashboard/stats
    A->>D: Query statistics
    D-->>A: Stats data
    A-->>F: Dashboard data
    F->>F: Update widgets
    F-->>U: Display dashboard
```

### 3. Real-time Updates
- **WebSocket**: Real-time contract updates
- **Polling**: Periodic data refresh
- **Event-driven**: Push updates on changes
- **Caching**: Reduce API calls

---

## 🔍 LUỒNG AUDIT & COMPLIANCE

### 1. Audit Logging Flow
```mermaid
sequenceDiagram
    participant U as User
    participant A as API
    participant L as Audit Service
    participant D as Database
    
    U->>A: Perform action
    A->>A: Process request
    A->>L: Log event
    L->>D: Store audit log
    A->>A: Complete action
    A-->>U: Response
```

### 2. Audit Data Structure
```typescript
interface AuditEvent {
  timestamp: Date;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details: object;
  ipAddress: string;
  userAgent: string;
}
```

### 3. Compliance Monitoring
- **Data Retention**: Tự động xóa log cũ
- **Access Logs**: Track tất cả truy cập
- **Change Tracking**: Theo dõi thay đổi dữ liệu
- **Security Events**: Monitor security incidents

---

## ⚙️ LUỒNG QUẢN TRỊ HỆ THỐNG

### 1. System Settings Management
```mermaid
graph TD
    A[Admin access settings] --> B[View current config]
    B --> C[Modify settings]
    C --> D[Validate changes]
    D --> E{Valid?}
    E -->|No| F[Show errors]
    E -->|Yes| G[Save changes]
    G --> H[Apply to system]
    H --> I[Log changes]
    I --> J[Notify users]
```

### 2. Backup & Recovery Flow
```mermaid
sequenceDiagram
    participant S as System
    participant B as Backup Service
    participant D as Database
    participant F as File Storage
    
    S->>B: Trigger backup
    B->>D: Export data
    D-->>B: Data dump
    B->>F: Store backup
    B->>S: Backup complete
    S->>S: Log backup
```

### 3. System Health Monitoring
- **Health Checks**: Kiểm tra sức khỏe hệ thống
- **Performance Monitoring**: Theo dõi hiệu suất
- **Error Tracking**: Bắt và log lỗi
- **Alert System**: Cảnh báo khi có vấn đề

---

## 📱 LUỒNG CLIENT-SIDE

### 1. Page Navigation Flow
```mermaid
graph TD
    A[App Start] --> B{Authenticated?}
    B -->|No| C[Login Page]
    B -->|Yes| D[Dashboard]
    
    D --> E[Contract Management]
    D --> F[User Management]
    D --> G[System Settings]
    D --> H[Reports]
    
    E --> I[Contract List]
    E --> J[Create Contract]
    E --> K[Contract Details]
    
    F --> L[User List]
    F --> M[Create User]
    F --> N[User Details]
```

### 2. State Management Flow
```mermaid
graph TD
    A[User Action] --> B[Component]
    B --> C[Local State]
    C --> D[Zustand Store]
    D --> E[Redux Store]
    E --> F[API Call]
    F --> G[Server Response]
    G --> E
    E --> D
    D --> C
    C --> B
    B --> H[UI Update]
```

### 3. Error Handling Flow
```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant S as Store
    participant A as API
    
    U->>C: Perform action
    C->>S: Dispatch action
    S->>A: API call
    A-->>S: Error response
    S->>S: Handle error
    S-->>C: Error state
    C->>C: Show error message
    C-->>U: Display error
```

---

## 🔧 LUỒNG KỸ THUẬT

### 1. API Request Flow
```mermaid
sequenceDiagram
    participant C as Client
    participant I as Interceptor
    participant A as API Gateway
    participant G as Guard
    participant S as Service
    participant D as Database
    
    C->>I: HTTP Request
    I->>I: Add auth header
    I->>A: Forward request
    A->>G: Check permissions
    G->>S: Allow/Deny
    S->>D: Query data
    D-->>S: Data
    S-->>G: Response
    G-->>A: Response
    A-->>I: Response
    I-->>C: Response
```

### 2. Database Transaction Flow
```mermaid
graph TD
    A[Start Transaction] --> B[Execute Operations]
    B --> C{Success?}
    C -->|Yes| D[Commit Transaction]
    C -->|No| E[Rollback Transaction]
    D --> F[Log Success]
    E --> G[Log Error]
    F --> H[End Transaction]
    G --> H
```

### 3. Caching Strategy
```mermaid
graph TD
    A[Request Data] --> B{Cache Hit?}
    B -->|Yes| C[Return Cached Data]
    B -->|No| D[Fetch from Database]
    D --> E[Store in Cache]
    E --> F[Return Data]
    C --> G[Response]
    F --> G
```

---

## 📈 LUỒNG PERFORMANCE & OPTIMIZATION

### 1. Load Balancing Flow
```mermaid
sequenceDiagram
    participant U as User
    participant L as Load Balancer
    participant S1 as Server 1
    participant S2 as Server 2
    participant D as Database
    
    U->>L: Request
    L->>S1: Route request
    S1->>D: Query data
    D-->>S1: Data
    S1-->>L: Response
    L-->>U: Response
```

### 2. Database Optimization Flow
```mermaid
graph TD
    A[Query Request] --> B[Check Index]
    B --> C{Index Available?}
    C -->|Yes| D[Use Index]
    C -->|No| E[Full Table Scan]
    D --> F[Optimized Query]
    E --> F
    F --> G[Execute Query]
    G --> H[Return Results]
```

### 3. Memory Management
- **Garbage Collection**: Tự động dọn dẹp memory
- **Connection Pooling**: Quản lý database connections
- **Object Caching**: Cache frequently used objects
- **Memory Monitoring**: Theo dõi memory usage

---

## 🔒 LUỒNG BẢO MẬT

### 1. Security Flow
```mermaid
graph TD
    A[Incoming Request] --> B[Rate Limiting]
    B --> C[Input Validation]
    C --> D[Authentication]
    D --> E[Authorization]
    E --> F[Request Processing]
    F --> G[Response Sanitization]
    G --> H[Security Headers]
    H --> I[Response]
```

### 2. Data Encryption Flow
```mermaid
sequenceDiagram
    participant U as User
    participant A as API
    participant E as Encryption
    participant D as Database
    
    U->>A: Sensitive data
    A->>E: Encrypt data
    E->>D: Store encrypted
    D-->>A: Confirmation
    A-->>U: Success
```

### 3. Security Monitoring
- **Intrusion Detection**: Phát hiện xâm nhập
- **Anomaly Detection**: Phát hiện bất thường
- **Threat Intelligence**: Thông tin mối đe dọa
- **Incident Response**: Xử lý sự cố

---

## 📊 TÓM TẮT CÁC TRANG VÀ CHỨC NĂNG

### 🔐 Authentication Pages
| Trang | Chức năng | User Role | API Endpoints |
|-------|-----------|-----------|---------------|
| `/login` | Đăng nhập | All | POST /auth/login |
| `/logout` | Đăng xuất | All | POST /auth/logout |
| `/profile` | Thông tin cá nhân | All | GET /auth/me |

### 👥 Admin Management Pages
| Trang | Chức năng | User Role | API Endpoints |
|-------|-----------|-----------|---------------|
| `/admin/users` | Quản lý user | ADMIN | GET/POST/PUT/DELETE /admin/users |
| `/admin/roles` | Quản lý role | ADMIN | GET/POST/PUT/DELETE /admin/roles |
| `/admin/permissions` | Quản lý permission | ADMIN | GET /admin/permissions |
| `/admin/settings` | Cài đặt hệ thống | ADMIN | GET/PUT /admin/settings |
| `/admin/audit-logs` | Nhật ký hoạt động | ADMIN/MANAGER | GET /admin/audit-logs |
| `/admin/dashboard` | Dashboard admin | ADMIN/MANAGER | GET /admin/dashboard/stats |

### 📄 Contract Management Pages
| Trang | Chức năng | User Role | API Endpoints |
|-------|-----------|-----------|---------------|
| `/contracts` | Danh sách hợp đồng | All | GET /contracts |
| `/contracts/create` | Tạo hợp đồng | MANAGER/STAFF | POST /contracts |
| `/contracts/:id` | Chi tiết hợp đồng | All | GET /contracts/:id |
| `/contracts/:id/edit` | Sửa hợp đồng | MANAGER/STAFF | PUT /contracts/:id |
| `/contracts/drafts` | Bản nháp hợp đồng | All | GET /contracts/drafts |
| `/contracts/templates` | Template hợp đồng | All | GET /contracts/templates |

### 🎯 Contract Drafting Pages
| Trang | Chức năng | User Role | API Endpoints |
|-------|-----------|-----------|---------------|
| `/contracts/create/collection` | Chọn template | MANAGER/STAFF | GET /contracts/templates |
| `/contracts/create/draft` | Soạn thảo hợp đồng | MANAGER/STAFF | GET/PUT /contracts/drafts/:id |
| `/contracts/create/draft/stage-1` | Stage 1: Soạn thảo | MANAGER/STAFF | PUT /contracts/drafts/:id |
| `/contracts/create/draft/stage-2` | Stage 2: Milestones | MANAGER/STAFF | PUT /contracts/drafts/:id |
| `/contracts/create/draft/stage-3` | Stage 3: Notifications | MANAGER/STAFF | PUT /contracts/drafts/:id |
| `/contracts/create/draft/preview` | Stage 4: Preview | MANAGER/STAFF | POST /contracts/drafts/:id/publish |

### 🔔 Notification Pages
| Trang | Chức năng | User Role | API Endpoints |
|-------|-----------|-----------|---------------|
| `/notifications` | Danh sách thông báo | All | GET /notifications |
| `/notifications/settings` | Cài đặt thông báo | All | GET/PUT /notifications/settings |

### 📊 Report Pages
| Trang | Chức năng | User Role | API Endpoints |
|-------|-----------|-----------|---------------|
| `/reports/contracts` | Báo cáo hợp đồng | MANAGER/ADMIN | GET /reports/contracts |
| `/reports/users` | Báo cáo user | ADMIN | GET /reports/user-activity |
| `/reports/analytics` | Analytics | ADMIN | GET /reports/analytics |

---

## 🔄 LUỒNG TƯƠNG TÁC GIỮA CÁC TRANG

### 1. User Journey - Tạo Hợp Đồng
```mermaid
graph LR
    A[Login] --> B[Dashboard]
    B --> C[Contracts List]
    C --> D[Create Contract]
    D --> E[Choose Mode]
    E --> F[Template Selection]
    F --> G[Draft Editor]
    G --> H[Set Milestones]
    H --> I[Set Notifications]
    I --> J[Preview]
    J --> K[Publish]
    K --> L[Contract List]
```

### 2. User Journey - Quản Lý User (Admin)
```mermaid
graph LR
    A[Login] --> B[Admin Dashboard]
    B --> C[User Management]
    C --> D[User List]
    D --> E[Create User]
    E --> F[Assign Role]
    F --> G[Set Permissions]
    G --> H[Activate User]
    H --> I[User List]
```

### 3. User Journey - Xem Báo Cáo
```mermaid
graph LR
    A[Login] --> B[Dashboard]
    B --> C[Reports]
    C --> D[Choose Report Type]
    D --> E[Set Filters]
    E --> F[Generate Report]
    F --> G[View Results]
    G --> H[Export/Print]
```

---

## 📈 METRICS & MONITORING

### 1. Performance Metrics
- **Page Load Time**: < 2 seconds
- **API Response Time**: < 200ms
- **Database Query Time**: < 100ms
- **User Session Duration**: Average 45 minutes

### 2. Business Metrics
- **Contract Creation Rate**: 10-20 contracts/day
- **User Activity**: 80% daily active users
- **Approval Time**: Average 2-3 days
- **System Uptime**: 99.9%

### 3. Security Metrics
- **Failed Login Attempts**: < 5%
- **Security Incidents**: 0
- **Data Breaches**: 0
- **Compliance Score**: 100%

---

## 🎯 KẾT LUẬN

Hệ thống quản lý hợp đồng nội bộ có các đặc điểm chính:

### ✅ **Điểm mạnh**
1. **Workflow rõ ràng**: Luồng xử lý từ tạo đến phê duyệt hợp đồng
2. **Phân quyền chi tiết**: RBAC với granular permissions
3. **Audit trail đầy đủ**: Theo dõi mọi hoạt động
4. **UI/UX thân thiện**: Responsive design, intuitive navigation
5. **Performance tối ưu**: Caching, optimization, monitoring

### 🔧 **Cần cải thiện**
1. **Mobile experience**: Ứng dụng mobile native
2. **Advanced features**: AI integration, advanced analytics
3. **Integration**: Third-party integrations
4. **Scalability**: Microservices architecture

### 🚀 **Roadmap**
1. **Phase 2**: Hoàn thiện contract workflow, export/print, notifications
2. **Phase 3**: Mobile app, AI features, advanced analytics
3. **Future**: Multi-tenant, blockchain, IoT integration

Hệ thống đã có nền tảng vững chắc và sẵn sàng cho việc mở rộng và phát triển trong tương lai.