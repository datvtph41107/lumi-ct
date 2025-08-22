import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, 
    faFilter, 
    faDownload, 
    faEye,
    faUser,
    faCalendarAlt,
    faClock,
    faInfoCircle,
    faExclamationTriangle,
    faCheckCircle,
    faTimes,
    faFileAlt,
    faBell,
    faCog
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './AuditLog.module.scss';
import type { AuditLogEntry, AuditLogFilter } from '~/types/contract/audit-log.types';
import { Logger } from '~/core/Logger';

const cx = classNames.bind(styles);
const logger = Logger.getInstance();

const AuditLog: React.FC = () => {
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<AuditLogFilter>({
        startDate: '',
        endDate: '',
        action: '',
        userId: '',
        module: '',
        severity: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Mock data for demonstration
    const mockAuditLogs: AuditLogEntry[] = [
        {
            id: '1',
            timestamp: new Date('2024-01-15T10:30:00Z').toISOString(),
            userId: 'user1',
            userName: 'Nguyễn Văn A',
            action: 'CREATE_CONTRACT',
            module: 'contract',
            description: 'Tạo hợp đồng mới: Hợp đồng dịch vụ ABC',
            severity: 'info',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            metadata: {
                contractId: 'contract-123',
                contractName: 'Hợp đồng dịch vụ ABC',
                contractType: 'service'
            }
        },
        {
            id: '2',
            timestamp: new Date('2024-01-15T11:15:00Z').toISOString(),
            userId: 'user2',
            userName: 'Trần Thị B',
            action: 'UPDATE_MILESTONE',
            module: 'milestone',
            description: 'Cập nhật mốc thời gian: Giai đoạn 1',
            severity: 'info',
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            metadata: {
                milestoneId: 'milestone-456',
                milestoneName: 'Giai đoạn 1',
                changes: ['startDate', 'assignee']
            }
        },
        {
            id: '3',
            timestamp: new Date('2024-01-15T12:00:00Z').toISOString(),
            userId: 'admin1',
            userName: 'Admin System',
            action: 'APPROVE_CONTRACT',
            module: 'contract',
            description: 'Phê duyệt hợp đồng: Hợp đồng dịch vụ ABC',
            severity: 'success',
            ipAddress: '192.168.1.102',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            metadata: {
                contractId: 'contract-123',
                contractName: 'Hợp đồng dịch vụ ABC',
                approvalNotes: 'Hợp đồng đã được phê duyệt'
            }
        },
        {
            id: '4',
            timestamp: new Date('2024-01-15T13:30:00Z').toISOString(),
            userId: 'user1',
            userName: 'Nguyễn Văn A',
            action: 'DELETE_DRAFT',
            module: 'contract',
            description: 'Xóa bản nháp hợp đồng: Draft XYZ',
            severity: 'warning',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            metadata: {
                draftId: 'draft-789',
                draftName: 'Draft XYZ'
            }
        },
        {
            id: '5',
            timestamp: new Date('2024-01-15T14:45:00Z').toISOString(),
            userId: 'user3',
            userName: 'Lê Văn C',
            action: 'LOGIN_FAILED',
            module: 'auth',
            description: 'Đăng nhập thất bại: Sai mật khẩu',
            severity: 'error',
            ipAddress: '192.168.1.103',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
            metadata: {
                attemptCount: 3,
                reason: 'Invalid password'
            }
        }
    ];

    useEffect(() => {
        loadAuditLogs();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [auditLogs, filters]);

    const loadAuditLogs = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setAuditLogs(mockAuditLogs);
        } catch (error) {
            logger.error('Failed to load audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...auditLogs];

        if (filters.startDate) {
            filtered = filtered.filter(log => 
                new Date(log.timestamp) >= new Date(filters.startDate)
            );
        }

        if (filters.endDate) {
            filtered = filtered.filter(log => 
                new Date(log.timestamp) <= new Date(filters.endDate + 'T23:59:59')
            );
        }

        if (filters.action) {
            filtered = filtered.filter(log => 
                log.action.toLowerCase().includes(filters.action.toLowerCase())
            );
        }

        if (filters.userId) {
            filtered = filtered.filter(log => 
                log.userId.toLowerCase().includes(filters.userId.toLowerCase()) ||
                log.userName.toLowerCase().includes(filters.userId.toLowerCase())
            );
        }

        if (filters.module) {
            filtered = filtered.filter(log => 
                log.module.toLowerCase().includes(filters.module.toLowerCase())
            );
        }

        if (filters.severity) {
            filtered = filtered.filter(log => 
                log.severity === filters.severity
            );
        }

        // Sort by timestamp (newest first)
        filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setFilteredLogs(filtered);
    };

    const handleFilterChange = (key: keyof AuditLogFilter, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            action: '',
            userId: '',
            module: '',
            severity: ''
        });
    };

    const handleViewDetail = (log: AuditLogEntry) => {
        setSelectedLog(log);
        setShowDetailModal(true);
    };

    const exportAuditLogs = () => {
        // TODO: Implement export functionality
        logger.info('Exporting audit logs');
        alert('Tính năng xuất dữ liệu sẽ được triển khai');
    };

    const getActionLabel = (action: string) => {
        const actionLabels: Record<string, string> = {
            'CREATE_CONTRACT': 'Tạo hợp đồng',
            'UPDATE_CONTRACT': 'Cập nhật hợp đồng',
            'DELETE_CONTRACT': 'Xóa hợp đồng',
            'APPROVE_CONTRACT': 'Phê duyệt hợp đồng',
            'REJECT_CONTRACT': 'Từ chối hợp đồng',
            'CREATE_MILESTONE': 'Tạo mốc thời gian',
            'UPDATE_MILESTONE': 'Cập nhật mốc thời gian',
            'DELETE_MILESTONE': 'Xóa mốc thời gian',
            'CREATE_TASK': 'Tạo công việc',
            'UPDATE_TASK': 'Cập nhật công việc',
            'DELETE_TASK': 'Xóa công việc',
            'LOGIN': 'Đăng nhập',
            'LOGOUT': 'Đăng xuất',
            'LOGIN_FAILED': 'Đăng nhập thất bại',
            'CREATE_DRAFT': 'Tạo bản nháp',
            'UPDATE_DRAFT': 'Cập nhật bản nháp',
            'DELETE_DRAFT': 'Xóa bản nháp'
        };
        return actionLabels[action] || action;
    };

    const getModuleLabel = (module: string) => {
        const moduleLabels: Record<string, string> = {
            'contract': 'Hợp đồng',
            'milestone': 'Mốc thời gian',
            'task': 'Công việc',
            'auth': 'Xác thực',
            'user': 'Người dùng',
            'notification': 'Thông báo',
            'template': 'Mẫu hợp đồng'
        };
        return moduleLabels[module] || module;
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'error':
                return faExclamationTriangle;
            case 'warning':
                return faExclamationTriangle;
            case 'success':
                return faCheckCircle;
            case 'info':
                return faInfoCircle;
            default:
                return faInfoCircle;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'error':
                return 'var(--danger-color)';
            case 'warning':
                return 'var(--warning-color)';
            case 'success':
                return 'var(--success-color)';
            case 'info':
                return 'var(--primary-color)';
            default:
                return 'var(--text-secondary)';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const date = new Date(timestamp);
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'Vừa xong';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} phút trước`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} giờ trước`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} ngày trước`;
        }
    };

    return (
        <div className={cx('audit-log')}>
            <div className={cx('header')}>
                <div className={cx('header-content')}>
                    <h1>Audit Log</h1>
                    <p>Theo dõi hoạt động hệ thống và hành động người dùng</p>
                </div>
                
                <div className={cx('header-actions')}>
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={cx('filter-btn')}
                    >
                        <FontAwesomeIcon icon={faFilter} />
                        Bộ lọc
                    </button>
                    <button
                        type="button"
                        onClick={exportAuditLogs}
                        className={cx('export-btn')}
                    >
                        <FontAwesomeIcon icon={faDownload} />
                        Xuất dữ liệu
                    </button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className={cx('filters-panel')}>
                    <div className={cx('filters-grid')}>
                        <div className={cx('filter-group')}>
                            <label>Từ ngày</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            />
                        </div>
                        <div className={cx('filter-group')}>
                            <label>Đến ngày</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            />
                        </div>
                        <div className={cx('filter-group')}>
                            <label>Hành động</label>
                            <input
                                type="text"
                                placeholder="Tìm kiếm hành động..."
                                value={filters.action}
                                onChange={(e) => handleFilterChange('action', e.target.value)}
                            />
                        </div>
                        <div className={cx('filter-group')}>
                            <label>Người dùng</label>
                            <input
                                type="text"
                                placeholder="Tìm kiếm người dùng..."
                                value={filters.userId}
                                onChange={(e) => handleFilterChange('userId', e.target.value)}
                            />
                        </div>
                        <div className={cx('filter-group')}>
                            <label>Module</label>
                            <select
                                value={filters.module}
                                onChange={(e) => handleFilterChange('module', e.target.value)}
                            >
                                <option value="">Tất cả</option>
                                <option value="contract">Hợp đồng</option>
                                <option value="milestone">Mốc thời gian</option>
                                <option value="task">Công việc</option>
                                <option value="auth">Xác thực</option>
                                <option value="user">Người dùng</option>
                                <option value="notification">Thông báo</option>
                            </select>
                        </div>
                        <div className={cx('filter-group')}>
                            <label>Mức độ</label>
                            <select
                                value={filters.severity}
                                onChange={(e) => handleFilterChange('severity', e.target.value)}
                            >
                                <option value="">Tất cả</option>
                                <option value="error">Lỗi</option>
                                <option value="warning">Cảnh báo</option>
                                <option value="success">Thành công</option>
                                <option value="info">Thông tin</option>
                            </select>
                        </div>
                    </div>
                    <div className={cx('filter-actions')}>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className={cx('clear-btn')}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>
            )}

            {/* Results Summary */}
            <div className={cx('results-summary')}>
                <span>Hiển thị {filteredLogs.length} kết quả</span>
                {Object.values(filters).some(f => f) && (
                    <span className={cx('filtered-indicator')}>
                        (Đã lọc)
                    </span>
                )}
            </div>

            {/* Audit Logs Table */}
            <div className={cx('audit-logs-table')}>
                {loading ? (
                    <div className={cx('loading')}>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className={cx('empty-state')}>
                        <FontAwesomeIcon icon={faInfoCircle} />
                        <p>Không có dữ liệu audit log nào</p>
                    </div>
                ) : (
                    <div className={cx('table-container')}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Thời gian</th>
                                    <th>Người dùng</th>
                                    <th>Hành động</th>
                                    <th>Module</th>
                                    <th>Mô tả</th>
                                    <th>Mức độ</th>
                                    <th>IP</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td>
                                            <div className={cx('timestamp')}>
                                                <div className={cx('time')}>
                                                    {formatTimestamp(log.timestamp)}
                                                </div>
                                                <div className={cx('time-ago')}>
                                                    {formatTimeAgo(log.timestamp)}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={cx('user-info')}>
                                                <FontAwesomeIcon icon={faUser} />
                                                <span>{log.userName}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={cx('action')}>
                                                {getActionLabel(log.action)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={cx('module')}>
                                                {getModuleLabel(log.module)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={cx('description')}>
                                                {log.description}
                                            </div>
                                        </td>
                                        <td>
                                            <span 
                                                className={cx('severity', log.severity)}
                                                style={{ color: getSeverityColor(log.severity) }}
                                            >
                                                <FontAwesomeIcon icon={getSeverityIcon(log.severity)} />
                                                {log.severity}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={cx('ip-address')}>
                                                {log.ipAddress}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => handleViewDetail(log)}
                                                className={cx('view-btn')}
                                                title="Xem chi tiết"
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedLog && (
                <div className={cx('detail-modal-overlay')} onClick={() => setShowDetailModal(false)}>
                    <div className={cx('detail-modal')} onClick={(e) => e.stopPropagation()}>
                        <div className={cx('modal-header')}>
                            <h3>Chi tiết Audit Log</h3>
                            <button
                                type="button"
                                onClick={() => setShowDetailModal(false)}
                                className={cx('close-btn')}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <div className={cx('modal-content')}>
                            <div className={cx('detail-section')}>
                                <h4>Thông tin cơ bản</h4>
                                <div className={cx('detail-grid')}>
                                    <div className={cx('detail-item')}>
                                        <label>ID:</label>
                                        <span>{selectedLog.id}</span>
                                    </div>
                                    <div className={cx('detail-item')}>
                                        <label>Thời gian:</label>
                                        <span>{formatTimestamp(selectedLog.timestamp)}</span>
                                    </div>
                                    <div className={cx('detail-item')}>
                                        <label>Người dùng:</label>
                                        <span>{selectedLog.userName} ({selectedLog.userId})</span>
                                    </div>
                                    <div className={cx('detail-item')}>
                                        <label>Hành động:</label>
                                        <span>{getActionLabel(selectedLog.action)}</span>
                                    </div>
                                    <div className={cx('detail-item')}>
                                        <label>Module:</label>
                                        <span>{getModuleLabel(selectedLog.module)}</span>
                                    </div>
                                    <div className={cx('detail-item')}>
                                        <label>Mức độ:</label>
                                        <span className={cx('severity', selectedLog.severity)}>
                                            {selectedLog.severity}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={cx('detail-section')}>
                                <h4>Mô tả</h4>
                                <p>{selectedLog.description}</p>
                            </div>

                            <div className={cx('detail-section')}>
                                <h4>Thông tin kỹ thuật</h4>
                                <div className={cx('detail-grid')}>
                                    <div className={cx('detail-item')}>
                                        <label>IP Address:</label>
                                        <span>{selectedLog.ipAddress}</span>
                                    </div>
                                    <div className={cx('detail-item')}>
                                        <label>User Agent:</label>
                                        <span className={cx('user-agent')}>{selectedLog.userAgent}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                                <div className={cx('detail-section')}>
                                    <h4>Metadata</h4>
                                    <pre className={cx('metadata')}>
                                        {JSON.stringify(selectedLog.metadata, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLog;