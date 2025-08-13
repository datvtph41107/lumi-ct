# Hướng dẫn sử dụng hệ thống Collaborator và Audit Log

## Tổng quan

Hệ thống collaborator và audit log đã được cải thiện với các tính năng sau:

### 1. Hệ thống Collaborator

#### Roles và Permissions
- **OWNER**: Có toàn quyền trên contract, có thể thêm/xóa/sửa collaborator
- **EDITOR**: Có thể chỉnh sửa contract, thêm/sửa/xóa files, milestones, tasks
- **REVIEWER**: Có thể xem và review contract, không thể chỉnh sửa
- **VIEWER**: Chỉ có thể xem contract

#### API Endpoints

##### Thêm Collaborator
```http
POST /contracts/{id}/collaborators
Content-Type: application/json

{
  "user_id": 123,
  "role": "editor"
}
```

##### Lấy danh sách Collaborators
```http
GET /contracts/{id}/collaborators
```

##### Cập nhật Collaborator
```http
PATCH /contracts/collaborators/{contract_id:user_id}
Content-Type: application/json

{
  "role": "reviewer",
  "active": true
}
```

##### Xóa Collaborator
```http
DELETE /contracts/collaborators/{contract_id:user_id}
```

#### Validation Rules
- Chỉ OWNER có thể thêm collaborator mới
- EDITOR có thể cập nhật/xóa VIEWER và REVIEWER
- Không thể xóa OWNER cuối cùng
- Không thể thêm user đã là collaborator

### 2. Hệ thống Audit Log

#### Các loại Action được ghi log
- `CREATE_CONTRACT`: Tạo contract mới
- `UPDATE_CONTRACT`: Cập nhật thông tin contract
- `ADD_COLLABORATOR`: Thêm collaborator
- `UPDATE_COLLABORATOR`: Cập nhật collaborator
- `REMOVE_COLLABORATOR`: Xóa collaborator
- `SAVE_STAGE`: Lưu stage
- `TRANSITION_STAGE`: Chuyển stage
- `UPLOAD_FILE`: Upload file
- `DELETE_FILE`: Xóa file
- `CREATE_MILESTONE`: Tạo milestone
- `UPDATE_MILESTONE`: Cập nhật milestone
- `CREATE_TASK`: Tạo task
- `UPDATE_TASK`: Cập nhật task
- `SOFT_DELETE`: Xóa mềm contract

#### API Endpoints

##### Lấy Audit Logs
```http
GET /contracts/{id}/audit
```

##### Lấy Audit Summary
```http
GET /contracts/{id}/audit/summary
```

##### Tìm kiếm Audit Logs
```http
GET /contracts/audit/search?contract_id={id}&user_id={user_id}&action={action}&start_date={date}&end_date={date}&limit=50&offset=0
```

### 3. Guards và Permissions

#### CollaboratorGuard
Kiểm tra quyền truy cập dựa trên role của user trong contract.

#### OwnerGuard
Chỉ cho phép OWNER truy cập.

#### EditorGuard
Cho phép OWNER và EDITOR truy cập.

#### PermissionGuard
Kiểm tra permission cụ thể dựa trên decorator.

#### Sử dụng Decorators

```typescript
// Yêu cầu role cụ thể
@RequireRoles(CollaboratorRole.OWNER, CollaboratorRole.EDITOR)
@UseGuards(CollaboratorGuard)
async someMethod() {}

// Yêu cầu permission cụ thể
@RequirePermission(PERMISSIONS.COLLABORATOR_ADD)
@UseGuards(PermissionGuard)
async addCollaborator() {}
```

### 4. Permission Matrix

Hệ thống sử dụng permission matrix để định nghĩa quyền:

```typescript
const permissionMatrix = {
  'contract:read': {
    [CollaboratorRole.OWNER]: ['*'],
    [CollaboratorRole.EDITOR]: ['*'],
    [CollaboratorRole.REVIEWER]: ['*'],
    [CollaboratorRole.VIEWER]: ['*'],
  },
  'collaborator:add': {
    [CollaboratorRole.OWNER]: ['*'],
  },
  // ... more permissions
};
```

### 5. Cách sử dụng trong Code

#### Trong Service
```typescript
// Kiểm tra permission
const hasPermission = await this.permissionService.hasPermission(
  contractId,
  userId,
  'collaborator:add'
);

// Kiểm tra có thể modify collaborator không
const canModify = await this.permissionService.canModifyCollaborator(
  contractId,
  currentUserId,
  targetUserId
);

// Lấy permissions của user
const permissions = await this.permissionService.getUserPermissions(
  contractId,
  userId
);
```

#### Trong Controller
```typescript
@Post(':id/collaborators')
@UseGuards(OwnerGuard) // Chỉ owner mới có thể thêm collaborator
async addCollaborator(
  @Param('id') id: string,
  @Body() dto: CreateCollaboratorDto,
  @CurrentUser() user: HeaderUserPayload,
) {
  return this.contractService.addCollaborator(id, dto, Number(user.sub));
}

@Get(':id/audit')
@RequirePermission(PERMISSIONS.AUDIT_READ)
@UseGuards(PermissionGuard)
async getAuditLogs(@Param('id') id: string) {
  return this.contractService.getAuditLogs(id);
}
```

### 6. Audit Log Format

Mỗi audit log entry có format:

```typescript
{
  id: string;
  contract_id: string;
  user_id: number;
  action: string;
  meta?: Record<string, any>;
  description?: string;
  created_at: Date;
  updated_at: Date;
  user?: {
    email: string;
    full_name: string;
    avatar?: string;
  };
}
```

### 7. Error Handling

Hệ thống có các error message rõ ràng:

- `Chỉ owner mới có thể thêm collaborator`
- `User đã là collaborator của contract này`
- `Không có quyền cập nhật collaborator này`
- `Không thể xóa owner cuối cùng`
- `You do not have permission: {permission}`

### 8. Best Practices

1. **Luôn sử dụng guards** để bảo vệ endpoints
2. **Ghi audit log** cho mọi thay đổi quan trọng
3. **Validate permission** trước khi thực hiện action
4. **Sử dụng DTOs** để validate input
5. **Kiểm tra role hierarchy** khi thay đổi role
6. **Backup audit logs** định kỳ
7. **Monitor permission changes** để phát hiện bất thường

### 9. Migration Notes

Nếu bạn đang upgrade từ version cũ:

1. Cập nhật imports cho các guard mới
2. Thay thế `CollaboratorGuard` bằng `OwnerGuard` hoặc `EditorGuard` phù hợp
3. Sử dụng `PermissionGuard` với decorator cho permission cụ thể
4. Cập nhật DTOs để sử dụng validation mới
5. Kiểm tra audit log format có tương thích không

### 10. Testing

```typescript
// Test permission
describe('PermissionService', () => {
  it('should allow owner to add collaborator', async () => {
    const hasPermission = await permissionService.hasPermission(
      contractId,
      ownerId,
      'collaborator:add'
    );
    expect(hasPermission).toBe(true);
  });
});

// Test audit log
describe('AuditLogService', () => {
  it('should create audit log for collaborator addition', async () => {
    const log = await auditService.create({
      contract_id: contractId,
      user_id: userId,
      action: 'ADD_COLLABORATOR',
      meta: { addedUserId: 123, role: 'editor' },
      description: 'Thêm collaborator mới với role editor'
    });
    expect(log.action).toBe('ADD_COLLABORATOR');
  });
});
```