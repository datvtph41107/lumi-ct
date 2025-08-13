// src/modules/contracts/contracts.service.ts
import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Contract, ContractStatus } from '@/core/domain/contract/contract.entity';
import { ContractVersion } from '@/core/domain/contract/contract-versions.entity';
import { ContractTemplate } from '@/core/domain/contract/contract-template.entity';
import { ContractDraft } from '@/core/domain/contract/contract-draft.entity';
import { ContractFile } from '@/core/domain/contract/contract-file.entity';
import { Milestone, MilestoneStatus } from '@/core/domain/contract/contract-milestones.entity';
import { Task, TaskStatus } from '@/core/domain/contract/contract-taks.entity';
import { Collaborator } from '@/core/domain/permission/collaborator.entity';
import { AuditLog } from '@/core/domain/permission/audit-log.entity';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { CreateContractDto } from '@/core/dto/contract/create-contract.dto';
import { StageSaveDto } from '@/core/dto/contract/stage-save.dto';
import { CreateVersionDto } from '@/core/dto/contract/create-version.dto';
import { CreateMilestoneDto } from '@/core/dto/contract/create-milestone.dto';
import { CreateTaskDto } from '@/core/dto/contract/create-task.dto';
import { CreateCollaboratorDto } from '@/core/dto/contract/collaborator.dto';
import { ContractQueryDto } from '@/core/dto/contract/contract-query.dto';
import { CreateTemplateDto, UpdateTemplateDto, TemplateQueryDto } from '@/core/dto/contract/template.dto';
import { UploadFileDto, UpdateFileDto } from '@/core/dto/contract/file.dto';
import { CreateNotificationDto, CreateReminderDto } from '@/core/dto/contract/notification.dto';
import { AuditLogService } from './audit-log.service';
import { CollaboratorService } from './collaborator.service';
import { CollaboratorRole } from '@/core/domain/permission/collaborator-role.enum';

@Injectable()
export class ContractService {
    private contractRepo: Repository<Contract>;
    private versionRepo: Repository<ContractVersion>;
    private templateRepo: Repository<ContractTemplate>;
    private draftRepo: Repository<ContractDraft>;
    private milestoneRepo: Repository<Milestone>;
    private taskRepo: Repository<Task>;
    private collabRepo: Repository<Collaborator>;
    private auditRepo: Repository<AuditLog>;
    private fileRepo: Repository<ContractFile>;

    constructor(
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        private readonly auditService: AuditLogService,
        private readonly collabService: CollaboratorService,
    ) {
        this.contractRepo = this.db.getRepository(Contract);
        this.versionRepo = this.db.getRepository(ContractVersion);
        this.templateRepo = this.db.getRepository(ContractTemplate);
        this.draftRepo = this.db.getRepository(ContractDraft);
        this.milestoneRepo = this.db.getRepository(Milestone);
        this.taskRepo = this.db.getRepository(Task);
        this.collabRepo = this.db.getRepository(Collaborator);
        this.auditRepo = this.db.getRepository(AuditLog);
        this.fileRepo = this.db.getRepository(ContractFile);
    }

    // ===== CONTRACT CRUD OPERATIONS =====
    async create(body: CreateContractDto, options: { userId: number }) {
        const qr = this.db.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();
        try {
            const ent = this.contractRepo.create({
                name: body.name,
                contract_code: body.contract_code,
                contract_type: body.contract_type,
                category: body.category,
                priority: body.priority as any,
                mode: body.mode as any,
                template_id: body.template_id,
                created_by: options.userId.toString(),
                status: ContractStatus.DRAFT,
                current_stage: 'template_selection',
                version: 1,
                auto_save_enabled: true,
                is_draft: true,
            });
            const saved = await qr.manager.save(ent);

            // add owner collaborator
            await qr.manager.save(
                this.collabRepo.create({ contract_id: saved.id, user_id: options.userId, role: CollaboratorRole.OWNER, active: true }),
            );

            // initial stage data if template provided
            if (body.template_id) {
                await qr.manager.save(
                    this.draftRepo.create({
                        contract_id: saved.id,
                        stage: 'template_selection',
                        data: { template_id: body.template_id },
                        version: saved.version,
                        created_by: options.userId,
                    }),
                );
            }

            await qr.commitTransaction();
            // audit
            await this.auditService.create({
                contract_id: saved.id,
                user_id: options.userId,
                action: 'CREATE_CONTRACT',
                meta: { body },
            });
            return { id: saved.id, version: saved.version, status: saved.status, current_stage: saved.current_stage };
        } catch (err) {
            await qr.rollbackTransaction();
            this.logger.APP.error('create contract error', err);
            throw err;
        } finally {
            await qr.release();
        }
    }

    async getContract(contractId: string) {
        const contract = await this.contractRepo.findOne({ where: { id: contractId } });
        if (!contract) throw new NotFoundException('Contract not found');

        // latest stage data
        const stages = await this.draftRepo
            .createQueryBuilder('s')
            .where('s.contract_id = :cid', { cid: contractId })
            .orderBy('s.created_at', 'DESC')
            .getMany();

        const latestByStage = stages.reduce(
            (acc, s) => {
                if (!acc[s.stage]) acc[s.stage] = s;
                return acc;
            },
            {} as Record<string, any>,
        );

        const collaborators = await this.collabRepo.find({ where: { contract_id: contractId, active: true } });
        const versions = await this.versionRepo.find({
            where: { contract_id: contractId },
            order: { edited_at: 'DESC' },
            take: 20,
        });

        return { ...contract, stage_data: latestByStage, collaborators, versions } as any;
    }

    async updateContract(contractId: string, body: Partial<CreateContractDto>, userId: number) {
        const contract = await this.contractRepo.findOne({ where: { id: contractId } });
        if (!contract) throw new NotFoundException('Contract not found');

        // permission check: user must be collaborator with editor rights or owner
        const allowed = await this.collabService.hasRole(contractId, userId, [CollaboratorRole.OWNER, CollaboratorRole.EDITOR]);
        if (!allowed) throw new ForbiddenException('No permission to update contract');

        Object.assign(contract, { ...body, updated_by: userId.toString() });
        const saved = await this.contractRepo.save(contract);

        await this.auditService.create({
            contract_id: contractId,
            user_id: userId,
            action: 'UPDATE_CONTRACT',
            meta: { body },
        });
        return saved;
    }

    // ===== CONTRACT LISTING & SEARCH =====
    async listContracts(query: ContractQueryDto, userId: number) {
        const queryBuilder = this.contractRepo.createQueryBuilder('contract');

        // Apply filters
        if ((query as any).search) {
            queryBuilder.andWhere(
                '(contract.name ILIKE :search OR contract.contract_code ILIKE :search OR contract.notes ILIKE :search)',
                { search: `%${(query as any).search}%` },
            );
        }

        if ((query as any).status) {
            queryBuilder.andWhere('contract.status = :status', { status: (query as any).status });
        }

        if ((query as any).priority) {
            queryBuilder.andWhere('contract.priority = :priority', { priority: (query as any).priority });
        }

        if ((query as any).category) {
            queryBuilder.andWhere('contract.category = :category', { category: (query as any).category });
        }

        if ((query as any).contract_type) {
            queryBuilder.andWhere('contract.contract_type = :contract_type', { contract_type: (query as any).contract_type });
        }

        if ((query as any).drafter_id) {
            queryBuilder.andWhere('contract.drafter_id = :drafter_id', { drafter_id: (query as any).drafter_id });
        }

        if ((query as any).manager_id) {
            queryBuilder.andWhere('contract.manager_id = :manager_id', { manager_id: (query as any).manager_id });
        }

        if ((query as any).created_from) {
            queryBuilder.andWhere('contract.created_at >= :created_from', { created_from: (query as any).created_from });
        }

        if ((query as any).created_to) {
            queryBuilder.andWhere('contract.created_at <= :created_to', { created_to: (query as any).created_to });
        }

        if ((query as any).effective_from) {
            // skipping since no effective_date field on entity presently
        }

        const page = (query as any).page || 1;
        const limit = (query as any).limit || 10;

        queryBuilder.orderBy('contract.created_at', ((query as any).sort_order || 'desc').toUpperCase() as 'ASC' | 'DESC');
        queryBuilder.skip((page - 1) * limit).take(limit);

        const [contracts, total] = await queryBuilder.getManyAndCount();

        return {
            data: contracts,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
            },
        };
    }

    // ===== STAGE MANAGEMENT =====
    async autosaveStage(contractId: string, dto: StageSaveDto, userId: number) {
        const contract = await this.contractRepo.findOne({ where: { id: contractId } });
        if (!contract) throw new NotFoundException('Contract not found');

        if (!contract.auto_save_enabled && dto.autoSave) {
            throw new ForbiddenException('Autosave disabled for this contract');
        }

        const entry = this.draftRepo.create({
            contract_id: contractId,
            stage: (dto.data as any)?.stage ?? 'content_draft',
            data: dto.data,
            version: contract.version,
            created_by: userId,
        });

        const saved = await this.draftRepo.save(entry);
        await this.contractRepo.update({ id: contractId }, { last_auto_save: new Date() as any });

        await this.auditService.create({
            contract_id: contractId,
            user_id: userId,
            action: 'AUTOSAVE_STAGE',
            meta: { stage: entry.stage },
        });
        return { stageDataId: saved.id, savedAt: saved.created_at, version: contract.version } as any;
    }

    async saveStage(contractId: string, stage: string, dto: StageSaveDto, userId: number) {
        const contract = await this.contractRepo.findOne({ where: { id: contractId } });
        if (!contract) throw new NotFoundException('Contract not found');

        const qr = this.db.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();
        try {
            const entry = this.draftRepo.create({
                contract_id: contractId,
                stage,
                data: dto.data,
                version: contract.version,
                created_by: userId,
            });
            const savedEntry = await qr.manager.save(entry);

            // create version snapshot for audit (optional)
            const snapshot = this.versionRepo.create({
                contract_id: contractId,
                version_number: contract.version,
                content_snapshot: { [stage]: dto.data },
                edited_by: userId.toString(),
                edited_at: new Date(),
            });
            await qr.manager.save(snapshot);

            await qr.commitTransaction();
            await this.auditService.create({
                contract_id: contractId,
                user_id: userId,
                action: 'SAVE_STAGE',
                meta: { stage },
            });
            return { ok: true, savedAt: savedEntry.created_at } as any;
        } catch (err) {
            await qr.rollbackTransaction();
            this.logger.APP.error('saveStage error', err);
            throw err;
        } finally {
            await qr.release();
        }
    }

    async transitionStage(contractId: string, from: string, to: string, userId: number) {
        const contract = await this.contractRepo.findOne({ where: { id: contractId } });
        if (!contract) throw new NotFoundException('Contract not found');

        if (contract.current_stage !== from) throw new BadRequestException('Stage mismatch');

        const validation = await this.runStageValidation(contractId, from);
        if (!(validation as any).ok) throw new BadRequestException({ message: 'Validation failed', details: (validation as any).errors });

        contract.current_stage = to as any;
        await this.contractRepo.save(contract);
        await this.auditService.create({
            contract_id: contractId,
            user_id: userId,
            action: 'TRANSITION_STAGE',
            meta: { from, to },
        });
        return { ok: true, current_stage: to } as any;
    }

    // ===== VERSION MANAGEMENT =====
    async createVersion(contractId: string, dto: CreateVersionDto, userId: number) {
        const qr = this.db.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const contract = await qr.manager.findOne(Contract, { where: { id: contractId } });
            if (!contract) throw new NotFoundException('Contract not found');

            // collect latest stage data
            const stageRows = await this.draftRepo
                .createQueryBuilder('s')
                .where('s.contract_id = :cid', { cid: contractId })
                .orderBy('s.created_at', 'DESC')
                .getMany();
            const latestByStage = stageRows.reduce(
                (acc, row) => {
                    if (!acc[row.stage]) acc[row.stage] = row.data;
                    return acc;
                },
                {} as Record<string, any>,
            );

            // bump version
            const newVersionNumber = contract.version + 1;
            contract.version = newVersionNumber;
            await qr.manager.save(contract);

            // create ContractVersion
            const versionEnt = this.versionRepo.create({
                contract_id: contractId,
                version_number: newVersionNumber,
                content_snapshot: latestByStage,
                edited_by: userId.toString(),
                edited_at: new Date(),
                change_summary: (dto as any).note,
            } as any);
            const savedVersion = await qr.manager.save(versionEnt as any);

            // if publish requested -> validate then set current_version_id & status active
            if ((dto as any).publish) {
                const validation = await this.validateBeforePublish(latestByStage);
                if (!(validation as any).ok) {
                    throw new BadRequestException({ message: 'Validation failed', details: (validation as any).errors });
                }
                contract.current_version_id = (savedVersion as any).id;
                contract.status = ContractStatus.ACTIVE as any;
                await qr.manager.save(contract);
            }

            await qr.commitTransaction();
            await this.auditService.create({
                contract_id: contractId,
                user_id: userId,
                action: 'CREATE_VERSION',
                meta: { version: newVersionNumber },
            });
            return { versionId: (savedVersion as any).id, version: newVersionNumber, published: !!(dto as any).publish } as any;
        } catch (err) {
            await qr.rollbackTransaction();
            this.logger.APP.error('createVersion error', err);
            throw err;
        } finally {
            await qr.release();
        }
    }

    async publishVersion(contractId: string, versionId: string, userId: number) {
        const qr = this.db.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const version = await qr.manager.findOne(ContractVersion, {
                where: { id: versionId, contract_id: contractId },
            });
            if (!version) throw new NotFoundException('Version not found');

            const validation = await this.validateBeforePublish((version as any).content_snapshot);
            if (!(validation as any).ok)
                throw new BadRequestException({ message: 'Validation failed', details: (validation as any).errors });

            const contract = await qr.manager.findOne(Contract, { where: { id: contractId } });
            if (!contract) throw new NotFoundException('Contract not found');
            contract.current_version_id = versionId;
            contract.status = ContractStatus.ACTIVE as any;
            await qr.manager.save(contract);

            await qr.commitTransaction();
            await this.auditService.create({
                contract_id: contractId,
                user_id: userId,
                action: 'PUBLISH_VERSION',
                meta: { versionId },
            });
            return { ok: true };
        } catch (err) {
            await qr.rollbackTransaction();
            this.logger.APP.error('publishVersion error', err);
            throw err;
        } finally {
            await qr.release();
        }
    }

    // ===== TEMPLATE MANAGEMENT =====
    async listTemplates(query: TemplateQueryDto) {
        const queryBuilder = this.templateRepo.createQueryBuilder('template');
        if ((query as any).search) {
            queryBuilder.andWhere('template.name ILIKE :search OR template.description ILIKE :search', {
                search: `%${(query as any).search}%`,
            });
        }
        if ((query as any).type) {
            queryBuilder.andWhere('template.type = :type', { type: (query as any).type });
        }
        if ((query as any).category) {
            queryBuilder.andWhere('template.category = :category', { category: (query as any).category });
        }
        if ((query as any).is_active !== undefined) {
            queryBuilder.andWhere('template.is_active = :is_active', { is_active: (query as any).is_active });
        }
        // optional mode filter
        if ((query as any).mode) {
            queryBuilder.andWhere('template.mode = :mode', { mode: (query as any).mode });
        }
        queryBuilder.orderBy('template.created_at', 'DESC');
        return queryBuilder.getMany();
    }

    async getTemplate(tid: string) {
        const template = await this.templateRepo.findOne({ where: { id: tid } });
        if (!template) {
            throw new NotFoundException('Template not found');
        }
        return template;
    }

    async createTemplate(dto: CreateTemplateDto, userId: number) {
        const template = this.templateRepo.create({
            ...dto,
            created_by: userId.toString(),
            updated_by: userId.toString(),
        });
        return this.templateRepo.save(template);
    }

    async updateTemplate(tid: string, dto: UpdateTemplateDto, userId: number) {
        const template = await this.getTemplate(tid);
        Object.assign(template, dto, { updated_by: userId.toString() });
        return this.templateRepo.save(template);
    }

    async deleteTemplate(tid: string, userId: number) {
        const template = await this.getTemplate(tid);
        template.is_active = false;
        template.updated_by = userId.toString();
        return this.templateRepo.save(template);
    }

    // ===== MILESTONE & TASK MANAGEMENT =====
    async createMilestone(contractId: string, dto: CreateMilestoneDto, userId: number) {
        const contract = await this.contractRepo.findOne({ where: { id: contractId } });
        if (!contract) throw new NotFoundException('Contract not found');

        const ent = this.milestoneRepo.create({
            contract_id: contractId,
            name: (dto as any).name,
            description: (dto as any).description,
            assignee_id: userId.toString(),
            assignee_name: 'Self',
            status: MilestoneStatus.PENDING,
            priority: (dto as any).priority || 'medium',
        } as any);
        const saved = await this.milestoneRepo.save(ent);
        await this.auditService.create({
            contract_id: contractId,
            user_id: userId,
            action: 'CREATE_MILESTONE',
            meta: { id: (saved as any).id },
        });
        return saved;
    }

    async createTask(mid: string, dto: CreateTaskDto, userId: number) {
        const milestone = await this.milestoneRepo.findOne({ where: { id: mid } });
        if (!milestone) throw new NotFoundException('Milestone not found');

        const ent = this.taskRepo.create({
            milestone_id: mid,
            name: (dto as any).name,
            description: (dto as any).description,
            assignee_id: userId.toString(),
            assignee_name: 'Self',
            status: TaskStatus.PENDING,
            priority: (dto as any).priority || 'medium',
        } as any);
        const saved = await this.taskRepo.save(ent);
        await this.auditService.create({
            contract_id: milestone.contract_id,
            user_id: userId,
            action: 'CREATE_TASK',
            meta: { id: (saved as any).id },
        });
        return saved;
    }

    // ===== FILE MANAGEMENT =====
    async uploadFile(contractId: string, dto: UploadFileDto, userId: number) {
        const file = this.fileRepo.create({
            ...(dto as any),
            contract_id: contractId,
        } as any);
        return this.fileRepo.save(file);
    }

    async listFiles(contractId: string) {
        return this.fileRepo.find({
            where: { contract_id: contractId } as any,
            order: { created_at: 'DESC' } as any,
        });
    }

    async deleteFile(fid: string, userId: number) {
        const file = await this.fileRepo.findOne({ where: { id: fid } as any });
        if (!file) throw new NotFoundException('File not found');
        await this.fileRepo.remove(file);
        return { ok: true } as any;
    }

    // ===== COLLABORATOR MANAGEMENT =====
    async addCollaborator(contractId: string, dto: CreateCollaboratorDto, userId: number) {
        return this.collabService.add(contractId, (dto as any).user_id, (dto as any).role as any);
    }

    async listCollaborators(contractId: string) {
        return this.collabService.list(contractId);
    }

    // ===== EXPORT & PRINT =====
    async exportPdf(contractId: string) {
        const contract = await this.contractRepo.findOne({ where: { id: contractId } });
        if (!contract) {
            throw new NotFoundException('Contract not found');
        }

        // TODO: Implement PDF generation logic
        return {
            success: true,
            message: 'PDF export initiated',
            download_url: `/api/contracts/${contractId}/download/pdf`,
        };
    }

    async exportDocx(contractId: string) {
        const contract = await this.contractRepo.findOne({ where: { id: contractId } });
        if (!contract) {
            throw new NotFoundException('Contract not found');
        }

        // TODO: Implement DOCX generation logic
        return {
            success: true,
            message: 'DOCX export initiated',
            download_url: `/api/contracts/${contractId}/download/docx`,
        };
    }

    async generatePrintView(contractId: string) {
        const contract = await this.contractRepo.findOne({ where: { id: contractId } });
        if (!contract) {
            throw new NotFoundException('Contract not found');
        }

        // TODO: Generate print-friendly HTML view
        return {
            success: true,
            print_url: `/api/contracts/${contractId}/print/view`,
        };
    }

    // ===== ANALYTICS & DASHBOARD =====
    async getContractAnalytics(id: string) {
        const contract = await this.contractRepo.findOne({ where: { id } });
        if (!contract) throw new NotFoundException('Contract not found');
        return {
            id: contract.id,
            status: contract.status,
        } as any;
    }

    async getDashboardStats(userId: number) {
        const total = await this.contractRepo.count();
        const drafts = await this.contractRepo.count({ where: { status: ContractStatus.DRAFT } as any });
        const active = await this.contractRepo.count({ where: { status: ContractStatus.ACTIVE } as any });
        return { total, drafts, active } as any;
    }

    // ===== NOTIFICATION & REMINDERS =====
    async createNotification(contractId: string, dto: CreateNotificationDto, userId: number) {
        // TODO: Implement notification creation logic
        return {
            success: true,
            message: 'Notification created successfully',
            notification_id: 'temp-id',
        };
    }

    async listNotifications(contractId: string) {
        // TODO: Implement notification listing logic
        return [];
    }

    async createReminder(contractId: string, dto: CreateReminderDto, userId: number) {
        // TODO: Implement reminder creation logic
        return {
            success: true,
            message: 'Reminder created successfully',
            reminder_id: 'temp-id',
        };
    }

    async listReminders(contractId: string) {
        // TODO: Implement reminder listing logic
        return [];
    }

    // ===== AUDIT & UTILITIES =====
    async getAuditLogs(contractId: string) {
        return this.auditService.findByContract(contractId, 200);
    }

    async softDelete(contractId: string, userId: number) {
        const contract = await this.contractRepo.findOne({ where: { id: contractId } });
        if (!contract) throw new NotFoundException('Contract not found');
        contract.deleted_at = new Date();
        await this.contractRepo.save(contract);
        await this.auditService.create({ contract_id: contractId, user_id: userId, action: 'SOFT_DELETE' });
        return { message: 'Deleted (soft)' };
    }

    // ===== DRAFT & STAGE MANAGEMENT =====
    async getStageData(contractId: string, stage: string) {
        return this.draftRepo.findOne({ where: { contract_id: contractId, stage }, order: { created_at: 'DESC' } as any });
    }

    async generatePreview(contractId: string) {
        // TODO: Implement preview logic (can reuse generatePrintView or return summary)
        return this.generatePrintView(contractId as any);
    }

    // ===== VERSIONING =====
    async listVersions(contractId: string) {
        return this.versionRepo.find({ where: { contract_id: contractId }, order: { edited_at: 'DESC' } as any });
    }

    async getVersion(contractId: string, versionId: string) {
        return this.versionRepo.findOne({ where: { id: versionId, contract_id: contractId } });
    }

    async rollbackVersion(contractId: string, versionId: string, userId: number) {
        // TODO: Implement rollback logic (set contract content to version snapshot)
        return { ok: false, message: 'Rollback not implemented yet' };
    }

    // ===== MILESTONE & TASK MANAGEMENT =====
    async listMilestones(contractId: string) {
        return this.milestoneRepo.find({ where: { contract_id: contractId } as any });
    }

    async updateMilestone(mid: string, dto: Partial<CreateMilestoneDto>, userId: number) {
        const milestone = await this.milestoneRepo.findOne({ where: { id: mid } });
        if (!milestone) throw new NotFoundException('Milestone not found');
        Object.assign(milestone, dto);
        return this.milestoneRepo.save(milestone);
    }

    async deleteMilestone(mid: string, userId: number) {
        const milestone = await this.milestoneRepo.findOne({ where: { id: mid } });
        if (!milestone) throw new NotFoundException('Milestone not found');
        await this.milestoneRepo.remove(milestone);
        return { ok: true } as any;
    }

    async listTasks(mid: string) {
        return this.taskRepo.find({ where: { milestone_id: mid } as any });
    }

    async updateTask(tid: string, dto: Partial<CreateTaskDto>, userId: number) {
        const task = await this.taskRepo.findOne({ where: { id: tid } });
        if (!task) throw new NotFoundException('Task not found');
        Object.assign(task, dto);
        return this.taskRepo.save(task);
    }

    async deleteTask(tid: string, userId: number) {
        const task = await this.taskRepo.findOne({ where: { id: tid } });
        if (!task) throw new NotFoundException('Task not found');
        await this.taskRepo.remove(task);
        return { ok: true } as any;
    }

    // ===== COLLABORATOR MANAGEMENT =====
    async updateCollaborator(cid: string, dto: Partial<CreateCollaboratorDto>, userId: number) {
        // Service does not support update by collab id; emulate by removing and adding
        return this.collabService.add(cid, (dto as any).user_id, (dto as any).role as any);
    }

    async removeCollaborator(cid: string, userId: number) {
        // Service expects contractId and userId
        return this.collabService.remove(cid as any, userId);
    }

    // ===== APPROVAL WORKFLOW =====
    async approveContract(contractId: string, userId: number) {
        // TODO: Implement approval logic
        return { ok: false, message: 'Approval not implemented yet' };
    }

    async rejectContract(contractId: string, reason: string, userId: number) {
        // TODO: Implement reject logic
        return { ok: false, message: 'Reject not implemented yet' };
    }

    async requestChanges(contractId: string, changes: string[], userId: number) {
        // TODO: Implement request changes logic
        return { ok: false, message: 'Request changes not implemented yet' };
    }

    // ===== HELPER METHODS =====
    private async runStageValidation(contractId: string, stage: string) {
        // implement per-stage validation rules (check stage-specific required fields)
        return { ok: true, errors: [] as any[] };
    }

    private async validateBeforePublish(snapshot: Record<string, any>) {
        return { ok: true, errors: [] as any[] };
    }

    private groupFilesByType(files: ContractFile[]) {
        const grouped: Record<string, number> = {};
        files.forEach(() => {
            const type = 'generic';
            grouped[type] = (grouped[type] || 0) + 1;
        });
        return grouped;
    }

    private groupContractsByStatus(contracts: Contract[]) {
        const grouped = {};
        contracts.forEach((contract) => {
            const status = contract.status;
            grouped[status] = (grouped[status] || 0) + 1;
        });
        return grouped;
    }

    private groupContractsByPriority(contracts: Contract[]) {
        const grouped = {};
        contracts.forEach((contract) => {
            const priority = contract.priority;
            grouped[priority] = (grouped[priority] || 0) + 1;
        });
        return grouped;
    }

    private getExpiringContracts(contracts: Contract[]) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        return contracts.filter((contract) => {
            return false;
        });
    }

    private async getUpcomingMilestones(userId: number) {
        return [] as any;
    }
}
