import React from 'react';
import { usePermissions } from '~/core/permissions';
import { PERMISSION, ROLE } from '~/types/auth/auth.types';

interface PermissionStatusProps {
    showDetails?: boolean;
    className?: string;
}

export const PermissionStatus: React.FC<PermissionStatusProps> = ({ 
    showDetails = false, 
    className = '' 
}) => {
    const { getUserPermissions, getUserRole, user } = usePermissions();

    if (!user) {
        return null;
    }

    const permissions = getUserPermissions();
    const role = getUserRole();

    return (
        <div className={`permission-status ${className}`}>
            <div className="permission-summary">
                <div className="role-info">
                    <span className="label">Role:</span>
                    <span className="value">{role}</span>
                </div>
                <div className="permissions-count">
                    <span className="label">Permissions:</span>
                    <span className="value">{permissions.length}</span>
                </div>
            </div>

            {showDetails && (
                <div className="permission-details">
                    <h4>Active Permissions:</h4>
                    <div className="permissions-list">
                        {permissions.map((permission) => (
                            <div key={permission} className="permission-item">
                                <span className="permission-name">{permission}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PermissionStatus;