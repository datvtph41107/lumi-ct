import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './UserLogDetail.module.scss';
import { routePrivate } from '~/config/routes.config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faClipboardList, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import UserProfile from './UserProfile';
import ContractCard from './components/ContractCard';
import ActivityTimeline from './components/ActivityTimeline';
import EmptyState from './components/EmptyState';
import type { User } from '~/types/user.types';
import type { ContractUserDetail } from '~/types/contract/contract.types';
import type { ActivityLog, Notification } from '~/types/activity.types';

const cx = classNames.bind(styles);

const UserLogDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = (path: string) => {
        if (typeof window !== 'undefined') {
            window.location.href = path;
        }
    };
    const [user, setUser] = useState<User | null>(null);
    const [contracts, setContracts] = useState<ContractUserDetail[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const slideRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mockUser: User = {
            id: id || '1',
            username: 'admin_staff_01',
            email: 'admin.staff01@company.com',
            fullName: 'Trần Thị Bình',
            department: 'admin',
            role: 'staff',
            isActive: true,
            avatar: '/api/placeholder/120/120',
            joinDate: '2023-03-20',
            phone: '0901234568',
            address: '123 Đường ABC, Quận 1, TP.HCM',
            lastLogin: '2024-01-15 14:30',
        };

        const mockContracts: Contract[] = [
            {
                id: 'HD-2024-001',
                title: 'Hợp đồng cung cấp dịch vụ IT',
                status: 'active',
                role: 'editor',
                startDate: '2024-01-10',
                progress: 75,
                mode: 'editor',
                previewImage:
                    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/contract-preview-PptYDPe5rfvd9fHw4v26pPS7zdlzYn.png',
                description:
                    'Hợp đồng cung cấp dịch vụ IT toàn diện cho công ty, bao gồm bảo trì hệ thống, phát triển phần mềm và hỗ trợ kỹ thuật.',
                userActivities: [
                    {
                        id: '1',
                        action: 'Chỉnh sửa điều khoản',
                        description: 'Cập nhật điều khoản thanh toán',
                        timestamp: '2024-01-15 14:30',
                    },
                    {
                        id: '2',
                        action: 'Thêm phụ lục',
                        description: 'Bổ sung phụ lục kỹ thuật',
                        timestamp: '2024-01-14 10:20',
                    },
                ],
                assignedTasks: ['Soạn thảo nội dung', 'Kiểm tra pháp lý', 'Phê duyệt cuối cùng'],
                participants: [
                    { id: '1', name: 'Trần Văn A', role: 'Chủ sở hữu' },
                    { id: '2', name: 'Nguyễn Thị B', role: 'Đánh giá' },
                    { id: '3', name: 'Lê Văn C', role: 'Biên tập' },
                    { id: '4', name: 'Phạm Thị D', role: 'Xem' },
                    { id: '5', name: 'Hoàng Văn E', role: 'Xem' },
                ],
            },
            {
                id: 'HD-2024-002',
                title: 'Hợp đồng thuê văn phòng',
                status: 'completed',
                role: 'reviewer',
                startDate: '2023-12-15',
                endDate: '2024-01-05',
                progress: 100,
                mode: 'basicForm',
                userActivities: [
                    {
                        id: '1',
                        action: 'Đánh giá hợp đồng',
                        description: 'Hoàn thành đánh giá và phê duyệt',
                        timestamp: '2024-01-05 16:15',
                    },
                ],
                assignedTasks: ['Đánh giá điều khoản', 'Phê duyệt'],
                participants: [{ id: '1', name: 'Lê Văn C', role: 'Chủ sở hữu' }],
            },
            {
                id: 'HD-2024-003',
                title: 'Hợp đồng mua sắm thiết bị',
                status: 'active',
                role: 'viewer',
                startDate: '2024-01-12',
                progress: 30,
                mode: 'basicForm',
                userActivities: [
                    {
                        id: '1',
                        action: 'Xem hợp đồng',
                        description: 'Theo dõi tiến độ thực hiện',
                        timestamp: '2024-01-15 09:00',
                    },
                ],
                assignedTasks: ['Theo dõi tiến độ'],
                participants: [
                    { id: '1', name: 'Phạm Thị D', role: 'Chủ sở hữu' },
                    { id: '2', name: 'Hoàng Văn E', role: 'Biên tập' },
                ],
            },
        ];

        const mockActivityLogs: ActivityLog[] = [
            {
                id: '1',
                action: 'Đăng nhập hệ thống',
                description: 'Đăng nhập thành công từ IP 192.168.1.100',
                timestamp: '2024-01-15 14:30',
                type: 'system',
            },
            {
                id: '2',
                action: 'Chỉnh sửa hợp đồng',
                description: 'Cập nhật nội dung hợp đồng HD-2024-001',
                timestamp: '2024-01-15 13:45',
                type: 'contract',
                details: 'Thay đổi điều khoản thanh toán',
            },
            {
                id: '3',
                action: 'Tạo báo cáo',
                description: 'Tạo báo cáo tiến độ hợp đồng tháng 1',
                timestamp: '2024-01-15 10:20',
                type: 'system',
            },
            {
                id: '4',
                action: 'Phê duyệt hợp đồng',
                description: 'Phê duyệt hợp đồng HD-2024-002',
                timestamp: '2024-01-14 16:15',
                type: 'contract',
            },
        ];

        const mockNotifications: Notification[] = [
            {
                id: '1',
                title: 'Nhắc nhở hạn hợp đồng',
                message: 'Hợp đồng HD-2024-001 sẽ hết hạn trong 7 ngày',
                type: 'warning',
                timestamp: '2024-01-15 09:00',
                isRead: false,
            },
            {
                id: '2',
                title: 'Hợp đồng được phê duyệt',
                message: 'Hợp đồng HD-2024-002 đã được phê duyệt thành công',
                type: 'success',
                timestamp: '2024-01-14 16:20',
                isRead: true,
            },
            {
                id: '3',
                title: 'Yêu cầu chỉnh sửa',
                message: 'Quản lý yêu cầu chỉnh sửa hợp đồng HD-2024-003',
                type: 'info',
                timestamp: '2024-01-14 14:30',
                isRead: true,
            },
        ];

        setUser(mockUser);
        setContracts(mockContracts);
        setActivityLogs(mockActivityLogs);
        setNotifications(mockNotifications);
    }, [id]);

    const scrollSlide = (direction: 'left' | 'right') => {
        if (slideRef.current) {
            const scrollAmount = 350;
            const currentScroll = slideRef.current.scrollLeft;
            const targetScroll = direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount;

            slideRef.current.scrollTo({
                left: targetScroll,
                behavior: 'smooth',
            });
        }
    };

    const toggleCardExpansion = (contractId: string) => {
        setExpandedCards((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(contractId)) {
                newSet.delete(contractId);
            } else {
                newSet.add(contractId);
            }
            return newSet;
        });
    };

    if (!user) {
        return <div className={cx('loading')}>Đang tải...</div>;
    }

    const activeContracts = contracts.filter((c) => c.status === 'active');
    const completedContracts = contracts.filter((c) => c.status === 'completed');

    return (
        <div className={cx('user-detail')}>
            {/* Header */}
            <div className={cx('header')}>
                <button className={cx('back-btn')} onClick={() => navigate(routePrivate.adminStaffs)}>
                    ← Quay lại
                </button>
                <h1>Chi tiết nhân viên</h1>
            </div>

            <UserProfile user={user} />

            {/* Current Contracts - Horizontal Slide */}
            <div className={cx('section')}>
                <div className={cx('section-header')}>
                    <h3>Hợp đồng đang xử lý</h3>
                    <span className={cx('count')}>{activeContracts.length} hợp đồng</span>
                </div>

                {activeContracts.length > 0 ? (
                    <div className={cx('contracts-slide')}>
                        <button
                            className={cx('slide-btn', 'prev')}
                            onClick={() => scrollSlide('left')}
                            aria-label="Previous contracts"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <div className={cx('slide-container')} ref={slideRef}>
                            {activeContracts.map((contract) => (
                                <ContractCard
                                    key={contract.id}
                                    contract={contract}
                                    isExpanded={expandedCards.has(contract.id)}
                                    onToggleExpansion={() => toggleCardExpansion(contract.id)}
                                    isCompleted={false}
                                />
                            ))}
                        </div>
                        <button
                            className={cx('slide-btn', 'next')}
                            onClick={() => scrollSlide('right')}
                            aria-label="Next contracts"
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>
                ) : (
                    <EmptyState icon={faClipboardList} message="Không có hợp đồng đang xử lý" />
                )}
            </div>

            {/* Completed Contracts - 3 Column Grid */}
            <div className={cx('section')}>
                <div className={cx('section-header')}>
                    <h3>Hợp đồng đã làm</h3>
                    <span className={cx('count')}>{completedContracts.length} hợp đồng</span>
                </div>

                {completedContracts.length > 0 ? (
                    <div className={cx('contracts-grid', 'fixed-columns')}>
                        {completedContracts.map((contract) => (
                            <ContractCard
                                key={contract.id}
                                contract={contract}
                                isExpanded={expandedCards.has(contract.id)}
                                onToggleExpansion={() => toggleCardExpansion(contract.id)}
                                isCompleted={true}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState icon={faCheckCircle} message="Chưa có hợp đồng hoàn thành" />
                )}
            </div>

            {/* Activity Logs */}
            <div className={cx('section')}>
                <div className={cx('section-header')}>
                    <h3>Hoạt động gần đây</h3>
                    <span className={cx('count')}>{activityLogs.length} hoạt động</span>
                </div>

                <ActivityTimeline activities={activityLogs} maxItems={5} />
            </div>
        </div>
    );
};

export default UserLogDetail;
