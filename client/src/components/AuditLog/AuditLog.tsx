import type React from 'react';
import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './AuditLog.module.scss';
import AuditLogViewer from './AuditLogViewer';
import AuditLogFilters from './AuditLogFilters';
import type { AuditLogProps, AuditLogFilters as FilterType } from '~/types/audit-log.types';
import { filterAuditEntries, extractAvailableUsers, extractAvailableEventTypes } from '~/utils/audit-log.utils';

const cx = classNames.bind(styles);

const AuditLog: React.FC<AuditLogProps> = ({
    entries,
    availableUsers,
    availableEventTypes,
    filters: initialFilters,
    onFiltersChange,
    showFilters = true,
    className,
    title = 'Nhật ký hoạt động',
    defaultDateRange,
}) => {
    const [filters, setFilters] = useState<FilterType>({
        dateRange: defaultDateRange || {
            startDate: new Date('2020-09-27T13:00:21'),
            endDate: new Date('2020-10-27T13:00:21'),
        },
        selectedUsers: [],
        selectedEventTypes: [],
        ...initialFilters,
    });

    const users = availableUsers || extractAvailableUsers(entries);
    const eventTypes = availableEventTypes || extractAvailableEventTypes(entries);
    const filteredEntries = filterAuditEntries(entries, filters);

    const handleFiltersChange = (newFilters: FilterType) => {
        setFilters(newFilters);
        onFiltersChange?.(newFilters);
    };

    useEffect(() => {
        if (initialFilters) {
            setFilters((prev) => ({ ...prev, ...initialFilters }));
        }
    }, [initialFilters]);

    return (
        <div className={cx('audit-log-section', className)}>
            <div className={cx('audit-log-container')}>
                <div className={cx('audit-log-header')}>
                    <h3>{title}</h3>
                </div>

                <div className={cx('audit-log-content')}>
                    <AuditLogViewer entries={filteredEntries} />

                    {showFilters && (
                        <AuditLogFilters
                            filters={filters}
                            availableUsers={users}
                            availableEventTypes={eventTypes}
                            onFiltersChange={handleFiltersChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditLog;
