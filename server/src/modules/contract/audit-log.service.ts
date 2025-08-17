import { Injectable, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { AuditLog } from '@/core/domain/permission/audit-log.entity';

export interface CreateAuditLogDto {
    contract_id?: string | number;
    user_id?: number;
    action: string;
    meta?: Record<string, any>;
    description?: string;
}

export interface AuditLogWithUser {
    id: string;
    contract_id?: string | number;
    user_id?: number;
    action: string;
    meta?: Record<string, any>;
    description?: string;
    created_at: Date;
    user_name?: string;
    user_email?: string;
    user_avatar?: string | null;
}

export interface AuditLogFilters {
    action?: string;
    user_id?: number;
    date_from?: Date;
    date_to?: Date;
    search?: string;
}

export interface AuditLogPagination {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}

@Injectable()
export class AuditLogService {
    private readonly repo: Repository<AuditLog>;

    constructor(
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        @Inject('LOGGER') private readonly logger: LoggerTypes,
    ) { this.repo = this.db.getRepository(AuditLog); }

    async create(payload: CreateAuditLogDto): Promise<AuditLog> {
        if (!payload.action) throw new BadRequestException('Action is required to create audit log');
        try {
            const saved = await this.repo.save(payload as any);
            this.logger.APP.info('Audit log created', { action: payload.action, contract_id: payload.contract_id, user_id: payload.user_id });
            return saved as any;
        } catch (err: unknown) {
            this.logger.APP.error('[AuditLogService] create error', { err, payload });
            throw new InternalServerErrorException('Failed to create audit log');
        }
    }

    async findByContract(
        contractId: string,
        filters?: AuditLogFilters,
        pagination?: { page: number; limit: number },
    ): Promise<{ data: AuditLogWithUser[]; pagination: AuditLogPagination }> {
        if (!contractId) {
            throw new BadRequestException('Contract ID is required');
        }

        const page = pagination?.page || 1;
        const limit = pagination?.limit || 50;
        const offset = (page - 1) * limit;

        const queryBuilder = this.repo
            .createQueryBuilder('audit')
            .where('audit.contract_id = :contractId', { contractId });

        // Apply filters
        if (filters?.action) {
            queryBuilder.andWhere('audit.action = :action', { action: filters.action });
        }

        if (filters?.user_id) {
            queryBuilder.andWhere('audit.user_id = :userId', { userId: filters.user_id });
        }

        if (filters?.date_from) {
            queryBuilder.andWhere('audit.created_at >= :dateFrom', { dateFrom: filters.date_from });
        }

        if (filters?.date_to) {
            queryBuilder.andWhere('audit.created_at <= :dateTo', { dateTo: filters.date_to });
        }

        if (filters?.search) {
            queryBuilder.andWhere('(audit.description ILIKE :search OR audit.action ILIKE :search)', {
                search: `%${filters.search}%`,
            });
        }

        // Get total count
        const total = await queryBuilder.getCount();

        // Get paginated results
        const logs = await queryBuilder.orderBy('audit.created_at', 'DESC').skip(offset).take(limit).getMany();

        // Map to include user details (placeholder)
        const data: AuditLogWithUser[] = logs.map((log) => ({
            id: log.id,
            contract_id: log.contract_id,
            user_id: log.user_id,
            action: log.action,
            meta: log.meta,
            description: log.description,
            created_at: log.created_at,
            user_name: log.user_id ? `User ${log.user_id}` : undefined,
            user_email: log.user_id ? `user${log.user_id}@example.com` : undefined,
            user_avatar: null,
        }));

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
            },
        };
    }

    async findByUser(
        userId: number,
        filters?: AuditLogFilters,
        pagination?: { page: number; limit: number },
    ): Promise<{ data: AuditLogWithUser[]; pagination: AuditLogPagination }> {
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 50;
        const offset = (page - 1) * limit;

        const queryBuilder = this.repo.createQueryBuilder('audit').where('audit.user_id = :userId', { userId });

        // Apply filters
        if (filters?.action) {
            queryBuilder.andWhere('audit.action = :action', { action: filters.action });
        }

        if (filters?.date_from) {
            queryBuilder.andWhere('audit.created_at >= :dateFrom', { dateFrom: filters.date_from });
        }

        if (filters?.date_to) {
            queryBuilder.andWhere('audit.created_at <= :dateTo', { dateTo: filters.date_to });
        }

        if (filters?.search) {
            queryBuilder.andWhere('(audit.description ILIKE :search OR audit.action ILIKE :search)', {
                search: `%${filters.search}%`,
            });
        }

        const total = await queryBuilder.getCount();

        const logs = await queryBuilder.orderBy('audit.created_at', 'DESC').skip(offset).take(limit).getMany();

        const data: AuditLogWithUser[] = logs.map((log) => ({
            id: log.id,
            contract_id: log.contract_id,
            user_id: log.user_id,
            action: log.action,
            meta: log.meta,
            description: log.description,
            created_at: log.created_at,
            user_name: log.user_id ? `User ${log.user_id}` : undefined,
            user_email: log.user_id ? `user${log.user_id}@example.com` : undefined,
            user_avatar: null,
        }));

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
            },
        };
    }

    async getSystemAuditLogs(
        filters?: AuditLogFilters,
        pagination?: { page: number; limit: number },
    ): Promise<{ data: AuditLogWithUser[]; pagination: AuditLogPagination }> {
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 50;
        const offset = (page - 1) * limit;

        const queryBuilder = this.repo.createQueryBuilder('audit');

        // Apply filters
        if (filters?.action) {
            queryBuilder.andWhere('audit.action = :action', { action: filters.action });
        }

        if (filters?.user_id) {
            queryBuilder.andWhere('audit.user_id = :userId', { userId: filters.user_id });
        }

        if (filters?.date_from) {
            queryBuilder.andWhere('audit.created_at >= :dateFrom', { dateFrom: filters.date_from });
        }

        if (filters?.date_to) {
            queryBuilder.andWhere('audit.created_at <= :dateTo', { dateTo: filters.date_to });
        }

        if (filters?.search) {
            queryBuilder.andWhere('(audit.description ILIKE :search OR audit.action ILIKE :search)', {
                search: `%${filters.search}%`,
            });
        }

        const total = await queryBuilder.getCount();

        const logs = await queryBuilder.orderBy('audit.created_at', 'DESC').skip(offset).take(limit).getMany();

        const data: AuditLogWithUser[] = logs.map((log) => ({
            id: log.id,
            contract_id: log.contract_id,
            user_id: log.user_id,
            action: log.action,
            meta: log.meta,
            description: log.description,
            created_at: log.created_at,
            user_name: log.user_id ? `User ${log.user_id}` : undefined,
            user_email: log.user_id ? `user${log.user_id}@example.com` : undefined,
            user_avatar: null,
        }));

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
            },
        };
    }

    async getAuditLogById(id: string): Promise<AuditLogWithUser> {
        const log = await this.repo.findOne({ where: { id } });
        if (!log) {
            throw new BadRequestException('Audit log not found');
        }

        return {
            id: log.id,
            contract_id: log.contract_id,
            user_id: log.user_id,
            action: log.action,
            meta: log.meta,
            description: log.description,
            created_at: log.created_at,
            user_name: log.user_id ? `User ${log.user_id}` : undefined,
            user_email: log.user_id ? `user${log.user_id}@example.com` : undefined,
            user_avatar: null,
        };
    }

    async getAuditSummary(contractId: string): Promise<{
        total_actions: number;
        actions_by_type: Record<string, number>;
        recent_activity: AuditLogWithUser[];
        top_users: Array<{ user_id: number; action_count: number; user_name: string }>;
    }> {
        const logs = await this.repo.find({
            where: { contract_id: contractId },
            order: { created_at: 'DESC' },
            take: 100,
        });

        const total_actions = logs.length;
        const actions_by_type: Record<string, number> = {};
        const user_actions: Record<number, number> = {};

        logs.forEach((log) => {
            actions_by_type[log.action] = (actions_by_type[log.action] || 0) + 1;
            if (log.user_id) {
                user_actions[log.user_id] = (user_actions[log.user_id] || 0) + 1;
            }
        });

        const recent_activity: AuditLogWithUser[] = logs.slice(0, 10).map((log) => ({
            id: log.id,
            contract_id: log.contract_id,
            user_id: log.user_id,
            action: log.action,
            meta: log.meta,
            description: log.description,
            created_at: log.created_at,
            user_name: log.user_id ? `User ${log.user_id}` : undefined,
            user_email: log.user_id ? `user${log.user_id}@example.com` : undefined,
            user_avatar: null,
        }));

        const top_users = Object.entries(user_actions)
            .map(([user_id, action_count]) => ({
                user_id: parseInt(user_id),
                action_count,
                user_name: `User ${user_id}`,
            }))
            .sort((a, b) => b.action_count - a.action_count)
            .slice(0, 5);

        return {
            total_actions,
            actions_by_type,
            recent_activity,
            top_users,
        };
    }

    async deleteOldLogs(olderThanDays: number): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        const result = await this.repo.delete({
            created_at: { $lt: cutoffDate } as any,
        });

        this.logger.APP.info('Deleted old audit logs', {
            deleted_count: result.affected,
            older_than_days: olderThanDays,
        });

        return result.affected || 0;
    }
}
