import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ContractManagement.module.scss';
import { routePrivate } from '~/config/routes.config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEdit,
    faBell,
    faBan,
    faUsers,
    faSearch,
    faTrash,
    faClock,
    faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import Dropdown from '~/page/Contract/components/Dropdown/Dropdown';
import Button from '~/components/Button';

const cx = classNames.bind(styles);

interface Contract {
    id: string;
    title: string;
    contractNumber: string;
    type: 'basic' | 'editor';
    status: 'draft' | 'pending' | 'active' | 'completed' | 'expired' | 'cancelled';
    department: 'admin' | 'accounting';
    owner: {
        id: string;
        name: string;
        avatar: string;
    };
    collaborators: Array<{
        id: string;
        name: string;
        role: 'owner' | 'editor' | 'reviewer' | 'viewer';
        avatar: string;
    }>;
    createdDate: string;
    startDate: string;
    endDate: string;
    lastModified: string;
    priority: 'low' | 'medium' | 'high';
    progress: number;
    notifications: number;
}

interface ContractStats {
    total: number;
    active: number;
    pending: number;
    completed: number;
    expired: number;
}

const generateInitials = (fullName: string): string => {
    const words = fullName
        .trim()
        .split(' ')
        .filter((word) => word.length > 0);
    if (words.length === 0) return 'C';
    if (words.length === 1) return words[0].charAt(0).toUpperCase();

    const firstLetter = words[0].charAt(0).toUpperCase();
    const lastLetter = words[words.length - 1].charAt(0).toUpperCase();
    return firstLetter + lastLetter;
};

const generateAvatarColor = (name: string): string => {
    const colors = [
        '#E3F2FD',
        '#F3E5F5',
        '#E8F5E8',
        '#FFF3E0',
        '#FCE4EC',
        '#F1F8E9',
        '#E0F2F1',
        '#FFF8E1',
        '#EFEBE9',
        '#F9FBE7',
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const getTextColor = (bgColor: string): string => {
    const textColors: { [key: string]: string } = {
        '#E3F2FD': '#1565C0',
        '#F3E5F5': '#7B1FA2',
        '#E8F5E8': '#2E7D32',
        '#FFF3E0': '#E65100',
        '#FCE4EC': '#C2185B',
        '#F1F8E9': '#689F38',
        '#E0F2F1': '#00695C',
        '#FFF8E1': '#F57F17',
        '#EFEBE9': '#5D4037',
        '#F9FBE7': '#827717',
    };
    return textColors[bgColor] || '#333333';
};

const ContractManagement: React.FC = () => {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [showDropdown, setShowDropdown] = useState<string | null>(null);
    const [stats, setStats] = useState<ContractStats>({ total: 0, active: 0, pending: 0, completed: 0, expired: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        const mockContracts: Contract[] = [
            {
                id: '1',
                title: 'Hợp đồng cung cấp dịch vụ IT',
                contractNumber: 'HD-2024-001',
                type: 'editor',
                status: 'active',
                department: 'admin',
                owner: { id: '1', name: 'Nguyễn Văn An', avatar: '' },
                collaborators: [
                    { id: '1', name: 'Nguyễn Văn An', role: 'owner', avatar: '' },
                    { id: '2', name: 'Trần Thị Bình', role: 'editor', avatar: '' },
                    { id: '3', name: 'Lê Văn Cường', role: 'reviewer', avatar: '' },
                ],
                createdDate: '2024-01-10',
                startDate: '2024-01-15',
                endDate: '2024-12-31',
                lastModified: '2024-01-15 14:30',
                priority: 'high',
                progress: 75,
                notifications: 2,
            },
            {
                id: '2',
                title: 'Hợp đồng thuê văn phòng',
                contractNumber: 'HD-2024-002',
                type: 'basic',
                status: 'pending',
                department: 'admin',
                owner: { id: '2', name: 'Trần Thị Bình', avatar: '' },
                collaborators: [
                    { id: '2', name: 'Trần Thị Bình', role: 'owner', avatar: '' },
                    { id: '4', name: 'Phạm Thị Dung', role: 'reviewer', avatar: '' },
                ],
                createdDate: '2024-01-12',
                startDate: '2024-02-01',
                endDate: '2025-01-31',
                lastModified: '2024-01-14 16:45',
                priority: 'medium',
                progress: 45,
                notifications: 1,
            },
            {
                id: '3',
                title: 'Hợp đồng dịch vụ kế toán',
                contractNumber: 'HD-2024-003',
                type: 'editor',
                status: 'draft',
                department: 'accounting',
                owner: { id: '3', name: 'Lê Văn Cường', avatar: '' },
                collaborators: [{ id: '3', name: 'Lê Văn Cường', role: 'owner', avatar: '' }],
                createdDate: '2024-01-14',
                startDate: '2024-02-15',
                endDate: '2024-08-15',
                lastModified: '2024-01-15 09:20',
                priority: 'low',
                progress: 20,
                notifications: 0,
            },
        ];

        setContracts(mockContracts);
        setFilteredContracts(mockContracts);

        const newStats = {
            total: mockContracts.length,
            active: mockContracts.filter((c) => c.status === 'active').length,
            pending: mockContracts.filter((c) => c.status === 'pending').length,
            completed: mockContracts.filter((c) => c.status === 'completed').length,
            expired: mockContracts.filter((c) => c.status === 'expired').length,
        };
        setStats(newStats);
    }, []);

    useEffect(() => {
        const filtered = contracts.filter((contract) => {
            const matchesSearch =
                contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contract.owner.name.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDepartment = departmentFilter === 'all' || contract.department === departmentFilter;
            const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
            const matchesType = typeFilter === 'all' || contract.type === typeFilter;

            return matchesSearch && matchesDepartment && matchesStatus && matchesType;
        });

        setFilteredContracts(filtered);
    }, [contracts, searchTerm, departmentFilter, statusFilter, typeFilter]);

    const handleContractAction = (action: string, contractId: string) => {
        setShowDropdown(null);

        switch (action) {
            case 'edit':
                console.log('Edit contract:', contractId);
                break;
            case 'notification':
                console.log('Send notification for contract:', contractId);
                break;
            case 'cancel':
                if (window.confirm('Bạn có chắc chắn muốn hủy hợp đồng này?')) {
                    setContracts((prev) =>
                        prev.map((contract) =>
                            contract.id === contractId ? { ...contract, status: 'cancelled' as const } : contract,
                        ),
                    );
                }
                break;
            case 'delete':
                if (window.confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) {
                    setContracts((prev) => prev.filter((contract) => contract.id !== contractId));
                }
                break;
            default:
                break;
        }
    };

    const getDepartmentLabel = (dept: string) => {
        return dept === 'admin' ? 'Phòng Hành chính' : 'Phòng Kế toán';
    };

    const getStatusLabel = (status: string) => {
        const statusLabels = {
            draft: 'Bản nháp',
            pending: 'Chờ duyệt',
            active: 'Đang thực hiện',
            completed: 'Hoàn thành',
            expired: 'Hết hạn',
            cancelled: 'Đã hủy',
        };
        return statusLabels[status as keyof typeof statusLabels] || status;
    };

    const getTypeLabel = (type: string) => {
        return type === 'basic' ? 'Cơ bản' : 'Soạn thảo';
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high':
                return <FontAwesomeIcon icon={faExclamationTriangle} className={cx('priority-high')} />;
            case 'medium':
                return <FontAwesomeIcon icon={faClock} className={cx('priority-medium')} />;
            default:
                return null;
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentContracts = filteredContracts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className={cx('contract-management')}>
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
                        Đang thực hiện
                    </button>
                    <button
                        className={cx('filter-tab', { active: statusFilter === 'pending' })}
                        onClick={() => setStatusFilter('pending')}
                    >
                        Chờ duyệt
                    </button>
                    <button
                        className={cx('filter-tab', { active: statusFilter === 'draft' })}
                        onClick={() => setStatusFilter('draft')}
                    >
                        Bản nháp
                    </button>
                </div>

                <div className={cx('filter-controls')}>
                    <div className={cx('search-container')}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm hợp đồng..."
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
                    <div style={{ width: '150px' }}>
                        <Dropdown
                            value={typeFilter}
                            onChange={(val) => setTypeFilter(val)}
                            options={[
                                { value: 'all', label: 'Loại hợp đồng' },
                                { value: 'basic', label: 'Cơ bản' },
                                { value: 'editor', label: 'Soạn thảo' },
                            ]}
                        />
                    </div>
                    <div>
                        <Button outline medium fullWidth primary className={cx('add-contract-btn')}>
                            + Tạo hợp đồng
                        </Button>
                    </div>
                </div>
            </div>

            <div className={cx('table-container')}>
                <div className={cx('table-header')}>
                    <span>
                        Hiển thị {itemsPerPage} trên {filteredContracts.length} kết quả
                    </span>
                </div>

                <table className={cx('contracts-table')}>
                    <thead>
                        <tr>
                            <th>Mã HĐ</th>
                            <th>Thông tin hợp đồng</th>
                            <th>Phòng ban</th>
                            <th>Loại</th>
                            <th>Người phụ trách</th>
                            <th>Tiến độ</th>
                            <th>Trạng thái</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentContracts.map((contract, index) => (
                            <tr key={index} className={cx('contract-row')}>
                                <td>
                                    <div className={cx('contract-id')}>
                                        <span className={cx('contract-number')}>{contract.contractNumber}</span>
                                        {getPriorityIcon(contract.priority)}
                                    </div>
                                </td>
                                <td>
                                    <div className={cx('contract-info')}>
                                        <div className={cx('contract-title')}>{contract.title}</div>
                                        <div className={cx('contract-dates')}>
                                            <span>Từ {new Date(contract.startDate).toLocaleDateString('vi-VN')}</span>
                                            <span> - </span>
                                            <span>đến {new Date(contract.endDate).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div className={cx('last-modified')}>
                                            Cập nhật: {new Date(contract.lastModified).toLocaleString('vi-VN')}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={cx('department-badge', contract.department)}>
                                        {getDepartmentLabel(contract.department)}
                                    </span>
                                </td>
                                <td>
                                    <span className={cx('type-badge', contract.type)}>
                                        {getTypeLabel(contract.type)}
                                    </span>
                                </td>
                                <td>
                                    <div className={cx('collaborators-info')}>
                                        <div className={cx('owner-info')}>
                                            <div
                                                className={cx('avatar-circle')}
                                                style={{
                                                    backgroundColor: generateAvatarColor(contract.owner.name),
                                                    color: getTextColor(generateAvatarColor(contract.owner.name)),
                                                }}
                                            >
                                                {generateInitials(contract.owner.name)}
                                            </div>
                                            <span className={cx('owner-name')}>{contract.owner.name}</span>
                                        </div>
                                        <div className={cx('collaborators-count')}>
                                            <FontAwesomeIcon icon={faUsers} />
                                            <span>{contract.collaborators.length} người</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className={cx('progress-info')}>
                                        {/* <div className={cx('progress-bar')}>
                                            <div
                                                className={cx('progress-fill')}
                                                style={{ width: `${contract.progress}%` }}
                                            ></div>
                                        </div> */}
                                        <span className={cx('progress-text')}>{contract.progress}%</span>
                                    </div>
                                </td>
                                <td>
                                    <div className={cx('status-info')}>
                                        <span className={cx('status-badge', contract.status)}>
                                            {getStatusLabel(contract.status)}
                                        </span>
                                        {contract.notifications > 0 && (
                                            <span className={cx('notification-badge')}>
                                                <FontAwesomeIcon icon={faBell} />
                                                {contract.notifications}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className={cx('actions')}>
                                        <Button
                                            primary
                                            small
                                            className={cx('detail-btn')}
                                            onClick={() => navigate(routePrivate.contractDetail(contract.id))}
                                        >
                                            Chi tiết
                                        </Button>
                                        <div className={cx('dropdown-container')}>
                                            <button
                                                className={cx('more-btn')}
                                                onClick={() =>
                                                    setShowDropdown(showDropdown === contract.id ? null : contract.id)
                                                }
                                            >
                                                ⋮
                                            </button>
                                            {showDropdown === contract.id && (
                                                <div className={cx('dropdown-menu')}>
                                                    <button onClick={() => handleContractAction('edit', contract.id)}>
                                                        <div className={cx('dropdown-menu-icon')}>
                                                            <FontAwesomeIcon icon={faEdit} />
                                                        </div>
                                                        <div>Chỉnh sửa</div>
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleContractAction('notification', contract.id)
                                                        }
                                                    >
                                                        <div className={cx('dropdown-menu-icon')}>
                                                            <FontAwesomeIcon icon={faBell} />
                                                        </div>
                                                        <div>Gửi thông báo</div>
                                                    </button>
                                                    <button onClick={() => handleContractAction('cancel', contract.id)}>
                                                        <div className={cx('dropdown-menu-icon')}>
                                                            <FontAwesomeIcon icon={faBan} />
                                                        </div>
                                                        <div>Hủy hợp đồng</div>
                                                    </button>
                                                    <button
                                                        onClick={() => handleContractAction('delete', contract.id)}
                                                        className={cx('delete-action')}
                                                    >
                                                        <div className={cx('dropdown-menu-icon')}>
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </div>
                                                        <div>Xóa</div>
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
                        Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredContracts.length)} trên{' '}
                        {filteredContracts.length} kết quả
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

            {filteredContracts.length === 0 && (
                <div className={cx('no-results')}>
                    <p>Không tìm thấy hợp đồng nào phù hợp với bộ lọc.</p>
                </div>
            )}
        </div>
    );
};

export default ContractManagement;
