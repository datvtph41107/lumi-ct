import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract, ContractMode, ContractPriority } from '@/core/domain/contract/contract.entity';
import { ContractStatus } from '@/core/shared/enums/base.enums';
import { ContractDraft } from '@/core/domain/contract/contract-draft.entity';

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
        @InjectRepository(Contract)
        private readonly contractRepo: Repository<Contract>,
        @InjectRepository(ContractDraft)
        private readonly draftRepo: Repository<ContractDraft>,
    ) {}

    async listDrafts(query: ListQuery, userId: number) {
        const page = Number(query.page || 1);
        const limit = Math.min(Number(query.limit || 20), 100);
        const qb = this.contractRepo
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
                const latestStage = await this.draftRepo.findOne({
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
        const c = await this.contractRepo.findOne({ where: { id } });
        if (!c) return null;
        const latestStage = await this.draftRepo.findOne({
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
        const contract = this.contractRepo.create({
            name: payload.name || 'Untitled Contract',
            contract_code: payload.contract_code,
            contract_type: payload.contract_type || 'custom',
            category: payload.category || 'business',
            priority: payload.priority || ContractPriority.MEDIUM,
            mode: payload.mode,
            template_id: payload.template_id,
            status: ContractStatus.DRAFT,
            is_draft: true,
            auto_save_enabled: true,
            created_by: String(userId),
            updated_by: String(userId),
        });
        const saved = await this.contractRepo.save(contract);

        if (payload.initialData) {
            const draft = this.draftRepo.create({
                contract_id: saved.id,
                stage: 'content_draft',
                data: payload.initialData,
                version: 1,
                created_by: userId,
            });
            await this.draftRepo.save(draft);
        }

        return this.getDraft(saved.id);
    }

    async updateDraft(id: string, updates: any, userId: number) {
        // Update contract basic fields if present
        const contract = await this.contractRepo.findOne({ where: { id } });
        if (!contract) return null;

        if (updates?.contractData?.name) {
            contract.name = updates.contractData.name;
        }
        contract.updated_by = String(userId);
        contract.last_auto_save = new Date();
        await this.contractRepo.save(contract);

        // Save stage payload if provided
        const stage = updates?.flow?.currentStage || 'content_draft';
        const data = updates?.contractData || updates;
        if (data) {
            await this.saveStage(id, stage, { data }, userId);
        }
        return this.getDraft(id);
    }

    async deleteDraft(id: string, userId: number) {
        await this.contractRepo.update({ id }, { deleted_at: new Date(), deleted_by: String(userId) });
        return { ok: true };
    }

    async saveStage(contractId: string, stage: string, payload: { data: any }, userId: number) {
        const draft = this.draftRepo.create({
            contract_id: contractId,
            stage,
            data: payload.data,
            version: 1,
            created_by: userId,
        });
        await this.draftRepo.save(draft);
        await this.contractRepo.update({ id: contractId }, { last_auto_save: new Date(), updated_by: String(userId) });
        return { ok: true };
    }

    private toClientDraftShape(contract: Contract, latestStage?: ContractDraft) {
        return {
            id: contract.id,
            isDraft: contract.is_draft,
            contractData: {
                name: contract.name,
                contractCode: contract.contract_code,
                contractType: (contract.contract_type as any) || 'custom',
                category: (contract.category as any) || 'business',
                priority: (contract.priority as any) || 'medium',
                structure: latestStage?.data?.structure || undefined,
                notes: contract.notes,
                tags: contract.tags || [],
                content: { mode: (contract.mode as any) || 'basic', templateId: contract.template_id },
                createdAt: (contract as any).created_at || new Date().toISOString(),
                updatedAt: (contract as any).updated_at || new Date().toISOString(),
            },
            flow: {
                id: contract.id,
                currentStage: contract.current_stage || 'template_selection',
                selectedMode: (contract.mode as any) || 'basic',
                selectedTemplate: contract.template_id ? { id: contract.template_id } : null,
                stageValidations: {},
                canProceedToNext: true,
                autoSaveEnabled: contract.auto_save_enabled,
                lastAutoSave: contract.last_auto_save,
            },
            createdBy: contract.created_by,
        };
    }
}
