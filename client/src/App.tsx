import React, { Fragment } from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { useIdleTimeout } from './hooks/useIdleTimeout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicRoute from './components/Auth/PublicRoute';
import SessionStatus from './components/Auth/SessionStatus';
import InactiveSessionAlert from './components/Auth/InactiveSessionAlert';
import './App.scss';

// Route configs
import { publicRoutes, privateRoutes } from './routes/routes';
import type { PublicRoute as PublicRouteType, PrivateRoute as PrivateRouteType } from './routes/routes';

// Pages
import Unauthorized from './page/Unauthorized/Unauthorized';

// Optional: fallback layout for special pages
import NotFound from './page/404Page';
import DefaultLayout from './layouts/DefaultLayout';

// Build route element per config
const buildElement = (route: PublicRouteType | PrivateRouteType, isPrivate: boolean) => {
    const Page = route.component;
    const LayoutComp = route.layout === null ? Fragment : route.layout || DefaultLayout;

    if (isPrivate) {
        const privateRoute = route as PrivateRouteType;
        const fallbackPath = route.path.includes('/admin') ? '/admin/login' : '/login';
        const requiredRole = privateRoute.access?.roles || [];

        return (
            <ProtectedRoute fallbackPath={fallbackPath} requiredRole={requiredRole}>
                <LayoutComp>
                    <Page />
                </LayoutComp>
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
    const { isWarningVisible, timeUntilLogout, continueSession, logoutNow } = useIdleTimeout({
        onWarning: () => {
            // could add analytics/log here
        },
        onLogout: () => {
            // optional cleanup
        },
    });

    const elements = useRoutes([
        // Public routes
        ...publicRoutes.map((route) => ({
            path: route.path,
            element: buildElement(route, false),
        })),

        // Private routes
        ...privateRoutes.map((route) => ({
            path: route.path,
            element: buildElement(route, true),
        })),

        // Unauthorized
        {
            path: '/unauthorized',
            element: (
                // <Layout>
                <Unauthorized />
                // </Layout>
            ),
        },

        // 404
        {
            path: '*',
            element: (
                // <Layout>
                <NotFound />
                // </Layout>
            ),
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
        <Provider store={store}>
            <Router>
                <div className="App">
                    <AppRoutes />
                </div>
            </Router>
        </Provider>
    );
}

export default App;
