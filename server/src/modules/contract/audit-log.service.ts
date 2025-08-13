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
}
