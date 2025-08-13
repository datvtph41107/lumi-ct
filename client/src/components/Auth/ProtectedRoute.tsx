import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '~/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string[];
    fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    children, 
    requiredRole = [], 
    fallbackPath = '/login' 
}) => {
    const { isAuthenticated, isLoading, user, refreshToken } = useAuth();
    const location = useLocation();

    useEffect(() => {
        // Try to refresh token if not authenticated but we have a session
        if (!isAuthenticated && !isLoading) {
            refreshToken();
        }
    }, [isAuthenticated, isLoading, refreshToken]);

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="auth-loading">
                <div className="loading-spinner"></div>
                <p>Đang kiểm tra xác thực...</p>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to={fallbackPath} state={{ from: location }} replace />;
    }

    // Check role-based access if required
    if (requiredRole.length > 0 && user) {
        const hasRequiredRole = requiredRole.includes(user.role);
        if (!hasRequiredRole) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
