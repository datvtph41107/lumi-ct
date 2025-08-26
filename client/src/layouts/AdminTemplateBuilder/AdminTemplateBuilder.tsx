import classNames from 'classnames/bind';
import style from './AdminTemplateBuilder.module.scss';
import type { ReactNode } from 'react';
const cx = classNames.bind(style);

interface AdminTemplateBuilderProps {
    children: ReactNode;
}

const AdminTemplateBuilder: React.FC<AdminTemplateBuilderProps> = ({ children }) => {
    return <div className={cx('wrapper')}>{children}</div>;
};

export default AdminTemplateBuilder;
