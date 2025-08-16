import config from '~/config';

// Layouts
import AdminLayout from '~/layouts/AdminLayout';
import DefaultLayout from '~/layouts/DefaultLayout';
import LoginLayout from '~/layouts/LoginLayout';

// Pages
import AdminLogin from '~/page/admin/AdminLogin';
import Login from '~/page/client/Login';
import Dashboard from '~/page/Dashboard';

// Types
import { ROLE, PERMISSION } from '~/types/auth/auth.types';
import type { ComponentType, FC, ReactNode } from 'react';
import type { RouteAccess } from '~/types/auth/auth.types';
import ContractDetail from '~/page/Contract/ContractDetail';
import CreateContract from '~/page/Contract/CreateContract';
import ContractPage from '~/page/Contract/ContractPage';
import CreateContractLayout from '~/layouts/CreateContractLayout';
import ContractDaft from '~/page/Contract/ContractDaft';
import ContractCollection from '~/page/Contract/ContractCollection';

// Admin pages
import SystemNotifications from '~/page/admin/SystemNotifications';
import UserManagement from '~/page/admin/UserManagement';
import RolePermissionManagement from '~/page/admin/RolePermissionManagement/role-permission-management';
import AdminDashboard from '~/page/admin/AdminDashboard';
import AuditLog from '~/page/admin/AuditLog';

// Contract pages
import ContractTemplates from '~/page/Contract/ContractTemplates';
import ContractReports from '~/page/Contract/ContractReports';

// Profile & Settings
import UserProfile from '~/page/Profile/UserProfile';
import UserSettings from '~/page/Settings/UserSettings';

// Route interfaces
interface BaseRoute {
    path: string;
    component: FC;
    layout?: ComponentType<{ children: ReactNode }> | null;
}

interface PublicRoute extends BaseRoute {
    redirectPath?: string;
    allowedWhenAuthenticated?: boolean;
}

interface PrivateRoute extends BaseRoute {
    access?: RouteAccess;
}

/**
 * Public Routes - Không cần đăng nhập
 */
export const publicRoutes: PublicRoute[] = [
    {
        path: config.routes.adminLogin,
        component: AdminLogin,
        layout: LoginLayout,
        redirectPath: '/dashboard',
        allowedWhenAuthenticated: false,
    },
    {
        path: config.routes.login,
        component: Login,
        layout: LoginLayout,
        redirectPath: '/dashboard',
        allowedWhenAuthenticated: false,
    },
];

/**
 * Protected Routes - Cần đăng nhập
 */
export const privateRoutes: PrivateRoute[] = [
    // Dashboard chung - Tất cả user đã đăng nhập đều có thể truy cập
    {
        path: config.routePrivate.dashboard,
        component: Dashboard,
        layout: DefaultLayout,
    },

    // Admin Routes
    {
        path: '/admin',
        component: AdminDashboard,
        layout: AdminLayout,
        access: {
            roles: [ROLE.ADMIN],
            permissions: [PERMISSION.ADMIN_ACCESS],
            requireAll: false,
        },
    },

    {
        path: '/admin/dashboard',
        component: AdminDashboard,
        layout: AdminLayout,
        access: {
            roles: [ROLE.ADMIN],
            permissions: [PERMISSION.ADMIN_ACCESS],
            requireAll: false,
        },
    },

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
        path: '/admin/roles-permissions',
        component: RolePermissionManagement,
        layout: AdminLayout,
        access: {
            roles: [ROLE.ADMIN],
            permissions: [PERMISSION.SYSTEM_SETTINGS],
            requireAll: false,
        },
    },

    {
        path: '/admin/notifications',
        component: SystemNotifications,
        layout: AdminLayout,
        access: {
            roles: [ROLE.ADMIN],
            permissions: [PERMISSION.SYSTEM_SETTINGS],
            requireAll: false,
        },
    },

    {
        path: '/admin/audit-log',
        component: AuditLog,
        layout: AdminLayout,
        access: {
            roles: [ROLE.ADMIN],
            permissions: [PERMISSION.SYSTEM_SETTINGS],
            requireAll: false,
        },
    },

    // Contract Routes
    {
        path: config.routePrivate.contract,
        component: ContractDaft,
        layout: CreateContractLayout,
        access: {
            permissions: [PERMISSION.CONTRACTS_CREATE],
        },
    },

    {
        path: config.routePrivate.ContractCollection,
        component: ContractCollection,
        layout: CreateContractLayout,
        access: {
            permissions: [PERMISSION.CONTRACTS_READ],
        },
    },

    {
        path: config.routePrivate.contractPages,
        component: ContractPage,
        layout: DefaultLayout,
        access: {
            permissions: [PERMISSION.CONTRACTS_READ],
        },
    },

    {
        path: config.routePrivate.createContract,
        component: CreateContract,
        layout: CreateContractLayout,
        access: {
            permissions: [PERMISSION.CONTRACTS_CREATE],
        },
    },

    {
        path: config.routePrivate.contractDetail,
        component: ContractDetail,
        layout: DefaultLayout,
        access: {
            permissions: [PERMISSION.CONTRACTS_READ],
        },
    },

    {
        path: '/contracts/templates',
        component: ContractTemplates,
        layout: DefaultLayout,
        access: {
            permissions: [PERMISSION.CONTRACTS_MANAGE],
        },
    },

    {
        path: '/contracts/reports',
        component: ContractReports,
        layout: DefaultLayout,
        access: {
            permissions: [PERMISSION.REPORTS_ACCESS],
        },
    },

    // Manager Routes
    {
        path: '/manager/reports',
        component: ContractReports,
        layout: DefaultLayout,
        access: {
            roles: [ROLE.MANAGER, ROLE.ADMIN],
            permissions: [PERMISSION.REPORTS_ACCESS],
            requireAll: false,
        },
    },

    {
        path: '/manager/team',
        component: UserManagement,
        layout: DefaultLayout,
        access: {
            roles: [ROLE.MANAGER, ROLE.ADMIN],
            permissions: [PERMISSION.TEAM_MANAGEMENT],
            requireAll: false,
        },
    },

    // Profile & Settings
    {
        path: '/profile',
        component: UserProfile,
        layout: DefaultLayout,
    },

    {
        path: '/settings',
        component: UserSettings,
        layout: DefaultLayout,
    },
];

// Export route types
export type { PublicRoute, PrivateRoute };
