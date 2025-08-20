export interface ActivityLog {
    id: string;
    action: string;
    description: string;
    timestamp: string;
    type: 'system' | 'contract' | 'user';
    details?: string;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    timestamp: string;
    isRead: boolean;
}
