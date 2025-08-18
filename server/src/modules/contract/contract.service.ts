// src/modules/contracts/contracts.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AuthService as AuthCoreService } from '@/modules/auth/auth/auth.service';
import { Contract } from '@/core/domain/contract/contract.entity';
import { ContractDraft } from '@/core/domain/contract/contract-draft.entity';
import { ContractTemplate } from '@/core/domain/contract/contract-template.entity';
import { ContractContent } from '@/core/domain/contract/contract-content.entity';
import { ContractVersion } from '@/core/domain/contract/contract-versions.entity';
import { ContractFile } from '@/core/domain/contract/contract-file.entity';
import { AuditLog } from '@/core/domain/permission/audit-log.entity';
import { User } from '@/core/domain/user/user.entity';
import { NotificationService } from '@/modules/notification/notification.service';
import { AuditLogService } from './audit-log.service';
import { Milestone } from '@/core/domain/contract/contract-milestones.entity';
import { Task } from '@/core/domain/contract/contract-taks.entity';
import { Between, LessThan, MoreThanOrEqual } from 'typeorm';
import * as dayjs from 'dayjs';
import { AuditLogPagination, AuditLogWithUser } from './audit-log.service';
import { diffJson, JsonDiffChange } from '@/common/utils/json-diff.utils';

type CreateContractDto = Partial<Contract> & { template_id?: string };

@Injectable()
export class ContractService {
    constructor(
        @InjectRepository(Contract) private readonly contractRepository: Repository<Contract>,
        @InjectRepository(ContractDraft) private readonly draftRepository: Repository<ContractDraft>,
        @InjectRepository(ContractTemplate) private readonly templateRepository: Repository<ContractTemplate>,
        @InjectRepository(ContractContent) private readonly contentRepository: Repository<ContractContent>,
        @InjectRepository(ContractVersion) private readonly versionRepository: Repository<ContractVersion>,
        @InjectRepository(ContractFile) private readonly fileRepository: Repository<ContractFile>,
        @InjectRepository(AuditLog) private readonly auditLogRepository: Repository<AuditLog>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Milestone) private readonly milestoneRepository: Repository<Milestone>,
        @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
        private readonly dataSource: DataSource,
        private readonly authCoreService: AuthCoreService,
        private readonly notificationService: NotificationService,
        private readonly auditLogService: AuditLogService,
    ) {}

    async create(dto: CreateContractDto, ctx: { userId: number }) {
        return this.createContract(dto, ctx.userId);
    }
    async softDelete(id: string, userId: number) {
        return this.deleteContract(id as any, userId);
    }

    async listContracts(query: any, userId: number) {
        const page = Number(query.page || 1);
        const limit = Number(query.limit || 10);
        const user = await this.userRepository.findOne({ where: { id: userId } as any });
        const isManager = (user?.role || '').toString().toUpperCase() === 'MANAGER';

        if (isManager) {
            const [data, total] = await this.contractRepository.findAndCount({
                where: { deleted_at: null as any },
                take: limit,
                skip: (page - 1) * limit,
                order: { id: 'DESC' as any },
            });
            return { data, total, page, limit };
        }

        const qb = this.contractRepository
            .createQueryBuilder('c')
            .leftJoin(
                'collaborators',
                'col',
                'col.contract_id = c.id AND col.user_id = :uid AND col.active = true',
                { uid: userId },
            )
            .where('c.deleted_at IS NULL')
            .andWhere('(c.is_public = true OR c.created_by = :uid OR col.user_id IS NOT NULL)', { uid: userId })
            .orderBy('c.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit };
    }

    async createContract(createDto: CreateContractDto, userId: number): Promise<Contract> {
        // Any authenticated user (manager or staff) can create contract; approval is manager-only later
        const now = new Date();
        const contract = this.contractRepository.create({
            name: createDto.name || 'Untitled',
            contract_type: createDto.contract_type || 'custom',
            category: createDto.category || 'general',
            priority: (createDto as any).priority || 'medium',
            mode: (createDto as any).mode || 'basic',
            created_by: String(userId),
            status: 'draft' as any,
            current_stage: 'draft',
            start_date: createDto.start_date,
            end_date: createDto.end_date,
        } as any);
        const saved = await this.contractRepository.save(contract);

        const savedContract = saved as unknown as Contract;
        const content = this.contentRepository.create({
            contract_id: savedContract.id,
            mode: (createDto as any).mode || 'basic',
            basic_content: null,
            editor_content: null,
            uploaded_file: null,
        } as any);
        await this.contentRepository.save(content);
        const version = this.versionRepository.create({
            contract_id: savedContract.id,
            version_number: 1,
            content_snapshot: {},
            edited_by: String(userId),
            edited_at: now,
        } as any);
        await this.versionRepository.save(version);

        await this.auditLogService.create({
            contract_id: savedContract.id,
            user_id: userId,
            action: 'CREATE_CONTRACT',
        });
        return savedContract;
    }

    async getContract(id: string, userId: number): Promise<Contract> {
        const contract = await this.contractRepository.findOne({ where: { id } });
        if (!contract) throw new NotFoundException('Hợp đồng không tồn tại');
        // Allow public contracts; private contracts require collaborator access
        if (!contract.is_public) {
            // Defer private access checks to controller guard or collab checks at controller level
        }
        return contract;
    }

    async updateContract(id: string, updateDto: any, userId: number): Promise<Contract> {
        const contract = await this.contractRepository.findOne({ where: { id } });
        if (!contract) throw new NotFoundException('Hợp đồng không tồn tại');
        Object.assign(contract, updateDto);
        return this.contractRepository.save(contract);
    }

    async deleteContract(id: number, userId: number): Promise<void> {
        const contract = await this.contractRepository.findOne({ where: { id: String(id) } as any });
        if (!contract) throw new NotFoundException('Hợp đồng không tồn tại');
        await this.contractRepository.update(String(id), { deleted_at: new Date(), deleted_by: String(userId) } as any);
        await this.auditLogService.create({ contract_id: String(id), user_id: userId, action: 'DELETE_CONTRACT' });
    }

    async exportDocx(id: string, userId: number) {
        return { fileUrl: `/exports/${id}.docx` };
    }
    async exportPdf(id: string, userId: number) {
        const filename = `contract-${id}.pdf`;
        const content = `%PDF-1.4\n% Stub PDF for contract ${id}\n`;
        const contentBase64 = Buffer.from(content).toString('base64');
        return { filename, contentBase64, contentType: 'application/pdf' } as any;
    }
    async generatePrintView(id: string, userId?: number) {
        return { html: `<html><body>Contract ${id}</body></html>` };
    }

    async createNotification(id: string, dto: any, userId: number) {
        await this.notificationService.create({
            type: dto.type,
            title: dto.title,
            message: dto.message,
            userId,
            data: id,
        });
        return { success: true };
    }
    async listNotifications(id: string) {
        return this.notificationService.getNotificationsByContract(id);
    }
    async createReminder(id: string, dto: any, userId: number) {
        return this.notificationService.createReminder({ contract_id: id, user_id: userId, ...dto });
    }
    async listReminders(id: string) {
        return this.notificationService.getRemindersByContract(id);
    }

    // ====== Support methods for cron/notifications ======
    async findUpcomingContracts(daysBefore: number): Promise<Contract[]> {
        const start = dayjs().add(daysBefore, 'day').startOf('day').toDate();
        const end = dayjs().add(daysBefore, 'day').endOf('day').toDate();
        return this.contractRepository.find({ where: { end_date: Between(start, end) } as any });
    }

    async findContractRelatedUsers(contractId: string): Promise<number[]> {
        const contract = await this.contractRepository.findOne({ where: { id: contractId } });
        if (!contract) return [];
        const possible = [contract.created_by, (contract as any).manager_id, contract.drafter_id]
            .filter(Boolean)
            .map((v) => parseInt(String(v)));
        const unique = Array.from(new Set(possible.filter((n) => Number.isFinite(n))));
        return unique;
    }

    async findUpcomingPhases(daysBefore: number): Promise<Milestone[]> {
        const start = dayjs().add(daysBefore, 'day').startOf('day').toDate();
        const end = dayjs().add(daysBefore, 'day').endOf('day').toDate();
        // milestones store date_range JSON with strings; we approximate by checking updated_at or ignore if not available
        // If your DB supports JSON queries, adjust accordingly. For now, return empty to avoid incorrect results.
        return [];
    }

    async findUpcomingTasks(daysBefore: number): Promise<Task[]> {
        const start = dayjs().add(daysBefore, 'day').startOf('day').toDate();
        const end = dayjs().add(daysBefore, 'day').endOf('day').toDate();
        return this.taskRepository.find({ where: { due_date: Between(start, end) } as any });
    }

    async findOverdueContracts(): Promise<Contract[]> {
        const now = new Date();
        return this.contractRepository.find({ where: { end_date: LessThan(now) } as any });
    }

    async updateStatus(entity: 'contract', id: string, status: any): Promise<void> {
        if (entity === 'contract') {
            await this.contractRepository.update({ id } as any, { status } as any);
        }
    }

    // ===== Versions =====
    async listVersions(contractId: string) {
        return this.versionRepository.find({
            where: { contract_id: contractId },
            order: { version_number: 'DESC' as any },
        });
    }
    async getVersion(contractId: string, versionId: string) {
        const version = await this.versionRepository.findOne({ where: { id: versionId, contract_id: contractId } });
        if (!version) throw new NotFoundException('Version not found');
        return version;
    }

    async diffVersions(
        contractId: string,
        sourceVersionId: string,
        targetVersionId: string,
    ): Promise<{ changes: JsonDiffChange[]; sourceVersion: number; targetVersion: number }> {
        const [source, target] = await Promise.all([
            this.versionRepository.findOne({ where: { id: sourceVersionId, contract_id: contractId } }),
            this.versionRepository.findOne({ where: { id: targetVersionId, contract_id: contractId } }),
        ]);
        if (!source || !target) throw new NotFoundException('One or both versions not found');
        const changes = diffJson(source.content_snapshot, target.content_snapshot);
        return { changes, sourceVersion: source.version_number as any, targetVersion: target.version_number as any };
    }

    async rollbackToVersion(contractId: string, versionId: string, userId: number): Promise<{ version_id: string }> {
        const version = await this.versionRepository.findOne({ where: { id: versionId, contract_id: contractId } });
        if (!version) throw new NotFoundException('Version not found');

        // Update current content with snapshot
        const content = await this.contentRepository.findOne({ where: { contract_id: contractId } });
        const snapshot = (version as any).content_snapshot || {};
        await this.contentRepository.update(
            { contract_id: contractId } as any,
            {
                basic_content: snapshot.basic_content || null,
                editor_content: snapshot.editor_content || null,
                uploaded_file: snapshot.uploaded_file || null,
                mode: snapshot.mode || content?.mode || 'basic',
            } as any,
        );

        // Create a new version from the snapshot to preserve history
        const latest = await this.versionRepository.findOne({
            where: { contract_id: contractId },
            order: { version_number: 'DESC' as any },
        });
        const nextVersionNumber = (latest?.version_number || 0) + 1;
        const newVersion = this.versionRepository.create({
            contract_id: contractId,
            version_number: nextVersionNumber,
            content_snapshot: snapshot,
            edited_by: String(userId),
            edited_at: new Date(),
        } as any);
        const saved = await this.versionRepository.save(newVersion);

        await this.auditLogService.create({
            contract_id: contractId,
            user_id: userId,
            action: 'ROLLBACK_VERSION',
            meta: { from_version_id: versionId, to_version_number: nextVersionNumber },
            description: `Rollback to version ${version.version_number}`,
        });
        return { version_id: saved.id } as any;
    }

    // ===== AUDIT LOG proxied for controller =====
    async getAuditLogs(
        contractId: string,
        query: {
            action?: string;
            user_id?: number;
            date_from?: string;
            date_to?: string;
            search?: string;
            page?: number;
            limit?: number;
        },
    ): Promise<{ data: AuditLogWithUser[]; pagination: AuditLogPagination }> {
        const filters: any = {
            action: query.action,
            user_id: query.user_id,
            search: query.search,
        };
        if (query.date_from) filters.date_from = new Date(query.date_from);
        if (query.date_to) filters.date_to = new Date(query.date_to);
        return this.auditLogService.findByContract(contractId, filters, {
            page: Number(query.page || 1),
            limit: Math.min(Number(query.limit || 20), 100),
        });
    }

    async getAuditSummary(contractId: string) {
        return this.auditLogService.getAuditSummary(contractId);
    }

    async submitReview(
        contractId: string,
        body: { summary: string; status: 'approved' | 'changes_requested' },
        userId: number,
    ) {
        // store review as an audit entry with meta
        await this.auditLogService.create({
            contract_id: contractId,
            user_id: userId,
            action: 'SUBMIT_REVIEW',
            meta: { summary: body.summary, status: body.status },
            description: `Review submitted with status ${body.status}`,
        });
        return { success: true } as any;
    }
}