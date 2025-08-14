import React, { Fragment } from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { useIdleTimeout } from './hooks/useIdleTimeout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicRoute from './components/Auth/PublicRoute';
import SessionStatus from './components/Auth/SessionStatus';
import SessionWarningModal from './components/Auth/SessionWarningModal';
import './App.scss';

// Route configs
import { publicRoutes, privateRoutes } from './routes/routes';
import type { PublicRoute as PublicRouteType, PrivateRoute as PrivateRouteType } from './routes/routes';

// Pages
import Unauthorized from './page/Unauthorized/Unauthorized';
import NotFound from './page/NotFound/NotFound';

// Optional: fallback layout for special pages
import Layout from './components/Layout/Layout';

// Build route element per config
const buildElement = (route: PublicRouteType | PrivateRouteType, isPrivate: boolean) => {
  const Page = route.component;
  const LayoutComp = route.layout === null ? Fragment : (route.layout || Layout);

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
  // Global idle timeout for the entire app
  useIdleTimeout({
    warningTime: 10 * 60 * 1000, // 10 minutes
    logoutTime: 15 * 60 * 1000, // 15 minutes
    onWarning: () => {
      // Global warning handling
      console.log('Idle warning triggered');
    },
    onLogout: () => {
      // Global logout handling
      console.log('Auto logout triggered');
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
        <Layout>
          <Unauthorized />
        </Layout>
      ),
    },

    // 404
    {
      path: '*',
      element: (
        <Layout>
          <NotFound />
        </Layout>
      ),
    },
  ]);

  return (
    <>
      {/* Global Components */}
      <SessionWarningModal />
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
