// src/modules/contracts/services/collaborator.service.ts
import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { Collaborator } from '@/core/domain/permission/collaborator.entity';
import { CollaboratorRole } from '@/core/domain/permission/collaborator-role.enum';

@Injectable()
export class CollaboratorService {
    private readonly collabRepo: Repository<Collaborator>;

    constructor(
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        @Inject('LOGGER') private readonly logger: LoggerTypes,
    ) {
        this.collabRepo = this.db.getRepository(Collaborator);
    }

    async add(contract_id: string, user_id: number, role: CollaboratorRole): Promise<Collaborator> {
        try {
            const existing = await this.collabRepo.findOne({ where: { contract_id, user_id } });
            if (existing) {
                existing.role = role;
                existing.active = true;
                return await this.collabRepo.save(existing);
            }

            const ent = this.collabRepo.create({ contract_id, user_id, role, active: true });
            return await this.collabRepo.save(ent);
        } catch (err) {
            this.logger.APP.error('CollaboratorService.add error', err);
            throw new BadRequestException('Không thể thêm collaborator');
        }
    }

    async remove(contract_id: string, user_id: number): Promise<Collaborator> {
        const ent = await this.collabRepo.findOne({ where: { contract_id, user_id } });
        if (!ent) throw new NotFoundException('Collaborator không tồn tại');
        ent.active = false;
        return await this.collabRepo.save(ent);
    }

    async list(contract_id: string): Promise<Collaborator[]> {
        return await this.collabRepo.find({ where: { contract_id, active: true } });
    }

    async hasRole(contract_id: string, user_id: number, requiredRoles: CollaboratorRole[]): Promise<boolean> {
        const ent = await this.collabRepo.findOne({ where: { contract_id, user_id, active: true } });
        if (!ent) return false;
        return requiredRoles.includes(ent.role);
    }
}
