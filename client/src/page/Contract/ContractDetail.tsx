'use client';

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ContractDetail.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronDown,
    faChevronUp,
    faUser,
    faCalendarAlt,
    faDollarSign,
    faFileContract,
    faCloudUploadAlt,
    faDownload,
    faEye,
    faEdit,
    faTrash,
    faPlus,
    faCheck,
    faClock,
    faExclamationTriangle,
    faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import { useContract } from '~/contexts/ContractContext';
import { AuditLog } from '~/components/AuditLog';

const cx = classNames.bind(styles);

interface Milestone {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: 'completed' | 'in-progress' | 'pending' | 'overdue';
    progress: number;
    tasks: Task[];
    paymentAmount?: string;
}

interface Task {
    id: string;
    title: string;
    description: string;
    assignee: string;
    dueDate: string;
    status: 'completed' | 'in-progress' | 'pending' | 'overdue';
    priority: 'high' | 'medium' | 'low';
}

interface Partner {
    id: string;
    name: string;
    role: string;
    contact: string;
    email: string;
}

interface Collaborator {
    id: string;
    name: string;
    email: string;
    role: 'Owner' | 'Editor' | 'Reviewer' | 'Viewer';
    addedDate: string;
    avatar?: string;
}

interface AuditLogEntry {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    details: string;
    ipAddress?: string;
    userAgent?: string;
}

interface Attachment {
    id: string;
    name: string;
    type: string;
    size: string;
    uploadDate: string;
    url: string;
}

const ContractDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        overview: true,
        milestones: true,
        partners: false,
        attachments: false,
        collaborators: true, // moved to sidebar, keep expanded by default
    });

    const [newComment, setNewComment] = useState('');
    const { getContractById, addComment, loading, error } = useContract();
    const contract = getContractById(id || '');

    const collaborators: Collaborator[] = [
        {
            id: '1',
            name: 'Jakub Hampl',
            email: 'jakub@example.com',
            role: 'Owner',
            addedDate: '2020-09-15',
        },
        {
            id: '2',
            name: 'Diffix Explorer',
            email: 'diffix@example.com',
            role: 'Editor',
            addedDate: '2020-09-20',
        },
        {
            id: '3',
            name: 'John Reviewer',
            email: 'john@example.com',
            role: 'Reviewer',
            addedDate: '2020-09-25',
        },
    ];

    const auditLogEntries: AuditLogEntry[] = [
        {
            id: '1',
            timestamp: '12:58:51',
            user: 'Nguyễn Văn A',
            action: "Cập nhật tiến độ giai đoạn 'Thiết kế UI/UX'",
            details: 'Tiến độ từ 65% lên 80%. IP Address: 127.0.0.1',
        },
        {
            id: '2',
            timestamp: '12:58:32',
            user: 'Trần Thị B',
            action: 'Thay đổi quyền cộng tác viên',
            details: 'Cấp quyền Editor cho Lê Văn C',
        },
        {
            id: '3',
            timestamp: '12:58:06',
            user: 'Lê Văn C',
            action: 'Đăng nhập hệ thống',
            details: 'IP Address: 127.0.0.1 Peer: 127.0.0.1:53760',
        },
        {
            id: '4',
            timestamp: '12:57:15',
            user: 'Nguyễn Văn A',
            action: 'Upload tài liệu hợp đồng',
            details: "Tải lên file 'Hop_dong_thiet_ke_v2.pdf' (2.3MB)",
        },
        {
            id: '5',
            timestamp: '12:56:42',
            user: 'Trần Thị B',
            action: 'Tạo giai đoạn mới',
            details: "Thêm giai đoạn 'Kiểm thử và bàn giao'",
        },
        {
            id: '6',
            timestamp: '07:17:40',
            user: 'Lê Văn C',
            action: 'Hoàn thành công việc',
            details: "Đánh dấu hoàn thành task 'Thiết kế mockup trang chủ'",
        },
        {
            id: '7',
            timestamp: '13:51:47',
            user: 'Nguyễn Văn A',
            action: 'Cập nhật thông tin hợp đồng',
            details: 'Thay đổi ngày kết thúc từ 15/12/2024 thành 20/12/2024',
        },
        {
            id: '8',
            timestamp: '10:08:26',
            user: 'Trần Thị B',
            action: 'Thêm bình luận',
            details: 'Gửi phản hồi về tiến độ giai đoạn hiện tại',
        },
        {
            id: '9',
            timestamp: '10:07:47',
            user: 'Lê Văn C',
            action: 'Chỉnh sửa thông tin đối tác',
            details: 'Cập nhật email liên hệ của công ty ABC',
        },
    ];

    const availableUsers = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'];
    const availableEventTypes = [
        'Cập nhật tiến độ giai đoạn',
        'Thay đổi quyền cộng tác viên',
        'Đăng nhập hệ thống',
        'Upload tài liệu hợp đồng',
        'Tạo giai đoạn mới',
        'Hoàn thành công việc',
        'Cập nhật thông tin hợp đồng',
        'Thêm bình luận',
        'Chỉnh sửa thông tin đối tác',
    ];

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'var(--green-block)';
            case 'in-progress':
                return 'var(--text-active)';
            case 'pending':
                return '#bf8700';
            case 'overdue':
                return '#d72c0d';
            default:
                return 'var(--text-op)';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Hoàn thành';
            case 'in-progress':
                return 'Đang thực hiện';
            case 'pending':
                return 'Chờ thực hiện';
            case 'overdue':
                return 'Quá hạn';
            default:
                return 'Không xác định';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return faCheck;
            case 'in-progress':
                return faClock;
            case 'pending':
                return faClock;
            case 'overdue':
                return faExclamationTriangle;
            default:
                return faClock;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return '#d72c0d';
            case 'medium':
                return '#bf8700';
            case 'low':
                return 'var(--green-block)';
            default:
                return 'var(--text-op)';
        }
    };

    const getCollaboratorRoleColor = (role: string) => {
        switch (role) {
            case 'Owner':
                return '#d72c0d';
            case 'Editor':
                return 'var(--text-active)';
            case 'Reviewer':
                return '#bf8700';
            case 'Viewer':
                return 'var(--text-op)';
            default:
                return 'var(--text-op)';
        }
    };

    const getUserAvatarColor = (user: string) => {
        const colors = {
            'Nguyễn Văn A': 'var(--text-active)',
            'Trần Thị B': '#bf8700',
            'Lê Văn C': 'var(--green-block)',
        };
        return colors[user as keyof typeof colors] || 'var(--text-op)';
    };

    const getUserInitials = (user: string) => {
        return user
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase();
    };

    const handleSubmitComment = () => {
        if (newComment.trim()) {
            addComment(contract.id, newComment.trim());
            setNewComment('');
        }
    };

    if (loading) {
        return (
            <div className={cx('loading-container')}>
                <div className={cx('loading-spinner')}></div>
                <p>Đang tải thông tin hợp đồng...</p>
            </div>
        );
    }

    if (error || !contract) {
        return (
            <div className={cx('error-container')}>
                <h2>Không tìm thấy hợp đồng</h2>
                <p>{error || 'Hợp đồng không tồn tại hoặc đã bị xóa'}</p>
                <button onClick={() => navigate('/contract')}>Quay lại danh sách</button>
            </div>
        );
    }

    const { milestones, partners, attachments, activities } = contract;

    return (
        <div className={cx('contract-detail')}>
            <div className={cx('header')}>
                <button className={cx('back-button')} onClick={() => navigate(-1)}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Quay lại
                </button>
                <div className={cx('header-content')}>
                    <h1 className={cx('title')}>{contract.title}</h1>
                    <div className={cx('header-actions')}>
                        <button className={cx('action-button', 'edit')}>
                            <FontAwesomeIcon icon={faEdit} />
                            Chỉnh sửa
                        </button>
                        <button className={cx('action-button', 'delete')}>
                            <FontAwesomeIcon icon={faTrash} />
                            Xóa
                        </button>
                    </div>
                </div>
            </div>

            <div className={cx('content')}>
                <div className={cx('main-content')}>
                    {/* Contract Overview */}
                    <div className={cx('section')}>
                        <div className={cx('section-header')} onClick={() => toggleSection('overview')}>
                            <h3>Thông tin tổng quan</h3>
                            <FontAwesomeIcon icon={expandedSections.overview ? faChevronUp : faChevronDown} />
                        </div>
                        {expandedSections.overview && (
                            <div className={cx('section-content')}>
                                <p className={cx('description')}>{contract.description}</p>
                                <div className={cx('overview-details')}>
                                    <div className={cx('detail-item')}>
                                        <strong>Loại hợp đồng:</strong> {contract.category}
                                    </div>
                                    <div className={cx('detail-item')}>
                                        <strong>Thời gian thực hiện:</strong> {contract.startDate} - {contract.endDate}
                                    </div>
                                    <div className={cx('detail-item')}>
                                        <strong>Giá trị hợp đồng:</strong> {contract.value}
                                    </div>
                                    <div className={cx('detail-item')}>
                                        <strong>Tiến độ tổng thể:</strong>
                                        <div className={cx('progress-container')}>
                                            <div className={cx('progress-bar')}>
                                                <div
                                                    className={cx('progress-fill')}
                                                    style={{ width: `${contract.progress}%` }}
                                                />
                                            </div>
                                            <span className={cx('progress-text')}>{contract.progress}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Milestones & Tasks */}
                    <div className={cx('section')}>
                        <div className={cx('section-header')} onClick={() => toggleSection('milestones')}>
                            <h3>Giai đoạn và công việc</h3>
                            <FontAwesomeIcon icon={expandedSections.milestones ? faChevronUp : faChevronDown} />
                        </div>
                        {expandedSections.milestones && (
                            <div className={cx('section-content')}>
                                {milestones.map((milestone) => (
                                    <div key={milestone.id} className={cx('milestone')}>
                                        <div className={cx('milestone-header')}>
                                            <div className={cx('milestone-info')}>
                                                <h4>{milestone.title}</h4>
                                                <p>{milestone.description}</p>
                                                <div className={cx('milestone-meta')}>
                                                    <span>
                                                        <FontAwesomeIcon icon={faCalendarAlt} /> {milestone.startDate} -{' '}
                                                        {milestone.endDate}
                                                    </span>
                                                    {milestone.paymentAmount && (
                                                        <span>
                                                            <FontAwesomeIcon icon={faDollarSign} />{' '}
                                                            {milestone.paymentAmount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={cx('milestone-status')}>
                                                <div
                                                    className={cx('status-badge')}
                                                    style={{ backgroundColor: getStatusColor(milestone.status) }}
                                                >
                                                    <FontAwesomeIcon icon={getStatusIcon(milestone.status)} />
                                                    {getStatusText(milestone.status)}
                                                </div>
                                                <div className={cx('progress-container')}>
                                                    <div className={cx('progress-bar')}>
                                                        <div
                                                            className={cx('progress-fill')}
                                                            style={{ width: `${milestone.progress}%` }}
                                                        />
                                                    </div>
                                                    <span className={cx('progress-text')}>{milestone.progress}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={cx('tasks')}>
                                            <h5>Công việc:</h5>
                                            {milestone.tasks.map((task) => (
                                                <div key={task.id} className={cx('task')}>
                                                    <div className={cx('task-info')}>
                                                        <h6>{task.title}</h6>
                                                        <p>{task.description}</p>
                                                        <div className={cx('task-meta')}>
                                                            <span>
                                                                <FontAwesomeIcon icon={faUser} /> {task.assignee}
                                                            </span>
                                                            <span>
                                                                <FontAwesomeIcon icon={faCalendarAlt} /> {task.dueDate}
                                                            </span>
                                                            <span
                                                                className={cx('priority')}
                                                                style={{ color: getPriorityColor(task.priority) }}
                                                            >
                                                                Ưu tiên:{' '}
                                                                {task.priority === 'high'
                                                                    ? 'Cao'
                                                                    : task.priority === 'medium'
                                                                    ? 'Trung bình'
                                                                    : 'Thấp'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={cx('task-status')}
                                                        style={{ backgroundColor: getStatusColor(task.status) }}
                                                    >
                                                        <FontAwesomeIcon icon={getStatusIcon(task.status)} />
                                                        {getStatusText(task.status)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Partners */}
                    <div className={cx('section')}>
                        <div className={cx('section-header')} onClick={() => toggleSection('partners')}>
                            <h3>Thông tin đối tác</h3>
                            <FontAwesomeIcon icon={expandedSections.partners ? faChevronUp : faChevronDown} />
                        </div>
                        {expandedSections.partners && (
                            <div className={cx('section-content')}>
                                {partners.map((partner) => (
                                    <div key={partner.id} className={cx('partner')}>
                                        <div className={cx('partner-info')}>
                                            <h4>{partner.name}</h4>
                                            <p>{partner.role}</p>
                                            <div className={cx('partner-contact')}>
                                                <span>📞 {partner.contact}</span>
                                                <span>✉️ {partner.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Attachments */}
                    <div className={cx('section')}>
                        <div className={cx('section-header')} onClick={() => toggleSection('attachments')}>
                            <h3>Tài liệu đính kèm</h3>
                            <FontAwesomeIcon icon={expandedSections.attachments ? faChevronUp : faChevronDown} />
                        </div>
                        {expandedSections.attachments && (
                            <div className={cx('section-content')}>
                                <div className={cx('upload-area')}>
                                    <FontAwesomeIcon icon={faCloudUploadAlt} />
                                    <p>Kéo thả file vào đây hoặc click để chọn file</p>
                                    <span>Tối đa 20 MB</span>
                                </div>
                                <div className={cx('attachments-list')}>
                                    {attachments.map((attachment) => (
                                        <div key={attachment.id} className={cx('attachment')}>
                                            <div className={cx('attachment-info')}>
                                                <FontAwesomeIcon icon={faFileContract} />
                                                <div>
                                                    <h5>{attachment.name}</h5>
                                                    <p>
                                                        {attachment.type} • {attachment.size} • {attachment.uploadDate}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={cx('attachment-actions')}>
                                                <button className={cx('action-btn')}>
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>
                                                <button className={cx('action-btn')}>
                                                    <FontAwesomeIcon icon={faDownload} />
                                                </button>
                                                <button className={cx('action-btn', 'delete')}>
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Activity */}
                    <div className={cx('section')}>
                        <div className={cx('section-header')}>
                            <h3>Hoạt động</h3>
                        </div>
                        <div className={cx('section-content')}>
                            <div className={cx('activity-input')}>
                                <textarea
                                    placeholder="Thêm bình luận..."
                                    rows={3}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <button className={cx('submit-comment')} onClick={handleSubmitComment}>
                                    Gửi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={cx('sidebar')}>
                    {/* Details */}
                    <div className={cx('sidebar-section')}>
                        <h4>Chi tiết</h4>
                        <div className={cx('detail-list')}>
                            <div className={cx('detail-row')}>
                                <span>Trạng thái</span>
                                <div
                                    className={cx('status-badge', 'small')}
                                    style={{ backgroundColor: getStatusColor(contract.status) }}
                                >
                                    {getStatusText(contract.status)}
                                </div>
                            </div>
                            <div className={cx('detail-row')}>
                                <span>Người phụ trách</span>
                                <span className={cx('assignee')}>{contract.owner}</span>
                            </div>
                            <div className={cx('detail-row')}>
                                <span>Khách hàng</span>
                                <span>{contract.client}</span>
                            </div>
                            <div className={cx('detail-row')}>
                                <span>Giai đoạn</span>
                                <span>
                                    {milestones.filter((m) => m.status === 'completed').length} / {milestones.length}{' '}
                                    hoàn thành
                                </span>
                            </div>
                            <div className={cx('detail-row')}>
                                <span>Tài liệu</span>
                                <span>{attachments.length} files</span>
                            </div>
                            <div className={cx('detail-row')}>
                                <span>Cộng tác viên</span>
                                <span>{collaborators.length} người</span>
                            </div>
                        </div>
                    </div>

                    <div className={cx('sidebar-section')}>
                        <div className={cx('section-header')} onClick={() => toggleSection('collaborators')}>
                            <h4>Cộng tác viên</h4>
                            <FontAwesomeIcon icon={expandedSections.collaborators ? faChevronUp : faChevronDown} />
                        </div>
                        {expandedSections.collaborators && (
                            <div className={cx('section-content')}>
                                <div className={cx('collaborators-header')}>
                                    <button className={cx('add-collaborator-btn')}>
                                        <FontAwesomeIcon icon={faPlus} />
                                        Thêm cộng tác viên
                                    </button>
                                </div>
                                <div className={cx('collaborators-list')}>
                                    {collaborators.map((collaborator) => (
                                        <div key={collaborator.id} className={cx('collaborator')}>
                                            <div className={cx('collaborator-info')}>
                                                <div className={cx('collaborator-avatar')}>
                                                    <FontAwesomeIcon icon={faUser} />
                                                </div>
                                                <div className={cx('collaborator-details')}>
                                                    <h5>{collaborator.name}</h5>
                                                    <p>{collaborator.email}</p>
                                                    <span className={cx('added-date')}>
                                                        Thêm vào: {collaborator.addedDate}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={cx('collaborator-role')}>
                                                <select
                                                    className={cx('role-select')}
                                                    value={collaborator.role}
                                                    style={{ borderColor: getCollaboratorRoleColor(collaborator.role) }}
                                                >
                                                    <option value="Owner">Owner</option>
                                                    <option value="Editor">Editor</option>
                                                    <option value="Reviewer">Reviewer</option>
                                                    <option value="Viewer">Viewer</option>
                                                </select>
                                                {collaborator.role !== 'Owner' && (
                                                    <button className={cx('remove-collaborator')}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Contract Review */}
                    <div className={cx('sidebar-section')}>
                        <h4>Đánh giá hợp đồng</h4>
                        <p className={cx('review-text')}>
                            Đảm bảo tất cả giai đoạn được hoàn thành đúng tiến độ và chất lượng trước khi submit để
                            review.
                        </p>
                        <button className={cx('submit-review')}>Submit để đánh giá</button>
                    </div>

                    {/* Quick Actions */}
                    <div className={cx('sidebar-section')}>
                        <h4>Hành động nhanh</h4>
                        <div className={cx('quick-actions')}>
                            <button className={cx('quick-action')}>
                                <FontAwesomeIcon icon={faPlus} />
                                Thêm giai đoạn
                            </button>
                            <button className={cx('quick-action')}>
                                <FontAwesomeIcon icon={faCloudUploadAlt} />
                                Upload tài liệu
                            </button>
                            <button className={cx('quick-action')}>
                                <FontAwesomeIcon icon={faUser} />
                                Thêm đối tác
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Audit Log */}
            <AuditLog
                entries={auditLogEntries}
                availableUsers={availableUsers}
                availableEventTypes={availableEventTypes}
                title="Nhật ký hoạt động"
                showFilters={true}
                defaultDateRange={{
                    startDate: new Date('2020-09-27T13:00:21'),
                    endDate: new Date('2020-10-27T13:00:21'),
                }}
            />
        </div>
    );
};

export default ContractDetail;
