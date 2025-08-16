# Permission System Documentation

## Tổng quan

Hệ thống permission được thiết kế để kiểm soát quyền truy cập một cách linh hoạt và hiệu quả. Hệ thống hỗ trợ:

- **Role-based Access Control (RBAC)**: Phân quyền dựa trên vai trò
- **Permission-based Access Control**: Phân quyền dựa trên hành động cụ thể
- **Scope-based Access**: Phân quyền theo phạm vi (global, department, contract)
- **Conditional Access**: Phân quyền có điều kiện

## Components

### 1. PermissionGuard

Component chính để bảo vệ routes và UI elements.

```tsx
import { PermissionGuard } from '~/core/permissions';

<PermissionGuard
    permissions={[PERMISSION.CONTRACTS_CREATE]}
    roles={[ROLE.MANAGER]}
    requireAll={false}
    fallback={<Unauthorized />}
>
    <CreateContractButton />
</PermissionGuard>
```

### 2. RoleGuard

Component để kiểm tra role đơn giản.

```tsx
import { RoleGuard } from '~/core/permissions';

<RoleGuard roles={[ROLE.ADMIN, ROLE.MANAGER]}>
    <AdminPanel />
</RoleGuard>
```

### 3. PermissionCheck

Component để kiểm tra permission inline.

```tsx
import { PermissionCheck } from '~/components/Permission';

<PermissionCheck permission={PERMISSION.CONTRACTS_DELETE}>
    <DeleteButton />
</PermissionCheck>
```

### 4. MultiPermissionCheck

Component để kiểm tra nhiều permissions.

```tsx
import { MultiPermissionCheck } from '~/components/Permission';

<MultiPermissionCheck 
    permissions={[PERMISSION.CONTRACTS_READ, PERMISSION.CONTRACTS_UPDATE]}
    requireAll={true}
>
    <EditContractButton />
</MultiPermissionCheck>
```

## Hooks

### 1. usePermissions

Hook cơ bản để kiểm tra permissions.

```tsx
import { usePermissions } from '~/core/permissions';

const { hasPermission, hasRole, canAccess } = usePermissions();

if (hasPermission(PERMISSION.CONTRACTS_CREATE)) {
    // User can create contracts
}
```

### 2. usePermissionCache

Hook nâng cao với caching và quản lý state.

```tsx
import { usePermissionCache } from '~/hooks/usePermissionCache';

const {
    permissions,
    roles,
    effectivePermissions,
    hasPermission,
    refreshPermissions,
    canAccess
} = usePermissionCache();
```

## Routes Configuration

Cấu hình permission cho routes trong `routes.tsx`:

```tsx
export const privateRoutes: PrivateRoute[] = [
    {
        path: '/admin/users',
        component: UserManagement,
        layout: AdminLayout,
        access: {
            roles: [ROLE.ADMIN],
            permissions: [PERMISSION.USER_MANAGEMENT],
            requireAll: false, // Chỉ cần 1 trong 2 điều kiện
        },
    },
];
```

## Permission Constants

Định nghĩa permissions trong `auth.types.ts`:

```tsx
export const PERMISSION = {
    // Contract permissions
    CONTRACTS_READ: 'contracts_read',
    CONTRACTS_CREATE: 'contracts_create',
    CONTRACTS_UPDATE: 'contracts_update',
    CONTRACTS_DELETE: 'contracts_delete',
    CONTRACTS_MANAGE: 'contracts_manage',
    
    // Admin permissions
    ADMIN_ACCESS: 'admin_access',
    USER_MANAGEMENT: 'user_management',
    SYSTEM_SETTINGS: 'system_settings',
} as const;
```

## Role Constants

Định nghĩa roles:

```tsx
export const ROLE = {
    USER: 'USER',
    STAFF: 'STAFF',
    MANAGER: 'MANAGER',
    ADMIN: 'ADMIN',
} as const;
```

## Debug Components

### PermissionStatus

Hiển thị thông tin permission cơ bản:

```tsx
import { PermissionStatus } from '~/components/Permission';

<PermissionStatus showDetails={true} />
```

### PermissionDebug

Component debug chi tiết (chỉ dùng trong development):

```tsx
import { PermissionDebug } from '~/components/Permission';

<PermissionDebug />
```

## Best Practices

### 1. Sử dụng PermissionGuard cho Routes

```tsx
// ✅ Tốt
<PermissionGuard permissions={[PERMISSION.CONTRACTS_CREATE]}>
    <CreateContractPage />
</PermissionGuard>

// ❌ Không tốt
{hasPermission(PERMISSION.CONTRACTS_CREATE) && <CreateContractPage />}
```

### 2. Sử dụng PermissionCheck cho UI Elements

```tsx
// ✅ Tốt
<PermissionCheck permission={PERMISSION.CONTRACTS_DELETE}>
    <DeleteButton />
</PermissionCheck>

// ❌ Không tốt
{hasPermission(PERMISSION.CONTRACTS_DELETE) && <DeleteButton />}
```

### 3. Kết hợp Role và Permission

```tsx
// ✅ Tốt - Linh hoạt
<PermissionGuard 
    roles={[ROLE.MANAGER]}
    permissions={[PERMISSION.CONTRACTS_APPROVE]}
    requireAll={false}
>
    <ApproveButton />
</PermissionGuard>
```

### 4. Sử dụng Fallback

```tsx
<PermissionGuard 
    permissions={[PERMISSION.CONTRACTS_DELETE]}
    fallback={<ReadOnlyView />}
>
    <EditForm />
</PermissionGuard>
```

## Performance Optimization

### 1. Sử dụng usePermissionCache

```tsx
// ✅ Tốt - Có cache
const { hasPermission } = usePermissionCache();

// ❌ Không tốt - Không có cache
const { hasPermission } = usePermissions();
```

### 2. Tránh re-render không cần thiết

```tsx
// ✅ Tốt - Memoize permission checks
const canEdit = useMemo(() => 
    hasPermission(PERMISSION.CONTRACTS_UPDATE), 
    [hasPermission]
);

// ❌ Không tốt - Check mỗi lần render
const canEdit = hasPermission(PERMISSION.CONTRACTS_UPDATE);
```

## Error Handling

### 1. Graceful Degradation

```tsx
<PermissionGuard 
    permissions={[PERMISSION.CONTRACTS_DELETE]}
    fallback={<div>You don't have permission to delete contracts</div>}
>
    <DeleteButton />
</PermissionGuard>
```

### 2. Loading States

```tsx
const { isLoading, error } = usePermissionCache();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

## Testing

### 1. Unit Tests

```tsx
import { render, screen } from '@testing-library/react';
import { PermissionGuard } from '~/core/permissions';

test('shows content when user has permission', () => {
    render(
        <PermissionGuard permissions={[PERMISSION.CONTRACTS_CREATE]}>
            <div>Create Contract</div>
        </PermissionGuard>
    );
    
    expect(screen.getByText('Create Contract')).toBeInTheDocument();
});
```

### 2. Integration Tests

```tsx
test('redirects to unauthorized when no permission', () => {
    render(
        <MemoryRouter>
            <PermissionGuard permissions={[PERMISSION.ADMIN_ACCESS]}>
                <AdminPage />
            </PermissionGuard>
        </MemoryRouter>
    );
    
    expect(screen.getByText('Unauthorized')).toBeInTheDocument();
});
```

## Migration Guide

### Từ hệ thống cũ

1. Thay thế role checks:
```tsx
// Cũ
{user.role === 'ADMIN' && <AdminPanel />}

// Mới
<RoleGuard roles={[ROLE.ADMIN]}>
    <AdminPanel />
</RoleGuard>
```

2. Thay thế permission checks:
```tsx
// Cũ
{user.permissions.admin_access && <AdminPanel />}

// Mới
<PermissionGuard permissions={[PERMISSION.ADMIN_ACCESS]}>
    <AdminPanel />
</PermissionGuard>
```

## Troubleshooting

### 1. Permission không hoạt động

- Kiểm tra user có được load permissions chưa
- Kiểm tra permission string có đúng format không
- Sử dụng PermissionDebug component để debug

### 2. Performance issues

- Sử dụng usePermissionCache thay vì usePermissions
- Tránh check permissions trong render loops
- Sử dụng React.memo cho components có permission checks

### 3. Cache issues

- Gọi refreshPermissions() khi cần update permissions
- Kiểm tra cache duration có phù hợp không
- Clear cache khi user logout