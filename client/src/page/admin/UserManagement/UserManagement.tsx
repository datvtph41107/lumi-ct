import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './UserManagement.module.scss';
import { routePrivate } from '~/config/routes.config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEye,
    faEdit,
    faBell,
    faBan,
    faCheckCircle,
    faUsers,
    faUserCheck,
    faUserTie,
    faUser,
    faBuilding,
    faPlus,
    faTrash,
    faSearch,
} from '@fortawesome/free-solid-svg-icons';
import Dropdown from '~/page/Contract/components/Dropdown/Dropdown';
import Button from '~/components/Button';

const cx = classNames.bind(styles);

interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    department: 'admin' | 'accounting';
    role: 'manager' | 'staff';
    isActive: boolean;
    lastActivity: string;
    currentActivity: string;
    avatar: string;
    joinDate: string;
    phone: string;
}

interface UserStats {
    total: number;
    active: number;
    managers: number;
    staff: number;
}

const generateInitials = (fullName: string): string => {
    const words = fullName
        .trim()
        .split(' ')
        .filter((word) => word.length > 0);
    if (words.length === 0) return 'U';
    if (words.length === 1) return words[0].charAt(0).toUpperCase();

    // Get first letter of first word and first letter of last word
    const firstLetter = words[0].charAt(0).toUpperCase();
    const lastLetter = words[words.length - 1].charAt(0).toUpperCase();
    return firstLetter + lastLetter;
};

const generateAvatarColor = (name: string): string => {
    // Soft, gentle colors for avatars
    const colors = [
        '#E3F2FD', // Light Blue
        '#F3E5F5', // Light Purple
        '#E8F5E8', // Light Green
        '#FFF3E0', // Light Orange
        '#FCE4EC', // Light Pink
        '#F1F8E9', // Light Lime
        '#E0F2F1', // Light Teal
        '#FFF8E1', // Light Yellow
        '#EFEBE9', // Light Brown
        '#F9FBE7', // Light Lime Green
    ];

    // Generate consistent color based on name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const getTextColor = (bgColor: string): string => {
    // Return darker text colors that complement the soft backgrounds
    const textColors: { [key: string]: string } = {
        '#E3F2FD': '#1565C0', // Dark Blue
        '#F3E5F5': '#7B1FA2', // Dark Purple
        '#E8F5E8': '#2E7D32', // Dark Green
        '#FFF3E0': '#E65100', // Dark Orange
        '#FCE4EC': '#C2185B', // Dark Pink
        '#F1F8E9': '#689F38', // Dark Lime
        '#E0F2F1': '#00695C', // Dark Teal
        '#FFF8E1': '#F57F17', // Dark Yellow
        '#EFEBE9': '#5D4037', // Dark Brown
        '#F9FBE7': '#827717', // Dark Lime Green
    };
    return textColors[bgColor] || '#333333';
};

const UserManagement: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showDropdown, setShowDropdown] = useState<string | null>(null);
    const [stats, setStats] = useState<UserStats>({ total: 0, active: 0, managers: 0, staff: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        const mockUsers: User[] = [
            {
                id: '1',
                username: 'admin_manager',
                email: 'admin.manager@company.com',
                fullName: 'Nguyễn Văn An',
                department: 'admin',
                role: 'manager',
                isActive: true,
                lastActivity: '2024-01-15 14:30',
                currentActivity: 'Đang xem báo cáo hợp đồng',
                avatar: '/api/placeholder/40/40',
                joinDate: '2023-01-15',
                phone: '0901234567',
            },
            {
                id: '2',
                username: 'admin_staff_01',
                email: 'admin.staff01@company.com',
                fullName: 'Trần Thị Bình',
                department: 'admin',
                role: 'staff',
                isActive: true,
                lastActivity: '2024-01-15 13:45',
                currentActivity: 'Đang chỉnh sửa hợp đồng HD-2024-001',
                avatar: '/api/placeholder/40/40',
                joinDate: '2023-03-20',
                phone: '0901234568',
            },
            {
                id: '3',
                username: 'accounting_manager',
                email: 'accounting.manager@company.com',
                fullName: 'Lê Văn Cường',
                department: 'accounting',
                role: 'staff',
                isActive: false,
                lastActivity: '2024-01-14 17:20',
                currentActivity: 'Offline',
                avatar: '/api/placeholder/40/40',
                joinDate: '2023-02-10',
                phone: '0901234569',
            },
            {
                id: '4',
                username: 'accounting_staff_01',
                email: 'accounting.staff01@company.com',
                fullName: 'Phạm Thị Dung',
                department: 'accounting',
                role: 'staff',
                isActive: true,
                lastActivity: '2024-01-15 15:10',
                currentActivity: 'Đang xử lý thanh toán',
                avatar: '/api/placeholder/40/40',
                joinDate: '2023-05-15',
                phone: '0901234570',
            },
            {
                id: '5',
                username: 'admin_staff_02',
                email: 'admin.staff02@company.com',
                fullName: 'Hoàng Văn Em',
                department: 'admin',
                role: 'staff',
                isActive: true,
                lastActivity: '2024-01-15 14:55',
                currentActivity: 'Đang tạo hợp đồng mới',
                avatar: '/api/placeholder/40/40',
                joinDate: '2023-07-01',
                phone: '0901234571',
            },
        ];

        setUsers(mockUsers);
        setFilteredUsers(mockUsers);

        const newStats = {
            total: mockUsers.length,
            active: mockUsers.filter((u) => u.isActive).length,
            managers: mockUsers.filter((u) => u.role === 'manager').length,
            staff: mockUsers.filter((u) => u.role === 'staff').length,
        };
        setStats(newStats);
    }, []);

    useEffect(() => {
        const filtered = users.filter((user) => {
            const matchesSearch =
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.fullName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'active' && user.isActive) ||
                (statusFilter === 'inactive' && !user.isActive);

            return matchesSearch && matchesDepartment && matchesStatus;
        });

        setFilteredUsers(filtered);
    }, [users, searchTerm, departmentFilter, statusFilter]);

    const handleToggleActive = (userId: string) => {
        setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, isActive: !user.isActive } : user)));
    };

    const handleUserAction = (action: string, userId: string) => {
        setShowDropdown(null);

        switch (action) {
            case 'edit':
                console.log('Edit user:', userId);
                break;
            case 'notification':
                console.log('Send notification to user:', userId);
                break;
            case 'block':
                handleToggleActive(userId);
                break;
            case 'delete':
                if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
                    setUsers((prev) => prev.filter((user) => user.id !== userId));
                }
                break;
            default:
                break;
        }
    };

    const getDepartmentLabel = (dept: string) => {
        return dept === 'admin' ? 'Phòng Hành chính' : 'Phòng Kế toán';
    };

    const getRoleLabel = (role: string) => {
        return role === 'manager' ? 'Quản lý' : 'Nhân viên';
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className={cx('user-management')}>
            <div className={cx('filter-bar')}>
                <div className={cx('filter-tabs')}>
                    <button
                        className={cx('filter-tab', { active: statusFilter === 'all' })}
                        onClick={() => setStatusFilter('all')}
                    >
                        Tất cả
                    </button>
                    <button
                        className={cx('filter-tab', { active: statusFilter === 'active' })}
                        onClick={() => setStatusFilter('active')}
                    >
                        Hoạt động
                    </button>
                    <button
                        className={cx('filter-tab', { active: statusFilter === 'inactive' })}
                        onClick={() => setStatusFilter('inactive')}
                    >
                        Tạm khóa
                    </button>
                </div>

                <div className={cx('filter-controls')}>
                    <div className={cx('search-container')}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm nhân viên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={cx('search-input')}
                        />
                        <span className={cx('search-icon')}>
                            <FontAwesomeIcon icon={faSearch} />
                        </span>
                    </div>
                    <div style={{ width: '200px' }}>
                        <Dropdown
                            value={departmentFilter}
                            onChange={(val) => setDepartmentFilter(val)}
                            options={[
                                { value: 'all', label: 'Phòng ban' },
                                { value: 'admin', label: 'Phòng Hành chính' },
                                { value: 'accounting', label: 'Phòng Kế toán' },
                            ]}
                        />
                    </div>
                    <div>
                        <Button
                            leftIcon={<FontAwesomeIcon icon={faPlus} />}
                            outline
                            medium
                            fullWidth
                            className={cx('add-user-btn')}
                        >
                            Thêm nhân viên
                        </Button>
                    </div>
                </div>
            </div>

            <div className={cx('table-container')}>
                <div className={cx('table-header')}>
                    <span>
                        Hiển thị {itemsPerPage} trên {filteredUsers.length} kết quả
                    </span>
                </div>

                <table className={cx('users-table')}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nhân viên</th>
                            <th>Phòng ban</th>
                            <th>Vai trò</th>
                            {/* <th>Hoạt động hiện tại</th> */}
                            {/* <th>Lần cuối hoạt động</th> */}
                            <th>Trạng thái</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map((user, index) => (
                            <tr key={index} className={cx('user-row')}>
                                <td>
                                    <span className={cx('user-id')}>#{user.id.padStart(3, '0')}</span>
                                </td>
                                <td>
                                    <div className={cx('user-info')}>
                                        <div className={cx('avatar-container')}>
                                            <div
                                                className={cx('avatar-circle')}
                                                style={{
                                                    backgroundColor: generateAvatarColor(user.fullName),
                                                    color: getTextColor(generateAvatarColor(user.fullName)),
                                                }}
                                            >
                                                {generateInitials(user.fullName)}
                                            </div>
                                        </div>
                                        <div className={cx('user-details')}>
                                            <div className={cx('full-name')}>{user.fullName}</div>
                                            <div className={cx('username')}>@{user.username}</div>
                                            <div className={cx('email')}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={cx('department-badge', user.department)}>
                                        {getDepartmentLabel(user.department)}
                                    </span>
                                </td>
                                <td>
                                    <span className={cx('role-badge', user.role)}>{getRoleLabel(user.role)}</span>
                                </td>
                                {/* <td>
                                    <div className={cx('activity-cell')}>
                                        <div className={cx('current-activity')}>{user.currentActivity}</div>
                                    </div>
                                </td> */}
                                {/* <td>
                                    <div className={cx('date-info')}>
                                        <div className={cx('date')}>
                                            {new Date(user.lastActivity).toLocaleDateString('vi-VN')}
                                        </div>
                                        <div className={cx('time')}>
                                            {new Date(user.lastActivity).toLocaleTimeString('vi-VN', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                    </div>
                                </td> */}

                                <td>
                                    <span
                                        className={cx('status-badge', {
                                            active: user.isActive,
                                            completed: user.isActive,
                                        })}
                                    >
                                        {user.isActive ? '● Hoạt động' : '● Tạm khóa'}
                                    </span>
                                </td>
                                <td>
                                    <div className={cx('actions')}>
                                        <Button
                                            primary
                                            small
                                            className={cx('detail-btn')}
                                            onClick={() => navigate(routePrivate.adminUserDetail(user.id))}
                                        >
                                            Chi tiết
                                        </Button>
                                        <div className={cx('dropdown-container')}>
                                            <button
                                                className={cx('more-btn')}
                                                onClick={() =>
                                                    setShowDropdown(showDropdown === user.id ? null : user.id)
                                                }
                                            >
                                                ⋮
                                            </button>
                                            {showDropdown === user.id && (
                                                <div className={cx('dropdown-menu')}>
                                                    <button onClick={() => handleUserAction('edit', user.id)}>
                                                        <div className={cx('dropdown-menu-icon')}>
                                                            <FontAwesomeIcon icon={faEdit} />
                                                        </div>
                                                        <div>Chỉnh sửa</div>
                                                    </button>
                                                    <button onClick={() => handleUserAction('block', user.id)}>
                                                        {user.isActive ? (
                                                            <div className={cx('dropdown-menu-gr')}>
                                                                <div className={cx('dropdown-menu-icon')}>
                                                                    <FontAwesomeIcon icon={faBan} />
                                                                </div>
                                                                <div>Khóa tài khoản</div>
                                                            </div>
                                                        ) : (
                                                            <div className={cx('dropdown-menu-gr')}>
                                                                <div className={cx('dropdown-menu-icon')}>
                                                                    <FontAwesomeIcon icon={faCheckCircle} />
                                                                </div>
                                                                <div>Mở khóa</div>
                                                            </div>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleUserAction('delete', user.id)}
                                                        className={cx('delete-action')}
                                                    >
                                                        <div className={cx('dropdown-menu-gr')}>
                                                            <div className={cx('dropdown-menu-icon')}>
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </div>
                                                            <div>Xóa</div>
                                                        </div>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className={cx('pagination')}>
                    <div className={cx('pagination-info')}>
                        Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} trên{' '}
                        {filteredUsers.length} kết quả
                    </div>
                    <div className={cx('pagination-controls')}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                className={cx('page-btn', { active: currentPage === page })}
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </button>
                        ))}
                        {totalPages > 5 && <span className={cx('page-dots')}>...</span>}
                        <button
                            className={cx('nav-btn')}
                            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>

            {filteredUsers.length === 0 && (
                <div className={cx('no-results')}>
                    <p>Không tìm thấy nhân viên nào phù hợp với bộ lọc.</p>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
