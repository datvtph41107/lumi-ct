# Permission System Documentation

## Overview

This directory contains the permission and role-based access control (RBAC) system for the application. The system provides both permission-based and role-based guards for protecting components and routes.

## Components

### PermissionGuard

The main permission checking component that verifies if a user has specific permissions for a resource and action.

#### Props

- `children`: React.ReactNode - The content to render if permission is granted
- `resource`: string - The resource to check permissions for (e.g., 'contract', 'template')
- `action`: string - The action to check permissions for (e.g., 'create', 'read', 'update', 'delete')
- `context`: Record<string, any> - Optional context for conditional permissions
- `fallback`: React.ReactNode - Content to show when permission is denied (if showFallback is true)
- `showFallback`: boolean - Whether to show fallback content when permission is denied
- `loadingFallback`: React.ReactNode - Custom loading component
- `onPermissionDenied`: () => void - Callback when permission is denied

#### Usage

```tsx
import { PermissionGuard } from '~/core/auth/PermissionGuard';

<PermissionGuard 
    resource="contract" 
    action="create"
    context={{ contractType: 'service' }}
    fallback={<div>Access denied</div>}
    showFallback={true}
    onPermissionDenied={() => console.log('Permission denied')}
>
    <ContractForm />
</PermissionGuard>
```

### RoleGuard

A simpler role-based guard that checks if a user has a specific role.

#### Props

- `children`: React.ReactNode - The content to render if role is granted
- `role`: string - The role to check for
- `scope`: string - Optional scope for the role
- `scopeId`: number - Optional scope ID for the role
- `fallback`: React.ReactNode - Content to show when role is denied
- `onRoleDenied`: () => void - Callback when role is denied

#### Usage

```tsx
import { RoleGuard } from '~/core/auth/PermissionGuard';

<RoleGuard 
    role="contract_manager"
    fallback={<div>Manager access required</div>}
    onRoleDenied={() => console.log('Role denied')}
>
    <ManagerDashboard />
</RoleGuard>
```

## Pre-built Guards

### Contract Guards

- `ContractCreateGuard` - Checks contract creation permission
- `ContractReadGuard` - Checks contract read permission
- `ContractUpdateGuard` - Checks contract update permission
- `ContractDeleteGuard` - Checks contract delete permission
- `ContractApproveGuard` - Checks contract approval permission
- `ContractRejectGuard` - Checks contract rejection permission

### Template Guards

- `TemplateManageGuard` - Checks template management permission

### Dashboard Guards

- `DashboardViewGuard` - Checks dashboard view permission
- `AnalyticsViewGuard` - Checks analytics view permission

### Role Guards

- `ContractManagerGuard` - Checks for contract_manager role
- `AccountingStaffGuard` - Checks for accounting_staff role
- `HRStaffGuard` - Checks for hr_staff role

## Features

### Error Handling

The PermissionGuard now includes comprehensive error handling:

- Loading states with customizable spinners
- Error states with retry functionality
- Graceful fallbacks for permission denials

### Performance Optimizations

- Memoized context to prevent unnecessary re-renders
- Efficient permission caching through AuthCoreService
- Lazy loading of permissions

### Accessibility

- Proper ARIA labels and roles
- Screen reader friendly error messages
- Keyboard navigation support

### Callbacks

Both PermissionGuard and RoleGuard support callback functions:

- `onPermissionDenied` - Called when permission check fails
- `onRoleDenied` - Called when role check fails

## Best Practices

1. **Use specific permissions over roles** when possible for fine-grained control
2. **Provide meaningful fallback content** to improve user experience
3. **Handle permission denials gracefully** with appropriate callbacks
4. **Use context sparingly** to avoid complex permission logic
5. **Test permission scenarios** thoroughly in development

## Examples

### Basic Permission Check

```tsx
<ContractReadGuard contractId={123}>
    <ContractDetails contractId={123} />
</ContractReadGuard>
```

### With Custom Loading State

```tsx
<ContractCreateGuard 
    loadingFallback={<LoadingSpinner size="large" message="Checking permissions..." />}
>
    <ContractForm />
</ContractCreateGuard>
```

### With Error Handling

```tsx
<DashboardViewGuard 
    dashboardType="financial"
    onPermissionDenied={() => {
        toast.error('You do not have access to financial dashboard');
        navigate('/dashboard');
    }}
>
    <FinancialDashboard />
</DashboardViewGuard>
```

### Role-based Access

```tsx
<ContractManagerGuard 
    fallback={<AccessDeniedPage />}
    onRoleDenied={() => {
        analytics.track('role_access_denied', { role: 'contract_manager' });
    }}
>
    <ManagerTools />
</ContractManagerGuard>
```