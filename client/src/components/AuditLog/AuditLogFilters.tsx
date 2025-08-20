import type React from 'react';
import { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './AuditLog.module.scss';
import type { AuditLogFiltersProps } from '~/types/audit-log.types';
import DateRangePicker, { type DateRange } from '~/components/DateRangePicker/DateRangePicker';

const cx = classNames.bind(styles);

const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({
    filters,
    availableUsers,
    availableEventTypes,
    onFiltersChange,
    className,
}) => {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleDateRangeChange = (range: DateRange) => {
        const newFilters = {
            ...localFilters,
            dateRange: {
                startDate: range.startDate,
                endDate: range.endDate,
            },
        };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const toggleUserFilter = (user: string) => {
        const newFilters = {
            ...localFilters,
            selectedUsers: localFilters.selectedUsers.includes(user)
                ? localFilters.selectedUsers.filter((u) => u !== user)
                : [...localFilters.selectedUsers, user],
        };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const toggleEventTypeFilter = (eventType: string) => {
        const newFilters = {
            ...localFilters,
            selectedEventTypes: localFilters.selectedEventTypes.includes(eventType)
                ? localFilters.selectedEventTypes.filter((e) => e !== eventType)
                : [...localFilters.selectedEventTypes, eventType],
        };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    return (
        <div className={cx('audit-filters', className)}>
            <h4>Bộ lọc</h4>

            <div className={cx('filter-section')}>
                <h5>Lọc theo thời gian</h5>
                <DateRangePicker
                    value={{
                        startDate: localFilters.dateRange.startDate,
                        endDate: localFilters.dateRange.endDate,
                    }}
                    onChange={handleDateRangeChange}
                    placeholder="Chọn khoảng thời gian"
                />
            </div>

            <div className={cx('filter-section')}>
                <h5>Lọc theo người dùng</h5>
                <div className={cx('filter-tags')}>
                    {availableUsers.map((user) => (
                        <span
                            key={user}
                            className={cx('filter-tag', {
                                active: localFilters.selectedUsers.includes(user),
                            })}
                            onClick={() => toggleUserFilter(user)}
                        >
                            {user}
                        </span>
                    ))}
                </div>
            </div>

            <div className={cx('filter-section')}>
                <h5>Lọc theo loại sự kiện</h5>
                <div className={cx('filter-tags')}>
                    {availableEventTypes.map((eventType) => (
                        <span
                            key={eventType}
                            className={cx('filter-tag', {
                                active: localFilters.selectedEventTypes.includes(eventType),
                            })}
                            onClick={() => toggleEventTypeFilter(eventType)}
                        >
                            {eventType}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AuditLogFilters;
