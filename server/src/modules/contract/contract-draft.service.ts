import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Contract, ContractMode, ContractPriority, ContractStatus } from '@/core/domain/contract/contract.entity';
import { ContractDraft } from '@/core/domain/contract/contract-draft.entity';
import { LoggerTypes } from '@/core/shared/logger/logger.types';

interface ListQuery {
    search?: string;
    mode?: ContractMode;
    status?: string;
    page?: number;
    limit?: number;
}

@Injectable()
export class ContractDraftService {
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        @Inject('DATA_SOURCE') private readonly db: DataSource,
    ) {}

    async listDrafts(query: ListQuery, userId: number) {
        const contractRepo = this.db.getRepository(Contract);
        const draftRepo = this.db.getRepository(ContractDraft);

        const page = Number(query.page || 1);
        const limit = Math.min(Number(query.limit || 20), 100);
        const qb = contractRepo
            .createQueryBuilder('c')
            .where('c.deleted_at IS NULL')
            .andWhere('c.status = :status', { status: ContractStatus.DRAFT })
            .andWhere('c.is_draft = :isDraft', { isDraft: true })
            .orderBy('c.updated_by', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (query.search) {
            qb.andWhere('(LOWER(c.name) LIKE :kw OR LOWER(c.contract_code) LIKE :kw)', {
                kw: `%${query.search.toLowerCase()}%`,
            });
        }
        if (query.mode) {
            qb.andWhere('c.mode = :mode', { mode: query.mode });
        }

        // limit to creator or collaborators in the future; for now, show creator only
        qb.andWhere('(c.created_by = :uid OR c.updated_by = :uid)', { uid: String(userId) });

        const [rows, total] = await qb.getManyAndCount();

        const data = await Promise.all(
            rows.map(async (c) => {
                const latestStage = await draftRepo.findOne({
                    where: { contract_id: c.id },
                    order: { created_at: 'DESC' as any },
                });

                return this.toClientDraftShape(c, latestStage || undefined);
            }),
        );

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

    async getDraft(id: string) {
        const contractRepo = this.db.getRepository(Contract);
        const draftRepo = this.db.getRepository(ContractDraft);

        const c = await contractRepo.findOne({ where: { id } });
        if (!c) return null;
        const latestStage = await draftRepo.findOne({
            where: { contract_id: id },
            order: { created_at: 'DESC' as any },
        });
        return this.toClientDraftShape(c, latestStage || undefined);
    }

    async createDraft(
        payload: {
            name: string;
            contract_code?: string;
            contract_type?: string;
            category?: string;
            priority?: ContractPriority;
            mode: ContractMode;
            template_id?: string;
            initialData?: any;
        },
        userId: number,
    ) {
        const contractRepo = this.db.getRepository(Contract);
        const draftRepo = this.db.getRepository(ContractDraft);

        const contract = contractRepo.create({
            name: payload.name || 'Untitled Contract',
            contract_code: payload.contract_code,
            contract_type: payload.contract_type || 'custom',
            category: payload.category || 'business',
            priority: payload.priority || ContractPriority.MEDIUM,
            mode: payload.mode,
            template_id: payload.template_id,
            status: ContractStatus.DRAFT,
            is_draft: true,
            created_by: String(userId),
            updated_by: String(userId),
        });

        const savedContract = await contractRepo.save(contract);

        const draft = draftRepo.create({
            contract_id: savedContract.id,
            stage: 'draft',
            data: payload.initialData || {},
            version: 1,
            created_by: userId,
        });

        await draftRepo.save(draft);

        return this.toClientDraftShape(savedContract, draft);
    }

    async updateDraft(
        id: string,
        payload: {
            name?: string;
            contract_code?: string;
            contract_type?: string;
            category?: string;
            priority?: ContractPriority;
            mode?: ContractMode;
            template_id?: string;
            data?: any;
        },
        userId: number,
    ) {
        const contractRepo = this.db.getRepository(Contract);
        const draftRepo = this.db.getRepository(ContractDraft);

        const contract = await contractRepo.findOne({ where: { id } });
        if (!contract) {
            throw new Error('Contract not found');
        }

        // Update contract
        Object.assign(contract, payload, { updated_by: String(userId) });
        const updatedContract = await contractRepo.save(contract);

        // Create new draft version
        const latestDraft = await draftRepo.findOne({
            where: { contract_id: id },
            order: { version: 'DESC' as any },
        });

        const newVersion = (latestDraft?.version || 0) + 1;
        const draft = draftRepo.create({
            contract_id: id,
            stage: 'draft',
            data: payload.data || latestDraft?.data || {},
            version: newVersion,
            created_by: userId,
        });

        await draftRepo.save(draft);

        return this.toClientDraftShape(updatedContract, draft);
    }

    async deleteDraft(id: string, userId: number) {
        const contractRepo = this.db.getRepository(Contract);
        const draftRepo = this.db.getRepository(ContractDraft);

        const contract = await contractRepo.findOne({ where: { id } });
        if (!contract) {
            throw new Error('Contract not found');
        }

        // Soft delete contract
        contract.deleted_at = new Date();
        contract.deleted_by = String(userId);
        await contractRepo.save(contract);

        // Delete all drafts
        await draftRepo.delete({ contract_id: id });

        return { success: true };
    }

    private toClientDraftShape(contract: Contract, draft?: ContractDraft) {
        return {
            id: contract.id,
            name: contract.name,
            contract_code: contract.contract_code,
            contract_type: contract.contract_type,
            category: contract.category,
            priority: contract.priority,
            mode: contract.mode,
            template_id: contract.template_id,
            status: contract.status,
            is_draft: contract.is_draft,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: contract.created_by,
            updated_by: contract.updated_by,
            current_stage: draft?.stage || 'draft',
            current_data: draft?.data || {},
            current_version: draft?.version || 1,
        };
    }
}
