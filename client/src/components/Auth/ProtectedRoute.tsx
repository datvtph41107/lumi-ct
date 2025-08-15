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
import { useIdleTimeout } from '~/hooks/useIdleTimeout';
import LoadingSpinner from '../LoadingSpinner';
import InactiveSessionAlert from './InactiveSessionAlert';

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
    const [showIdleWarning, setShowIdleWarning] = useState(false);

    // Idle timeout hook
    const { isIdleWarningShown, timeUntilWarning, timeUntilLogout, updateActivity } = useIdleTimeout({
        warningTime: 10 * 60 * 1000, // 10 minutes
        logoutTime: 15 * 60 * 1000, // 15 minutes
        onWarning: () => setShowIdleWarning(true),
        onLogout: () => {
            setShowIdleWarning(false);
        },
    });

    // Initialize authentication
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Try to get current user first
                await dispatch(getCurrentUser()).unwrap();
                // Ensure permissions are loaded
                if (!isPermissionsLoaded) {
                    await dispatch(getUserPermissions()).unwrap();
                }
            } catch (error) {
                // If getCurrentUser fails, try to refresh token
                try {
                    await dispatch(refreshToken()).unwrap();
                    if (!isPermissionsLoaded) {
                        await dispatch(getUserPermissions()).unwrap();
                    }
                } catch (refreshError) {
                    // Both failed, user needs to login
                    // No-op here; Navigate will handle redirect
                }
            } finally {
                setIsInitializing(false);
            }
        };

        if (!isAuthenticated && !isLoading) {
            initializeAuth();
        } else {
            // If already authenticated but permissions not loaded
            if (isAuthenticated && !isPermissionsLoaded) {
                dispatch(getUserPermissions());
            }
            setIsInitializing(false);
        }
    }, [dispatch, isAuthenticated, isLoading, isPermissionsLoaded]);

    // Handle idle warning
    const handleIdleWarningContinue = () => {
        updateActivity();
        setShowIdleWarning(false);
    };

    const handleIdleWarningLogout = () => {
        setShowIdleWarning(false);
        // Logout will be handled by useIdleTimeout
    };

    // Show loading spinner while initializing or refreshing
    if (isInitializing || isLoading || isRefreshing) {
        return (
            <div className="auth-loading">
                <LoadingSpinner />
                <p>Đang kiểm tra xác thực...</p>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        // Save current path for redirect after login
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

    // Check role-based access if required
    if (requiredRole.length > 0 && user) {
        const hasRequiredRole = requiredRole.includes(user.role as any);
        if (!hasRequiredRole) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return (
        <>
            {children}

            {/* Idle Warning Modal */}
            {showIdleWarning && (
                <InactiveSessionAlert
                    timeUntilLogout={timeUntilLogout}
                    onContinue={handleIdleWarningContinue}
                    onLogout={handleIdleWarningLogout}
                />
            )}
        </>
    );
};

export default ProtectedRoute;
