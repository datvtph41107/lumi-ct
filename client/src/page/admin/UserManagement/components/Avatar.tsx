import type React from 'react';
import classNames from 'classnames/bind';
import styles from '../UserLogDetail.module.scss';
import { getInitials, getAvatarColor, getAvatarTextColor } from '~/utils/user.utils';

const cx = classNames.bind(styles);

interface AvatarProps {
    name: string;
    size?: 'small' | 'medium' | 'large';
    className?: string;
    title?: string;
}

const Avatar: React.FC<AvatarProps> = ({ name, size = 'small', className, title }) => {
    const avatarClass = size === 'small' ? 'avatar-small' : size === 'large' ? 'avatar-circle' : 'avatar-medium';

    return (
        <div
            className={cx(avatarClass, className)}
            style={{
                backgroundColor: getAvatarColor(name),
                color: getAvatarTextColor(name),
            }}
            title={title || name}
        >
            {getInitials(name)}
        </div>
    );
};

export default Avatar;
