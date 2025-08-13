// import { Permission, UserRole } from "~/types/auth.types";

// // Role-based permission mapping
// export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
//     [UserRole.USER]: [Permission.CONTRACTS_READ, Permission.CONTRACTS_CREATE],
//     [UserRole.MANAGER]: [
//         Permission.CONTRACTS_READ,
//         Permission.CONTRACTS_CREATE,
//         Permission.CONTRACTS_UPDATE,
//         Permission.CONTRACTS_MANAGE,
//         Permission.TEAM_MANAGEMENT,
//         Permission.REPORTS_ACCESS,
//     ],
//     [UserRole.ADMIN]: [
//         Permission.CONTRACTS_READ,
//         Permission.CONTRACTS_CREATE,
//         Permission.CONTRACTS_UPDATE,
//         Permission.CONTRACTS_DELETE,
//         Permission.CONTRACTS_MANAGE,
//         Permission.ADMIN_ACCESS,
//         Permission.USER_MANAGEMENT,
//         Permission.SYSTEM_SETTINGS,
//         Permission.TEAM_MANAGEMENT,
//         Permission.REPORTS_ACCESS,
//     ],
// };

// // Helper function to get permissions by role
// export const getPermissionsByRole = (role: UserRole): Permission[] => {
//     return ROLE_PERMISSIONS[role] || [];
// };

// // Helper function to check if role has permission
// export const roleHasPermission = (role: UserRole, permission: Permission): boolean => {
//     return ROLE_PERMISSIONS[role]?.includes(permission) || false;
// };
