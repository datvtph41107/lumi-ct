// 📁 components/sidebar/SidebarMenuItem.tsx
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';

const cx = classNames.bind(styles);

type SidebarMenuItemProps = {
    item: {
        label: string;
        path?: string;
        icon?: React.ElementType;
    };
    collapsed: boolean;
    location: ReturnType<typeof useLocation>;
    activeLabel: string | null;
    setActiveLabel: React.Dispatch<React.SetStateAction<string | null>>;
    defaultActiveLabel: string | null;
    setShowNotifModal: React.Dispatch<React.SetStateAction<boolean>>;
    showNotifModal: boolean;
};

const SidebarMenuItem = ({
    item,
    collapsed,
    location,
    activeLabel,
    setActiveLabel,
    // defaultActiveLabel,
    // showNotifModal,
    setShowNotifModal,
}: SidebarMenuItemProps) => {
    const isActive = (!activeLabel && location.pathname === item.path) || activeLabel === item.label;

    if (item.label === 'Thông báo') {
        return (
            <ul className={cx('menu')}>
                <li className={cx('menu-item', { active: isActive })}>
                    <div
                        className={cx('menu-group')}
                        onClick={() => {
                            setActiveLabel(item.label);
                            setShowNotifModal(true);
                        }}
                    >
                        <div className={cx('menu-notify')}>
                            <div className={cx('menu-notify-rm')}>
                                {item.icon && <item.icon className={cx('menu-group-icon')} />}
                                <div className={cx('menu-group-label')}>{item.label}</div>
                            </div>
                            <div className={cx('dot', { collapsed })}>12</div>
                        </div>
                    </div>
                </li>
            </ul>
        );
    }

    return (
        <ul className={cx('menu')}>
            <li className={cx('menu-item', { active: isActive })}>
                <Link
                    className={cx('menu-group')}
                    to={item.path as string}
                    title={collapsed ? item.label : undefined}
                    onClick={() => setActiveLabel(item.label)}
                >
                    {item.icon && <item.icon className={cx('menu-group-icon')} />}
                    <div className={cx('menu-group-label')}>{item.label}</div>
                </Link>
            </li>
        </ul>
    );
};

export default SidebarMenuItem;
