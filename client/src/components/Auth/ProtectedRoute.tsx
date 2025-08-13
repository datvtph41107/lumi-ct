import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "~/redux/hooks";
import { AuthManager } from "~/core/http/settings/AuthManager";
import { clearAuth, getCurrentUser, verifySession, refreshToken, restoreSession } from "~/redux/slices/auth.slice";
import type { RouteAccess } from "~/types/auth.types";
import { checkUserAccess } from "~/utils/user";
import LoadingSpinner from "../LoadingSpinner";

interface ProtectedRouteProps {
    children: React.ReactNode;
    access?: RouteAccess;
    fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, access, fallbackPath = "/login" }) => {
    // const dispatch = useAppDispatch();
    // const location = useLocation();
    // const { user, isAuthenticated, isSessionValid, tokenExpiry, isTokenRefreshing, loading } = useAppSelector((state) => state.auth);

    // const [isInitializing, setIsInitializing] = useState(true);
    // const initializedRef = useRef(false);

    // // initital authen access route
    // useEffect(() => {
    //     const initialize = async () => {
    //         if (initializedRef.current) return;
    //         initializedRef.current = true;

    //         console.log("[ProtectedRoute] Initializing session...");
    //         const authManager = AuthManager.getInstance();

    //         try {
    //             // Step 1: Verify session with backend
    //             console.log("[ProtectedRoute] Step 1: Verifying session...");
    //             const sessionResult = await dispatch(verifySession({})).unwrap();

    //             if (!sessionResult.isValid) {
    //                 console.log("[ProtectedRoute] No valid session found");
    //                 dispatch(clearAuth({}));
    //                 return;
    //             }

    //             console.log("[ProtectedRoute] Session valid:", sessionResult.sessionId);

    //             // Step 2: Ensure valid access token
    //             console.log("[ProtectedRoute] Step 2: Checking access token...");
    //             const token = await authManager.ensureValidToken();

    //             if (!token) {
    //                 console.log("[ProtectedRoute] No valid token, attempting refresh...");
    //                 try {
    //                     await dispatch(refreshToken({})).unwrap();
    //                     console.log("[ProtectedRoute] Token refreshed successfully");
    //                 } catch (refreshError) {
    //                     console.error("[ProtectedRoute] Token refresh failed:", refreshError);
    //                     dispatch(clearAuth({}));
    //                     return;
    //                 }
    //             }

    //             // Step 3: Restore session state if needed
    //             if (sessionResult.isValid && !isAuthenticated) {
    //                 console.log("[ProtectedRoute] Step 3: Restoring session state...");
    //                 dispatch(
    //                     restoreSession({
    //                         sessionId: sessionResult.sessionId,
    //                         isAuthenticated: true,
    //                         tokenExpiry: authManager.getTokenExpiry(),
    //                     }),
    //                 );
    //             }

    //             // Step 4: Load user data if not present
    //             if (!user && isAuthenticated) {
    //                 console.log("[ProtectedRoute] Step 4: Loading user data...");
    //                 try {
    //                     await dispatch(getCurrentUser({})).unwrap();
    //                     console.log("[ProtectedRoute] User data loaded");
    //                 } catch (userError) {
    //                     console.error("[ProtectedRoute] Failed to load user:", userError);
    //                     dispatch(clearAuth({}));
    //                     return;
    //                 }
    //             }

    //             console.log("[ProtectedRoute] Initialization completed successfully");
    //         } catch (err) {
    //             console.error("[ProtectedRoute] Initialization failed:", err);
    //             dispatch(clearAuth({}));
    //         } finally {
    //             setIsInitializing(false);
    //         }
    //     };

    //     initialize();
    // }, [dispatch, user, isAuthenticated]);

    // //  useEffect 2 – Lắng nghe sự kiện từ các tab khác hoặc timeout check session idle
    // useEffect(() => {
    //     const handleLogout = () => {
    //         console.log("[ProtectedRoute] Received logout event");
    //         dispatch(clearAuth({}));
    //     };

    //     const handleIdleTimeout = () => {
    //         console.log("[ProtectedRoute] Received idle timeout event");
    //         dispatch(clearAuth({}));
    //     };

    //     const handleUnauthorized = () => {
    //         console.log("[ProtectedRoute] Received unauthorized event");
    //         dispatch(clearAuth({}));
    //     };

    //     window.addEventListener("auth:logout", handleLogout);
    //     window.addEventListener("auth:idle-timeout", handleIdleTimeout);
    //     window.addEventListener("auth:unauthorized", handleUnauthorized);

    //     return () => {
    //         window.removeEventListener("auth:logout", handleLogout);
    //         window.removeEventListener("auth:idle-timeout", handleIdleTimeout);
    //         window.removeEventListener("auth:unauthorized", handleUnauthorized);
    //     };
    // }, [dispatch]);

    // // Auto-refresh token before expiry
    // useEffect(() => {
    //     if (!isAuthenticated || !tokenExpiry || isTokenRefreshing) return;

    //     const now = Math.floor(Date.now() / 1000);
    //     const refreshIn = tokenExpiry - now - 2 * 60; // 2 minutes before expiry
    //     const remaining = tokenExpiry - now;

    //     console.log(`[ProtectedRoute] Token expires in ${remaining}s → scheduling refresh in ${refreshIn}s`);

    //     if (refreshIn > 0) {
    //         const timer = setTimeout(async () => {
    //             try {
    //                 console.log("[ProtectedRoute] Auto-refreshing access token...");
    //                 await dispatch(refreshToken({})).unwrap();
    //                 console.log("[ProtectedRoute] Auto-refresh success");
    //             } catch (err) {
    //                 console.error("[ProtectedRoute] Auto-refresh failed:", err);
    //                 dispatch(clearAuth({}));
    //             }
    //         }, refreshIn * 1000);

    //         return () => clearTimeout(timer);
    //     }
    // }, [isAuthenticated, tokenExpiry, isTokenRefreshing, dispatch]);

    // console.log(isInitializing, loading, isTokenRefreshing);
    // if (isInitializing || loading || isTokenRefreshing) {
    //     return <LoadingSpinner message="Checking session..." />;
    // }

    // if (!isAuthenticated || !isSessionValid) {
    //     console.warn("[ProtectedRoute] Not authenticated or invalid session → redirecting to login");
    //     return <Navigate to={fallbackPath} state={{ from: location }} replace />;
    // }
    // console.log(access);

    // if (access && !checkUserAccess(user, access)) {
    //     console.warn("[ProtectedRoute] Access denied → redirecting to /unauthorized");
    //     return <Navigate to="/unauthorized" replace />;
    // }

    return <>{children}</>;
};

export default ProtectedRoute;
