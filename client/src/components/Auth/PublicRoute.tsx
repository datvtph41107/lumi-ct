// src/components/PublicRoute.tsx
import type React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "~/redux/hooks";
import LoadingSpinner from "../LoadingSpinner";

interface PublicRouteProps {
    children: React.ReactNode;
    redirectPath?: string;
    allowedWhenAuthenticated?: boolean;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children, redirectPath = "/dashboard", allowedWhenAuthenticated = false }) => {
    const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

    if (loading) {
        console.log("[PublicRoute] Auth state loading...");
        return <LoadingSpinner message="Verifying authentication..." />;
    }

    if (isAuthenticated && !allowedWhenAuthenticated) {
        console.warn("[PublicRoute] User already authenticated → redirecting to", redirectPath);
        return <Navigate to={redirectPath} replace />;
    }

    console.log("[PublicRoute] Allowed to access public route");
    return <>{children}</>;
};

export default PublicRoute;
