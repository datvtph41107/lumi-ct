import type { Permission, Role, RouteAccess, User } from "~/types/auth.types";

// Helper function to check user access
// export function checkUserAccess(user: User, access: RouteAccess): boolean {
//     const { roles, permissions, requireAll = false } = access;

//     // If no access restrictions, allow access
//     if (!roles && !permissions) {
//         return true;
//     }

//     const userRoles = [user.role]; // Nếu sau này backend trả roles: string[], bạn đổi lại
//     const userPermissions = Object.entries(user.permissions || {})
//         .filter(([_, allowed]) => allowed)
//         .map(([key]) => key);

//     let hasRoleAccess = false;
//     let hasPermissionAccess = false;

//     // Check roles
//     if (roles && roles.length > 0) {
//         hasRoleAccess = roles.some((role) => userRoles.includes(role));
//     }

//     // Check permissions
//     if (permissions && permissions.length > 0) {
//         hasPermissionAccess = permissions.some((permission) => userPermissions.includes(permission));
//     }

//     // Apply access logic
//     if (requireAll) {
//         const roleCheck = !roles || hasRoleAccess;
//         const permissionCheck = !permissions || hasPermissionAccess;
//         return roleCheck && permissionCheck;
//     } else {
//         if (roles && permissions) {
//             return hasRoleAccess || hasPermissionAccess;
//         } else if (roles) {
//             return hasRoleAccess;
//         } else if (permissions) {
//             return hasPermissionAccess;
//         }
//     }

//     return false;
// }

/**
 * Check if user has access to a route based on roles and permissions
 */
export function checkUserAccess(user: User | null, access: RouteAccess): boolean {
    if (!user) return false;

    const { roles, permissions, requireAll = false } = access;
    console.log(access);

    // If no access requirements specified, allow access
    if (!roles && !permissions) return true;

    const userRole = user.role as Role;
    const userPermissions = extractUserPermissions(user);

    // Check roles
    const hasRequiredRole = roles ? roles.includes(userRole) : true;

    // Check permissions
    const hasRequiredPermissions = permissions
        ? requireAll
            ? permissions.every((permission) => userPermissions.includes(permission))
            : permissions.some((permission) => userPermissions.includes(permission))
        : true;

    // Return based on requireAll flag
    if (requireAll) {
        return hasRequiredRole && hasRequiredPermissions;
    } else {
        return hasRequiredRole || hasRequiredPermissions;
    }
}

/**
 * Extract permissions from user object
 */
function extractUserPermissions(user: User): Permission[] {
    const permissions: Permission[] = [];

    // Extract from user.permissions object
    if (user.permissions) {
        Object.entries(user.permissions).forEach(([key, value]) => {
            if (value === true) {
                // Convert permission keys to our Permission type
                switch (key) {
                    case "create_contract":
                        permissions.push("contracts_create" as Permission);
                        break;
                    case "create_report":
                        permissions.push("reports_access" as Permission);
                        break;
                    case "read":
                        permissions.push("read" as Permission);
                        break;
                    case "update":
                        permissions.push("write" as Permission);
                        break;
                    case "delete":
                        permissions.push("delete" as Permission);
                        break;
                    case "approve":
                        permissions.push("approve" as Permission);
                        break;
                    case "assign":
                        permissions.push("assign" as Permission);
                        break;
                }
            }
        });
    }

    // Add role-based permissions
    switch (user.role) {
        case "ADMIN":
            permissions.push("admin_access" as Permission, "user_management" as Permission, "system_settings" as Permission);
            break;
        case "MANAGER":
            permissions.push("team_management" as Permission, "contracts_manage" as Permission);
            break;
    }

    return permissions;
}

/**
 * Check if user has specific role
 */
export function hasRole(user: User | null, role: Role): boolean {
    return user?.role === role;
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
    if (!user) return false;
    const userPermissions = extractUserPermissions(user);
    return userPermissions.includes(permission);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: User | null, roles: Role[]): boolean {
    if (!user) return false;
    return roles.includes(user.role as Role);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
    if (!user) return false;
    const userPermissions = extractUserPermissions(user);
    return permissions.some((permission) => userPermissions.includes(permission));
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: User | null): string {
    if (!user) return "Unknown User";
    return user.profile?.name || user.name || user.username || "Unknown User";
}

/**
 * Check if user is active
 */
export function isUserActive(user: User | null): boolean {
    return user?.status === "active";
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: string): string {
    const roleMap: Record<string, string> = {
        ADMIN: "Administrator",
        MANAGER: "Manager",
        STAFF: "Staff",
        USER: "User",
    };
    return roleMap[role] || role;
}
