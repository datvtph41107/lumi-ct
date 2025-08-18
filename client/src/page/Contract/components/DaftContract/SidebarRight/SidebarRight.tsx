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
import { contractService } from '~/services/api/contract.service';
import { useEditorStore } from '~/store/editor-store';
import { useContractDraftStore } from '~/store/contract-draft-store';

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
    const [activeTab, setActiveTab] = useState<'info' | 'settings' | 'collaborators' | 'activity' | 'versions'>('info');
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

    const { editor: tiptapEditor } = useEditorStore();
    const { currentDraft, updateDraftData, performAutoSave, setDirty } = useContractDraftStore();

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
                case 'versions':
                    // versions are loaded lazily in VersionsTab component if implemented
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

    const handleQuickAction = async (action: string) => {
        switch (action) {
            case 'save':
                if (tiptapEditor && currentDraft) {
                    const html = tiptapEditor.getHTML();
                    const text = tiptapEditor.getText();
                    await updateDraftData('content_draft', {
                        mode: 'editor',
                        content: {
                            mode: 'editor',
                            editorContent: {
                                content: html,
                                plainText: text,
                                metadata: {
                                    wordCount: text.trim().split(/\s+/).filter(Boolean).length,
                                    characterCount: text.length,
                                    lastEditedAt: new Date().toISOString(),
                                    version:
                                        ((currentDraft?.contractData as any)?.content?.editorContent?.metadata
                                            ?.version || 0) + 1,
                                },
                            },
                        },
                    } as any);
                    setDirty(false);
                    try {
                        await performAutoSave();
                        alert('Đã lưu bản nháp');
                    } catch (e) {
                        alert('Lưu thất bại');
                    }
                }
                break;
            case 'preview':
                console.log('Opening preview...');
                break;
            case 'print':
                window.print();
                break;
            case 'export':
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
                <button
                    className={cx('tab-btn', { active: activeTab === 'versions' })}
                    onClick={() => setActiveTab('versions')}
                >
                    <FontAwesomeIcon icon={faHistory} />
                    Phiên bản
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
                        {activeTab === 'versions' && 'Lịch sử phiên bản'}
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
                                <div className={cx('setting-item')}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={settings.autoSave}
                                            onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                                        />
                                        Tự động lưu
                                    </label>
                                </div>
                                <div className={cx('setting-item')}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={settings.suggestions}
                                            onChange={(e) => handleSettingChange('suggestions', e.target.checked)}
                                        />
                                        Gợi ý nội dung
                                    </label>
                                </div>
                                <div className={cx('setting-item')}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications}
                                            onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                                        />
                                        Thông báo
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Collaborators Tab */}
                        {activeTab === 'collaborators' && (
                            <div className={cx('collaborators-tab')}>
                                <CollaboratorManagement contractId={resolvedContractId} currentUserId={userId || 0} />
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
                                                style={{ color: getActivityColor(item.type) }}
                                            >
                                                <FontAwesomeIcon icon={getActivityIcon(item.type)} />
                                            </div>
                                            <div className={cx('activity-details')}>
                                                <div className={cx('activity-description')}>{item.description}</div>
                                                <div className={cx('activity-meta')}>
                                                    <span className={cx('user')}>{item.user}</span>
                                                    <span className={cx('time')}>
                                                        {auditLogService.formatAuditLogDate(item.timestamp)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Versions Tab */}
                        {activeTab === 'versions' && (
                            <div className={cx('activity-tab')}>
                                <ContractVersions contractId={resolvedContractId} />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SidebarRight;

const ContractVersions = ({ contractId }: { contractId: string }) => {
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await contractService.listVersions(Number(contractId));
            setRows((res.data as any) || []);
        } catch (e) {
            setError('Không thể tải danh sách phiên bản');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, [contractId]);

    return (
        <div className={cx('activity-list')}>
            {loading && <div className={cx('loading')}>Đang tải...</div>}
            {error && <div className={cx('error')}>{error}</div>}
            {!loading && !error && (
                <table width="100%" cellPadding={6} style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left' }}>
                            <th>#</th>
                            <th>Edited At</th>
                            <th>Edited By</th>
                            <th>Summary</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((v: any) => (
                            <tr key={v.id} style={{ borderTop: '1px solid #eee' }}>
                                <td>{v.version_number}</td>
                                <td>{new Date(v.edited_at).toLocaleString()}</td>
                                <td>{v.edited_by}</td>
                                <td>{v.change_summary || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
