// src/modules/contracts/contracts.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AuthCoreService } from '../../core/services/auth-core.service';
import { Contract } from '../../core/domain/contract/contract.entity';
import { ContractDraft } from '../../core/domain/contract/contract-draft.entity';
import { ContractTemplate } from '../../core/domain/contract/contract-template.entity';
import { ContractContent } from '../../core/domain/contract/contract-content.entity';
import { ContractVersion } from '../../core/domain/contract/contract-version.entity';
import { Milestone } from '../../core/domain/contract/milestone.entity';
import { Task } from '../../core/domain/contract/task.entity';
import { ContractFile } from '../../core/domain/contract/contract-file.entity';
import { Collaborator } from '../../core/domain/contract/collaborator.entity';
import { AuditLog } from '../../core/domain/contract/audit-log.entity';
import { User } from '../../core/domain/user/user.entity';
import { WorkflowService } from './workflow.service';
import { NotificationService } from '../notification/notification.service';
import { AuditLogService } from './audit-log.service';
import { CollaboratorService } from './collaborator.service';
import type { CreateContractDto, UpdateContractDto, ContractFilters, ContractPagination } from './dto/contract.dto';

@Injectable()
export class ContractService {
    constructor(
        @InjectRepository(Contract)
        private readonly contractRepository: Repository<Contract>,
        @InjectRepository(ContractDraft)
        private readonly draftRepository: Repository<ContractDraft>,
        @InjectRepository(ContractTemplate)
        private readonly templateRepository: Repository<ContractTemplate>,
        @InjectRepository(ContractContent)
        private readonly contentRepository: Repository<ContractContent>,
        @InjectRepository(ContractVersion)
        private readonly versionRepository: Repository<ContractVersion>,
        @InjectRepository(Milestone)
        private readonly milestoneRepository: Repository<Milestone>,
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @InjectRepository(ContractFile)
        private readonly fileRepository: Repository<ContractFile>,
        @InjectRepository(Collaborator)
        private readonly collaboratorRepository: Repository<Collaborator>,
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly dataSource: DataSource,
        private readonly authCoreService: AuthCoreService,
        private readonly workflowService: WorkflowService,
        private readonly notificationService: NotificationService,
        private readonly auditLogService: AuditLogService,
        private readonly collaboratorService: CollaboratorService,
    ) {}

    // ==================== CONTRACT CRUD OPERATIONS ====================

    async createContract(createDto: CreateContractDto, userId: number): Promise<Contract> {
        // Check permission
        if (!(await this.authCoreService.canCreateContract(userId, createDto.type))) {
            throw new ForbiddenException('Không có quyền tạo hợp đồng');
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Create contract
            const contract = this.contractRepository.create({
                ...createDto,
                created_by: userId,
                status: 'draft',
                current_stage: 'draft',
            });

            const savedContract = await queryRunner.manager.save(contract);

            // Create initial draft
            const draft = this.draftRepository.create({
                contract_id: savedContract.id,
                stage: 'draft',
                data: createDto.initial_data || {},
                version: 1,
                created_by: userId,
            });

            await queryRunner.manager.save(draft);

            // Create initial content
            if (createDto.content) {
                const content = this.contentRepository.create({
                    contract_id: savedContract.id,
                    content: createDto.content,
                    version: 1,
                    created_by: userId,
                });

                await queryRunner.manager.save(content);
            }

            // Create initial version
            const version = this.versionRepository.create({
                contract_id: savedContract.id,
                version: 1,
                changes: 'Initial version',
                created_by: userId,
            });

            await queryRunner.manager.save(version);

            // Start workflow if template has workflow
            if (createDto.template_id) {
                const template = await this.templateRepository.findOne({
                    where: { id: createDto.template_id },
                });

                if (template?.workflow_id) {
                    await this.workflowService.createWorkflowInstance(savedContract.id, template.workflow_id, userId);
                }
            }

            // Add creator as owner collaborator
            await this.collaboratorService.addCollaborator(savedContract.id, userId, 'owner', userId);

            // Log audit
            await this.auditLogService.create({
                contract_id: savedContract.id,
                user_id: userId,
                action: 'CREATE_CONTRACT',
                details: { contract_type: createDto.type, template_id: createDto.template_id },
            });

            await queryRunner.commitTransaction();
            return savedContract;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getContract(id: number, userId: number): Promise<Contract> {
        const contract = await this.contractRepository.findOne({
            where: { id },
            relations: [
                'template',
                'current_content',
                'current_version',
                'milestones',
                'tasks',
                'files',
                'collaborators',
                'collaborators.user',
            ],
        });

        if (!contract) {
            throw new NotFoundException('Hợp đồng không tồn tại');
        }

        // Check permission
        if (
            !(await this.authCoreService.canReadContract(userId, id, {
                ownerId: contract.created_by,
                status: contract.status,
                type: contract.type,
            }))
        ) {
            throw new ForbiddenException('Không có quyền xem hợp đồng này');
        }

        return contract;
    }

    async updateContract(id: number, updateDto: UpdateContractDto, userId: number): Promise<Contract> {
        const contract = await this.contractRepository.findOne({
            where: { id },
            relations: ['current_content', 'current_version'],
        });

        if (!contract) {
            throw new NotFoundException('Hợp đồng không tồn tại');
        }

        // Check permission
        if (
            !(await this.authCoreService.canUpdateContract(userId, id, {
                ownerId: contract.created_by,
                status: contract.status,
                type: contract.type,
            }))
        ) {
            throw new ForbiddenException('Không có quyền cập nhật hợp đồng này');
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Update contract
            Object.assign(contract, updateDto);
            const updatedContract = await queryRunner.manager.save(contract);

            // Create new version if content changed
            if (updateDto.content && updateDto.content !== contract.current_content?.content) {
                const newVersion = contract.current_version ? contract.current_version.version + 1 : 1;

                const content = this.contentRepository.create({
                    contract_id: id,
                    content: updateDto.content,
                    version: newVersion,
                    created_by: userId,
                });

                await queryRunner.manager.save(content);

                const version = this.versionRepository.create({
                    contract_id: id,
                    version: newVersion,
                    changes: updateDto.changes || 'Content updated',
                    created_by: userId,
                });

                await queryRunner.manager.save(version);

                // Update contract with new version
                updatedContract.current_content = content;
                updatedContract.current_version = version;
                await queryRunner.manager.save(updatedContract);
            }

            // Log audit
            await this.auditLogService.create({
                contract_id: id,
                user_id: userId,
                action: 'UPDATE_CONTRACT',
                details: { changes: updateDto.changes },
            });

            await queryRunner.commitTransaction();
            return updatedContract;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async deleteContract(id: number, userId: number): Promise<void> {
        const contract = await this.contractRepository.findOne({
            where: { id },
        });

        if (!contract) {
            throw new NotFoundException('Hợp đồng không tồn tại');
        }

        // Check permission
        if (
            !(await this.authCoreService.canDeleteContract(userId, id, {
                ownerId: contract.created_by,
                status: contract.status,
            }))
        ) {
            throw new ForbiddenException('Không có quyền xóa hợp đồng này');
        }

        // Soft delete
        await this.contractRepository.update(id, {
            deleted_at: new Date(),
            deleted_by: userId,
        });

        // Log audit
        await this.auditLogService.create({
            contract_id: id,
            user_id: userId,
            action: 'DELETE_CONTRACT',
        });
    }

    async listContracts(
        filters: ContractFilters,
        pagination: ContractPagination,
        userId: number,
    ): Promise<{
        data: Contract[];
        total: number;
        page: number;
        limit: number;
    }> {
        const queryBuilder = this.contractRepository
            .createQueryBuilder('contract')
            .leftJoinAndSelect('contract.template', 'template')
            .leftJoinAndSelect('contract.current_content', 'current_content')
            .leftJoinAndSelect('contract.collaborators', 'collaborators')
            .leftJoinAndSelect('collaborators.user', 'collaborator_user')
            .where('contract.deleted_at IS NULL');

        // Apply filters
        if (filters.status) {
            queryBuilder.andWhere('contract.status = :status', { status: filters.status });
        }

        if (filters.type) {
            queryBuilder.andWhere('contract.type = :type', { type: filters.type });
        }

        if (filters.search) {
            queryBuilder.andWhere('(contract.title ILIKE :search OR contract.description ILIKE :search)', {
                search: `%${filters.search}%`,
            });
        }

        // Apply permission-based filtering
        const userPermissions = await this.authCoreService.getUserPermissions(userId);
        const isManager = userPermissions.roles.some((role) => role.name === 'contract_manager');

        if (!isManager) {
            // Filter by user's access
            queryBuilder.andWhere('(contract.created_by = :userId OR collaborators.user_id = :userId)', { userId });
        }

        // Apply pagination
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        const offset = (page - 1) * limit;

        queryBuilder.orderBy('contract.updated_at', 'DESC').skip(offset).take(limit);

        const [data, total] = await queryBuilder.getManyAndCount();

        return {
            data,
            total,
            page,
            limit,
        };
    }

    // ==================== CONTRACT WORKFLOW OPERATIONS ====================

    async submitForReview(id: number, userId: number): Promise<Contract> {
        const contract = await this.getContract(id, userId);

        if (contract.status !== 'draft') {
            throw new BadRequestException('Chỉ có thể submit hợp đồng ở trạng thái draft');
        }

        // Start workflow
        const workflowInstance = await this.workflowService.createWorkflowInstance(
            id,
            'default_contract_workflow',
            userId,
        );

        // Update contract status
        await this.contractRepository.update(id, {
            status: 'pending_review',
            current_stage: 'review',
            workflow_instance_id: workflowInstance.id,
        });

        // Log audit
        await this.auditLogService.create({
            contract_id: id,
            user_id: userId,
            action: 'SUBMIT_FOR_REVIEW',
        });

        return this.getContract(id, userId);
    }

    async approveContract(id: number, userId: number, comment?: string): Promise<Contract> {
        const contract = await this.getContract(id, userId);

        if (
            !(await this.authCoreService.canApproveContract(userId, id, {
                status: contract.status,
                type: contract.type,
            }))
        ) {
            throw new ForbiddenException('Không có quyền phê duyệt hợp đồng này');
        }

        // Execute workflow step
        await this.workflowService.executeStep(contract.workflow_instance_id, 'approve', userId, 'approve', comment);

        // Update contract status
        await this.contractRepository.update(id, {
            status: 'approved',
            current_stage: 'approved',
            approved_by: userId,
            approved_at: new Date(),
        });

        // Log audit
        await this.auditLogService.create({
            contract_id: id,
            user_id: userId,
            action: 'APPROVE_CONTRACT',
            details: { comment },
        });

        return this.getContract(id, userId);
    }

    async rejectContract(id: number, userId: number, reason: string): Promise<Contract> {
        const contract = await this.getContract(id, userId);

        if (
            !(await this.authCoreService.canRejectContract(userId, id, {
                status: contract.status,
                type: contract.type,
            }))
        ) {
            throw new ForbiddenException('Không có quyền từ chối hợp đồng này');
        }

        // Execute workflow step
        await this.workflowService.executeStep(contract.workflow_instance_id, 'reject', userId, 'reject', reason);

        // Update contract status
        await this.contractRepository.update(id, {
            status: 'rejected',
            current_stage: 'rejected',
            rejected_by: userId,
            rejected_at: new Date(),
            rejection_reason: reason,
        });

        // Log audit
        await this.auditLogService.create({
            contract_id: id,
            user_id: userId,
            action: 'REJECT_CONTRACT',
            details: { reason },
        });

        return this.getContract(id, userId);
    }

    async requestChanges(id: number, userId: number, changes: string): Promise<Contract> {
        const contract = await this.getContract(id, userId);

        if (
            !(await this.authCoreService.canApproveContract(userId, id, {
                status: contract.status,
                type: contract.type,
            }))
        ) {
            throw new ForbiddenException('Không có quyền yêu cầu chỉnh sửa hợp đồng này');
        }

        // Execute workflow step
        await this.workflowService.executeStep(
            contract.workflow_instance_id,
            'request_changes',
            userId,
            'request_changes',
            changes,
        );

        // Update contract status
        await this.contractRepository.update(id, {
            status: 'changes_requested',
            current_stage: 'changes_requested',
            changes_requested_by: userId,
            changes_requested_at: new Date(),
            requested_changes: changes,
        });

        // Log audit
        await this.auditLogService.create({
            contract_id: id,
            user_id: userId,
            action: 'REQUEST_CHANGES',
            details: { changes },
        });

        return this.getContract(id, userId);
    }

    // ==================== MILESTONE & TASK MANAGEMENT ====================

    async createMilestone(contractId: number, milestoneData: any, userId: number): Promise<Milestone> {
        const contract = await this.getContract(contractId, userId);

        if (
            !(await this.authCoreService.canUpdateContract(userId, contractId, {
                ownerId: contract.created_by,
                status: contract.status,
            }))
        ) {
            throw new ForbiddenException('Không có quyền tạo milestone');
        }

        const milestone = this.milestoneRepository.create({
            ...milestoneData,
            contract_id: contractId,
            created_by: userId,
        });

        const savedMilestone = await this.milestoneRepository.save(milestone);

        // Create notification
        await this.notificationService.createMilestoneReminder(savedMilestone);

        // Log audit
        await this.auditLogService.create({
            contract_id: contractId,
            user_id: userId,
            action: 'CREATE_MILESTONE',
            details: { milestone_id: savedMilestone.id },
        });

        return savedMilestone;
    }

    async updateMilestone(milestoneId: number, updateData: any, userId: number): Promise<Milestone> {
        const milestone = await this.milestoneRepository.findOne({
            where: { id: milestoneId },
            relations: ['contract'],
        });

        if (!milestone) {
            throw new NotFoundException('Milestone không tồn tại');
        }

        if (
            !(await this.authCoreService.canUpdateContract(userId, milestone.contract_id, {
                ownerId: milestone.contract.created_by,
                status: milestone.contract.status,
            }))
        ) {
            throw new ForbiddenException('Không có quyền cập nhật milestone');
        }

        Object.assign(milestone, updateData);
        const updatedMilestone = await this.milestoneRepository.save(milestone);

        // Log audit
        await this.auditLogService.create({
            contract_id: milestone.contract_id,
            user_id: userId,
            action: 'UPDATE_MILESTONE',
            details: { milestone_id: milestoneId },
        });

        return updatedMilestone;
    }

    async deleteMilestone(milestoneId: number, userId: number): Promise<void> {
        const milestone = await this.milestoneRepository.findOne({
            where: { id: milestoneId },
            relations: ['contract'],
        });

        if (!milestone) {
            throw new NotFoundException('Milestone không tồn tại');
        }

        if (
            !(await this.authCoreService.canUpdateContract(userId, milestone.contract_id, {
                ownerId: milestone.contract.created_by,
                status: milestone.contract.status,
            }))
        ) {
            throw new ForbiddenException('Không có quyền xóa milestone');
        }

        await this.milestoneRepository.delete(milestoneId);

        // Cancel related reminders
        await this.notificationService.cancelRemindersByMilestone(milestoneId);

        // Log audit
        await this.auditLogService.create({
            contract_id: milestone.contract_id,
            user_id: userId,
            action: 'DELETE_MILESTONE',
            details: { milestone_id: milestoneId },
        });
    }

    // Similar methods for Task management...
    async createTask(contractId: number, taskData: any, userId: number): Promise<Task> {
        const contract = await this.getContract(contractId, userId);

        if (
            !(await this.authCoreService.canUpdateContract(userId, contractId, {
                ownerId: contract.created_by,
                status: contract.status,
            }))
        ) {
            throw new ForbiddenException('Không có quyền tạo task');
        }

        const task = this.taskRepository.create({
            ...taskData,
            contract_id: contractId,
            created_by: userId,
        });

        const savedTask = await this.taskRepository.save(task);

        // Create notification
        await this.notificationService.createTaskReminder(savedTask);

        // Log audit
        await this.auditLogService.create({
            contract_id: contractId,
            user_id: userId,
            action: 'CREATE_TASK',
            details: { task_id: savedTask.id },
        });

        return savedTask;
    }

    // ==================== FILE MANAGEMENT ====================

    async uploadFile(contractId: number, fileData: any, userId: number): Promise<ContractFile> {
        const contract = await this.getContract(contractId, userId);

        if (
            !(await this.authCoreService.canUpdateContract(userId, contractId, {
                ownerId: contract.created_by,
                status: contract.status,
            }))
        ) {
            throw new ForbiddenException('Không có quyền upload file');
        }

        const file = this.fileRepository.create({
            ...fileData,
            contract_id: contractId,
            uploaded_by: userId,
        });

        const savedFile = await this.fileRepository.save(file);

        // Log audit
        await this.auditLogService.create({
            contract_id: contractId,
            user_id: userId,
            action: 'UPLOAD_FILE',
            details: { file_id: savedFile.id, filename: savedFile.filename },
        });

        return savedFile;
    }

    async deleteFile(fileId: number, userId: number): Promise<void> {
        const file = await this.fileRepository.findOne({
            where: { id: fileId },
            relations: ['contract'],
        });

        if (!file) {
            throw new NotFoundException('File không tồn tại');
        }

        if (
            !(await this.authCoreService.canUpdateContract(userId, file.contract_id, {
                ownerId: file.contract.created_by,
                status: file.contract.status,
            }))
        ) {
            throw new ForbiddenException('Không có quyền xóa file');
        }

        await this.fileRepository.delete(fileId);

        // Log audit
        await this.auditLogService.create({
            contract_id: file.contract_id,
            user_id: userId,
            action: 'DELETE_FILE',
            details: { file_id: fileId, filename: file.filename },
        });
    }

    // ==================== EXPORT & REPORTING ====================

    async exportContract(id: number, format: string, userId: number): Promise<any> {
        const contract = await this.getContract(id, userId);

        if (!(await this.authCoreService.canExportContract(userId, id))) {
            throw new ForbiddenException('Không có quyền export hợp đồng');
        }

        // Implementation for different export formats
        switch (format) {
            case 'pdf':
                return this.exportToPDF(contract);
            case 'docx':
                return this.exportToDOCX(contract);
            case 'json':
                return this.exportToJSON(contract);
            default:
                throw new BadRequestException('Format không được hỗ trợ');
        }
    }

    private async exportToPDF(contract: Contract): Promise<any> {
        // PDF export implementation
        return { format: 'pdf', data: contract };
    }

    private async exportToDOCX(contract: Contract): Promise<any> {
        // DOCX export implementation
        return { format: 'docx', data: contract };
    }

    private async exportToJSON(contract: Contract): Promise<any> {
        // JSON export implementation
        return { format: 'json', data: contract };
    }

    // Controller-facing helpers (stubs) for export & print
    async exportPdf(id: string, userId?: number): Promise<{ filename: string; contentBase64: string; contentType: string }> {
        // NOTE: Lightweight placeholder that returns HTML content as a downloadable payload
        // A real PDF generator (e.g., puppeteer/Playwright) should be integrated later.
        const contract = await this.contractRepository.findOne({ where: { id } });
        if (!contract) {
            throw new NotFoundException('Hợp đồng không tồn tại');
        }
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>${
            contract.name || 'contract'
        }</title></head><body><h1>${contract.name || 'Hợp đồng'}</h1><p>Mã: ${
            contract.contract_code || ''
        }</p></body></html>`;
        // Audit
        try {
            await this.auditLogService.create({ contract_id: contract.id, user_id: userId, action: 'EXPORT_PDF' });
        } catch {}
        return {
            filename: `${contract.name || 'contract'}.html`,
            contentBase64: Buffer.from(html, 'utf8').toString('base64'),
            contentType: 'text/html',
        };
    }

    async exportDocx(id: string, userId?: number): Promise<{ filename: string; contentBase64: string; contentType: string }> {
        const contract = await this.contractRepository.findOne({ where: { id } });
        if (!contract) {
            throw new NotFoundException('Hợp đồng không tồn tại');
        }
        // Placeholder DOCX export as plain text packaged; real implementation should produce a .docx file
        const content = `Contract: ${contract.name || ''}\nCode: ${contract.contract_code || ''}`;
        // Audit
        try {
            await this.auditLogService.create({ contract_id: contract.id, user_id: userId, action: 'EXPORT_DOCX' });
        } catch {}
        return {
            filename: `${contract.name || 'contract'}.txt`,
            contentBase64: Buffer.from(content, 'utf8').toString('base64'),
            contentType: 'text/plain',
        };
    }

    async generatePrintView(id: string, userId?: number): Promise<{ html: string }> {
        const contract = await this.contractRepository.findOne({ where: { id } });
        if (!contract) {
            throw new NotFoundException('Hợp đồng không tồn tại');
        }
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>${
            contract.name || 'contract'
        }</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:24px}</style></head><body><h1>${
            contract.name || 'Hợp đồng'
        }</h1><p>Mã hợp đồng: ${contract.contract_code || ''}</p></body></html>`;
        // Audit
        try {
            await this.auditLogService.create({ contract_id: contract.id, user_id: userId, action: 'PRINT_CONTRACT' });
        } catch {}
        return { html };
    }

    // ==================== STATISTICS & ANALYTICS ====================

    async getContractStatistics(userId: number): Promise<any> {
        const userPermissions = await this.authCoreService.getUserPermissions(userId);
        const isManager = userPermissions.roles.some((role) => role.name === 'contract_manager');

        let queryBuilder = this.contractRepository.createQueryBuilder('contract').where('contract.deleted_at IS NULL');

        if (!isManager) {
            queryBuilder.andWhere(
                '(contract.created_by = :userId OR EXISTS (SELECT 1 FROM collaborators c WHERE c.contract_id = contract.id AND c.user_id = :userId))',
                { userId },
            );
        }

        const [totalContracts, draftContracts, pendingContracts, approvedContracts, rejectedContracts] =
            await Promise.all([
                queryBuilder.getCount(),
                queryBuilder.clone().andWhere('contract.status = :status', { status: 'draft' }).getCount(),
                queryBuilder.clone().andWhere('contract.status = :status', { status: 'pending_review' }).getCount(),
                queryBuilder.clone().andWhere('contract.status = :status', { status: 'approved' }).getCount(),
                queryBuilder.clone().andWhere('contract.status = :status', { status: 'rejected' }).getCount(),
            ]);

        return {
            total: totalContracts,
            byStatus: {
                draft: draftContracts,
                pending: pendingContracts,
                approved: approvedContracts,
                rejected: rejectedContracts,
            },
        };
    }

    // ==================== NOTIFICATIONS & REMINDERS (Controller helpers) ====================

    async createNotification(contractId: string, dto: any, userId: number) {
        // Delegate to NotificationService; ensure contract id and user id present
        return this.notificationService.createNotification({
            ...dto,
            contract_id: contractId,
            user_id: userId,
        });
    }

    async listNotifications(contractId: string) {
        // As a simple approach, fetch pending and failed notifications and filter by contract
        const [pending, failed] = await Promise.all([
            this.notificationService.getPendingNotifications(),
            this.notificationService.getFailedNotifications(),
        ]);
        return [...pending, ...failed].filter((n) => n.contract_id === contractId);
    }

    async createReminder(contractId: string, dto: any, userId: number) {
        return this.notificationService.createReminder({
            ...dto,
            contract_id: contractId,
            user_id: userId,
        });
    }

    async listReminders(contractId: string) {
        return this.notificationService.getRemindersByContract(contractId);
    }
}
