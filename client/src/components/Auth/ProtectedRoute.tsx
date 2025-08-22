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
    setRedirectPath,
} from '~/redux/slices/auth.slice';
import LoadingSpinner from '../LoadingSpinner';
import { useAppDispatch } from '~/redux/hooks';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole = [] }) => {
    // const dispatch = useAppDispatch();
    // const location = useLocation();

    // const isAuthenticated = useSelector(selectIsAuthenticated);
    // const isLoading = useSelector(selectIsLoading);
    // const isRefreshing = useSelector(selectIsRefreshing);
    // const user = useSelector(selectUser);
    // const redirectPath = useSelector(selectRedirectPath);
    // const isPermissionsLoaded = useSelector(selectIsPermissionsLoaded);

    // const [isInitializing, setIsInitializing] = useState(true);

    // useEffect(() => {
    //     let cancelled = false;
    //     const init = async () => {
    //         try {
    //             if (!isAuthenticated) {
    //                 try {
    //                     await dispatch(getCurrentUser()).unwrap();
    //                 } catch {
    //                     try {
    //                         await dispatch(refreshToken()).unwrap();
    //                         await dispatch(getCurrentUser()).unwrap();
    //                     } catch {
    //                         // Not logged in
    //                     }
    //                 }
    //             }

    //             if (!isPermissionsLoaded && (isAuthenticated || user)) {
    //                 try {
    //                     await dispatch(getUserPermissions()).unwrap();
    //                 } catch {}
    //             }
    //         } finally {
    //             if (!cancelled) setIsInitializing(false);
    //         }
    //     };
    //     void init();
    //     return () => {
    //         cancelled = true;
    //     };
    // }, [dispatch, isAuthenticated, isPermissionsLoaded, user]);

    // if (isInitializing || isLoading || isRefreshing) {
    //     return (
    //         <div className="auth-loading">
    //             <LoadingSpinner />
    //             <p>Đang kiểm tra xác thực...</p>
    //         </div>
    //     );
    // }

    // if (!isAuthenticated) {
    //     // Store redirect and go to appropriate login page
    //     dispatch(setRedirectPath(location.pathname));
    //     const fallbackPath = location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
    //     return (
    //         <Navigate
    //             to={fallbackPath}
    //             state={{ from: location, message: redirectPath ? 'Phiên đăng nhập đã hết hạn' : undefined }}
    //             replace
    //         />
    //     );
    // }

    // if (requiredRole.length > 0 && user) {
    //     const hasRequiredRole = requiredRole.includes(user.role);
    //     if (!hasRequiredRole) {
    //         return <Navigate to="/unauthorized" replace />;
    //     }
    // }

    // if (redirectPath) {
    //     // Clear stale redirect flag
    //     dispatch(clearRedirectPath());
    // }

    return <>{children}</>;
};

export default ProtectedRoute;
