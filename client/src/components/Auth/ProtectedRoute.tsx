import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
import { useAppDispatch } from '~/redux/hooks';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string[];
    fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole = [], fallbackPath = '/login' }) => {
    const dispatch = useAppDispatch();
    const location = useLocation();

    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isLoading = useSelector(selectIsLoading);
    const isRefreshing = useSelector(selectIsRefreshing);
    const user = useSelector(selectUser);
    const redirectPath = useSelector(selectRedirectPath);
    const isPermissionsLoaded = useSelector(selectIsPermissionsLoaded);

    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const loadPermissions = async () => {
            if (!isPermissionsLoaded) {
                await dispatch(getUserPermissions(undefined)).unwrap();
            }
        };

        const initializeAuth = async () => {
            let success = false;
            try {
                await dispatch(getCurrentUser(undefined)).unwrap();
                success = true;
            } catch {
                try {
                    await dispatch(refreshToken(undefined)).unwrap();
                    success = true;
                } catch {
                    // No-op
                }
            }

            if (success) {
                await loadPermissions();
            }

            setIsInitializing(false);
        };

        if (!isAuthenticated && !isLoading) {
            initializeAuth();
        } else {
            if (isAuthenticated) {
                loadPermissions();
            }
            setIsInitializing(false);
        }
    }, [dispatch, isAuthenticated, isLoading, isPermissionsLoaded]);

    // Loading state
    if (isInitializing || isLoading || isRefreshing) {
        return (
            <div className="auth-loading">
                <LoadingSpinner />
                <p>Đang kiểm tra xác thực...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        if (redirectPath) {
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
        const hasRequiredRole = requiredRole.includes(user.role);
        if (!hasRequiredRole) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
