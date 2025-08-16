import React, { useState } from 'react';
import { usePermissionCache } from '~/hooks/usePermissionCache';
import { useAuth } from '~/hooks/useAuth';

interface PermissionDebugProps {
    showDetails?: boolean;
    className?: string;
}

export const PermissionDebug: React.FC<PermissionDebugProps> = ({ 
    showDetails = false, 
    className = '' 
}) => {
    const { user } = useAuth();
    const {
        permissions,
        roles,
        effectivePermissions,
        isLoading,
        error,
        lastUpdated,
        refreshPermissions,
        hasPermission,
        hasRole,
    } = usePermissionCache();

    const [isExpanded, setIsExpanded] = useState(false);

    if (!user) {
        return <div className="permission-debug">No user logged in</div>;
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className={`permission-debug ${className}`}>
            <div className="debug-header">
                <h3>Permission Debug Info</h3>
                <div className="debug-actions">
                    <button 
                        onClick={() => refreshPermissions()}
                        disabled={isLoading}
                        className="refresh-btn"
                    >
                        {isLoading ? 'Loading...' : 'Refresh'}
                    </button>
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="expand-btn"
                    >
                        {isExpanded ? 'Collapse' : 'Expand'}
                    </button>
                </div>
            </div>

            <div className="debug-summary">
                <div className="summary-item">
                    <span className="label">User:</span>
                    <span className="value">{user.name} ({user.username})</span>
                </div>
                <div className="summary-item">
                    <span className="label">Role:</span>
                    <span className="value">{user.role}</span>
                </div>
                <div className="summary-item">
                    <span className="label">Status:</span>
                    <span className="value">{isLoading ? 'Loading' : error ? 'Error' : 'Ready'}</span>
                </div>
                <div className="summary-item">
                    <span className="label">Last Updated:</span>
                    <span className="value">{lastUpdated ? formatDate(lastUpdated) : 'Never'}</span>
                </div>
                <div className="summary-item">
                    <span className="label">Effective Permissions:</span>
                    <span className="value">{effectivePermissions.length}</span>
                </div>
            </div>

            {error && (
                <div className="debug-error">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {isExpanded && (
                <div className="debug-details">
                    <div className="detail-section">
                        <h4>Effective Permissions ({effectivePermissions.length})</h4>
                        <div className="permissions-list">
                            {effectivePermissions.map((permission) => (
                                <div key={permission} className="permission-item">
                                    <span className="permission-name">{permission}</span>
                                    <span className="permission-status">
                                        {hasPermission(permission) ? '✅' : '❌'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="detail-section">
                        <h4>User Roles ({roles.length})</h4>
                        <div className="roles-list">
                            {roles.map((role) => (
                                <div key={role.id} className="role-item">
                                    <div className="role-header">
                                        <span className="role-name">{role.display_name || role.name}</span>
                                        <span className="role-status">
                                            {hasRole(role.name) ? '✅' : '❌'}
                                        </span>
                                    </div>
                                    <div className="role-details">
                                        <span className="role-scope">Scope: {role.scope}</span>
                                        <span className="role-permissions">
                                            Permissions: {role.permissions.length}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="detail-section">
                        <h4>Available Permissions ({permissions.length})</h4>
                        <div className="permissions-list">
                            {permissions.map((permission) => (
                                <div key={permission.id} className="permission-item">
                                    <div className="permission-header">
                                        <span className="permission-name">
                                            {permission.display_name || `${permission.resource}:${permission.action}`}
                                        </span>
                                        <span className="permission-status">
                                            {permission.is_active ? '✅' : '❌'}
                                        </span>
                                    </div>
                                    <div className="permission-details">
                                        <span className="permission-resource">
                                            Resource: {permission.resource}
                                        </span>
                                        <span className="permission-action">
                                            Action: {permission.action}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PermissionDebug;