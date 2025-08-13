import { Injectable, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { AuditLog } from '@/core/domain/permission/audit-log.entity';

export interface CreateAuditLogDto {
    contract_id?: string;
    user_id?: number;
    action: string;
    meta?: Record<string, any>;
    description?: string;
}

export interface AuditLogQueryDto {
    contract_id?: string;
    user_id?: number;
    action?: string;
    start_date?: Date;
    end_date?: Date;
    limit?: number;
    offset?: number;
}

@Injectable()
export class AuditLogService {
    private readonly repo: Repository<AuditLog>;

    constructor(
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        @Inject('LOGGER') private readonly logger: LoggerTypes,
    ) {
        this.repo = this.db.getRepository(AuditLog);
    }

    async create(payload: CreateAuditLogDto): Promise<AuditLog> {
        if (!payload.action) {
            throw new BadRequestException('Action is required to create audit log');
        }
        try {
            const ent = this.repo.create(payload);
            return await this.repo.save(ent);
        } catch (err: unknown) {
            this.logger.APP.error('[AuditLogService] create error', { err, payload });
            throw new InternalServerErrorException('Failed to create audit log');
        }
    }

    async findByContract(contractId: string, limit = 100): Promise<AuditLog[]> {
        if (!contractId) {
            throw new BadRequestException('Contract ID is required');
        }
        return this.repo.find({
            where: { contract_id: contractId },
            order: { created_at: 'DESC' },
            take: limit,
        });
    }

    async findByUser(userId: number, limit = 100): Promise<AuditLog[]> {
        if (!userId) {
            throw new BadRequestException('User ID is required');
        }
        return this.repo.find({
            where: { user_id: userId },
            order: { created_at: 'DESC' },
            take: limit,
        });
    }

    async findByAction(action: string, limit = 100): Promise<AuditLog[]> {
        if (!action) {
            throw new BadRequestException('Action is required');
        }
        return this.repo.find({
            where: { action },
            order: { created_at: 'DESC' },
            take: limit,
        });
    }

    async search(query: AuditLogQueryDto): Promise<{ logs: AuditLog[]; total: number }> {
        const queryBuilder = this.repo.createQueryBuilder('audit');

        if (query.contract_id) {
            queryBuilder.andWhere('audit.contract_id = :contract_id', { contract_id: query.contract_id });
        }

        if (query.user_id) {
            queryBuilder.andWhere('audit.user_id = :user_id', { user_id: query.user_id });
        }

        if (query.action) {
            queryBuilder.andWhere('audit.action = :action', { action: query.action });
        }

        if (query.start_date) {
            queryBuilder.andWhere('audit.created_at >= :start_date', { start_date: query.start_date });
        }

        if (query.end_date) {
            queryBuilder.andWhere('audit.created_at <= :end_date', { end_date: query.end_date });
        }

        const total = await queryBuilder.getCount();

        queryBuilder.orderBy('audit.created_at', 'DESC');
        
        if (query.limit) {
            queryBuilder.take(query.limit);
        }
        
        if (query.offset) {
            queryBuilder.skip(query.offset);
        }

        const logs = await queryBuilder.getMany();

        return { logs, total };
    }

    async getAuditLogsWithUserDetails(contractId: string, limit = 100): Promise<any[]> {
        if (!contractId) {
            throw new BadRequestException('Contract ID is required');
        }

        const logs = await this.repo
            .createQueryBuilder('audit')
            .leftJoin('user', 'user', 'user.id = audit.user_id')
            .select([
                'audit.id',
                'audit.contract_id',
                'audit.user_id',
                'audit.action',
                'audit.meta',
                'audit.description',
                'audit.created_at',
                'audit.updated_at',
                'user.email',
                'user.full_name',
                'user.avatar'
            ])
            .where('audit.contract_id = :contract_id', { contract_id: contractId })
            .orderBy('audit.created_at', 'DESC')
            .take(limit)
            .getRawMany();

        return logs.map(log => ({
            id: log.audit_id,
            contract_id: log.audit_contract_id,
            user_id: log.audit_user_id,
            action: log.audit_action,
            meta: log.audit_meta,
            description: log.audit_description,
            created_at: log.audit_created_at,
            updated_at: log.audit_updated_at,
            user: {
                email: log.user_email,
                full_name: log.user_full_name,
                avatar: log.user_avatar
            }
        }));
    }

    async getRecentActivity(userId: number, limit = 20): Promise<AuditLog[]> {
        return this.repo.find({
            where: { user_id: userId },
            order: { created_at: 'DESC' },
            take: limit,
        });
    }

    async getContractActivitySummary(contractId: string): Promise<any> {
        const logs = await this.repo.find({
            where: { contract_id: contractId },
            order: { created_at: 'DESC' },
        });

        const actionCounts = {};
        const userActivity = {};
        const recentActions = logs.slice(0, 10);

        logs.forEach(log => {
            // Count actions
            actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
            
            // Count user activity
            if (log.user_id) {
                userActivity[log.user_id] = (userActivity[log.user_id] || 0) + 1;
            }
        });

        return {
            total_actions: logs.length,
            action_breakdown: actionCounts,
            user_activity: userActivity,
            recent_actions: recentActions,
            first_action: logs[logs.length - 1],
            last_action: logs[0]
        };
    }

    async deleteOldLogs(olderThanDays: number): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        const result = await this.repo
            .createQueryBuilder()
            .delete()
            .where('created_at < :cutoffDate', { cutoffDate })
            .execute();

        return result.affected || 0;
    }
}
