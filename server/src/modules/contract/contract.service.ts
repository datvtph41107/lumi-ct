// src/modules/contracts/contracts.service.ts
import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Contract } from '@/core/domain/contract/contract.entity';
import { ContractVersion } from '@/core/domain/contract/contract-versions.entity';
import { ContractTemplate } from '@/core/domain/contract/contract-template.entity';
import { ContractDraft } from '@/core/domain/contract/contract-draft.entity';
import { ContractFile } from '@/core/domain/contract/contract-file.entity';
import { Milestone } from '@/core/domain/contract/contract-milestones.entity';
import { Task } from '@/core/domain/contract/contract-taks.entity';
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

@Injectable()
export class ContractService {
    private contractRepo = this.db.getRepository(Contract);
    private versionRepo = this.db.getRepository(ContractVersion);
    private templateRepo = this.db.getRepository(ContractTemplate);
    private draftRepo = this.db.getRepository(ContractDraft);
    private milestoneRepo = this.db.getRepository(Milestone);
    private taskRepo = this.db.getRepository(Task);
    private collabRepo = this.db.getRepository(Collaborator);
    private auditRepo = this.db.getRepository(AuditLog);
    private fileRepo = this.db.getRepository(ContractFile);

    constructor(
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        private readonly auditService: AuditLogService,
        private readonly collabService: CollaboratorService,
    ) {}

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
                priority: body.priority,
                mode: body.mode,
                template_id: body.template_id,
                created_by: options.userId,
                status: 'draft',
                current_stage: 'template_selection',
                version: 1,
                auto_save_enabled: true,
                is_draft: true,
            });
            const saved = await qr.manager.save(ent);

            // add owner collaborator
            await qr.manager.save(
                this.collabRepo.create({ contract_id: saved.id, user_id: options.userId, role: 'owner', active: true }),
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
        const contract = await this.contractRepo.findOneBy({ id: contractId });
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
            order: { created_at: 'DESC' },
            take: 20,
        });

        return { ...contract, stage_data: latestByStage, collaborators, versions };
    }

    async updateContract(contractId: string, body: Partial<CreateContractDto>, userId: number) {
        const contract = await this.contractRepo.findOneBy({ id: contractId });
        if (!contract) throw new NotFoundException('Contract not found');

        // permission check: user must be collaborator with editor rights or owner
        const allowed = await this.collabService.hasRole(contractId, userId, ['owner', 'editor']);
        if (!allowed) throw new ForbiddenException('No permission to update contract');

        Object.assign(contract, { ...body, updated_at: new Date() });
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
        if (query.search) {
            queryBuilder.andWhere(
                '(contract.name ILIKE :search OR contract.contract_code ILIKE :search OR contract.notes ILIKE :search)',
                { search: `%${query.search}%` },
            );
        }

        if (query.status) {
            queryBuilder.andWhere('contract.status = :status', { status: query.status });
        }

        if (query.priority) {
            queryBuilder.andWhere('contract.priority = :priority', { priority: query.priority });
        }

        if (query.category) {
            queryBuilder.andWhere('contract.category = :category', { category: query.category });
        }

        if (query.contract_type) {
            queryBuilder.andWhere('contract.contract_type = :contract_type', { contract_type: query.contract_type });
        }

        if (query.drafter_id) {
            queryBuilder.andWhere('contract.drafter_id = :drafter_id', { drafter_id: query.drafter_id });
        }

        if (query.manager_id) {
            queryBuilder.andWhere('contract.manager_id = :manager_id', { manager_id: query.manager_id });
        }

        if (query.created_from) {
            queryBuilder.andWhere('contract.created_at >= :created_from', { created_from: query.created_from });
        }

        if (query.created_to) {
            queryBuilder.andWhere('contract.created_at <= :created_to', { created_to: query.created_to });
        }

        if (query.effective_from) {
            queryBuilder.andWhere('contract.effective_date >= :effective_from', {
                effective_from: query.effective_from,
            });
        }

        if (query.effective_to) {
            queryBuilder.andWhere('contract.effective_date <= :effective_to', { effective_to: query.effective_to });
        }

        // Apply sorting
        queryBuilder.orderBy(`contract.${query.sort_by}`, query.sort_order.toUpperCase() as 'ASC' | 'DESC');

        // Apply pagination
        const page = query.page || 1;
        const limit = query.limit || 10;
        const offset = (page - 1) * limit;

        queryBuilder.skip(offset).take(limit);

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
        const contract = await this.contractRepo.findOneBy({ id: contractId });
        if (!contract) throw new NotFoundException('Contract not found');

        if (!contract.auto_save_enabled && dto.autoSave) {
            throw new ForbiddenException('Autosave disabled for this contract');
        }

        const entry = this.draftRepo.create({
            contract_id: contractId,
            stage: dto.data?.stage ?? 'content_draft',
            data: dto.data,
            version: contract.version,
            created_by: userId,
        });

        const saved = await this.draftRepo.save(entry);
        await this.contractRepo.update({ id: contractId }, { last_auto_save: new Date() });

        await this.auditService.create({
            contract_id: contractId,
            user_id: userId,
            action: 'AUTOSAVE_STAGE',
            meta: { stage: entry.stage },
        });
        return { stageDataId: saved.id, savedAt: saved.created_at, version: contract.version };
    }

    async saveStage(contractId: string, stage: string, dto: StageSaveDto, userId: number) {
        const contract = await this.contractRepo.findOneBy({ id: contractId });
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
                created_by: userId,
            });
            await qr.manager.save(snapshot);

            await qr.commitTransaction();
            await this.auditService.create({
                contract_id: contractId,
                user_id: userId,
                action: 'SAVE_STAGE',
                meta: { stage },
            });
            return { ok: true, savedAt: savedEntry.created_at };
        } catch (err) {
            await qr.rollbackTransaction();
            this.logger.APP.error('saveStage error', err);
            throw err;
        } finally {
            await qr.release();
        }
    }

    async transitionStage(contractId: string, from: string, to: string, userId: number) {
        const contract = await this.contractRepo.findOneBy({ id: contractId });
        if (!contract) throw new NotFoundException('Contract not found');

        if (contract.current_stage !== from) throw new BadRequestException('Stage mismatch');

        const validation = await this.runStageValidation(contractId, from);
        if (!validation.ok) throw new BadRequestException({ message: 'Validation failed', details: validation.errors });

        contract.current_stage = to;
        await this.contractRepo.save(contract);
        await this.auditService.create({
            contract_id: contractId,
            user_id: userId,
            action: 'TRANSITION_STAGE',
            meta: { from, to },
        });
        return { ok: true, current_stage: to };
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
                created_by: userId,
                note: dto.note,
            });
            const savedVersion = await qr.manager.save(versionEnt);

            // if publish requested -> validate then set current_version_id & status active
            if (dto.publish) {
                const validation = await this.validateBeforePublish(latestByStage);
                if (!validation.ok) {
                    throw new BadRequestException({ message: 'Validation failed', details: validation.errors });
                }
                contract.current_version_id = savedVersion.id;
                contract.status = 'active';
                await qr.manager.save(contract);
            }

            await qr.commitTransaction();
            await this.auditService.create({
                contract_id: contractId,
                user_id: userId,
                action: 'CREATE_VERSION',
                meta: { version: newVersionNumber },
            });
            return { versionId: savedVersion.id, version: newVersionNumber, published: !!dto.publish };
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

            const validation = await this.validateBeforePublish(version.content_snapshot);
            if (!validation.ok)
                throw new BadRequestException({ message: 'Validation failed', details: validation.errors });

            const contract = await qr.manager.findOne(Contract, { where: { id: contractId } });
            contract.current_version_id = versionId;
            contract.status = 'active';
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

        if (query.search) {
            queryBuilder.andWhere('(template.name ILIKE :search OR template.description ILIKE :search)', {
                search: `%${query.search}%`,
            });
        }

        if (query.type) {
            queryBuilder.andWhere('template.contract_type = :type', { type: query.type });
        }

        if (query.category) {
            queryBuilder.andWhere('template.category = :category', { category: query.category });
        }

        if (query.mode) {
            queryBuilder.andWhere('template.mode = :mode', { mode: query.mode });
        }

        if (query.is_active !== undefined) {
            queryBuilder.andWhere('template.is_active = :is_active', { is_active: query.is_active });
        }

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
        const contract = await this.contractRepo.findOneBy({ id: contractId });
        if (!contract) throw new NotFoundException('Contract not found');

        const ent = this.milestoneRepo.create({
            contract_id: contractId,
            title: dto.title,
            description: dto.description,
            start_at: dto.start_at ? new Date(dto.start_at) : null,
            due_at: dto.due_at ? new Date(dto.due_at) : null,
            assigned_to: dto.assigned_to,
            created_by: userId,
            status: 'pending',
        });
        const saved = await this.milestoneRepo.save(ent);
        await this.auditService.create({
            contract_id: contractId,
            user_id: userId,
            action: 'CREATE_MILESTONE',
            meta: { milestoneId: saved.id },
        });
        return saved;
    }

    async createTask(milestoneId: string, dto: CreateTaskDto, userId: number) {
        const milestone = await this.milestoneRepo.findOneBy({ id: milestoneId });
        if (!milestone) throw new NotFoundException('Milestone not found');

        const ent = this.taskRepo.create({
            milestone_id: milestoneId,
            title: dto.title,
            description: dto.description,
            due_at: dto.due_at ? new Date(dto.due_at) : null,
            assigned_to: dto.assigned_to,
            created_by: userId,
            status: 'pending',
        });
        const saved = await this.taskRepo.save(ent);
        await this.auditService.create({
            contract_id: milestone.contract_id,
            user_id: userId,
            action: 'CREATE_TASK',
            meta: { taskId: saved.id },
        });
        return saved;
    }

    // ===== FILE MANAGEMENT =====
    async uploadFile(contractId: string, dto: UploadFileDto, userId: number) {
        const file = this.fileRepo.create({
            ...dto,
            contract_id: contractId,
            uploaded_by: userId.toString(),
        });
        return this.fileRepo.save(file);
    }

    async listFiles(contractId: string) {
        return this.fileRepo.find({
            where: { contract_id: contractId },
            order: { created_at: 'DESC' },
        });
    }

    async deleteFile(fid: string, userId: number) {
        const file = await this.fileRepo.findOne({ where: { id: fid } });
        if (!file) {
            throw new NotFoundException('File not found');
        }
        file.deleted_by = userId.toString();
        file.deleted_at = new Date();
        return this.fileRepo.save(file);
    }

    // ===== COLLABORATOR MANAGEMENT =====
    async addCollaborator(contractId: string, dto: CreateCollaboratorDto, userId: number) {
        // only owners can add collaborator: check
        const isOwner = await this.collabService.hasRole(contractId, userId, ['owner']);
        if (!isOwner) throw new ForbiddenException('Only owner can add collaborator');

        const saved = await this.collabService.add(contractId, dto.user_id, dto.role as any, userId);
        await this.auditService.create({
            contract_id: contractId,
            user_id: userId,
            action: 'ADD_COLLABORATOR',
            meta: { collaboratorId: saved.id },
        });
        return saved;
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
    async getContractAnalytics(contractId: string) {
        const contract = await this.contractRepo.findOne({ where: { id: contractId } });
        if (!contract) {
            throw new NotFoundException('Contract not found');
        }

        const milestones = await this.milestoneRepo.find({ where: { contract_id: contractId } });
        const tasks = await this.taskRepo.find({ where: { contract_id: contractId } });
        const files = await this.fileRepo.find({ where: { contract_id: contractId } });

        const completedMilestones = milestones.filter((m) => m.status === 'completed').length;
        const completedTasks = tasks.filter((t) => t.status === 'completed').length;

        return {
            contract_id: contractId,
            milestones: {
                total: milestones.length,
                completed: completedMilestones,
                pending: milestones.length - completedMilestones,
                completion_rate: milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0,
            },
            tasks: {
                total: tasks.length,
                completed: completedTasks,
                pending: tasks.length - completedTasks,
                completion_rate: tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0,
            },
            files: {
                total: files.length,
                types: this.groupFilesByType(files),
            },
            timeline: {
                created_at: contract.created_at,
                effective_date: contract.effective_date,
                expiration_date: contract.expiration_date,
                days_until_expiry: contract.expiration_date
                    ? Math.ceil(
                          (new Date(contract.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                      )
                    : null,
            },
        };
    }

    async getDashboardStats(userId: number) {
        const userContracts = await this.contractRepo.find({
            where: [{ drafter_id: userId.toString() }, { manager_id: userId.toString() }],
        });

        const statusCounts = this.groupContractsByStatus(userContracts);
        const priorityCounts = this.groupContractsByPriority(userContracts);
        const recentContracts = userContracts
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);

        const upcomingMilestones = await this.getUpcomingMilestones(userId);

        return {
            overview: {
                total_contracts: userContracts.length,
                active_contracts: statusCounts.active || 0,
                pending_review: statusCounts.pending_review || 0,
                expiring_soon: this.getExpiringContracts(userContracts).length,
            },
            status_distribution: statusCounts,
            priority_distribution: priorityCounts,
            recent_contracts: recentContracts,
            upcoming_milestones: upcomingMilestones,
        };
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
        const contract = await this.contractRepo.findOneBy({ id: contractId });
        if (!contract) throw new NotFoundException('Contract not found');
        contract.deleted_at = new Date();
        await this.contractRepo.save(contract);
        await this.auditService.create({ contract_id: contractId, user_id: userId, action: 'SOFT_DELETE' });
        return { message: 'Deleted (soft)' };
    }

    // ===== DRAFT & STAGE MANAGEMENT =====
    async getStageData(contractId: string, stage: string) {
        // TODO: Implement logic to get stage data by contractId and stage
        return this.draftRepo.findOne({ where: { contract_id: contractId, stage }, order: { created_at: 'DESC' } });
    }

    async generatePreview(contractId: string) {
        // TODO: Implement preview logic (can reuse generatePrintView or return summary)
        return this.generatePrintView(contractId);
    }

    // ===== VERSIONING =====
    async listVersions(contractId: string) {
        return this.versionRepo.find({ where: { contract_id: contractId }, order: { created_at: 'DESC' } });
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
        return this.milestoneRepo.find({ where: { contract_id: contractId }, order: { created_at: 'ASC' } });
    }

    async updateMilestone(milestoneId: string, dto: Partial<any>, userId: number) {
        // TODO: Validate permission, update milestone
        const milestone = await this.milestoneRepo.findOne({ where: { id: milestoneId } });
        if (!milestone) throw new NotFoundException('Milestone not found');
        Object.assign(milestone, dto, { updated_by: userId });
        return this.milestoneRepo.save(milestone);
    }

    async deleteMilestone(milestoneId: string, userId: number) {
        // TODO: Validate permission, soft delete milestone
        const milestone = await this.milestoneRepo.findOne({ where: { id: milestoneId } });
        if (!milestone) throw new NotFoundException('Milestone not found');
        milestone.status = 'deleted';
        milestone.updated_by = userId;
        return this.milestoneRepo.save(milestone);
    }

    async listTasks(milestoneId: string) {
        return this.taskRepo.find({ where: { milestone_id: milestoneId }, order: { created_at: 'ASC' } });
    }

    async updateTask(taskId: string, dto: Partial<any>, userId: number) {
        // TODO: Validate permission, update task
        const task = await this.taskRepo.findOne({ where: { id: taskId } });
        if (!task) throw new NotFoundException('Task not found');
        Object.assign(task, dto, { updated_by: userId });
        return this.taskRepo.save(task);
    }

    async deleteTask(taskId: string, userId: number) {
        // TODO: Validate permission, soft delete task
        const task = await this.taskRepo.findOne({ where: { id: taskId } });
        if (!task) throw new NotFoundException('Task not found');
        task.status = 'deleted';
        task.updated_by = userId;
        return this.taskRepo.save(task);
    }

    // ===== COLLABORATOR MANAGEMENT =====
    async updateCollaborator(collabId: string, dto: Partial<any>, userId: number) {
        // TODO: Validate permission, update collaborator
        return this.collabService.update(collabId, dto, userId);
    }

    async removeCollaborator(collabId: string, userId: number) {
        // TODO: Validate permission, remove collaborator
        return this.collabService.removeById(collabId, userId);
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
        // implement required checks (signatures, required clauses...)
        return { ok: true, errors: [] as any[] };
    }

    private groupFilesByType(files: ContractFile[]) {
        const grouped = {};
        files.forEach((file) => {
            const type = file.file_type;
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
            if (!contract.expiration_date) return false;
            return new Date(contract.expiration_date) <= thirtyDaysFromNow;
        });
    }

    private async getUpcomingMilestones(userId: number) {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        return this.milestoneRepo
            .createQueryBuilder('milestone')
            .leftJoin('contract', 'contract', 'contract.id = milestone.contract_id')
            .where('contract.drafter_id = :userId OR contract.manager_id = :userId', { userId: userId.toString() })
            .andWhere('milestone.due_at <= :sevenDaysFromNow', { sevenDaysFromNow })
            .andWhere('milestone.status != :completed', { completed: 'completed' })
            .orderBy('milestone.due_at', 'ASC')
            .limit(10)
            .getMany();
    }
}
