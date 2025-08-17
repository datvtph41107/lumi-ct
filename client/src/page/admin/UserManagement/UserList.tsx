import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faEdit, 
    faTrash, 
    faEye, 
    faSearch,
    faFilter,
    faDownload
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import { PermissionGuard, usePermission } from '~/components/guards/PermissionGuard';
import { userService } from '~/services/api/user.service';
import type { User } from '~/types/auth/auth.types';
import Button from '~/components/Button';
import Input from '~/components/Input';
import Select from '~/components/Select';
import styles from './UserManagement.module.scss';

const cx = classNames.bind(styles);

interface UserListProps {
    onUserSelect?: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ onUserSelect }) => {
    const navigate = useNavigate();
    const { hasPermission } = usePermission();
    
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getUsers();
            setUsers(response.data);
        } catch (err) {
            setError('Không thể tải danh sách người dùng');
            console.error('Load users error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = () => {
        navigate('/admin/users/create');
    };

    const handleEditUser = (user: User) => {
        navigate(`/admin/users/${user.id}/edit`);
    };

    const handleViewUser = (user: User) => {
        if (onUserSelect) {
            onUserSelect(user);
        } else {
            navigate(`/admin/users/${user.id}`);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            return;
        }

        try {
            await userService.deleteUser(userId);
            await loadUsers();
        } catch (err) {
            setError('Không thể xóa người dùng');
            console.error('Delete user error:', err);
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedUsers.length} người dùng?`)) {
            return;
        }

        try {
            await Promise.all(selectedUsers.map(id => userService.deleteUser(id)));
            setSelectedUsers([]);
            await loadUsers();
        } catch (err) {
            setError('Không thể xóa người dùng');
            console.error('Bulk delete error:', err);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        
        return matchesSearch && matchesRole && matchesStatus;
    });

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUsers(filteredUsers.map(user => user.id.toString()));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectUser = (userId: string, checked: boolean) => {
        if (checked) {
            setSelectedUsers(prev => [...prev, userId]);
        } else {
            setSelectedUsers(prev => prev.filter(id => id !== userId));
        }
    };

    if (loading) {
        return (
            <div className={cx('loading')}>
                <div className={cx('spinner')}></div>
                <p>Đang tải danh sách người dùng...</p>
            </div>
        );
    }

    return (
        <div className={cx('user-list')}>
            <div className={cx('header')}>
                <div className={cx('title-section')}>
                    <h1>Quản lý người dùng</h1>
                    <p>Quản lý tài khoản người dùng trong hệ thống</p>
                </div>
                
                <div className={cx('actions')}>
                    <PermissionGuard permissions={['user_management']}>
                        <Button 
                            primary 
                            onClick={handleCreateUser}
                            leftIcon={<FontAwesomeIcon icon={faPlus} />}
                        >
                            Thêm người dùng
                        </Button>
                    </PermissionGuard>
                </div>
            </div>

            {error && (
                <div className={cx('error-message')}>
                    {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            <div className={cx('filters')}>
                <div className={cx('search-section')}>
                    <Input
                        placeholder="Tìm kiếm theo tên hoặc username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        leftIcon={<FontAwesomeIcon icon={faSearch} />}
                    />
                </div>

                <div className={cx('filter-section')}>
                    <Select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        options={[
                            { value: 'all', label: 'Tất cả vai trò' },
                            { value: 'ADMIN', label: 'Quản trị viên' },
                            { value: 'MANAGER', label: 'Quản lý' },
                            { value: 'STAFF', label: 'Nhân viên' },
                            { value: 'USER', label: 'Người dùng' },
                        ]}
                    />

                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        options={[
                            { value: 'all', label: 'Tất cả trạng thái' },
                            { value: 'active', label: 'Hoạt động' },
                            { value: 'inactive', label: 'Không hoạt động' },
                            { value: 'suspended', label: 'Tạm khóa' },
                        ]}
                    />
                </div>
            </div>

            {selectedUsers.length > 0 && (
                <div className={cx('bulk-actions')}>
                    <span>{selectedUsers.length} người dùng được chọn</span>
                    <PermissionGuard permissions={['user_management']}>
                        <Button 
                            danger 
                            onClick={handleBulkDelete}
                            leftIcon={<FontAwesomeIcon icon={faTrash} />}
                        >
                            Xóa đã chọn
                        </Button>
                    </PermissionGuard>
                </div>
            )}

            <div className={cx('table-container')}>
                <table className={cx('user-table')}>
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                />
                            </th>
                            <th>Thông tin</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Phòng ban</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className={cx({ selected: selectedUsers.includes(user.id.toString()) })}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id.toString())}
                                        onChange={(e) => handleSelectUser(user.id.toString(), e.target.checked)}
                                    />
                                </td>
                                <td>
                                    <div className={cx('user-info')}>
                                        <div className={cx('avatar')}>
                                            {user.profile?.name?.charAt(0) || user.username.charAt(0)}
                                        </div>
                                        <div className={cx('details')}>
                                            <div className={cx('name')}>{user.name}</div>
                                            <div className={cx('username')}>@{user.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={cx('role', user.role.toLowerCase())}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <span className={cx('status', user.status)}>
                                        {user.status === 'active' ? 'Hoạt động' : 
                                         user.status === 'inactive' ? 'Không hoạt động' : 
                                         user.status === 'suspended' ? 'Tạm khóa' : user.status}
                                    </span>
                                </td>
                                <td>
                                    {user.department?.name || 'Chưa phân công'}
                                </td>
                                <td>
                                    <div className={cx('actions')}>
                                        <PermissionGuard permissions={['user_management']}>
                                            <button
                                                className={cx('action-btn', 'view')}
                                                onClick={() => handleViewUser(user)}
                                                title="Xem chi tiết"
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                            
                                            <button
                                                className={cx('action-btn', 'edit')}
                                                onClick={() => handleEditUser(user)}
                                                title="Chỉnh sửa"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            
                                            <button
                                                className={cx('action-btn', 'delete')}
                                                onClick={() => handleDeleteUser(user.id.toString())}
                                                title="Xóa"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </PermissionGuard>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className={cx('empty-state')}>
                        <p>Không tìm thấy người dùng nào</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserList;