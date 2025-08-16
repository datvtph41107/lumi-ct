import React from 'react';
import { useAuth } from '~/hooks/useAuth';

interface RoleGuardProps {
    children: React.ReactNode;
    roles: string[];
    requireAll?: boolean;
    fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
    children,
    roles,
    requireAll = false,
    fallback = null,
}) => {
    const { user } = useAuth();

    if (!user) {
        return <>{fallback}</>;
    }

    const hasRequiredRole = () => {
        if (requireAll) {
            return roles.every(role => user.role === role);
        } else {
            return roles.some(role => user.role === role);
        }
    };

    if (!hasRequiredRole()) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

export default RoleGuard;