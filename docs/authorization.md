## Phân quyền (RBAC) & Guard

- `PermissionGuard` đọc metadata `RequirePermissions({ resource, action, conditions })` và gọi `AuthCoreService.hasPermission()`
- Server còn có `CollaboratorGuard` cho các hành động chỉnh sửa trên hợp đồng (editor/reviewer/viewer)
- Client cung cấp `AuthCoreService` (redux) để guard UI theo resource/action, cache kết quả

Collaborator Roles:
- owner, editor, reviewer, viewer (`CollaboratorRole` enum)

Ví dụ dùng `PermissionGuard`:
```ts
@UseGuards(PermissionGuard)
@RequirePermissions({ resource: contract, action: export })
@Get(:id/export/pdf)
exportPdf() {}
```
