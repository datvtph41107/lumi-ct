import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faEdit, 
    faTrash, 
    faCrown, 
    faUser, 
    faEye, 
    faSearch,
    faFilter,
    faSync
} from '@fortawesome/free-solid-svg-icons';
import { collaboratorService } from '~/services/api/collaborator.service';
import { auditLogService } from '~/services/api/audit-log.service';
import type { 
    Collaborator, 
    CreateCollaboratorDto, 
    UpdateCollaboratorDto,
    CollaboratorPermissions,
    CollaboratorFilters 
} from '~/types/contract/collaborator.types';
import type { AuditLog } from '~/types/contract/audit-log.types';
import { ROLE_PERMISSIONS } from '~/types/contract/collaborator.types';
import { AUDIT_ACTIONS } from '~/types/contract/audit-log.types';
import styles from './CollaboratorManagement.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface CollaboratorManagementProps {
    contractId: string;
    currentUserId: number;
}

const CollaboratorManagement: React.FC<CollaboratorManagementProps> = ({ 
    contractId, 
    currentUserId 
}) => {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [permissions, setPermissions] = useState<CollaboratorPermissions | null>(null);
    const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Form states
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
    const [showTransferOwnership, setShowTransferOwnership] = useState(false);
    
    // Filter states
    const [filters, setFilters] = useState<CollaboratorFilters>({});
    const [searchTerm, setSearchTerm] = useState('');
    
    // Form data
    const [formData, setFormData] = useState<CreateCollaboratorDto>({
        user_id: 0,
        role: 'viewer',
        user_email: '',
        user_name: ''
    });
    
    const [transferData, setTransferData] = useState({
        to_user_id: 0,
        to_user_email: ''
    });

    useEffect(() => {
        loadData();
    }, [contractId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [collabResponse, permissionsResponse, activityResponse] = await Promise.all([
                collaboratorService.listCollaborators(contractId, filters),
                collaboratorService.getPermissions(contractId),
                auditLogService.getRecentActivity(contractId, 5)
            ]);
            
            setCollaborators(collabResponse.data?.data || []);
            setPermissions(permissionsResponse.data || null);
            setRecentActivity(activityResponse);
        } catch (err) {
            setError('Không thể tải dữ liệu collaborators');
            console.error('Error loading collaborators:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCollaborator = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await collaboratorService.addCollaborator(contractId, formData);
            setShowAddForm(false);
            setFormData({ user_id: 0, role: 'viewer', user_email: '', user_name: '' });
            await loadData();
        } catch (err) {
            setError('Không thể thêm collaborator');
            console.error('Error adding collaborator:', err);
        }
    };

    const handleUpdateCollaborator = async (collaboratorId: string, data: UpdateCollaboratorDto) => {
        try {
            await collaboratorService.updateCollaborator(collaboratorId, data);
            setEditingCollaborator(null);
            await loadData();
        } catch (err) {
            setError('Không thể cập nhật collaborator');
            console.error('Error updating collaborator:', err);
        }
    };

    const handleRemoveCollaborator = async (collaboratorId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa collaborator này?')) {
            return;
        }
        
        try {
            await collaboratorService.removeCollaborator(collaboratorId);
            await loadData();
        } catch (err) {
            setError('Không thể xóa collaborator');
            console.error('Error removing collaborator:', err);
        }
    };

    const handleTransferOwnership = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await collaboratorService.transferOwnership(contractId, { 
                to_user_id: transferData.to_user_id 
            });
            setShowTransferOwnership(false);
            setTransferData({ to_user_id: 0, to_user_email: '' });
            await loadData();
        } catch (err) {
            setError('Không thể chuyển quyền sở hữu');
            console.error('Error transferring ownership:', err);
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'owner': return faCrown;
            case 'editor': return faEdit;
            case 'reviewer': return faEye;
            case 'viewer': return faUser;
            default: return faUser;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'owner': return '#FFD700';
            case 'editor': return '#4CAF50';
            case 'reviewer': return '#2196F3';
            case 'viewer': return '#9E9E9E';
            default: return '#9E9E9E';
        }
    };

    const filteredCollaborators = collaborators.filter(collab => {
        if (searchTerm) {
            return collab.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   collab.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return true;
    });

    if (loading) {
        return (
            <div className={cx('loading')}>
                <FontAwesomeIcon icon={faSync} spin />
                <span>Đang tải...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cx('error')}>
                <span>{error}</span>
                <button onClick={loadData} className={cx('retry-btn')}>
                    <FontAwesomeIcon icon={faSync} />
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className={cx('collaborator-management')}>
            {/* Header */}
            <div className={cx('header')}>
                <h3>Quản lý cộng tác viên</h3>
                {permissions?.permissions.can_manage_collaborators && (
                    <button 
                        className={cx('add-btn')}
                        onClick={() => setShowAddForm(true)}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm cộng tác viên
                    </button>
                )}
            </div>

            {/* Search and Filters */}
            <div className={cx('controls')}>
                <div className={cx('search-box')}>
                    <FontAwesomeIcon icon={faSearch} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm cộng tác viên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className={cx('filter-box')}>
                    <FontAwesomeIcon icon={faFilter} />
                    <select
                        value={filters.role || ''}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value as any })}
                    >
                        <option value="">Tất cả vai trò</option>
                        <option value="owner">Owner</option>
                        <option value="editor">Editor</option>
                        <option value="reviewer">Reviewer</option>
                        <option value="viewer">Viewer</option>
                    </select>
                </div>
            </div>

            {/* Collaborators List */}
            <div className={cx('collaborators-list')}>
                {filteredCollaborators.length === 0 ? (
                    <div className={cx('empty-state')}>
                        <p>Không có cộng tác viên nào</p>
                    </div>
                ) : (
                    filteredCollaborators.map((collab) => (
                        <div key={collab.id} className={cx('collaborator-item')}>
                            <div className={cx('collaborator-info')}>
                                <div className={cx('avatar')}>
                                    {collab.user_avatar ? (
                                        <img src={collab.user_avatar} alt={collab.user_name} />
                                    ) : (
                                        <div className={cx('avatar-placeholder')}>
                                            {collab.user_name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </div>
                                
                                <div className={cx('details')}>
                                    <div className={cx('name')}>{collab.user_name || `User ${collab.user_id}`}</div>
                                    <div className={cx('email')}>{collab.user_email}</div>
                                    <div className={cx('role')}>
                                        <FontAwesomeIcon 
                                            icon={getRoleIcon(collab.role)} 
                                            style={{ color: getRoleColor(collab.role) }}
                                        />
                                        <span>{collab.role}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={cx('actions')}>
                                {permissions?.permissions.can_manage_collaborators && 
                                 collab.user_id !== currentUserId && (
                                    <>
                                        <button
                                            className={cx('action-btn', 'edit')}
                                            onClick={() => setEditingCollaborator(collab)}
                                            title="Chỉnh sửa vai trò"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        
                                        <button
                                            className={cx('action-btn', 'remove')}
                                            onClick={() => handleRemoveCollaborator(collab.id)}
                                            title="Xóa cộng tác viên"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Transfer Ownership */}
            {permissions?.permissions.can_transfer_ownership && (
                <div className={cx('transfer-ownership')}>
                    <button 
                        className={cx('transfer-btn')}
                        onClick={() => setShowTransferOwnership(true)}
                    >
                        <FontAwesomeIcon icon={faCrown} />
                        Chuyển quyền sở hữu
                    </button>
                </div>
            )}

            {/* Recent Activity */}
            <div className={cx('recent-activity')}>
                <h4>Hoạt động gần đây</h4>
                <div className={cx('activity-list')}>
                    {recentActivity.map((activity) => (
                        <div key={activity.id} className={cx('activity-item')}>
                            <div className={cx('activity-icon')}>
                                {auditLogService.getActionIcon(activity.action)}
                            </div>
                            <div className={cx('activity-details')}>
                                <div className={cx('activity-description')}>
                                    {activity.description || auditLogService.getActionDisplayName(activity.action)}
                                </div>
                                <div className={cx('activity-meta')}>
                                    <span className={cx('user')}>{activity.user_name}</span>
                                    <span className={cx('time')}>
                                        {auditLogService.formatAuditLogDate(activity.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Collaborator Modal */}
            {showAddForm && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal')}>
                        <div className={cx('modal-header')}>
                            <h4>Thêm cộng tác viên</h4>
                            <button 
                                className={cx('close-btn')}
                                onClick={() => setShowAddForm(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddCollaborator} className={cx('modal-form')}>
                            <div className={cx('form-group')}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.user_email}
                                    onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                                    required
                                />
                            </div>
                            
                            <div className={cx('form-group')}>
                                <label>Vai trò</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                >
                                    <option value="viewer">Viewer</option>
                                    <option value="reviewer">Reviewer</option>
                                    <option value="editor">Editor</option>
                                    <option value="owner">Owner</option>
                                </select>
                            </div>
                            
                            <div className={cx('modal-actions')}>
                                <button type="button" onClick={() => setShowAddForm(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className={cx('primary')}>
                                    Thêm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Collaborator Modal */}
            {editingCollaborator && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal')}>
                        <div className={cx('modal-header')}>
                            <h4>Chỉnh sửa vai trò</h4>
                            <button 
                                className={cx('close-btn')}
                                onClick={() => setEditingCollaborator(null)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdateCollaborator(editingCollaborator.id, { role: formData.role });
                            }} 
                            className={cx('modal-form')}
                        >
                            <div className={cx('form-group')}>
                                <label>Người dùng</label>
                                <input
                                    type="text"
                                    value={editingCollaborator.user_name || `User ${editingCollaborator.user_id}`}
                                    disabled
                                />
                            </div>
                            
                            <div className={cx('form-group')}>
                                <label>Vai trò</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                >
                                    <option value="viewer">Viewer</option>
                                    <option value="reviewer">Reviewer</option>
                                    <option value="editor">Editor</option>
                                    <option value="owner">Owner</option>
                                </select>
                            </div>
                            
                            <div className={cx('modal-actions')}>
                                <button type="button" onClick={() => setEditingCollaborator(null)}>
                                    Hủy
                                </button>
                                <button type="submit" className={cx('primary')}>
                                    Cập nhật
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transfer Ownership Modal */}
            {showTransferOwnership && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal')}>
                        <div className={cx('modal-header')}>
                            <h4>Chuyển quyền sở hữu</h4>
                            <button 
                                className={cx('close-btn')}
                                onClick={() => setShowTransferOwnership(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleTransferOwnership} className={cx('modal-form')}>
                            <div className={cx('warning')}>
                                <p>⚠️ Cảnh báo: Việc chuyển quyền sở hữu sẽ làm mất quyền owner của bạn.</p>
                            </div>
                            
                            <div className={cx('form-group')}>
                                <label>Email người nhận</label>
                                <input
                                    type="email"
                                    value={transferData.to_user_email}
                                    onChange={(e) => setTransferData({ ...transferData, to_user_email: e.target.value })}
                                    required
                                />
                            </div>
                            
                            <div className={cx('modal-actions')}>
                                <button type="button" onClick={() => setShowTransferOwnership(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className={cx('danger')}>
                                    Chuyển quyền sở hữu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollaboratorManagement;