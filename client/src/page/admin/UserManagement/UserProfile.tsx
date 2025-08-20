import type React from 'react';
import classNames from 'classnames/bind';
import styles from './UserLogDetail.module.scss';
import type { User } from '~/types/user.types';
import { getDepartmentLabel, getRoleLabel, getInitials, getAvatarColor, getAvatarTextColor } from '~/utils/user.utils';

const cx = classNames.bind(styles);

interface UserProfileProps {
    user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
    return (
        <div className={cx('profile-card')}>
            <div className={cx('profile-header')}>
                <div
                    className={cx('avatar-circle')}
                    style={{
                        backgroundColor: getAvatarColor(user.fullName),
                        color: getAvatarTextColor(user.fullName),
                    }}
                >
                    {getInitials(user.fullName)}
                </div>
                <div className={cx('profile-info')}>
                    <h2>{user.fullName}</h2>
                    <p className={cx('username')}>@{user.username}</p>
                    <div className={cx('badges')}>
                        <span className={cx('department-badge', user.department)}>
                            {getDepartmentLabel(user.department)}
                        </span>
                        <span className={cx('role-badge', user.role)}>{getRoleLabel(user.role)}</span>
                        <span className={cx('status-badge', { active: user.isActive })}>
                            {user.isActive ? 'Hoạt động' : 'Tạm khóa'}
                        </span>
                    </div>
                </div>
            </div>

            <div className={cx('profile-details')}>
                <div className={cx('detail-item')}>
                    <span className={cx('label')}>Email:</span>
                    <span>{user.email}</span>
                </div>
                <div className={cx('detail-item')}>
                    <span className={cx('label')}>Số điện thoại:</span>
                    <span>{user.phone}</span>
                </div>
                <div className={cx('detail-item')}>
                    <span className={cx('label')}>Địa chỉ:</span>
                    <span>{user.address}</span>
                </div>
                <div className={cx('detail-item')}>
                    <span className={cx('label')}>Ngày tham gia:</span>
                    <span>{user.joinDate}</span>
                </div>
                <div className={cx('detail-item')}>
                    <span className={cx('label')}>Đăng nhập cuối:</span>
                    <span>{user.lastLogin}</span>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
