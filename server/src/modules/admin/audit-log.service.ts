import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog } from '../../core/domain/permission/audit-log.entity';
import { User } from '../../core/domain/user/user.entity';

export interface AuditLogEntry {
    user_id: string;
    action: string;
    resource_type: string;
    resource_id?: string;
    details?: any;
    ip_address?: string;
    user_agent?: string;
}

export interface AuditLogFilters {
    user_id?: string;
    action?: string;
    resource_type?: string;
    resource_id?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
}

export interface AuditLogResponse {
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Injectable()
export class AuditLogService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async log(entry: AuditLogEntry): Promise<AuditLog> {
        const auditLog = this.auditLogRepository.create({
            user_id: entry.user_id,
            action: entry.action,
            resource_type: entry.resource_type,
            resource_id: entry.resource_id,
            details: entry.details ? JSON.stringify(entry.details) : null,
            ip_address: entry.ip_address,
            user_agent: entry.user_agent,
            timestamp: new Date(),
        });

        return this.auditLogRepository.save(auditLog);
    }

    async getLogs(filters: AuditLogFilters, currentUser: User): Promise<AuditLogResponse> {
        const { user_id, action, resource_type, resource_id, start_date, end_date, page = 1, limit = 50 } = filters;

        const queryBuilder = this.auditLogRepository
            .createQueryBuilder('audit_log')
            .leftJoinAndSelect('audit_log.user', 'user');

        // Apply filters
        if (user_id) {
            queryBuilder.andWhere('audit_log.user_id = :user_id', { user_id });
        }

        if (action) {
            queryBuilder.andWhere('audit_log.action = :action', { action });
        }

        if (resource_type) {
            queryBuilder.andWhere('audit_log.resource_type = :resource_type', { resource_type });
        }

        if (resource_id) {
            queryBuilder.andWhere('audit_log.resource_id = :resource_id', { resource_id });
        }

        if (start_date && end_date) {
            queryBuilder.andWhere('audit_log.timestamp BETWEEN :start_date AND :end_date', {
                start_date: new Date(start_date),
                end_date: new Date(end_date),
            });
        }

        // Count total
        const total = await queryBuilder.getCount();

        // Apply pagination
        const offset = (page - 1) * limit;
        queryBuilder.skip(offset).take(limit);

        // Order by timestamp (newest first)
        queryBuilder.orderBy('audit_log.timestamp', 'DESC');

        const logs = await queryBuilder.getMany();

        return {
            logs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getLog(logId: string, currentUser: User): Promise<AuditLog> {
        const log = await this.auditLogRepository.findOne({
            where: { id: logId },
            relations: ['user'],
        });

        if (!log) {
            throw new Error('Audit log not found');
        }

        return log;
    }

    async getRecentActivity(filters: any, currentUser: User): Promise<AuditLog[]> {
        const { limit = 10, user_id, resource_type } = filters;

        const queryBuilder = this.auditLogRepository
            .createQueryBuilder('audit_log')
            .leftJoinAndSelect('audit_log.user', 'user');

        if (user_id) {
            queryBuilder.andWhere('audit_log.user_id = :user_id', { user_id });
        }

        if (resource_type) {
            queryBuilder.andWhere('audit_log.resource_type = :resource_type', { resource_type });
        }

        queryBuilder
            .orderBy('audit_log.timestamp', 'DESC')
            .limit(limit);

        return queryBuilder.getMany();
    }

    async getUserActivity(userId: string, filters?: any): Promise<AuditLog[]> {
        const { start_date, end_date, limit = 50 } = filters || {};

        const queryBuilder = this.auditLogRepository
            .createQueryBuilder('audit_log')
            .leftJoinAndSelect('audit_log.user', 'user')
            .where('audit_log.user_id = :userId', { userId });

        if (start_date && end_date) {
            queryBuilder.andWhere('audit_log.timestamp BETWEEN :start_date AND :end_date', {
                start_date: new Date(start_date),
                end_date: new Date(end_date),
            });
        }

        queryBuilder
            .orderBy('audit_log.timestamp', 'DESC')
            .limit(limit);

        return queryBuilder.getMany();
    }

    async getResourceActivity(resourceType: string, resourceId: string, filters?: any): Promise<AuditLog[]> {
        const { start_date, end_date, limit = 50 } = filters || {};

        const queryBuilder = this.auditLogRepository
            .createQueryBuilder('audit_log')
            .leftJoinAndSelect('audit_log.user', 'user')
            .where('audit_log.resource_type = :resourceType', { resourceType })
            .andWhere('audit_log.resource_id = :resourceId', { resourceId });

        if (start_date && end_date) {
            queryBuilder.andWhere('audit_log.timestamp BETWEEN :start_date AND :end_date', {
                start_date: new Date(start_date),
                end_date: new Date(end_date),
            });
        }

        queryBuilder
            .orderBy('audit_log.timestamp', 'DESC')
            .limit(limit);

        return queryBuilder.getMany();
    }

    async getActivitySummary(filters?: any): Promise<any> {
        const { start_date, end_date } = filters || {};

        const queryBuilder = this.auditLogRepository
            .createQueryBuilder('audit_log');

        if (start_date && end_date) {
            queryBuilder.where('audit_log.timestamp BETWEEN :start_date AND :end_date', {
                start_date: new Date(start_date),
                end_date: new Date(end_date),
            });
        }

        // Get total actions
        const totalActions = await queryBuilder.getCount();

        // Get actions by type
        const actionsByType = await queryBuilder
            .select('audit_log.action', 'action')
            .addSelect('COUNT(*)', 'count')
            .groupBy('audit_log.action')
            .getRawMany();

        // Get actions by resource type
        const actionsByResource = await queryBuilder
            .select('audit_log.resource_type', 'resource_type')
            .addSelect('COUNT(*)', 'count')
            .groupBy('audit_log.resource_type')
            .getRawMany();

        // Get top users by activity
        const topUsers = await queryBuilder
            .select('audit_log.user_id', 'user_id')
            .addSelect('COUNT(*)', 'count')
            .groupBy('audit_log.user_id')
            .orderBy('count', 'DESC')
            .limit(10)
            .getRawMany();

        return {
            totalActions,
            actionsByType,
            actionsByResource,
            topUsers,
        };
    }

    async exportLogs(filters: AuditLogFilters, format: 'csv' | 'excel' = 'csv'): Promise<string> {
        const { logs } = await this.getLogs(filters, {} as User);

        if (format === 'csv') {
            return this.generateCsv(logs);
        } else {
            return this.generateExcel(logs);
        }
    }

    private generateCsv(logs: AuditLog[]): string {
        const headers = ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource ID', 'Details', 'IP Address'];
        const rows = logs.map(log => [
            log.timestamp.toISOString(),
            log.user?.username || 'Unknown',
            log.action,
            log.resource_type,
            log.resource_id || '',
            log.details || '',
            log.ip_address || '',
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return csvContent;
    }

    private generateExcel(logs: AuditLog[]): string {
        // This would typically use a library like xlsx
        // For now, return CSV format
        return this.generateCsv(logs);
    }

    async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const result = await this.auditLogRepository
            .createQueryBuilder()
            .delete()
            .where('timestamp < :cutoffDate', { cutoffDate })
            .execute();

        return result.affected || 0;
    }
}