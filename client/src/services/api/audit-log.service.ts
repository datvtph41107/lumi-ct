import { BaseService } from "./base.service";
import type { ApiResponse } from "~/core/types/api.types";
import type { 
    AuditLog, 
    AuditLogFilters, 
    AuditLogListResponse, 
    AuditLogSummary 
} from "~/types/contract/audit-log.types";

export class AuditLogService extends BaseService {
    private readonly baseUrl = "/contracts";

    // ===== CONTRACT AUDIT LOGS =====
    async getContractAuditLogs(
        contractId: string, 
        filters?: AuditLogFilters, 
        pagination?: { page: number; limit: number }
    ): Promise<ApiResponse<AuditLogListResponse>> {
        const params = new URLSearchParams();
        
        if (filters?.action) params.append('action', filters.action);
        if (filters?.user_id) params.append('user_id', filters.user_id.toString());
        if (filters?.date_from) params.append('date_from', filters.date_from);
        if (filters?.date_to) params.append('date_to', filters.date_to);
        if (filters?.search) params.append('search', filters.search);
        
        if (pagination?.page) params.append('page', pagination.page.toString());
        if (pagination?.limit) params.append('limit', pagination.limit.toString());
        
        const url = `${this.baseUrl}/${contractId}/audit${params.toString() ? `?${params.toString()}` : ''}`;
        return this.request.private.get<AuditLogListResponse>(url);
    }

    async getContractAuditSummary(contractId: string): Promise<ApiResponse<AuditLogSummary>> {
        return this.request.private.get<AuditLogSummary>(
            `${this.baseUrl}/${contractId}/audit/summary`
        );
    }

    // ===== USER AUDIT LOGS =====
    async getUserAuditLogs(
        filters?: AuditLogFilters, 
        pagination?: { page: number; limit: number }
    ): Promise<ApiResponse<AuditLogListResponse>> {
        const params = new URLSearchParams();
        
        if (filters?.action) params.append('action', filters.action);
        if (filters?.date_from) params.append('date_from', filters.date_from);
        if (filters?.date_to) params.append('date_to', filters.date_to);
        if (filters?.search) params.append('search', filters.search);
        
        if (pagination?.page) params.append('page', pagination.page.toString());
        if (pagination?.limit) params.append('limit', pagination.limit.toString());
        
        const url = `${this.baseUrl}/audit/user${params.toString() ? `?${params.toString()}` : ''}`;
        return this.request.private.get<AuditLogListResponse>(url);
    }

    // ===== SYSTEM AUDIT LOGS =====
    async getSystemAuditLogs(
        filters?: AuditLogFilters, 
        pagination?: { page: number; limit: number }
    ): Promise<ApiResponse<AuditLogListResponse>> {
        const params = new URLSearchParams();
        
        if (filters?.action) params.append('action', filters.action);
        if (filters?.user_id) params.append('user_id', filters.user_id.toString());
        if (filters?.date_from) params.append('date_from', filters.date_from);
        if (filters?.date_to) params.append('date_to', filters.date_to);
        if (filters?.search) params.append('search', filters.search);
        
        if (pagination?.page) params.append('page', pagination.page.toString());
        if (pagination?.limit) params.append('limit', pagination.limit.toString());
        
        const url = `${this.baseUrl}/audit/system${params.toString() ? `?${params.toString()}` : ''}`;
        return this.request.private.get<AuditLogListResponse>(url);
    }

    // ===== HELPER METHODS =====
    async getRecentActivity(contractId: string, limit: number = 10): Promise<AuditLog[]> {
        try {
            const response = await this.getContractAuditLogs(contractId, undefined, { page: 1, limit });
            return response.data?.data || [];
        } catch (error) {
            console.error('Error fetching recent activity:', error);
            return [];
        }
    }

    async getActivityByAction(contractId: string, action: string): Promise<AuditLog[]> {
        try {
            const response = await this.getContractAuditLogs(contractId, { action });
            return response.data?.data || [];
        } catch (error) {
            console.error('Error fetching activity by action:', error);
            return [];
        }
    }

    async getActivityByUser(contractId: string, userId: number): Promise<AuditLog[]> {
        try {
            const response = await this.getContractAuditLogs(contractId, { user_id: userId });
            return response.data?.data || [];
        } catch (error) {
            console.error('Error fetching activity by user:', error);
            return [];
        }
    }

    async getActivityByDateRange(
        contractId: string, 
        dateFrom: string, 
        dateTo: string
    ): Promise<AuditLog[]> {
        try {
            const response = await this.getContractAuditLogs(contractId, { 
                date_from: dateFrom, 
                date_to: dateTo 
            });
            return response.data?.data || [];
        } catch (error) {
            console.error('Error fetching activity by date range:', error);
            return [];
        }
    }

    async searchActivity(contractId: string, searchTerm: string): Promise<AuditLog[]> {
        try {
            const response = await this.getContractAuditLogs(contractId, { search: searchTerm });
            return response.data?.data || [];
        } catch (error) {
            console.error('Error searching activity:', error);
            return [];
        }
    }

    // ===== UTILITY METHODS =====
    formatAuditLogDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    getActionDisplayName(action: string): string {
        const actionNames: Record<string, string> = {
            'CREATE_CONTRACT': 'Tạo hợp đồng',
            'UPDATE_CONTRACT': 'Cập nhật hợp đồng',
            'DELETE_CONTRACT': 'Xóa hợp đồng',
            'PUBLISH_CONTRACT': 'Xuất bản hợp đồng',
            'SAVE_STAGE': 'Lưu giai đoạn',
            'TRANSITION_STAGE': 'Chuyển giai đoạn',
            'AUTO_SAVE': 'Tự động lưu',
            'ADD_COLLABORATOR': 'Thêm cộng tác viên',
            'UPDATE_COLLABORATOR_ROLE': 'Cập nhật vai trò',
            'REMOVE_COLLABORATOR': 'Xóa cộng tác viên',
            'TRANSFER_OWNERSHIP': 'Chuyển quyền sở hữu',
            'CREATE_VERSION': 'Tạo phiên bản',
            'PUBLISH_VERSION': 'Xuất bản phiên bản',
            'ROLLBACK_VERSION': 'Khôi phục phiên bản',
            'CREATE_MILESTONE': 'Tạo mốc thời gian',
            'UPDATE_MILESTONE': 'Cập nhật mốc thời gian',
            'DELETE_MILESTONE': 'Xóa mốc thời gian',
            'CREATE_TASK': 'Tạo công việc',
            'UPDATE_TASK': 'Cập nhật công việc',
            'DELETE_TASK': 'Xóa công việc',
            'UPLOAD_FILE': 'Tải lên tệp',
            'DELETE_FILE': 'Xóa tệp',
            'APPROVE_CONTRACT': 'Phê duyệt hợp đồng',
            'REJECT_CONTRACT': 'Từ chối hợp đồng',
            'REQUEST_CHANGES': 'Yêu cầu thay đổi',
            'CREATE_TEMPLATE': 'Tạo mẫu',
            'UPDATE_TEMPLATE': 'Cập nhật mẫu',
            'DELETE_TEMPLATE': 'Xóa mẫu',
            'CREATE_NOTIFICATION': 'Tạo thông báo',
            'CREATE_REMINDER': 'Tạo nhắc nhở',
            'EXPORT_PDF': 'Xuất PDF',
            'EXPORT_DOCX': 'Xuất DOCX',
            'PRINT_CONTRACT': 'In hợp đồng',
        };

        return actionNames[action] || action;
    }

    getActionIcon(action: string): string {
        const actionIcons: Record<string, string> = {
            'CREATE_CONTRACT': '📄',
            'UPDATE_CONTRACT': '✏️',
            'DELETE_CONTRACT': '🗑️',
            'PUBLISH_CONTRACT': '✅',
            'SAVE_STAGE': '💾',
            'TRANSITION_STAGE': '➡️',
            'AUTO_SAVE': '🔄',
            'ADD_COLLABORATOR': '👥',
            'UPDATE_COLLABORATOR_ROLE': '🔄',
            'REMOVE_COLLABORATOR': '❌',
            'TRANSFER_OWNERSHIP': '👑',
            'CREATE_VERSION': '📝',
            'PUBLISH_VERSION': '✅',
            'ROLLBACK_VERSION': '⏪',
            'CREATE_MILESTONE': '🎯',
            'UPDATE_MILESTONE': '✏️',
            'DELETE_MILESTONE': '🗑️',
            'CREATE_TASK': '📋',
            'UPDATE_TASK': '✏️',
            'DELETE_TASK': '🗑️',
            'UPLOAD_FILE': '📁',
            'DELETE_FILE': '🗑️',
            'APPROVE_CONTRACT': '✅',
            'REJECT_CONTRACT': '❌',
            'REQUEST_CHANGES': '⚠️',
            'CREATE_TEMPLATE': '📄',
            'UPDATE_TEMPLATE': '✏️',
            'DELETE_TEMPLATE': '🗑️',
            'CREATE_NOTIFICATION': '🔔',
            'CREATE_REMINDER': '⏰',
            'EXPORT_PDF': '📄',
            'EXPORT_DOCX': '📄',
            'PRINT_CONTRACT': '🖨️',
        };

        return actionIcons[action] || '📝';
    }
}

export const auditLogService = new AuditLogService();