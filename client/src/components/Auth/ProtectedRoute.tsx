import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import {
    selectIsAuthenticated,
    selectIsLoading,
    selectIsRefreshing,
    selectUser,
    selectRedirectPath,
    clearRedirectPath,
    getCurrentUser,
    refreshToken,
    getUserPermissions,
    selectIsPermissionsLoaded,
} from '~/redux/slices/auth.slice';
import LoadingSpinner from '../LoadingSpinner';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string[];
    fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole = [], fallbackPath = '/login' }) => {
    const dispatch = useDispatch();
    const location = useLocation();

    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isLoading = useSelector(selectIsLoading);
    const isRefreshing = useSelector(selectIsRefreshing);
    const user = useSelector(selectUser);
    const redirectPath = useSelector(selectRedirectPath);
    const isPermissionsLoaded = useSelector(selectIsPermissionsLoaded);

    const [isInitializing, setIsInitializing] = useState(true);

    // Initialize authentication
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                await dispatch(getCurrentUser()).unwrap();
                if (!isPermissionsLoaded) {
                    await dispatch(getUserPermissions()).unwrap();
                }
            } catch (error) {
                try {
                    await dispatch(refreshToken()).unwrap();
                    if (!isPermissionsLoaded) {
                        await dispatch(getUserPermissions()).unwrap();
                    }
                } catch (refreshError) {
                    // No-op; Navigate will handle redirect
                }
            } finally {
                setIsInitializing(false);
            }
        };

        if (!isAuthenticated && !isLoading) {
            initializeAuth();
        } else {
            if (isAuthenticated && !isPermissionsLoaded) {
                dispatch(getUserPermissions());
            }
            setIsInitializing(false);
        }
    }, [dispatch, isAuthenticated, isLoading, isPermissionsLoaded]);

    if (isInitializing || isLoading || isRefreshing) {
        return (
            <div className="auth-loading">
                <LoadingSpinner />
                <p>Đang kiểm tra xác thực...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        if (location.pathname !== '/login') {
            dispatch(clearRedirectPath());
        }

        return (
            <Navigate
                to={fallbackPath}
                state={{
                    from: location.pathname,
                    message: redirectPath ? 'Phiên đăng nhập đã hết hạn' : undefined,
                }}
                replace
            />
        );
    }

    if (requiredRole.length > 0 && user) {
        const hasRequiredRole = requiredRole.includes(user.role as any);
        if (!hasRequiredRole) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
