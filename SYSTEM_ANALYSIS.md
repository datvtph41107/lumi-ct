# PHÂN TÍCH HỆ THỐNG QUẢN LÝ HỢP ĐỒNG

## 1. TỔNG QUAN HỆ THỐNG

### 1.1 Kiến trúc tổng thể
- **Frontend**: React + TypeScript + Vite
- **Backend**: NestJS + TypeORM + MySQL
- **Authentication**: JWT + HTTPOnly Cookies
- **Authorization**: RBAC (Role-Based Access Control)
- **Queue System**: BullMQ + Redis
- **Real-time**: WebSocket (có thể mở rộng)

### 1.2 Các module chính
1. **Authentication & Authorization**
2. **Contract Management**
3. **User Management**
4. **Notification System**
5. **Audit Logging**
6. **Admin Dashboard**

## 2. PHÂN TÍCH ENTITY

### 2.1 Entity đã được cải thiện

#### ✅ Contract Entity
```typescript
@Entity('contracts')
export class Contract extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'enum', enum: ContractStatus, default: ContractStatus.DRAFT })
    status: ContractStatus;

    @Column({ type: 'enum', enum: ContractPriority, default: ContractPriority.MEDIUM })
    priority: ContractPriority;

    @Column({ type: 'enum', enum: ContractMode, nullable: true })
    mode?: ContractMode;

    @Column({ type: 'varchar', length: 50, nullable: true })
    current_stage?: string;

    @Column({ type: 'int', default: 1 })
    version: number;

    @Column({ type: 'boolean', default: true })
    auto_save_enabled: boolean;

    @Column({ type: 'boolean', default: false })
    is_draft: boolean;

    // Audit fields
    @Column({ type: 'char', length: 36, nullable: true })
    created_by?: string;

    @Column({ type: 'char', length: 36, nullable: true })
    updated_by?: string;

    @Column({ type: 'datetime', nullable: true })
    deleted_at?: Date;
}
```

#### ✅ User Entity (Đã cải thiện)
```typescript
@Entity('users')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    username: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone?: string;

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
    status: UserStatus;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Column({ type: 'bigint', nullable: true })
    department_id?: number;

    @Column({ type: 'json', nullable: true })
    role_ids?: string[]; // Array of role UUIDs for RBAC

    @Column({ type: 'json', nullable: true })
    permissions?: string[]; // Array of permission strings

    @Column({ type: 'json', nullable: true })
    settings?: Record<string, any>; // User preferences
}
```

#### ✅ Role Entity (Không dùng mối quan hệ)
```typescript
@Entity('roles')
export class Role extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;

    @Column({ type: 'varchar', length: 150, nullable: true })
    display_name?: string;

    @Column({ type: 'varchar', length: 50, default: 'global' })
    scope: string; // global, department, contract

    @Column({ type: 'bigint', nullable: true })
    scope_id?: number; // department_id or contract_id

    @Column({ type: 'json', nullable: true })
    permissions?: string[]; // Array of permission strings (resource:action)

    @Column({ type: 'json', nullable: true })
    conditions?: Record<string, any>; // Role-specific conditions
}
```

#### ✅ Permission Entity
```typescript
@Entity('permissions')
export class Permission extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    resource: string; // contract, user, notification, etc.

    @Column({ type: 'varchar', length: 100 })
    action: string; // create, read, update, delete, approve, etc.

    @Column({ type: 'varchar', length: 150, nullable: true })
    display_name?: string;

    @Column({ type: 'json', nullable: true })
    conditions_schema?: Record<string, any>; // JSON schema for conditions
}
```

#### ✅ UserRoleMapping Entity (Mới)
```typescript
@Entity('user_role_mappings')
export class UserRoleMapping extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    user_id: number;

    @Column({ type: 'uuid' })
    role_id: string;

    @Column({ type: 'varchar', length: 50, default: 'global' })
    scope: string; // global, department, contract

    @Column({ type: 'bigint', nullable: true })
    scope_id?: number; // department_id or contract_id

    @Column({ type: 'datetime', nullable: true })
    expires_at?: Date;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'json', nullable: true })
    conditions?: Record<string, any>; // Role-specific conditions for this user
}
```

### 2.2 Ưu điểm của thiết kế mới
- ✅ **Không sử dụng mối quan hệ phức tạp**
- ✅ **Linh hoạt với JSON fields**
- ✅ **Hỗ trợ scope-based permissions**
- ✅ **Dễ dàng mở rộng**
- ✅ **Performance tốt hơn**
- ✅ **Audit trail đầy đủ**

## 3. LUỒNG HOẠT ĐỘNG CHÍNH

### 3.1 Soạn thảo & Quản lý hợp đồng

#### Stage 1: Draft
```typescript
// Tạo hợp đồng mới
const contract = {
    name: "Hợp đồng mua bán",
    contract_type: "purchase",
    category: "commercial",
    mode: ContractMode.EDITOR,
    current_stage: "draft",
    is_draft: true,
    auto_save_enabled: true
};

// Auto-save khi chuyển stage
const autoSave = async (contractId: string, content: any) => {
    await contractService.updateDraft(contractId, content);
    await auditLogService.log('contract_auto_save', { contractId });
};
```

#### Stage 2: Milestones & Tasks
```typescript
// Tạo milestones
const milestone = {
    contract_id: contractId,
    name: "Ký kết hợp đồng",
    start_date: new Date(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    priority: "high",
    assigned_to: userId
};

// Tạo tasks
const task = {
    milestone_id: milestoneId,
    name: "Chuẩn bị tài liệu",
    description: "Chuẩn bị các tài liệu cần thiết",
    estimated_hours: 4,
    assigned_to: userId,
    dependencies: [taskId1, taskId2]
};
```

#### Stage 3: Notifications
```typescript
// Thiết lập notification rules
const notificationRule = {
    contract_id: contractId,
    event_type: "milestone_due",
    channels: ["email", "push"],
    frequency: "daily",
    recipients: [userId1, userId2],
    conditions: {
        days_before: 3,
        working_hours_only: true
    }
};
```

#### Stage 4: Preview/Review
```typescript
// Preview hợp đồng
const preview = await contractService.generatePreview(contractId);

// Submit for review
const review = await contractService.submitForReview(contractId, {
    reviewer_id: managerId,
    comments: "Vui lòng kiểm tra lại điều khoản"
});
```

### 3.2 Phê duyệt
```typescript
// Approve/Reject/Request Changes
const approval = await contractService.processApproval(contractId, {
    action: "approve", // approve | reject | request_changes
    approver_id: managerId,
    comments: "Hợp đồng đã được phê duyệt",
    changes_requested: [] // nếu request_changes
});

// Audit log
await auditLogService.log('contract_approved', {
    contractId,
    approverId: managerId,
    action: "approve"
});
```

### 3.3 Export/Print
```typescript
// Export PDF/DOCX/HTML
const exportContract = async (contractId: string, format: 'pdf' | 'docx' | 'html') => {
    const result = await contractService.export(contractId, format);
    
    // Audit log
    await auditLogService.log('contract_exported', {
        contractId,
        format,
        exportedBy: userId
    });
    
    return result;
};

// Print (ẩn sidebar)
const printContract = async (contractId: string) => {
    const printData = await contractService.getPrintData(contractId);
    
    // Audit log
    await auditLogService.log('contract_printed', {
        contractId,
        printedBy: userId
    });
    
    return printData;
};
```

## 4. HỆ THỐNG PERMISSION (CLIENT)

### 4.1 Components đã tạo

#### PermissionGuard
```typescript
<PermissionGuard
    permissions={[PERMISSION.CONTRACTS_CREATE]}
    roles={[ROLE.MANAGER]}
    requireAll={false}
    fallback={<Unauthorized />}
>
    <CreateContractButton />
</PermissionGuard>
```

#### RoleGuard
```typescript
<RoleGuard roles={[ROLE.ADMIN, ROLE.MANAGER]}>
    <AdminPanel />
</RoleGuard>
```

#### PermissionCheck
```typescript
<PermissionCheck permission={PERMISSION.CONTRACTS_DELETE}>
    <DeleteButton />
</PermissionCheck>
```

### 4.2 Hooks

#### usePermissions
```typescript
const { hasPermission, hasRole, canAccess } = usePermissions();

if (hasPermission(PERMISSION.CONTRACTS_CREATE)) {
    // User can create contracts
}
```

#### usePermissionCache
```typescript
const {
    permissions,
    roles,
    effectivePermissions,
    hasPermission,
    refreshPermissions,
    canAccess
} = usePermissionCache();
```

### 4.3 Routes Configuration
```typescript
export const privateRoutes: PrivateRoute[] = [
    {
        path: '/admin/users',
        component: UserManagement,
        layout: AdminLayout,
        access: {
            roles: [ROLE.ADMIN],
            permissions: [PERMISSION.USER_MANAGEMENT],
            requireAll: false,
        },
    },
    {
        path: '/contracts/create',
        component: CreateContract,
        layout: CreateContractLayout,
        access: {
            permissions: [PERMISSION.CONTRACTS_CREATE],
        },
    },
];
```

## 5. THÔNG BÁO & NHẮC HẠN

### 5.1 Global Settings
```typescript
const globalSettings = {
    notifications: {
        channels: {
            email: { enabled: true, config: { /* SMTP config */ } },
            sms: { enabled: false, config: { /* SMS config */ } },
            push: { enabled: true, config: { /* Push config */ } },
            in_app: { enabled: true, config: { /* In-app config */ } }
        },
        working_hours: {
            start: "09:00",
            end: "18:00",
            timezone: "Asia/Ho_Chi_Minh"
        },
        quiet_hours: {
            start: "22:00",
            end: "07:00"
        },
        escalation: {
            enabled: true,
            levels: [
                { delay_minutes: 30, notify_managers: true },
                { delay_minutes: 60, notify_admins: true }
            ]
        }
    }
};
```

### 5.2 Notification Rules
```typescript
const notificationRule = {
    contract_id: contractId,
    event_type: "milestone_due", // start, end, overdue, completed, assigned
    trigger: "before_due", // before_due, on_due, after_due
    frequency: "daily", // once, daily, hourly
    recipients: [userId1, userId2],
    channels: ["email", "push"],
    conditions: {
        days_before: 3,
        working_hours_only: true,
        skip_weekends: true
    }
};
```

### 5.3 Queue System
```typescript
// Cron job để quét notifications
const notificationCron = new CronJob('*/5 * * * *', async () => {
    const pendingNotifications = await notificationService.getPendingNotifications();
    
    for (const notification of pendingNotifications) {
        await notificationQueue.add('send-notification', {
            notificationId: notification.id,
            retryAttempts: 3
        });
    }
});

// Queue worker
const notificationWorker = new Worker('send-notification', async (job) => {
    const { notificationId } = job.data;
    
    try {
        await notificationService.sendNotification(notificationId);
        await auditLogService.log('notification_sent', { notificationId });
    } catch (error) {
        await auditLogService.log('notification_failed', { 
            notificationId, 
            error: error.message 
        });
        throw error;
    }
});
```

## 6. AUDIT LOG

### 6.1 Audit Events
```typescript
const auditEvents = {
    // Contract events
    'contract_created': { contractId, createdBy },
    'contract_updated': { contractId, updatedBy, changes },
    'contract_deleted': { contractId, deletedBy },
    'contract_approved': { contractId, approverId, action },
    'contract_exported': { contractId, format, exportedBy },
    'contract_printed': { contractId, printedBy },
    
    // User events
    'user_login': { userId, ip, userAgent },
    'user_logout': { userId },
    'user_created': { userId, createdBy },
    'user_updated': { userId, updatedBy, changes },
    'user_deleted': { userId, deletedBy },
    
    // Permission events
    'role_assigned': { userId, roleId, assignedBy },
    'role_removed': { userId, roleId, removedBy },
    'permission_granted': { userId, permission, grantedBy },
    'permission_revoked': { userId, permission, revokedBy },
    
    // System events
    'system_settings_updated': { setting, updatedBy, oldValue, newValue },
    'backup_created': { backupId, createdBy },
    'maintenance_mode_toggled': { enabled, toggledBy }
};
```

### 6.2 Audit Service
```typescript
class AuditLogService {
    async log(event: string, data: Record<string, any>) {
        const auditLog = {
            event,
            data,
            user_id: this.getCurrentUserId(),
            ip_address: this.getClientIP(),
            user_agent: this.getUserAgent(),
            timestamp: new Date()
        };
        
        await this.auditLogRepository.save(auditLog);
    }
    
    async search(filters: AuditSearchFilters) {
        return await this.auditLogRepository.find({
            where: this.buildSearchQuery(filters),
            order: { timestamp: 'DESC' },
            skip: filters.offset,
            take: filters.limit
        });
    }
    
    async getSummary() {
        return {
            actions_by_type: await this.getActionsByType(),
            top_users: await this.getTopUsers(),
            recent_activity: await this.getRecentActivity()
        };
    }
}
```

## 7. QUẢN TRỊ HỆ THỐNG (ADMIN)

### 7.1 User Management
```typescript
// CRUD Users
const userManagement = {
    list: async (filters: UserFilters) => {
        return await userService.list(filters);
    },
    
    create: async (userData: CreateUserDto) => {
        const user = await userService.create(userData);
        await auditLogService.log('user_created', { userId: user.id });
        return user;
    },
    
    update: async (userId: number, userData: UpdateUserDto) => {
        const oldData = await userService.findById(userId);
        const user = await userService.update(userId, userData);
        await auditLogService.log('user_updated', { 
            userId, 
            changes: this.getChanges(oldData, user) 
        });
        return user;
    },
    
    delete: async (userId: number) => {
        await userService.delete(userId);
        await auditLogService.log('user_deleted', { userId });
    },
    
    assignRole: async (userId: number, roleId: string, scope?: string) => {
        await userService.assignRole(userId, roleId, scope);
        await auditLogService.log('role_assigned', { userId, roleId, scope });
    }
};
```

### 7.2 Role & Permission Management
```typescript
// CRUD Roles
const roleManagement = {
    list: async () => {
        return await roleService.list();
    },
    
    create: async (roleData: CreateRoleDto) => {
        const role = await roleService.create(roleData);
        await auditLogService.log('role_created', { roleId: role.id });
        return role;
    },
    
    update: async (roleId: string, roleData: UpdateRoleDto) => {
        const role = await roleService.update(roleId, roleData);
        await auditLogService.log('role_updated', { roleId });
        return role;
    },
    
    setPermissions: async (roleId: string, permissions: string[]) => {
        await roleService.setPermissions(roleId, permissions);
        await auditLogService.log('role_permissions_updated', { roleId, permissions });
    }
};
```

### 7.3 System Notifications
```typescript
// System notification settings
const systemNotifications = {
    getSettings: async () => {
        return await notificationService.getSystemSettings();
    },
    
    updateSettings: async (settings: SystemNotificationSettings) => {
        const oldSettings = await notificationService.getSystemSettings();
        await notificationService.updateSystemSettings(settings);
        await auditLogService.log('system_settings_updated', { 
            setting: 'notifications',
            oldValue: oldSettings,
            newValue: settings
        });
    },
    
    testSend: async (channel: string, recipients: string[]) => {
        await notificationService.testSend(channel, recipients);
        await auditLogService.log('test_notification_sent', { channel, recipients });
    }
};
```

## 8. DÒNG ĐỜI NGƯỜI DÙNG & PHIÊN

### 8.1 Authentication Flow
```typescript
// Login
const login = async (credentials: LoginRequest) => {
    const user = await authService.validateCredentials(credentials);
    const token = await authService.generateToken(user);
    
    // Set HTTPOnly cookie
    res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    await auditLogService.log('user_login', { 
        userId: user.id, 
        ip: req.ip 
    });
    
    return { user, token };
};

// Session management
const sessionMiddleware = async (req, res, next) => {
    const token = req.cookies.accessToken;
    
    if (token) {
        try {
            const user = await authService.validateToken(token);
            req.user = user;
            
            // Update last activity
            await userService.updateLastActivity(user.id);
        } catch (error) {
            res.clearCookie('accessToken');
        }
    }
    
    next();
};
```

### 8.2 Idle Timeout
```typescript
// Client-side idle detection
const useInactiveTimeout = ({ onWarning, onLogout }) => {
    const [isWarningVisible, setIsWarningVisible] = useState(false);
    const [timeUntilLogout, setTimeUntilLogout] = useState(0);
    
    useEffect(() => {
        let warningTimer: NodeJS.Timeout;
        let logoutTimer: NodeJS.Timeout;
        
        const resetTimers = () => {
            clearTimeout(warningTimer);
            clearTimeout(logoutTimer);
            
            warningTimer = setTimeout(() => {
                setIsWarningVisible(true);
                setTimeUntilLogout(60); // 60 seconds warning
                
                const countdown = setInterval(() => {
                    setTimeUntilLogout(prev => {
                        if (prev <= 1) {
                            clearInterval(countdown);
                            onLogout();
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
                
            }, 14 * 60 * 1000); // 14 minutes idle
            
            logoutTimer = setTimeout(() => {
                onLogout();
            }, 15 * 60 * 1000); // 15 minutes total
        };
        
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, resetTimers, true);
        });
        
        resetTimers();
        
        return () => {
            clearTimeout(warningTimer);
            clearTimeout(logoutTimer);
            events.forEach(event => {
                document.removeEventListener(event, resetTimers, true);
            });
        };
    }, [onWarning, onLogout]);
    
    return { isWarningVisible, timeUntilLogout };
};
```

## 9. LUỒNG DỮ LIỆU TIÊU BIỂU

### 9.1 Tạo hợp đồng từ template
```typescript
// 1. User chọn template
const template = await templateService.findById(templateId);

// 2. Tạo nháp
const draft = await contractService.createFromTemplate(templateId, {
    name: "Hợp đồng mới",
    drafter_id: userId
});

// 3. Vào Editor
const editorData = await contractService.getEditorData(draft.id);

// 4. Soạn thảo, lưu nháp
await contractService.saveDraft(draft.id, content);

// 5. Thêm collaborator
await collaboratorService.addCollaborator(draft.id, {
    user_id: collaboratorId,
    role: CollaboratorRole.REVIEWER
});

// 6. Thiết lập milestones/tasks
await milestoneService.createMilestones(draft.id, milestones);

// 7. Thiết lập notifications
await notificationService.setupContractNotifications(draft.id, rules);

// 8. Preview → Export → Submit review
const preview = await contractService.generatePreview(draft.id);
await contractService.submitForReview(draft.id, { reviewer_id: managerId });

// 9. Manager approve/reject
const approval = await contractService.processApproval(draft.id, {
    action: "approve",
    approver_id: managerId
});

// 10. Notifications gửi theo rule
await notificationService.triggerContractEvent(draft.id, "approved");
```

### 9.2 Nhắc hạn mốc/task
```typescript
// 1. Cron quét mốc/task due/overdue
const checkDueItems = async () => {
    const dueMilestones = await milestoneService.getDueMilestones();
    const dueTasks = await taskService.getDueTasks();
    
    for (const milestone of dueMilestones) {
        await notificationQueue.add('milestone-reminder', {
            milestoneId: milestone.id,
            type: 'due'
        });
    }
    
    for (const task of dueTasks) {
        await notificationQueue.add('task-reminder', {
            taskId: task.id,
            type: 'due'
        });
    }
};

// 2. Queue gửi notifications
const notificationWorker = new Worker('milestone-reminder', async (job) => {
    const { milestoneId, type } = job.data;
    
    const rules = await notificationService.getMilestoneNotificationRules(milestoneId);
    
    for (const rule of rules) {
        if (rule.event_type === type) {
            await notificationService.sendNotification({
                type: 'milestone_reminder',
                recipients: rule.recipients,
                channels: rule.channels,
                data: { milestoneId, type }
            });
        }
    }
});

// 3. Ghi log và cập nhật trạng thái
await auditLogService.log('reminder_sent', {
    type: 'milestone',
    milestoneId,
    recipients: rule.recipients
});
```

### 9.3 Phân quyền
```typescript
// 1. Admin tạo role
const contractManagerRole = await roleService.create({
    name: 'contract_manager',
    display_name: 'Contract Manager',
    permissions: [
        'contract:create',
        'contract:read',
        'contract:update',
        'contract:approve',
        'contract:export'
    ],
    scope: 'department'
});

// 2. Gán role cho user
await userService.assignRole(userId, contractManagerRole.id, {
    scope: 'department',
    scope_id: departmentId
});

// 3. UI sử dụng PermissionGuard
<PermissionGuard permissions={[PERMISSION.CONTRACTS_APPROVE]}>
    <ApproveButton />
</PermissionGuard>

// 4. API guard xác thực quyền
@UseGuards(PermissionGuard)
@Post(':id/approve')
async approveContract(
    @Param('id') contractId: string,
    @Body() approvalData: ApprovalDto,
    @User() user: UserEntity
) {
    // Kiểm tra quyền
    if (!this.permissionService.can(user, 'contract:approve', { contractId })) {
        throw new ForbiddenException('Insufficient permissions');
    }
    
    return await this.contractService.approve(contractId, approvalData);
}
```

## 10. KẾT NỐI CLIENT-SERVER

### 10.1 RBAC Services
```typescript
// Client: admin-rbac.service.ts
class AdminRbacService extends BaseService {
    async listRoles(): Promise<ApiResponse<RoleListResponse>> {
        return await this.request.private.get<RoleListResponse>('/admin/roles');
    }
    
    async createRole(role: Partial<RoleDto>): Promise<ApiResponse<RoleDto>> {
        return await this.request.private.post<RoleDto, Partial<RoleDto>>('/admin/roles', role);
    }
    
    async setRolePermissions(roleId: string, bindings: PermissionBinding[]): Promise<ApiResponse<{ success: boolean }>> {
        return await this.request.private.put<{ success: boolean }, { permissions: PermissionBinding[] }>(
            `/admin/roles/${roleId}/permissions`,
            { permissions: bindings }
        );
    }
}

// Server: AdminController
@Controller('admin')
export class AdminController {
    @Get('roles')
    async listRoles(): Promise<RoleListResponse> {
        return await this.adminService.listRoles();
    }
    
    @Post('roles')
    async createRole(@Body() roleData: CreateRoleDto): Promise<RoleDto> {
        return await this.adminService.createRole(roleData);
    }
    
    @Put('roles/:id/permissions')
    async setRolePermissions(
        @Param('id') roleId: string,
        @Body() data: { permissions: PermissionBinding[] }
    ): Promise<{ success: boolean }> {
        return await this.adminService.setRolePermissions(roleId, data.permissions);
    }
}
```

### 10.2 Notification Services
```typescript
// Client: notification-settings.service.ts
class NotificationSettingsService extends BaseService {
    async getSystemSettings(): Promise<ApiResponse<SystemNotificationSettings>> {
        return await this.request.private.get<SystemNotificationSettings>('/notifications/settings');
    }
    
    async updateSystemSettings(settings: SystemNotificationSettings): Promise<ApiResponse<{ success: boolean }>> {
        return await this.request.private.put<{ success: boolean }, SystemNotificationSettings>(
            '/notifications/settings',
            settings
        );
    }
}

// Server: NotificationController
@Controller('notifications')
export class NotificationController {
    @Get('settings')
    async getSystemSettings(): Promise<SystemNotificationSettings> {
        return await this.notificationService.getSystemSettings();
    }
    
    @Put('settings')
    async updateSystemSettings(@Body() settings: SystemNotificationSettings): Promise<{ success: boolean }> {
        return await this.notificationService.updateSystemSettings(settings);
    }
}
```

### 10.3 Contract Services
```typescript
// Client: contract.service.ts
class ContractService extends BaseService {
    async createContract(contractData: CreateContractDto): Promise<ApiResponse<ContractDto>> {
        return await this.request.private.post<ContractDto, CreateContractDto>('/contracts', contractData);
    }
    
    async exportContract(contractId: string, format: 'pdf' | 'docx' | 'html'): Promise<ApiResponse<{ url: string }>> {
        return await this.request.private.get<{ url: string }>(`/contracts/${contractId}/export/${format}`);
    }
    
    async submitForReview(contractId: string, reviewData: SubmitReviewDto): Promise<ApiResponse<{ success: boolean }>> {
        return await this.request.private.post<{ success: boolean }, SubmitReviewDto>(
            `/contracts/${contractId}/submit-review`,
            reviewData
        );
    }
}

// Server: ContractController
@Controller('contracts')
export class ContractController {
    @Post()
    async createContract(@Body() contractData: CreateContractDto, @User() user: UserEntity): Promise<ContractDto> {
        return await this.contractService.create(contractData, user);
    }
    
    @Get(':id/export/:format')
    async exportContract(
        @Param('id') contractId: string,
        @Param('format') format: string,
        @User() user: UserEntity
    ): Promise<{ url: string }> {
        return await this.contractService.export(contractId, format, user);
    }
    
    @Post(':id/submit-review')
    async submitForReview(
        @Param('id') contractId: string,
        @Body() reviewData: SubmitReviewDto,
        @User() user: UserEntity
    ): Promise<{ success: boolean }> {
        return await this.contractService.submitForReview(contractId, reviewData, user);
    }
}
```

## 11. VIỆC CÒN LẠI

### 11.1 Migration & Seed
```typescript
// Tạo migration cho roles/permissions mặc định
export class CreateDefaultRolesAndPermissions implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo permissions
        const permissions = [
            { resource: 'contract', action: 'create', display_name: 'Create Contracts' },
            { resource: 'contract', action: 'read', display_name: 'Read Contracts' },
            { resource: 'contract', action: 'update', display_name: 'Update Contracts' },
            { resource: 'contract', action: 'delete', display_name: 'Delete Contracts' },
            { resource: 'contract', action: 'approve', display_name: 'Approve Contracts' },
            { resource: 'contract', action: 'export', display_name: 'Export Contracts' },
            { resource: 'user', action: 'manage', display_name: 'Manage Users' },
            { resource: 'system', action: 'settings', display_name: 'System Settings' }
        ];
        
        for (const permission of permissions) {
            await queryRunner.query(
                'INSERT INTO permissions (resource, action, display_name, is_system) VALUES (?, ?, ?, ?)',
                [permission.resource, permission.action, permission.display_name, true]
            );
        }
        
        // Tạo roles
        const roles = [
            {
                name: 'admin',
                display_name: 'Administrator',
                permissions: ['contract:create', 'contract:read', 'contract:update', 'contract:delete', 'contract:approve', 'contract:export', 'user:manage', 'system:settings'],
                is_system: true
            },
            {
                name: 'manager',
                display_name: 'Manager',
                permissions: ['contract:create', 'contract:read', 'contract:update', 'contract:approve', 'contract:export'],
                is_system: true
            },
            {
                name: 'staff',
                display_name: 'Staff',
                permissions: ['contract:create', 'contract:read', 'contract:update'],
                is_system: true
            }
        ];
        
        for (const role of roles) {
            await queryRunner.query(
                'INSERT INTO roles (name, display_name, permissions, is_system) VALUES (?, ?, ?, ?)',
                [role.name, role.display_name, JSON.stringify(role.permissions), role.is_system]
            );
        }
    }
}

// Tạo admin user mặc định
export class CreateDefaultAdminUser implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await queryRunner.query(
            'INSERT INTO users (name, username, email, password, role, is_active, is_system) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['System Administrator', 'admin', 'admin@company.com', hashedPassword, 'admin', true, true]
        );
    }
}
```

### 11.2 Docker Configuration
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: contract_management
      MYSQL_USER: contract_user
      MYSQL_PASSWORD: contract_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - contract_network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - contract_network

  server:
    build:
      context: ./server
      dockerfile: Dockerfile.dev
    environment:
      - NODE_ENV=development
      - DATABASE_HOST=mysql
      - DATABASE_PORT=3306
      - DATABASE_NAME=contract_management
      - DATABASE_USER=contract_user
      - DATABASE_PASSWORD=contract_password
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    ports:
      - "3000:3000"
    volumes:
      - ./server:/app
      - /app/node_modules
    depends_on:
      - mysql
      - redis
    networks:
      - contract_network

  client:
    build:
      context: ./client
      dockerfile: Dockerfile.dev
    environment:
      - VITE_API_URL=http://localhost:3000
    ports:
      - "5173:5173"
    volumes:
      - ./client:/app
      - /app/node_modules
    networks:
      - contract_network

volumes:
  mysql_data:
  redis_data:

networks:
  contract_network:
    driver: bridge
```

### 11.3 Environment Variables
```bash
# .env.example (Server)
NODE_ENV=development
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=contract_management
DATABASE_USER=contract_user
DATABASE_PASSWORD=contract_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m

# File Upload
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=10485760

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS (optional)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Push Notifications (optional)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

```bash
# .env.example (Client)
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Contract Management System
VITE_APP_VERSION=1.0.0
```

### 11.4 BullMQ Integration
```typescript
// Queue configuration
import { Queue, Worker, QueueScheduler } from 'bullmq';

// Notification Queue
const notificationQueue = new Queue('notifications', {
    connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT)
    }
});

// Export Queue
const exportQueue = new Queue('exports', {
    connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT)
    }
});

// Notification Worker
const notificationWorker = new Worker('notifications', async (job) => {
    const { type, data } = job.data;
    
    switch (type) {
        case 'email':
            await emailService.send(data);
            break;
        case 'sms':
            await smsService.send(data);
            break;
        case 'push':
            await pushService.send(data);
            break;
        case 'in_app':
            await inAppService.send(data);
            break;
    }
}, {
    connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT)
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000
        }
    }
});

// Export Worker
const exportWorker = new Worker('exports', async (job) => {
    const { contractId, format, userId } = job.data;
    
    const contract = await contractService.findById(contractId);
    const exportData = await exportService.generate(contract, format);
    
    // Upload to cloud storage
    const url = await fileService.upload(exportData, `exports/${contractId}.${format}`);
    
    // Notify user
    await notificationQueue.add('in_app', {
        userId,
        title: 'Export Completed',
        message: `Your contract export is ready: ${url}`,
        data: { url }
    });
    
    return { url };
}, {
    connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT)
    }
});

// Queue Scheduler for delayed jobs
const scheduler = new QueueScheduler('notifications', {
    connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT)
    }
});
```

## 12. KẾT LUẬN

### 12.1 Điểm mạnh của hệ thống
- ✅ **Kiến trúc modular**: Dễ dàng mở rộng và bảo trì
- ✅ **Permission system linh hoạt**: Hỗ trợ RBAC và scope-based access
- ✅ **Audit trail đầy đủ**: Ghi nhận mọi hành động quan trọng
- ✅ **Notification system mạnh mẽ**: Hỗ trợ nhiều kênh và rule phức tạp
- ✅ **Performance optimized**: Caching, queue system, lazy loading
- ✅ **Security**: JWT, HTTPOnly cookies, permission guards
- ✅ **User experience**: Auto-save, idle timeout, responsive design

### 12.2 Các tính năng chính đã hoàn thiện
1. **Entity Design**: Không sử dụng mối quan hệ phức tạp
2. **Permission System**: Hoàn chỉnh với guards, hooks, components
3. **Route Protection**: Tích hợp permission vào routing
4. **Authentication**: JWT + session management
5. **Audit Logging**: Ghi nhận đầy đủ các hành động
6. **Notification Framework**: Hỗ trợ nhiều kênh và rule

### 12.3 Việc cần làm tiếp theo
1. **Migration & Seed**: Tạo dữ liệu mặc định
2. **Docker Setup**: Cấu hình development environment
3. **BullMQ Integration**: Queue system cho notifications/export
4. **API Integration**: Kết nối client-server thực tế
5. **Testing**: Unit tests và integration tests
6. **Documentation**: API documentation và user guides

Hệ thống đã được thiết kế với kiến trúc vững chắc và có thể mở rộng để đáp ứng các yêu cầu phức tạp của hệ thống quản lý hợp đồng doanh nghiệp.
