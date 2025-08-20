// import type React from 'react';
// import { useState, useEffect, useRef } from 'react';
// import { useParams } from 'react-router-dom';
// import classNames from 'classnames/bind';
// import styles from './UserLogDetail.module.scss';
// import { routePrivate } from '~/config/routes.config'; // Updated import to use TypeScript file extension
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {
//     faChevronLeft,
//     faChevronRight,
//     faEllipsisH,
//     faTasks,
//     faClipboardCheck,
//     faUserTag,
//     faHistory,
//     faCheckCircle,
//     faCheckDouble,
//     faClipboardList,
//     faCheck,
//     faFileAlt,
//     faUser,
//     faCog,
//     faChevronUp,
//     faChevronDown,
// } from '@fortawesome/free-solid-svg-icons';

// const cx = classNames.bind(styles);

// interface User {
//     id: string;
//     username: string;
//     email: string;
//     fullName: string;
//     department: 'admin' | 'accounting';
//     role: 'manager' | 'staff';
//     isActive: boolean;
//     avatar: string;
//     joinDate: string;
//     phone: string;
//     address: string;
//     lastLogin: string;
// }

// interface Contract {
//     id: string;
//     title: string;
//     status: 'active' | 'completed' | 'pending';
//     role: 'owner' | 'editor' | 'reviewer' | 'viewer';
//     startDate: string;
//     endDate?: string;
//     progress: number;
//     mode: 'basicForm' | 'editor';
//     previewImage?: string;
//     description?: string;
//     userActivities?: UserActivity[];
//     assignedTasks?: string[];
//     participants?: Participant[];
// }

// interface UserActivity {
//     id: string;
//     action: string;
//     description: string;
//     timestamp: string;
// }

// interface Participant {
//     id: string;
//     name: string;
//     role: string;
// }

// interface ActivityLog {
//     id: string;
//     action: string;
//     description: string;
//     timestamp: string;
//     type: 'system' | 'contract' | 'user';
//     details?: string;
// }

// interface Notification {
//     id: string;
//     title: string;
//     message: string;
//     type: 'info' | 'warning' | 'success' | 'error';
//     timestamp: string;
//     isRead: boolean;
// }

// const UserLogDetail: React.FC = () => {
//     const { id } = useParams<{ id: string }>();
//     const navigate = (path: string) => {
//         if (typeof window !== 'undefined') {
//             window.location.href = path;
//         }
//     };
//     const [user, setUser] = useState<User | null>(null);
//     const [contracts, setContracts] = useState<Contract[]>([]);
//     const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
//     const [notifications, setNotifications] = useState<Notification[]>([]);
//     const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
//     const slideRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         const mockUser: User = {
//             id: id || '1',
//             username: 'admin_staff_01',
//             email: 'admin.staff01@company.com',
//             fullName: 'Trần Thị Bình',
//             department: 'admin',
//             role: 'staff',
//             isActive: true,
//             avatar: '/api/placeholder/120/120',
//             joinDate: '2023-03-20',
//             phone: '0901234568',
//             address: '123 Đường ABC, Quận 1, TP.HCM',
//             lastLogin: '2024-01-15 14:30',
//         };

//         const mockContracts: Contract[] = [
//             {
//                 id: 'HD-2024-001',
//                 title: 'Hợp đồng cung cấp dịch vụ IT',
//                 status: 'active',
//                 role: 'editor',
//                 startDate: '2024-01-10',
//                 progress: 75,
//                 mode: 'editor',
//                 previewImage:
//                     'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/contract-preview-PptYDPe5rfvd9fHw4v26pPS7zdlzYn.png',
//                 description:
//                     'Hợp đồng cung cấp dịch vụ IT toàn diện cho công ty, bao gồm bảo trì hệ thống, phát triển phần mềm và hỗ trợ kỹ thuật.',
//                 userActivities: [
//                     {
//                         id: '1',
//                         action: 'Chỉnh sửa điều khoản',
//                         description: 'Cập nhật điều khoản thanh toán',
//                         timestamp: '2024-01-15 14:30',
//                     },
//                     {
//                         id: '2',
//                         action: 'Thêm phụ lục',
//                         description: 'Bổ sung phụ lục kỹ thuật',
//                         timestamp: '2024-01-14 10:20',
//                     },
//                 ],
//                 assignedTasks: ['Soạn thảo nội dung', 'Kiểm tra pháp lý', 'Phê duyệt cuối cùng'],
//                 participants: [
//                     { id: '1', name: 'Trần Văn A', role: 'Chủ sở hữu' },
//                     { id: '2', name: 'Nguyễn Thị B', role: 'Đánh giá' },
//                     { id: '3', name: 'Lê Văn C', role: 'Biên tập' },
//                     { id: '4', name: 'Phạm Thị D', role: 'Xem' },
//                     { id: '5', name: 'Hoàng Văn E', role: 'Xem' },
//                 ],
//             },
//             {
//                 id: 'HD-2024-002',
//                 title: 'Hợp đồng thuê văn phòng',
//                 status: 'completed',
//                 role: 'reviewer',
//                 startDate: '2023-12-15',
//                 endDate: '2024-01-05',
//                 progress: 100,
//                 mode: 'basicForm',
//                 userActivities: [
//                     {
//                         id: '1',
//                         action: 'Đánh giá hợp đồng',
//                         description: 'Hoàn thành đánh giá và phê duyệt',
//                         timestamp: '2024-01-05 16:15',
//                     },
//                 ],
//                 assignedTasks: ['Đánh giá điều khoản', 'Phê duyệt'],
//                 participants: [{ id: '1', name: 'Lê Văn C', role: 'Chủ sở hữu' }],
//             },
//             {
//                 id: 'HD-2024-003',
//                 title: 'Hợp đồng mua sắm thiết bị',
//                 status: 'active',
//                 role: 'viewer',
//                 startDate: '2024-01-12',
//                 progress: 30,
//                 mode: 'basicForm',
//                 userActivities: [
//                     {
//                         id: '1',
//                         action: 'Xem hợp đồng',
//                         description: 'Theo dõi tiến độ thực hiện',
//                         timestamp: '2024-01-15 09:00',
//                     },
//                 ],
//                 assignedTasks: ['Theo dõi tiến độ'],
//                 participants: [
//                     { id: '1', name: 'Phạm Thị D', role: 'Chủ sở hữu' },
//                     { id: '2', name: 'Hoàng Văn E', role: 'Biên tập' },
//                 ],
//             },
//         ];

//         const mockActivityLogs: ActivityLog[] = [
//             {
//                 id: '1',
//                 action: 'Đăng nhập hệ thống',
//                 description: 'Đăng nhập thành công từ IP 192.168.1.100',
//                 timestamp: '2024-01-15 14:30',
//                 type: 'system',
//             },
//             {
//                 id: '2',
//                 action: 'Chỉnh sửa hợp đồng',
//                 description: 'Cập nhật nội dung hợp đồng HD-2024-001',
//                 timestamp: '2024-01-15 13:45',
//                 type: 'contract',
//                 details: 'Thay đổi điều khoản thanh toán',
//             },
//             {
//                 id: '3',
//                 action: 'Tạo báo cáo',
//                 description: 'Tạo báo cáo tiến độ hợp đồng tháng 1',
//                 timestamp: '2024-01-15 10:20',
//                 type: 'system',
//             },
//             {
//                 id: '4',
//                 action: 'Phê duyệt hợp đồng',
//                 description: 'Phê duyệt hợp đồng HD-2024-002',
//                 timestamp: '2024-01-14 16:15',
//                 type: 'contract',
//             },
//         ];

//         const mockNotifications: Notification[] = [
//             {
//                 id: '1',
//                 title: 'Nhắc nhở hạn hợp đồng',
//                 message: 'Hợp đồng HD-2024-001 sẽ hết hạn trong 7 ngày',
//                 type: 'warning',
//                 timestamp: '2024-01-15 09:00',
//                 isRead: false,
//             },
//             {
//                 id: '2',
//                 title: 'Hợp đồng được phê duyệt',
//                 message: 'Hợp đồng HD-2024-002 đã được phê duyệt thành công',
//                 type: 'success',
//                 timestamp: '2024-01-14 16:20',
//                 isRead: true,
//             },
//             {
//                 id: '3',
//                 title: 'Yêu cầu chỉnh sửa',
//                 message: 'Quản lý yêu cầu chỉnh sửa hợp đồng HD-2024-003',
//                 type: 'info',
//                 timestamp: '2024-01-14 14:30',
//                 isRead: true,
//             },
//         ];

//         setUser(mockUser);
//         setContracts(mockContracts);
//         setActivityLogs(mockActivityLogs);
//         setNotifications(mockNotifications);
//     }, [id]);

//     const getDepartmentLabel = (dept: string) => {
//         return dept === 'admin' ? 'Phòng Hành chính' : 'Phòng Kế toán';
//     };

//     const getRoleLabel = (role: string) => {
//         return role === 'manager' ? 'Quản lý' : 'Nhân viên';
//     };

//     const getContractStatusLabel = (status: string) => {
//         switch (status) {
//             case 'active':
//                 return 'Đang thực hiện';
//             case 'completed':
//                 return 'Hoàn thành';
//             case 'pending':
//                 return 'Chờ xử lý';
//             default:
//                 return status;
//         }
//     };

//     const getContractRoleLabel = (role: string) => {
//         switch (role) {
//             case 'owner':
//                 return 'Chủ sở hữu';
//             case 'editor':
//                 return 'Biên tập';
//             case 'reviewer':
//                 return 'Đánh giá';
//             case 'viewer':
//                 return 'Xem';
//             default:
//                 return role;
//         }
//     };

//     const getInitials = (fullName: string): string => {
//         const words = fullName.trim().split(' ');
//         if (words.length === 1) return words[0].charAt(0).toUpperCase();
//         const firstLetter = words[0].charAt(0);
//         const lastLetter = words[words.length - 1].charAt(0);
//         return (firstLetter + lastLetter).toUpperCase();
//     };

//     const getAvatarColor = (name: string): string => {
//         const colors = [
//             '#E3F2FD',
//             '#F3E5F5',
//             '#E8F5E8',
//             '#FFF3E0',
//             '#FCE4EC',
//             '#E1F5FE',
//             '#F1F8E9',
//             '#FFF8E1',
//             '#FFEBEE',
//             '#E8EAF6',
//         ];
//         let hash = 0;
//         for (let i = 0; i < name.length; i++) {
//             hash = name.charCodeAt(i) + ((hash << 5) - hash);
//         }
//         const index = Math.abs(hash) % colors.length;
//         return colors[index];
//     };

//     const getAvatarTextColor = (name: string): string => {
//         const textColors = [
//             '#1976D2',
//             '#7B1FA2',
//             '#388E3C',
//             '#F57C00',
//             '#C2185B',
//             '#0288D1',
//             '#689F38',
//             '#FBC02D',
//             '#D32F2F',
//             '#512DA8',
//         ];
//         let hash = 0;
//         for (let i = 0; i < name.length; i++) {
//             hash = name.charCodeAt(i) + ((hash << 5) - hash);
//         }
//         const index = Math.abs(hash) % textColors.length;
//         return textColors[index];
//     };

//     const scrollSlide = (direction: 'left' | 'right') => {
//         if (slideRef.current) {
//             const scrollAmount = 350;
//             const currentScroll = slideRef.current.scrollLeft;
//             const targetScroll = direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount;

//             slideRef.current.scrollTo({
//                 left: targetScroll,
//                 behavior: 'smooth',
//             });
//         }
//     };

//     const toggleCardExpansion = (contractId: string) => {
//         setExpandedCards((prev) => {
//             const newSet = new Set(prev);
//             if (newSet.has(contractId)) {
//                 newSet.delete(contractId);
//             } else {
//                 newSet.add(contractId);
//             }
//             return newSet;
//         });
//     };

//     if (!user) {
//         return <div className={cx('loading')}>Đang tải...</div>;
//     }

//     const activeContracts = contracts.filter((c) => c.status === 'active');
//     const completedContracts = contracts.filter((c) => c.status === 'completed');

//     return (
//         <div className={cx('user-detail')}>
//             {/* Header */}
//             <div className={cx('header')}>
//                 <button className={cx('back-btn')} onClick={() => navigate(routePrivate.adminStaffs)}>
//                     ← Quay lại
//                 </button>
//                 <h1>Chi tiết nhân viên</h1>
//             </div>

//             {/* User Profile Card */}
//             <div className={cx('profile-card')}>
//                 <div className={cx('profile-header')}>
//                     <div
//                         className={cx('avatar-circle')}
//                         style={{
//                             backgroundColor: getAvatarColor(user.fullName),
//                             color: getAvatarTextColor(user.fullName),
//                         }}
//                     >
//                         {getInitials(user.fullName)}
//                     </div>
//                     <div className={cx('profile-info')}>
//                         <h2>{user.fullName}</h2>
//                         <p className={cx('username')}>@{user.username}</p>
//                         <div className={cx('badges')}>
//                             <span className={cx('department-badge', user.department)}>
//                                 {getDepartmentLabel(user.department)}
//                             </span>
//                             <span className={cx('role-badge', user.role)}>{getRoleLabel(user.role)}</span>
//                             <span className={cx('status-badge', { active: user.isActive })}>
//                                 {user.isActive ? 'Hoạt động' : 'Tạm khóa'}
//                             </span>
//                         </div>
//                     </div>
//                 </div>

//                 <div className={cx('profile-details')}>
//                     <div className={cx('detail-item')}>
//                         <span className={cx('label')}>Email:</span>
//                         <span>{user.email}</span>
//                     </div>
//                     <div className={cx('detail-item')}>
//                         <span className={cx('label')}>Số điện thoại:</span>
//                         <span>{user.phone}</span>
//                     </div>
//                     <div className={cx('detail-item')}>
//                         <span className={cx('label')}>Địa chỉ:</span>
//                         <span>{user.address}</span>
//                     </div>
//                     <div className={cx('detail-item')}>
//                         <span className={cx('label')}>Ngày tham gia:</span>
//                         <span>{user.joinDate}</span>
//                     </div>
//                     <div className={cx('detail-item')}>
//                         <span className={cx('label')}>Đăng nhập cuối:</span>
//                         <span>{user.lastLogin}</span>
//                     </div>
//                 </div>
//             </div>

//             {/* Current Contracts - Horizontal Slide */}
//             <div className={cx('section')}>
//                 <div className={cx('section-header')}>
//                     <h3>Hợp đồng đang xử lý</h3>
//                     <span className={cx('count')}>{activeContracts.length} hợp đồng</span>
//                 </div>

//                 {activeContracts.length > 0 ? (
//                     <div className={cx('contracts-slide')}>
//                         <button
//                             className={cx('slide-btn', 'prev')}
//                             onClick={() => scrollSlide('left')}
//                             aria-label="Previous contracts"
//                         >
//                             <FontAwesomeIcon icon={faChevronLeft} />
//                         </button>
//                         <div className={cx('slide-container')} ref={slideRef}>
//                             {activeContracts.map((contract) => (
//                                 <div key={contract.id} className={cx('contract-card', 'active', contract.mode)}>
//                                     <div className={cx('card-top')}>
//                                         <div className={cx('card-header')}>
//                                             <div className={cx('contract-tags')}>
//                                                 <span className={cx('tag', 'role')}>
//                                                     {getContractRoleLabel(contract.role)}
//                                                 </span>
//                                                 <span className={cx('tag', 'status')}>
//                                                     {getContractStatusLabel(contract.status)}
//                                                 </span>
//                                                 <span className={cx('tag', 'mode')}>
//                                                     {contract.mode === 'editor' ? 'Editor' : 'Form'}
//                                                 </span>
//                                             </div>
//                                             <div className={cx('card-menu')}>
//                                                 <FontAwesomeIcon icon={faEllipsisH} />
//                                             </div>
//                                         </div>

//                                         {contract.mode === 'editor' && contract.previewImage ? (
//                                             <div className={cx('contract-preview')}>
//                                                 <img
//                                                     src={contract.previewImage || '/placeholder.svg'}
//                                                     alt="Contract preview"
//                                                     className={cx('preview-image')}
//                                                 />
//                                                 <div className={cx('preview-info-overlay')}>
//                                                     <div className={cx('contract-info')}>
//                                                         <h4 className={cx('contract-title')}>{contract.title}</h4>
//                                                         <div className={cx('contract-meta')}>
//                                                             <span className={cx('contract-id')}>{contract.id}</span>
//                                                             <span className={cx('start-date')}>
//                                                                 Bắt đầu: {contract.startDate}
//                                                             </span>
//                                                         </div>
//                                                         {contract.description && (
//                                                             <p className={cx('contract-description')}>
//                                                                 {contract.description}
//                                                             </p>
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         ) : (
//                                             <>
//                                                 <h4 className={cx('contract-title')}>{contract.title}</h4>
//                                                 <div className={cx('contract-meta')}>
//                                                     <span className={cx('contract-id')}>{contract.id}</span>
//                                                     <span className={cx('start-date')}>
//                                                         Bắt đầu: {contract.startDate}
//                                                     </span>
//                                                 </div>
//                                             </>
//                                         )}
//                                     </div>

//                                     <div className={cx('card-divider')}></div>

//                                     <div className={cx('card-bottom')}>
//                                         <div className={cx('progress-section')}>
//                                             <div className={cx('progress-info')}>
//                                                 <span>Tiến độ</span>
//                                                 <span className={cx('progress-percent')}>{contract.progress}%</span>
//                                             </div>
//                                             <div className={cx('progress-bar')}>
//                                                 <div
//                                                     className={cx('progress-fill')}
//                                                     style={{ width: `${contract.progress}%` }}
//                                                 ></div>
//                                             </div>
//                                         </div>

//                                         <div className={cx('card-footer')}>
//                                             <div className={cx('team-avatars')}>
//                                                 {contract.participants?.slice(0, 3).map((participant, index) => (
//                                                     <div
//                                                         key={participant.id}
//                                                         className={cx('avatar-small')}
//                                                         style={{
//                                                             backgroundColor: getAvatarColor(participant.name),
//                                                             color: getAvatarTextColor(participant.name),
//                                                         }}
//                                                         title={participant.name}
//                                                     >
//                                                         {getInitials(participant.name)}
//                                                     </div>
//                                                 ))}
//                                                 {contract.participants && contract.participants.length > 3 && (
//                                                     <div className={cx('avatar-small', 'count-avatar')}>
//                                                         +{contract.participants.length - 3}
//                                                     </div>
//                                                 )}
//                                             </div>
//                                             <button
//                                                 className={cx('expand-btn', {
//                                                     expanded: expandedCards.has(contract.id),
//                                                 })}
//                                                 onClick={() => toggleCardExpansion(contract.id)}
//                                                 aria-label={
//                                                     expandedCards.has(contract.id) ? 'Ẩn chi tiết' : 'Xem chi tiết'
//                                                 }
//                                                 title={expandedCards.has(contract.id) ? 'Ẩn chi tiết' : 'Xem chi tiết'}
//                                             >
//                                                 <FontAwesomeIcon icon={faChevronUp} />
//                                             </button>
//                                         </div>

//                                         <div
//                                             className={cx('expandable-section', {
//                                                 expanded: expandedCards.has(contract.id),
//                                             })}
//                                         >
//                                             <div className={cx('expandable-content')}>
//                                                 {expandedCards.has(contract.id) && (
//                                                     <div className={cx('collapse-header')}>
//                                                         <button
//                                                             type="button"
//                                                             className={cx('collapse-btn')}
//                                                             onClick={() => toggleCardExpansion(contract.id)}
//                                                             aria-label="Ẩn chi tiết"
//                                                         >
//                                                             <FontAwesomeIcon icon={faChevronDown} />
//                                                         </button>
//                                                     </div>
//                                                 )}

//                                                 <div className={cx('user-activities')}>
//                                                     <h5>
//                                                         <FontAwesomeIcon icon={faTasks} /> Hoạt động của bạn
//                                                     </h5>
//                                                     {contract.userActivities && contract.userActivities.length > 0 ? (
//                                                         contract.userActivities.map((activity) => (
//                                                             <div key={activity.id} className={cx('activity-item')}>
//                                                                 <div className={cx('activity-details')}>
//                                                                     <span className={cx('activity-action')}>
//                                                                         {activity.action}
//                                                                     </span>
//                                                                     <span className={cx('activity-description')}>
//                                                                         {activity.description}
//                                                                     </span>
//                                                                 </div>
//                                                                 <span className={cx('activity-time')}>
//                                                                     {activity.timestamp}
//                                                                 </span>
//                                                             </div>
//                                                         ))
//                                                     ) : (
//                                                         <p className={cx('no-activities')}>Chưa có hoạt động nào</p>
//                                                     )}
//                                                 </div>

//                                                 <div className={cx('assigned-tasks')}>
//                                                     <h5>
//                                                         <FontAwesomeIcon icon={faClipboardCheck} /> Nhiệm vụ được giao
//                                                     </h5>
//                                                     {contract.assignedTasks && contract.assignedTasks.length > 0 ? (
//                                                         <ul>
//                                                             {contract.assignedTasks.map((task, index) => (
//                                                                 <li key={index}>
//                                                                     <FontAwesomeIcon icon={faCheckCircle} />
//                                                                     {task}
//                                                                 </li>
//                                                             ))}
//                                                         </ul>
//                                                     ) : (
//                                                         <p className={cx('no-tasks')}>Chưa có nhiệm vụ nào</p>
//                                                     )}
//                                                 </div>

//                                                 <div className={cx('contract-role')}>
//                                                     <h5>
//                                                         <FontAwesomeIcon icon={faUserTag} /> Vai trò trong hợp đồng
//                                                     </h5>
//                                                     <div className={cx('role-info')}>
//                                                         <span className={cx('role-badge', contract.role)}>
//                                                             {getContractRoleLabel(contract.role)}
//                                                         </span>
//                                                         <p className={cx('role-description')}>
//                                                             {contract.role === 'owner' &&
//                                                                 'Bạn là chủ sở hữu hợp đồng này, có toàn quyền quản lý và chỉnh sửa.'}
//                                                             {contract.role === 'editor' &&
//                                                                 'Bạn có quyền chỉnh sửa nội dung và cập nhật hợp đồng.'}
//                                                             {contract.role === 'reviewer' &&
//                                                                 'Bạn có quyền xem xét và đánh giá hợp đồng.'}
//                                                             {contract.role === 'viewer' &&
//                                                                 'Bạn chỉ có quyền xem hợp đồng.'}
//                                                         </p>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                         <button
//                             className={cx('slide-btn', 'next')}
//                             onClick={() => scrollSlide('right')}
//                             aria-label="Next contracts"
//                         >
//                             <FontAwesomeIcon icon={faChevronRight} />
//                         </button>
//                     </div>
//                 ) : (
//                     <div className={cx('empty-state')}>
//                         <div className={cx('empty-icon')}>
//                             <FontAwesomeIcon icon={faClipboardList} />
//                         </div>
//                         <p>Không có hợp đồng đang xử lý</p>
//                     </div>
//                 )}
//             </div>

//             {/* Completed Contracts - 3 Column Grid */}
//             <div className={cx('section')}>
//                 <div className={cx('section-header')}>
//                     <h3>Hợp đồng đã làm</h3>
//                     <span className={cx('count')}>{completedContracts.length} hợp đồng</span>
//                 </div>

//                 {completedContracts.length > 0 ? (
//                     <div className={cx('contracts-grid', 'fixed-columns')}>
//                         {completedContracts.map((contract) => (
//                             <div key={contract.id} className={cx('contract-card', 'completed', contract.mode)}>
//                                 <div className={cx('card-top')}>
//                                     <div className={cx('card-header')}>
//                                         <div className={cx('contract-tags')}>
//                                             <span className={cx('tag', 'role')}>
//                                                 {getContractRoleLabel(contract.role)}
//                                             </span>
//                                             <span className={cx('tag', 'status', 'completed')}>
//                                                 {getContractStatusLabel(contract.status)}
//                                             </span>
//                                             <span className={cx('tag', 'mode')}>
//                                                 {contract.mode === 'editor' ? 'Editor' : 'Form'}
//                                             </span>
//                                         </div>
//                                         <div className={cx('card-menu')}>
//                                             <FontAwesomeIcon icon={faEllipsisH} />
//                                         </div>
//                                     </div>

//                                     <h4 className={cx('contract-title')}>{contract.title}</h4>
//                                     <div className={cx('contract-meta')}>
//                                         <span className={cx('contract-id')}>{contract.id}</span>
//                                         {contract.endDate && (
//                                             <span className={cx('date-range')}>
//                                                 {contract.startDate} - {contract.endDate}
//                                             </span>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <div className={cx('card-divider')}></div>

//                                 <div className={cx('card-bottom')}>
//                                     <div className={cx('completion-badge')}>
//                                         <span className={cx('check-icon')}>
//                                             <FontAwesomeIcon icon={faCheck} />
//                                         </span>
//                                         <span>Hoàn thành 100%</span>
//                                     </div>

//                                     <div className={cx('card-footer')}>
//                                         <div className={cx('team-avatars')}>
//                                             {contract.participants?.slice(0, 3).map((participant) => (
//                                                 <div
//                                                     key={participant.id}
//                                                     className={cx('avatar-small')}
//                                                     style={{
//                                                         backgroundColor: getAvatarColor(participant.name),
//                                                         color: getAvatarTextColor(participant.name),
//                                                     }}
//                                                     title={participant.name}
//                                                 >
//                                                     {getInitials(participant.name)}
//                                                 </div>
//                                             ))}
//                                             {contract.participants && contract.participants.length > 3 && (
//                                                 <div className={cx('avatar-small', 'count-avatar')}>
//                                                     +{contract.participants.length - 3}
//                                                 </div>
//                                             )}
//                                         </div>
//                                         <button
//                                             className={cx('expand-btn', {
//                                                 expanded: expandedCards.has(contract.id),
//                                             })}
//                                             onClick={() => toggleCardExpansion(contract.id)}
//                                             aria-label={expandedCards.has(contract.id) ? 'Ẩn chi tiết' : 'Xem chi tiết'}
//                                             title={expandedCards.has(contract.id) ? 'Ẩn chi tiết' : 'Xem chi tiết'}
//                                         >
//                                             <FontAwesomeIcon icon={faChevronUp} />
//                                         </button>
//                                     </div>

//                                     <div
//                                         className={cx('expandable-section', {
//                                             expanded: expandedCards.has(contract.id),
//                                         })}
//                                     >
//                                         <div className={cx('expandable-content')}>
//                                             {expandedCards.has(contract.id) && (
//                                                 <div className={cx('collapse-header')}>
//                                                     <button
//                                                         type="button"
//                                                         className={cx('collapse-btn')}
//                                                         onClick={() => toggleCardExpansion(contract.id)}
//                                                         aria-label="Ẩn chi tiết"
//                                                     >
//                                                         <FontAwesomeIcon icon={faChevronDown} />
//                                                     </button>
//                                                 </div>
//                                             )}

//                                             <div className={cx('user-activities')}>
//                                                 <h5>
//                                                     <FontAwesomeIcon icon={faHistory} /> Hoạt động đã thực hiện
//                                                 </h5>
//                                                 {contract.userActivities && contract.userActivities.length > 0 ? (
//                                                     contract.userActivities.map((activity) => (
//                                                         <div key={activity.id} className={cx('activity-item')}>
//                                                             <div className={cx('activity-details')}>
//                                                                 <span className={cx('activity-action')}>
//                                                                     {activity.action}
//                                                                 </span>
//                                                                 <span className={cx('activity-description')}>
//                                                                     {activity.description}
//                                                                 </span>
//                                                             </div>
//                                                             <span className={cx('activity-time')}>
//                                                                 {activity.timestamp}
//                                                             </span>
//                                                         </div>
//                                                     ))
//                                                 ) : (
//                                                     <p className={cx('no-activities')}>Chưa có hoạt động nào</p>
//                                                 )}
//                                             </div>

//                                             <div className={cx('assigned-tasks')}>
//                                                 <h5>
//                                                     <FontAwesomeIcon icon={faCheckDouble} /> Nhiệm vụ đã hoàn thành
//                                                 </h5>
//                                                 {contract.assignedTasks && contract.assignedTasks.length > 0 ? (
//                                                     <ul>
//                                                         {contract.assignedTasks.map((task, index) => (
//                                                             <li key={index} className={cx('completed-task')}>
//                                                                 <FontAwesomeIcon icon={faCheckCircle} />
//                                                                 {task}
//                                                             </li>
//                                                         ))}
//                                                     </ul>
//                                                 ) : (
//                                                     <p className={cx('no-tasks')}>Chưa có nhiệm vụ nào</p>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <div className={cx('empty-state')}>
//                         <div className={cx('empty-icon')}>
//                             <FontAwesomeIcon icon={faCheckCircle} />
//                         </div>
//                         <p>Chưa có hợp đồng hoàn thành</p>
//                     </div>
//                 )}
//             </div>

//             {/* Activity Logs */}
//             <div className={cx('section')}>
//                 <div className={cx('section-header')}>
//                     <h3>Hoạt động gần đây</h3>
//                     <span className={cx('count')}>{activityLogs.length} hoạt động</span>
//                 </div>

//                 <div className={cx('activity-timeline')}>
//                     {activityLogs.slice(0, 5).map((log) => (
//                         <div key={log.id} className={cx('activity-item')}>
//                             <div className={cx('activity-icon', log.type)}>
//                                 {log.type === 'system' && <FontAwesomeIcon icon={faCog} />}
//                                 {log.type === 'contract' && <FontAwesomeIcon icon={faFileAlt} />}
//                                 {log.type === 'user' && <FontAwesomeIcon icon={faUser} />}
//                             </div>
//                             <div className={cx('activity-content')}>
//                                 <h4>{log.action}</h4>
//                                 <p>{log.description}</p>
//                                 <span className={cx('timestamp')}>{log.timestamp}</span>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default UserLogDetail;
