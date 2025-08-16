// src/modules/contracts/contracts.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthCoreService } from '../auth/auth/auth-core.service';
import { Contract } from '../../core/domain/contract/contract.entity';
import { ContractDraft } from '../../core/domain/contract/contract-draft.entity';
import { ContractTemplate } from '../../core/domain/contract/contract-template.entity';
import { ContractContent } from '../../core/domain/contract/contract-content.entity';
import { ContractVersion } from '../../core/domain/contract/contract-versions.entity';
import { Milestone } from '../../core/domain/contract/contract-milestones.entity';
import { Task } from '../../core/domain/contract/contract-taks.entity';
import { ContractFile } from '../../core/domain/contract/contract-file.entity';
import { Collaborator } from '../../core/domain/permission/collaborator.entity';
import { AuditLog } from '../../core/domain/permission/audit-log.entity';
import { User } from '../../core/domain/user/user.entity';
import { NotificationService } from '../notification/notification.service';
import { AuditLogService } from './audit-log.service';
import { CollaboratorService } from './collaborator.service';
import { LoggerTypes } from '@/core/shared/logger/logger.types';

export interface CreateContractDto {
    name: string;
    contract_type: string;
    category: string;
    priority?: string;
    template_id?: string;
    content?: string;
    initial_data?: any;
}

export interface UpdateContractDto {
    name?: string;
    contract_type?: string;
    category?: string;
    priority?: string;
    content?: string;
}

export interface ContractFilters {
    status?: string;
    type?: string;
    category?: string;
}

export interface ContractPagination {
    page: number;
    limit: number;
}

@Injectable()
export class ContractService {
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        private readonly authCoreService: AuthCoreService,
        private readonly notificationService: NotificationService,
        private readonly auditLogService: AuditLogService,
        private readonly collaboratorService: CollaboratorService,
    ) {}

    // ==================== CONTRACT CRUD OPERATIONS ====================

    async createContract(createDto: CreateContractDto, userId: number): Promise<Contract> {
        // Check permission
        if (!(await this.authCoreService.canCreateContract(userId, createDto.contract_type))) {
            throw new ForbiddenException('Không có quyền tạo hợp đồng');
        }

        const queryRunner = this.db.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const contractRepo = this.db.getRepository(Contract);
            const draftRepo = this.db.getRepository(ContractDraft);
            const contentRepo = this.db.getRepository(ContractContent);

            // Create contract
            const contract = contractRepo.create({
                ...createDto,
                created_by: String(userId),
                status: 'draft',
                current_stage: 'draft',
            });

            const savedContract = await queryRunner.manager.save(contract);

            // Create initial draft
            const draft = draftRepo.create({
                contract_id: savedContract.id,
                stage: 'draft',
                data: createDto.initial_data || {},
                version: 1,
                created_by: userId,
            });

            await queryRunner.manager.save(draft);

            // Create initial content
            if (createDto.content) {
                const content = contentRepo.create({
                    contract_id: savedContract.id,
                    content: createDto.content,
                    version: 1,
                    created_by: userId,
                });

                await queryRunner.manager.save(content);
            }

            await queryRunner.commitTransaction();
            return savedContract;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.APP.error('Create contract failed: ' + error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getContractById(contractId: string, userId: number): Promise<Contract> {
        const contractRepo = this.db.getRepository(Contract);
        const contract = await contractRepo.findOne({
            where: { id: contractId },
        });

        if (!contract) {
            throw new NotFoundException('Contract not found');
        }

        // Check permission
        if (!(await this.authCoreService.canViewContract(userId, contractId))) {
            throw new ForbiddenException('Không có quyền xem hợp đồng này');
        }

        return contract;
    }

    async updateContract(contractId: string, updateDto: UpdateContractDto, userId: number): Promise<Contract> {
        // Check permission
        if (!(await this.authCoreService.canEditContract(userId, contractId))) {
            throw new ForbiddenException('Không có quyền chỉnh sửa hợp đồng này');
        }

        const contractRepo = this.db.getRepository(Contract);
        const contract = await contractRepo.findOne({
            where: { id: contractId },
        });

        if (!contract) {
            throw new NotFoundException('Contract not found');
        }

        Object.assign(contract, updateDto, { updated_by: String(userId) });
        const updatedContract = await contractRepo.save(contract);

        return updatedContract;
    }

    async deleteContract(contractId: string, userId: number): Promise<void> {
        // Check permission
        if (!(await this.authCoreService.canDeleteContract(userId, contractId))) {
            throw new ForbiddenException('Không có quyền xóa hợp đồng này');
        }

        const contractRepo = this.db.getRepository(Contract);
        const contract = await contractRepo.findOne({
            where: { id: contractId },
        });

        if (!contract) {
            throw new NotFoundException('Contract not found');
        }

        // Soft delete
        contract.deleted_at = new Date();
        contract.deleted_by = String(userId);
        await contractRepo.save(contract);
    }

    async getContracts(filters: ContractFilters, pagination: ContractPagination, userId: number): Promise<{ contracts: Contract[]; total: number }> {
        const contractRepo = this.db.getRepository(Contract);
        
        const queryBuilder = contractRepo.createQueryBuilder('contract')
            .where('contract.deleted_at IS NULL');

        // Apply filters
        if (filters.status) {
            queryBuilder.andWhere('contract.status = :status', { status: filters.status });
        }

        if (filters.type) {
            queryBuilder.andWhere('contract.contract_type = :type', { type: filters.type });
        }

        if (filters.category) {
            queryBuilder.andWhere('contract.category = :category', { category: filters.category });
        }

        // Apply pagination
        const skip = (pagination.page - 1) * pagination.limit;
        queryBuilder.skip(skip).take(pagination.limit);

        // Apply ordering
        queryBuilder.orderBy('contract.created_at', 'DESC');

        const [contracts, total] = await queryBuilder.getManyAndCount();

        return { contracts, total };
    }

    // ==================== CONTRACT WORKFLOW OPERATIONS ====================

    async create(createDto: CreateContractDto, context: { userId: number }): Promise<Contract> {
        return this.createContract(createDto, context.userId);
    }

    async getContract(id: string): Promise<Contract> {
        const contractRepo = this.db.getRepository(Contract);
        const contract = await contractRepo.findOne({
            where: { id },
        });

        if (!contract) {
            throw new NotFoundException('Contract not found');
        }

        return contract;
    }

    async listContracts(filters: ContractFilters, userId: number): Promise<{ data: Contract[]; total: number; page: number; limit: number }> {
        const result = await this.getContracts(filters, { page: 1, limit: 10 }, userId);
        return {
            data: result.contracts,
            total: result.total,
            page: 1,
            limit: 10,
        };
    }

    async softDelete(id: string, userId: number): Promise<void> {
        return this.deleteContract(id, userId);
    }

    async autosaveStage(id: string, dto: any, userId: number): Promise<any> {
        // Implementation for auto save stage
        return { success: true };
    }

    async saveStage(id: string, stage: string, dto: any, userId: number): Promise<any> {
        // Implementation for save stage
        return { success: true };
    }

    async getStageData(id: string, stage: string): Promise<any> {
        // Implementation for get stage data
        return { stage, data: {} };
    }

    async transitionStage(id: string, from: string, to: string, userId: number): Promise<any> {
        // Implementation for transition stage
        return { success: true };
    }

    async generatePreview(id: string): Promise<{ html: string }> {
        // Implementation for generate preview
        return { html: '<div>Preview</div>' };
    }

    async generatePrintView(id: string): Promise<{ html: string }> {
        // Implementation for generate print view
        return { html: '<div>Print View</div>' };
    }

    async createVersion(id: string, dto: any, userId: number): Promise<any> {
        // Implementation for create version
        return { success: true };
    }

    async listVersions(id: string): Promise<any[]> {
        // Implementation for list versions
        return [];
    }

    async getVersion(id: string, vid: string): Promise<any> {
        // Implementation for get version
        return { id: vid };
    }

    async publishVersion(id: string, vid: string, userId: number): Promise<any> {
        // Implementation for publish version
        return { success: true };
    }

    async rollbackVersion(id: string, vid: string, userId: number): Promise<any> {
        // Implementation for rollback version
        return { success: true };
    }

    async createMilestone(contractId: string, dto: any, userId: number): Promise<any> {
        const milestoneRepo = this.db.getRepository(Milestone);
        
        const milestone = milestoneRepo.create({
            contract_id: contractId,
            name: dto.name,
            description: dto.description,
            assignee_id: String(dto.assignee_id),
            assignee_name: dto.assignee_name,
            status: 'pending',
            priority: 'medium',
            created_by: String(userId),
        });

        const savedMilestone = await milestoneRepo.save(milestone);

        // Create audit log
        await this.auditLogService.create({
            contract_id: contractId,
            user_id: userId,
            action: 'CREATE_MILESTONE',
            meta: { milestone_id: savedMilestone.id },
        });

        return savedMilestone;
    }

    async listMilestones(contractId: string): Promise<any[]> {
        const milestoneRepo = this.db.getRepository(Milestone);
        return milestoneRepo.find({
            where: { contract_id: contractId },
        });
    }

    async updateMilestone(milestoneId: string, dto: any, userId: number): Promise<any> {
        const milestoneRepo = this.db.getRepository(Milestone);
        const milestone = await milestoneRepo.findOne({
            where: { id: milestoneId },
        });

        if (!milestone) {
            throw new NotFoundException('Milestone not found');
        }

        Object.assign(milestone, dto);
        const updatedMilestone = await milestoneRepo.save(milestone);

        // Create audit log
        await this.auditLogService.create({
            contract_id: milestone.contract_id,
            user_id: userId,
            action: 'UPDATE_MILESTONE',
            meta: { milestone_id: milestoneId },
        });

        return updatedMilestone;
    }

    async deleteMilestone(milestoneId: string, userId: number): Promise<void> {
        const milestoneRepo = this.db.getRepository(Milestone);
        const milestone = await milestoneRepo.findOne({
            where: { id: milestoneId },
        });

        if (!milestone) {
            throw new NotFoundException('Milestone not found');
        }

        await milestoneRepo.delete(milestoneId);

        // Create audit log
        await this.auditLogService.create({
            contract_id: milestone.contract_id,
            user_id: userId,
            action: 'DELETE_MILESTONE',
            meta: { milestone_id: milestoneId },
        });
    }

    async createTask(milestoneId: string, dto: any, userId: number): Promise<any> {
        const taskRepo = this.db.getRepository(Task);
        const milestoneRepo = this.db.getRepository(Milestone);
        
        const milestone = await milestoneRepo.findOne({
            where: { id: milestoneId },
        });

        if (!milestone) {
            throw new NotFoundException('Milestone not found');
        }

        const task = taskRepo.create({
            milestone_id: milestoneId,
            name: dto.name,
            description: dto.description,
            assignee_id: String(dto.assignee_id),
            assignee_name: dto.assignee_name,
            status: 'pending',
            priority: 'medium',
            created_by: String(userId),
        });

        const savedTask = await taskRepo.save(task);

        // Create audit log
        await this.auditLogService.create({
            contract_id: milestone.contract_id,
            user_id: userId,
            action: 'CREATE_TASK',
            meta: { task_id: savedTask.id },
        });

        return savedTask;
    }

    async listTasks(milestoneId: string): Promise<any[]> {
        const taskRepo = this.db.getRepository(Task);
        return taskRepo.find({
            where: { milestone_id: milestoneId },
        });
    }

    async updateTask(taskId: string, dto: any, userId: number): Promise<any> {
        const taskRepo = this.db.getRepository(Task);
        const task = await taskRepo.findOne({
            where: { id: taskId },
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        Object.assign(task, dto);
        const updatedTask = await taskRepo.save(task);

        return updatedTask;
    }

    async deleteTask(taskId: string, userId: number): Promise<void> {
        const taskRepo = this.db.getRepository(Task);
        const task = await taskRepo.findOne({
            where: { id: taskId },
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        await taskRepo.delete(taskId);
    }

    async addCollaborator(contractId: string, dto: any, userId: number): Promise<any> {
        return this.collaboratorService.add(contractId, dto.user_id, dto.role, userId);
    }

    async listCollaborators(contractId: string): Promise<any[]> {
        return this.collaboratorService.getByContract(contractId);
    }

    async updateCollaborator(collaboratorId: string, dto: any, userId: number): Promise<any> {
        return this.collaboratorService.updateRole(collaboratorId, dto.role, userId);
    }

    async removeCollaborator(collaboratorId: string, userId: number): Promise<void> {
        return this.collaboratorService.remove(collaboratorId, userId);
    }

    async transferOwnership(contractId: string, toUserId: number, userId: number): Promise<any> {
        // Implementation for transfer ownership
        return { success: true };
    }

    async getCollaboratorPermissions(contractId: string, userId: number): Promise<any> {
        // Implementation for get collaborator permissions
        return { permissions: [] };
    }

    async uploadFile(contractId: string, dto: any, userId: number): Promise<any> {
        const fileRepo = this.db.getRepository(ContractFile);
        
        const file = fileRepo.create({
            contract_id: contractId,
            file_name: dto.file_name,
            file_url: dto.file_url,
            file_size: dto.file_size,
            mime_type: dto.mime_type,
            version: 1,
            created_by: String(userId),
        });

        const savedFile = await fileRepo.save(file);

        // Create audit log
        await this.auditLogService.create({
            contract_id: contractId,
            user_id: userId,
            action: 'UPLOAD_FILE',
            meta: { file_id: savedFile.id },
        });

        return savedFile;
    }

    async listFiles(contractId: string): Promise<any[]> {
        const fileRepo = this.db.getRepository(ContractFile);
        return fileRepo.find({
            where: { contract_id: contractId },
        });
    }

    async deleteFile(fileId: string, userId: number): Promise<void> {
        const fileRepo = this.db.getRepository(ContractFile);
        const file = await fileRepo.findOne({
            where: { id: fileId },
        });

        if (!file) {
            throw new NotFoundException('File not found');
        }

        await fileRepo.delete(fileId);

        // Create audit log
        await this.auditLogService.create({
            contract_id: file.contract_id,
            user_id: userId,
            action: 'DELETE_FILE',
            meta: { file_id: fileId, filename: file.file_name },
        });
    }

    async approveContract(contractId: string, userId: number): Promise<any> {
        const contractRepo = this.db.getRepository(Contract);
        const contract = await contractRepo.findOne({
            where: { id: contractId },
        });

        if (!contract) {
            throw new NotFoundException('Contract not found');
        }

        contract.status = 'approved';
        contract.updated_by = String(userId);
        await contractRepo.save(contract);

        // Create audit log
        await this.auditLogService.create({
            contract_id: contractId,
            user_id: userId,
            action: 'APPROVE_CONTRACT',
        });

        return contract;
    }

    async rejectContract(contractId: string, reason: string, userId: number): Promise<any> {
        const contractRepo = this.db.getRepository(Contract);
        const contract = await contractRepo.findOne({
            where: { id: contractId },
        });

        if (!contract) {
            throw new NotFoundException('Contract not found');
        }

        contract.status = 'rejected';
        contract.updated_by = String(userId);
        await contractRepo.save(contract);

        // Create audit log
        await this.auditLogService.create({
            contract_id: contractId,
            user_id: userId,
            action: 'REJECT_CONTRACT',
            meta: { reason },
        });

        return contract;
    }

    async requestChanges(contractId: string, changes: string, userId: number): Promise<any> {
        const contractRepo = this.db.getRepository(Contract);
        const contract = await contractRepo.findOne({
            where: { id: contractId },
        });

        if (!contract) {
            throw new NotFoundException('Contract not found');
        }

        contract.status = 'changes_requested';
        contract.updated_by = String(userId);
        await contractRepo.save(contract);

        // Create audit log
        await this.auditLogService.create({
            contract_id: contractId,
            user_id: userId,
            action: 'REQUEST_CHANGES',
            meta: { changes },
        });

        return contract;
    }

    async getAuditLogs(contractId: string, filters: any, pagination: any): Promise<any> {
        return this.auditLogService.findByContract(contractId, filters, pagination);
    }

    async getAuditSummary(contractId: string): Promise<any> {
        return this.auditLogService.getSummary(contractId);
    }

    async getUserAuditLogs(userId: number, filters: any, pagination: any): Promise<any> {
        return this.auditLogService.findByUser(userId, filters, pagination);
    }

    async getSystemAuditLogs(filters: any, pagination: any): Promise<any> {
        return this.auditLogService.findSystemLogs(filters, pagination);
    }

    async getContractAnalytics(contractId: string): Promise<any> {
        // Implementation for contract analytics
        return { analytics: {} };
    }

    async getDashboardStats(userId: number): Promise<any> {
        // Implementation for dashboard stats
        return { stats: {} };
    }

    async listTemplates(query: any): Promise<any[]> {
        const templateRepo = this.db.getRepository(ContractTemplate);
        return templateRepo.find();
    }

    async getTemplate(templateId: string): Promise<any> {
        const templateRepo = this.db.getRepository(ContractTemplate);
        const template = await templateRepo.findOne({
            where: { id: templateId },
        });

        if (!template) {
            throw new NotFoundException('Template not found');
        }

        return template;
    }

    async createTemplate(dto: any, userId: number): Promise<any> {
        const templateRepo = this.db.getRepository(ContractTemplate);
        const template = templateRepo.create({
            ...dto,
            created_by: String(userId),
        });

        return templateRepo.save(template);
    }

    async updateTemplate(templateId: string, dto: any, userId: number): Promise<any> {
        const templateRepo = this.db.getRepository(ContractTemplate);
        const template = await templateRepo.findOne({
            where: { id: templateId },
        });

        if (!template) {
            throw new NotFoundException('Template not found');
        }

        Object.assign(template, dto, { updated_by: String(userId) });
        return templateRepo.save(template);
    }

    async deleteTemplate(templateId: string, userId: number): Promise<void> {
        const templateRepo = this.db.getRepository(ContractTemplate);
        const template = await templateRepo.findOne({
            where: { id: templateId },
        });

        if (!template) {
            throw new NotFoundException('Template not found');
        }

        await templateRepo.delete(templateId);
    }

    async generatePrintView(id: string): Promise<{ html: string }> {
        const contractRepo = this.db.getRepository(Contract);
        const contract = await contractRepo.findOne({
            where: { id },
        });

        if (!contract) {
            throw new NotFoundException('Contract not found');
        }

        // Generate print view HTML
        const html = `
            <div class="contract-print">
                <h1>${contract.name}</h1>
                <p>Contract ID: ${contract.id}</p>
                <p>Status: ${contract.status}</p>
            </div>
        `;

        return { html };
    }
}
