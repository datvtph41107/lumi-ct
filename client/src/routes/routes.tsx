import config from '~/config';

// Layouts
import AdminLayout from '~/layouts/AdminLayout';
import DefaultLayout from '~/layouts/DefaultLayout';
import LoginLayout from '~/layouts/LoginLayout';

// Pages
import AdminLogin from '~/page/admin/AdminLogin';
import Login from '~/page/client/Login';
import Dashboard from '~/page/Dashboard';
import Admin from '~/page/admin/Admin';

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

// Route interfaces
interface BaseRoute {
    path: string;
    component: FC; // hoặc React.ComponentType<unknown>
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
 * Nếu user đã đăng nhập và truy cập các route này, sẽ redirect về dashboard
 */
export const publicRoutes: PublicRoute[] = [
    {
        path: config.routes.adminLogin,
        component: AdminLogin,
        layout: LoginLayout,
        redirectPath: '/dashboard', // Redirect về dashboard chung
        allowedWhenAuthenticated: false, // Không cho phép truy cập khi đã đăng nhập
    },
    {
        path: config.routes.login,
        component: Login,
        layout: LoginLayout,
        redirectPath: '/dashboard', // Redirect về dashboard chung
        allowedWhenAuthenticated: false, // Không cho phép truy cập khi đã đăng nhập
    },
    // Có thể thêm các public routes khác như forgot-password, register, etc.
    // {
    //   path: "/forgot-password",
    //   component: ForgotPassword,
    //   layout: LoginLayout,
    //   allowedWhenAuthenticated: true, // Cho phép truy cập khi đã đăng nhập
    // },
];

/**
 * Protected Routes - Cần đăng nhập
 * Mặc định tất cả đều cần authentication, chỉ cần định nghĩa access nếu có yêu cầu đặc biệt
 */
export const privateRoutes: PrivateRoute[] = [
    // Dashboard chung - Tất cả user đã đăng nhập đều có thể truy cập
    {
        path: config.routePrivate.dashboard,
        component: Dashboard,
        layout: DefaultLayout,
        // Không có access restrictions - chỉ cần đăng nhập
    },

    // Admin Panel - Chỉ dành cho Admin hoặc có quyền admin access
    {
        path: config.routePrivate.admin,
        component: Admin,
        layout: AdminLayout,
        access: {
            roles: [ROLE.ADMIN],
            permissions: [PERMISSION.ADMIN_ACCESS],
            requireAll: false, // Chỉ cần 1 trong 2: role ADMIN HOẶC permission ADMIN_ACCESS
        },
    },

    {
        path: config.routePrivate.contract,
        component: ContractDaft,
        layout: CreateContractLayout,
    },

    {
        path: config.routePrivate.ContractCollection,
        component: ContractCollection,
        layout: CreateContractLayout,
    },
    // Admin User Management - Chỉ Admin
    {
        path: '/admin/users',
        component: Admin, // Replace with actual UserManagement component
        layout: AdminLayout,
        access: {
            roles: [ROLE.ADMIN],
            permissions: [PERMISSION.USER_MANAGEMENT],
            requireAll: false, // Chỉ cần 1 trong 2
        },
    },

    // Admin System Settings - Chỉ Admin
    {
        path: '/admin/settings',
        component: Admin, // Replace with actual SystemSettings component
        layout: AdminLayout,
        access: {
            roles: [ROLE.ADMIN],
            permissions: [PERMISSION.SYSTEM_SETTINGS],
            requireAll: false,
        },
    },

    // Contract Routes - Dựa trên permissions
    {
        path: config.routePrivate.contractPages,
        component: ContractPage, // Replace with actual Contracts component
        layout: DefaultLayout,
        access: {
            permissions: [PERMISSION.CONTRACTS_READ],
        },
    },

    {
        path: config.routePrivate.createContract,
        component: CreateContract, // Replace with actual CreateContract component
        layout: CreateContractLayout,
        access: {
            permissions: [PERMISSION.CONTRACTS_CREATE],
        },
    },

    {
        path: config.routePrivate.contractDetail,
        component: ContractDetail, // Replace with actual ContractDetail component
        layout: DefaultLayout,
        access: {
            permissions: [PERMISSION.CONTRACTS_READ],
        },
    },

    {
        path: config.routePrivate.contractTypes,
        component: Dashboard, // Replace with actual ContractTypeManager component
        layout: DefaultLayout,
        access: {
            permissions: [PERMISSION.CONTRACTS_MANAGE],
        },
    },

    // Manager Routes - Dành cho Manager và Admin
    {
        path: '/manager/reports',
        component: Dashboard, // Replace with actual Reports component
        layout: DefaultLayout,
        access: {
            roles: [ROLE.MANAGER, ROLE.ADMIN],
            permissions: [PERMISSION.REPORTS_ACCESS],
            requireAll: false, // Có role HOẶC có permission
        },
    },

    {
        path: '/manager/team',
        component: Dashboard, // Replace with actual TeamManagement component
        layout: DefaultLayout,
        access: {
            roles: [ROLE.MANAGER, ROLE.ADMIN],
            permissions: [PERMISSION.TEAM_MANAGEMENT],
            requireAll: false,
        },
    },

    // Profile - Tất cả user đều có thể truy cập
    {
        path: '/profile',
        component: Dashboard, // Replace with actual Profile component
        layout: DefaultLayout,
        // Không có access restrictions
    },

    // Settings - Tất cả user đều có thể truy cập settings cá nhân
    {
        path: '/settings',
        component: Dashboard, // Replace with actual UserSettings component
        layout: DefaultLayout,
        // Không có access restrictions
    },
];

// Export route types
export type { PublicRoute, PrivateRoute };
