import type React from 'react';
import classNames from 'classnames/bind';
import styles from '../UserLogDetail.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faFileAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import type { ActivityLog } from '~/types/activity.types';

const cx = classNames.bind(styles);

interface ActivityTimelineProps {
    activities: ActivityLog[];
    maxItems?: number;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, maxItems = 5 }) => {
    return (
        <div className={cx('activity-timeline')}>
            {activities.slice(0, maxItems).map((log) => (
                <div key={log.id} className={cx('activity-item')}>
                    <div className={cx('activity-icon', log.type)}>
                        {log.type === 'system' && <FontAwesomeIcon icon={faCog} />}
                        {log.type === 'contract' && <FontAwesomeIcon icon={faFileAlt} />}
                        {log.type === 'user' && <FontAwesomeIcon icon={faUser} />}
                    </div>
                    <div className={cx('activity-content')}>
                        <h4>{log.action}</h4>
                        <p>{log.description}</p>
                        <span className={cx('timestamp')}>{log.timestamp}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityTimeline;
