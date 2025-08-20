import type { User } from './user.types';

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    details: string;
    ipAddress?: string;
    userAgent?: string;
}

export interface AuditLogFilters {
    dateRange: {
        startDate: Date | null;
        endDate: Date | null;
    };
    selectedUsers: string[];
    selectedEventTypes: string[];
}

export interface AuditLogProps {
    entries: AuditLogEntry[];
    availableUsers?: string[];
    availableEventTypes?: string[];
    filters?: AuditLogFilters;
    onFiltersChange?: (filters: AuditLogFilters) => void;
    showFilters?: boolean;
    className?: string;
    title?: string;
    defaultDateRange?: {
        startDate: Date | null;
        endDate: Date | null;
    };
}

export interface AuditLogViewerProps {
    entries: AuditLogEntry[];
    className?: string;
}

export interface AuditLogFiltersProps {
    filters: AuditLogFilters;
    availableUsers: string[];
    availableEventTypes: string[];
    onFiltersChange: (filters: AuditLogFilters) => void;
    className?: string;
}
