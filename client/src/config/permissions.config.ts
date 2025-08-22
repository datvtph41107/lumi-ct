export type PermissionKey = `${string}:${
    | 'create'
    | 'read'
    | 'update'
    | 'delete'
    | 'approve'
    | 'reject'
    | 'export'
    | 'assign'}`;

export const PERMISSIONS: Record<PermissionKey, { label: string; description?: string }> = {
    'contract:create': { label: 'Tạo hợp đồng' },
    'contract:read': { label: 'Xem hợp đồng' },
    'contract:update': { label: 'Cập nhật hợp đồng' },
    'contract:delete': { label: 'Xóa hợp đồng' },
    'contract:approve': { label: 'Phê duyệt hợp đồng' },
    'contract:reject': { label: 'Từ chối hợp đồng' },
    'contract:export': { label: 'Xuất hợp đồng' },
    'contract:assign': { label: 'Phân công hợp đồng' },
};
