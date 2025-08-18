// src/modules/contracts/contracts.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AuthCoreService } from '@/modules/auth/auth/auth-core.service';
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
        private readonly dataSource: DataSource,
        private readonly authCoreService: AuthCoreService,
        private readonly notificationService: NotificationService,
        private readonly auditLogService: AuditLogService,
    ) {}

    async create(dto: CreateContractDto, ctx: { userId: number }) {
        const contract = await this.createContract(dto, ctx.userId);
        await this.notificationService.create({
            type: 'APPROVAL_REQUIRED' as any,
            title: 'Contract created',
            message: `Hợp đồng "${contract.name}" đã được tạo`,
            userId: ctx.userId,
            data: contract.id,
        } as any);
        return contract;
    }
    async softDelete(id: string, userId: number) {
        return this.deleteContract(id as any, userId);
    }

    async listContracts(query: any, userId: number) {
        const page = Number(query.page || 1);
        const limit = Number(query.limit || 10);
        const [data, total] = await this.contractRepository.findAndCount({
            where: { deleted_at: null as any },
            take: limit,
            skip: (page - 1) * limit,
            order: { id: 'DESC' as any },
        });
        return { data, total, page, limit };
    }

    async createContract(createDto: CreateContractDto, userId: number): Promise<Contract> {
        if (!(await this.authCoreService.canCreateContract(userId, createDto.contract_type)))
            throw new ForbiddenException('Không có quyền tạo hợp đồng');
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
        const can = await this.authCoreService.canReadContract(userId, 0 as any, {
            ownerId: contract.created_by,
            status: contract.status,
            type: contract.contract_type,
        });
        if (!can) throw new ForbiddenException('Không có quyền xem hợp đồng này');
        return contract;
    }

    async updateContract(id: string, updateDto: any, userId: number): Promise<Contract> {
        const contract = await this.contractRepository.findOne({ where: { id } });
        if (!contract) throw new NotFoundException('Hợp đồng không tồn tại');
        const can = await this.authCoreService.canUpdateContract(userId, 0 as any, {
            ownerId: contract.created_by,
            status: contract.status,
            type: contract.contract_type,
        });
        if (!can) throw new ForbiddenException('Không có quyền cập nhật hợp đồng này');
        Object.assign(contract, updateDto);
        return this.contractRepository.save(contract);
    }

    async deleteContract(id: number, userId: number): Promise<void> {
        const contract = await this.contractRepository.findOne({ where: { id: String(id) } as any });
        if (!contract) throw new NotFoundException('Hợp đồng không tồn tại');
        const can = await this.authCoreService.canDeleteContract(userId, 0 as any, {
            ownerId: contract.created_by,
            status: contract.status,
        });
        if (!can) throw new ForbiddenException('Không có quyền xóa hợp đồng này');
        await this.contractRepository.update(String(id), { deleted_at: new Date(), deleted_by: String(userId) } as any);
        await this.auditLogService.create({ contract_id: String(id), user_id: userId, action: 'DELETE_CONTRACT' });
    }

    async exportDocx(id: string, userId: number) {
        return { fileUrl: `/exports/${id}.docx` };
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
}