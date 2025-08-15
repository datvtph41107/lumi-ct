import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faInfoCircle,
    faCog,
    faUsers,
    faHistory,
    faPlus,
    faSave,
    faEye,
    faPrint,
    faDownload,
    faEdit,
    faTrash,
    faUser,
    faCalendarAlt,
    faFileAlt,
    faCheckCircle,
    faExclamationTriangle,
    faClock,
} from '@fortawesome/free-solid-svg-icons';
import styles from './SidebarRight.module.scss';
import classNames from 'classnames/bind';
import { useLocation } from 'react-router-dom';
import CollaboratorManagement from '~/components/CollaboratorManagement/CollaboratorManagement';
import { auditLogService } from '~/services/api/audit-log.service';

const cx = classNames.bind(styles);

interface SidebarRightProps {
    contractId?: string;
    userId?: number;
    editor?: any;
}

interface ContractInfo {
    id: string;
    name: string;
    status: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    wordCount: number;
    characterCount: number;
    collaborators: number;
    milestones: number;
    tasks: number;
}

interface Collaborator {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    joinedAt: string;
}

interface ActivityItem {
    id: string;
    action: string;
    description: string;
    timestamp: string;
    user: string;
    type: 'edit' | 'save' | 'share' | 'comment';
}

const SidebarRight: React.FC<SidebarRightProps> = ({ contractId, userId, editor }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'settings' | 'collaborators' | 'activity'>('info');
    const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [settings, setSettings] = useState({
        autoSave: true,
        spellCheck: true,
        suggestions: true,
        notifications: true,
        darkMode: false,
    });
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const resolvedContractId = contractId || query.get('draftId') || 'contract-001';

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Simulate API calls
            await new Promise((resolve) => setTimeout(resolve, 300));

            switch (activeTab) {
                case 'info':
                    setContractInfo({
                        id: 'contract-001',
                        name: 'Hợp đồng lao động - Nguyễn Văn A',
                        status: 'draft',
                        type: 'employment',
                        createdAt: '2024-01-15 10:30',
                        updatedAt: '2024-01-15 14:20',
                        createdBy: 'Nguyễn Văn A',
                        wordCount: 1250,
                        characterCount: 8500,
                        collaborators: 3,
                        milestones: 5,
                        tasks: 12,
                    });
                    break;
                case 'collaborators':
                    // Collaborator list is rendered by CollaboratorManagement
                    break;
                case 'activity':
                    // Fetch real audit activity if available
                    try {
                        const recent = await auditLogService.getRecentActivity(resolvedContractId, 10);
                        setActivity(
                            recent.map((log) => ({
                                id: String(log.id),
                                action: log.action,
                                description: log.description || auditLogService.getActionDisplayName(log.action),
                                timestamp: log.created_at,
                                user: log.user_name || `${log.user_id}`,
                                type: 'edit',
                            })),
                        );
                    } catch {}
                    break;
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSettingChange = (key: string, value: boolean) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'save':
                if (editor) {
                    // Trigger save
                    console.log('Saving...');
                }
                break;
            case 'preview':
                // Open preview
                console.log('Opening preview...');
                break;
            case 'print':
                window.print();
                break;
            case 'export':
                // Export functionality
                console.log('Exporting...');
                break;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return '#ffc107';
            case 'in_progress':
                return '#007bff';
            case 'completed':
                return '#28a745';
            case 'archived':
                return '#6c757d';
            default:
                return '#6c757d';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'draft':
                return 'Bản nháp';
            case 'in_progress':
                return 'Đang soạn thảo';
            case 'completed':
                return 'Hoàn thành';
            case 'archived':
                return 'Đã lưu trữ';
            default:
                return status;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'owner':
                return '#e74c3c';
            case 'editor':
                return '#3498db';
            case 'viewer':
                return '#27ae60';
            default:
                return '#6c757d';
        }
    };

    const getRoleText = (role: string) => {
        switch (role) {
            case 'owner':
                return 'Chủ sở hữu';
            case 'editor':
                return 'Chỉnh sửa';
            case 'viewer':
                return 'Xem';
            default:
                return role;
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'edit':
                return faEdit;
            case 'save':
                return faSave;
            case 'share':
                return faUsers;
            case 'comment':
                return faFileAlt;
            default:
                return faHistory;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'edit':
                return '#3498db';
            case 'save':
                return '#27ae60';
            case 'share':
                return '#f39c12';
            case 'comment':
                return '#9b59b6';
            default:
                return '#6c757d';
        }
    };

    return (
        <div className={cx('sidebar-right')}>
            <div className={cx('tab-navigation')}>
                <button
                    className={cx('tab-btn', { active: activeTab === 'info' })}
                    onClick={() => setActiveTab('info')}
                >
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Thông tin
                </button>
                <button
                    className={cx('tab-btn', { active: activeTab === 'settings' })}
                    onClick={() => setActiveTab('settings')}
                >
                    <FontAwesomeIcon icon={faCog} />
                    Cài đặt
                </button>
                <button
                    className={cx('tab-btn', { active: activeTab === 'collaborators' })}
                    onClick={() => setActiveTab('collaborators')}
                >
                    <FontAwesomeIcon icon={faUsers} />
                    Cộng tác
                </button>
                <button
                    className={cx('tab-btn', { active: activeTab === 'activity' })}
                    onClick={() => setActiveTab('activity')}
                >
                    <FontAwesomeIcon icon={faHistory} />
                    Hoạt động
                </button>
            </div>

            <div className={cx('tab-content')}>
                <div className={cx('tab-header')}>
                    <h3>
                        {activeTab === 'info' && <FontAwesomeIcon icon={faInfoCircle} />}
                        {activeTab === 'settings' && <FontAwesomeIcon icon={faCog} />}
                        {activeTab === 'collaborators' && <FontAwesomeIcon icon={faUsers} />}
                        {activeTab === 'activity' && <FontAwesomeIcon icon={faHistory} />}
                        {activeTab === 'info' && 'Thông tin hợp đồng'}
                        {activeTab === 'settings' && 'Cài đặt'}
                        {activeTab === 'collaborators' && 'Cộng tác viên'}
                        {activeTab === 'activity' && 'Hoạt động gần đây'}
                    </h3>
                    {activeTab === 'collaborators' && (
                        <button className={cx('add-collaborator-btn')}>
                            <FontAwesomeIcon icon={faPlus} />
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className={cx('loading')}>Đang tải...</div>
                ) : (
                    <>
                        {/* Info Tab */}
                        {activeTab === 'info' && contractInfo && (
                            <div className={cx('info-tab')}>
                                <div className={cx('contract-info')}>
                                    <div className={cx('info-section')}>
                                        <h4>Tên hợp đồng</h4>
                                        <p>{contractInfo.name}</p>
                                    </div>

                                    <div className={cx('info-section')}>
                                        <h4>Trạng thái</h4>
                                        <span
                                            className={cx('status-badge')}
                                            style={{ backgroundColor: getStatusColor(contractInfo.status) }}
                                        >
                                            {getStatusText(contractInfo.status)}
                                        </span>
                                    </div>

                                    <div className={cx('info-section')}>
                                        <h4>Thống kê</h4>
                                        <div className={cx('stats-grid')}>
                                            <div className={cx('stat-item')}>
                                                <span className={cx('stat-label')}>Từ</span>
                                                <span className={cx('stat-value')}>
                                                    {contractInfo.wordCount.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className={cx('stat-item')}>
                                                <span className={cx('stat-label')}>Ký tự</span>
                                                <span className={cx('stat-value')}>
                                                    {contractInfo.characterCount.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className={cx('stat-item')}>
                                                <span className={cx('stat-label')}>Cộng tác</span>
                                                <span className={cx('stat-value')}>{contractInfo.collaborators}</span>
                                            </div>
                                            <div className={cx('stat-item')}>
                                                <span className={cx('stat-label')}>Mốc thời gian</span>
                                                <span className={cx('stat-value')}>{contractInfo.milestones}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={cx('info-section')}>
                                        <h4>Thông tin thời gian</h4>
                                        <div className={cx('time-info')}>
                                            <p>
                                                <strong>Tạo lúc:</strong> {contractInfo.createdAt}
                                            </p>
                                            <p>
                                                <strong>Cập nhật:</strong> {contractInfo.updatedAt}
                                            </p>
                                            <p>
                                                <strong>Người tạo:</strong> {contractInfo.createdBy}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className={cx('quick-actions')}>
                                    <button
                                        className={cx('action-btn', 'save')}
                                        onClick={() => handleQuickAction('save')}
                                    >
                                        <FontAwesomeIcon icon={faSave} />
                                        Lưu
                                    </button>
                                    <button
                                        className={cx('action-btn', 'preview')}
                                        onClick={() => handleQuickAction('preview')}
                                    >
                                        <FontAwesomeIcon icon={faEye} />
                                        Xem trước
                                    </button>
                                    <button
                                        className={cx('action-btn', 'print')}
                                        onClick={() => handleQuickAction('print')}
                                    >
                                        <FontAwesomeIcon icon={faPrint} />
                                        In
                                    </button>
                                    <button
                                        className={cx('action-btn', 'export')}
                                        onClick={() => handleQuickAction('export')}
                                    >
                                        <FontAwesomeIcon icon={faDownload} />
                                        Xuất
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div className={cx('settings-tab')}>
                                <div className={cx('settings-list')}>
                                    <div className={cx('setting-item')}>
                                        <div className={cx('setting-info')}>
                                            <h4>Tự động lưu</h4>
                                            <p>Lưu tự động khi có thay đổi</p>
                                        </div>
                                        <label className={cx('toggle-switch')}>
                                            <input
                                                type="checkbox"
                                                checked={settings.autoSave}
                                                onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                                            />
                                            <span className={cx('slider')}></span>
                                        </label>
                                    </div>

                                    <div className={cx('setting-item')}>
                                        <div className={cx('setting-info')}>
                                            <h4>Kiểm tra chính tả</h4>
                                            <p>Hiển thị lỗi chính tả khi soạn thảo</p>
                                        </div>
                                        <label className={cx('toggle-switch')}>
                                            <input
                                                type="checkbox"
                                                checked={settings.spellCheck}
                                                onChange={(e) => handleSettingChange('spellCheck', e.target.checked)}
                                            />
                                            <span className={cx('slider')}></span>
                                        </label>
                                    </div>

                                    <div className={cx('setting-item')}>
                                        <div className={cx('setting-info')}>
                                            <h4>Gợi ý thông minh</h4>
                                            <p>Hiển thị gợi ý khi soạn thảo</p>
                                        </div>
                                        <label className={cx('toggle-switch')}>
                                            <input
                                                type="checkbox"
                                                checked={settings.suggestions}
                                                onChange={(e) => handleSettingChange('suggestions', e.target.checked)}
                                            />
                                            <span className={cx('slider')}></span>
                                        </label>
                                    </div>

                                    <div className={cx('setting-item')}>
                                        <div className={cx('setting-info')}>
                                            <h4>Thông báo</h4>
                                            <p>Nhận thông báo về thay đổi</p>
                                        </div>
                                        <label className={cx('toggle-switch')}>
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications}
                                                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                                            />
                                            <span className={cx('slider')}></span>
                                        </label>
                                    </div>

                                    <div className={cx('setting-item')}>
                                        <div className={cx('setting-info')}>
                                            <h4>Chế độ tối</h4>
                                            <p>Sử dụng giao diện tối</p>
                                        </div>
                                        <label className={cx('toggle-switch')}>
                                            <input
                                                type="checkbox"
                                                checked={settings.darkMode}
                                                onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                                            />
                                            <span className={cx('slider')}></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Collaborators Tab */}
                        {activeTab === 'collaborators' && (
                            <div className={cx('collaborators-tab')}>
                                <CollaboratorManagement contractId={resolvedContractId} currentUserId={Number(userId) || 0} />
                                <div className={cx('collaborator-tips')}>
                                    <h4>Về cộng tác viên</h4>
                                    <ul>
                                        <li>Chủ sở hữu có quyền cao nhất</li>
                                        <li>Editor có thể chỉnh sửa nội dung</li>
                                        <li>Viewer chỉ có thể xem</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Activity Tab */}
                        {activeTab === 'activity' && (
                            <div className={cx('activity-tab')}>
                                <div className={cx('activity-list')}>
                                    {activity.map((item) => (
                                        <div key={item.id} className={cx('activity-item')}>
                                            <div
                                                className={cx('activity-icon')}
                                                style={{
                                                    backgroundColor: getActivityColor(item.type) + '20',
                                                    color: getActivityColor(item.type),
                                                }}
                                            >
                                                <FontAwesomeIcon icon={getActivityIcon(item.type)} />
                                            </div>
                                            <div className={cx('activity-content')}>
                                                <p>
                                                    <strong>{item.action}</strong>: {item.description}
                                                </p>
                                                <small>
                                                    {item.timestamp} - {item.user}
                                                </small>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className={cx('activity-tips')}>
                                    <h4>Về hoạt động</h4>
                                    <ul>
                                        <li>Ghi lại mọi thay đổi</li>
                                        <li>Dễ dàng theo dõi</li>
                                        <li>Đảm bảo minh bạch</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SidebarRight;
