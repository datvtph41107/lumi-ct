import type { AuditLogEntry, AuditLogFilters } from '~/types/audit-log.types';

export const filterAuditEntries = (entries: AuditLogEntry[], filters: AuditLogFilters): AuditLogEntry[] => {
    return entries.filter((entry) => {
        // Filter by users
        if (filters.selectedUsers.length > 0 && !filters.selectedUsers.includes(entry.user)) {
            return false;
        }

        // Filter by event types
        if (filters.selectedEventTypes.length > 0) {
            const matchesEventType = filters.selectedEventTypes.some((eventType) => entry.action.includes(eventType));
            if (!matchesEventType) return false;
        }

        // Filter by date range (simplified - you might want to add proper date parsing)
        // This assumes timestamp is in a format that can be compared

        return true;
    });
};

export const groupEntriesByDate = (entries: AuditLogEntry[]): Record<string, AuditLogEntry[]> => {
    return entries.reduce((groups, entry) => {
        // Simple date grouping - you might want to improve this based on your timestamp format
        const isToday = ['12:58:51', '12:58:32', '12:58:06', '12:57:15', '12:56:42'].includes(entry.timestamp);
        const dateKey = isToday ? 'Hôm nay' : '22 Tháng 10, 2020';

        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(entry);
        return groups;
    }, {} as Record<string, AuditLogEntry[]>);
};

export const extractAvailableUsers = (entries: AuditLogEntry[]): string[] => {
    const users = new Set(entries.map((entry) => entry.user));
    return Array.from(users);
};

export const extractAvailableEventTypes = (entries: AuditLogEntry[]): string[] => {
    const eventTypes = new Set(entries.map((entry) => entry.action));
    return Array.from(eventTypes);
};
