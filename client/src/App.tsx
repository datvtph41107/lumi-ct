import React, { Fragment } from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { useInactiveTimeout } from './hooks/useInactiveTimeout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicRoute from './components/Auth/PublicRoute';
import SessionStatus from './components/Auth/SessionStatus';
import InactiveSessionAlert from './components/Auth/InactiveSessionAlert';
import { publicRoutes, privateRoutes } from './routes/routes';
import type { PublicRoute as PublicRouteType, PrivateRoute as PrivateRouteType } from './routes/routes';
import Unauthorized from './page/Unauthorized/Unauthorized';
import NotFound from './page/404Page';
import DefaultLayout from './layouts/DefaultLayout';
import { PermissionGuard } from './core/permissions';

const buildElement = (route: PublicRouteType | PrivateRouteType, isPrivate: boolean) => {
    const Page = route.component;
    const LayoutComp = route.layout === null ? Fragment : route.layout || DefaultLayout;

    if (isPrivate) {
        const privateRoute = route as PrivateRouteType;
        const fallbackPath = route.path.includes('/admin') ? '/admin/login' : '/login';
        const requiredRole = privateRoute.access?.roles || [];
        const requiredPermissions = privateRoute.access?.permissions || [];
        const requireAll = privateRoute.access?.requireAll || false;

        return (
            <ProtectedRoute fallbackPath={fallbackPath} requiredRole={requiredRole}>
                <PermissionGuard
                    permissions={requiredPermissions}
                    roles={requiredRole}
                    requireAll={requireAll}
                    fallback={<Unauthorized />}
                >
                    <LayoutComp>
                        <Page />
                    </LayoutComp>
                </PermissionGuard>
            </ProtectedRoute>
        );
    }

    const publicRoute = route as PublicRouteType;
    return (
        <PublicRoute
            redirectPath={publicRoute.redirectPath}
            allowedWhenAuthenticated={publicRoute.allowedWhenAuthenticated}
        >
            <LayoutComp>
                <Page />
            </LayoutComp>
        </PublicRoute>
    );
};

const AppRoutes: React.FC = () => {
    const { isWarningVisible, timeUntilLogout, continueSession, logoutNow } = useInactiveTimeout({
        onWarning: () => {
            // could add analytics/log here
        },
        onLogout: () => {
            // optional cleanup
        },
    });

    const elements = useRoutes([
        ...publicRoutes.map((route) => ({
            path: route.path,
            element: buildElement(route, false),
        })),
        ...privateRoutes.map((route) => ({
            path: route.path,
            element: buildElement(route, true),
        })),

        {
            path: '/unauthorized',
            element: <Unauthorized />,
        },

        // 404
        {
            path: '*',
            element: <NotFound />,
        },
    ]);

    return (
        <>
            {/* Global idle warning modal */}
            {isWarningVisible && (
                <InactiveSessionAlert
                    timeUntilLogout={timeUntilLogout}
                    onContinue={continueSession}
                    onLogout={logoutNow}
                />
            )}
            <SessionStatus />
            {elements}
        </>
    );
};

function App() {
    return (
        <Router>
            <div className="App">
                <AppRoutes />
            </div>
        </Router>
    );
}

export default App;
