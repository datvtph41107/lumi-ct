'use client';

import type React from 'react';

import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import styles from './AuditLog.module.scss';
import type { AuditLogViewerProps } from '~/types/audit-log.types';
import { groupEntriesByDate } from '~/utils/audit-log.utils';
import { getAvatarColor, getAvatarTextColor, getInitials } from '~/utils/user.utils';

const cx = classNames.bind(styles);

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ entries, className }) => {
    const groupedEntries = groupEntriesByDate(entries);

    return (
        <div className={cx('audit-log-main', className)}>
            <div className={cx('audit-entries')}>
                {Object.entries(groupedEntries).map(([dateKey, dateEntries], groupIndex) => (
                    <div key={dateKey} className={cx('audit-group')}>
                        <div className={cx('date-separator')}>
                            <div className={cx('date-separator-bg')}>{dateKey}</div>
                        </div>
                        <div className={cx('timeline-container')}>
                            {dateEntries.map((entry) => (
                                <div key={entry.id} className={cx('audit-entry')}>
                                    <div className={cx('timeline-line')}></div>
                                    <div className={cx('entry-time')}>{entry.timestamp}</div>
                                    <div
                                        className={cx('user-avatar')}
                                        style={{
                                            backgroundColor: getAvatarColor(entry.user),
                                            color: getAvatarTextColor(entry.user),
                                        }}
                                    >
                                        {getInitials(entry.user)}
                                    </div>
                                    <div className={cx('entry-content')}>
                                        <div className={cx('entry-user')}>
                                            <span
                                                className={cx('user-badge')}
                                                style={{ color: getAvatarTextColor(entry.user) }}
                                            >
                                                {entry.user}
                                            </span>
                                            <span className={cx('entry-action')}>{entry.action}</span>
                                        </div>
                                        {entry.details && <div className={cx('entry-details')}>{entry.details}</div>}
                                    </div>
                                </div>
                            ))}

                            {groupIndex === 0 && dateEntries.length >= 3 && (
                                <div className={cx('expand-link')}>
                                    <div className={cx('expand-icon')}>
                                        <FontAwesomeIcon icon={faChevronDown} />
                                    </div>
                                    <span>
                                        Mở rộng {Math.max(0, entries.length - dateEntries.length)} hoạt động tương tự
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AuditLogViewer;
