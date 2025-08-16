// src/modules/contracts/contracts.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
		private readonly notificationService: NotificationService,
		private readonly auditLogService: AuditLogService,
		private readonly collaboratorService: CollaboratorService,
	) {}

	// Helper to check access without ORM relations
	private async assertCanReadContract(userId: number, contract: Contract): Promise<void> {
		const isOwner = contract.created_by && String(contract.created_by) === String(userId);
		if (isOwner) return;
		const collab = await this.collaboratorRepository.findOne({ where: { contract_id: contract.id, user_id: userId, active: true } });
		if (!collab) {
			throw new ForbiddenException('Không có quyền xem hợp đồng này');
		}
	}

	// CRUD simplified without relations/joins
	async create(body: Partial<Contract>, ctx: { userId: number }) {
		const ent = this.contractRepository.create({
			name: body.name!,
			contract_code: body.contract_code,
			contract_type: body.contract_type || 'general',
			category: body.category || 'general',
			priority: body.priority as any,
			mode: body.mode as any,
			status: 'draft' as any,
			current_stage: 'draft',
			created_by: String(ctx.userId),
		});
		const saved = await this.contractRepository.save(ent);
		await this.collaboratorRepository.save(
			this.collaboratorRepository.create({ contract_id: saved.id, user_id: ctx.userId, role: 'owner' as any, active: true }),
		);
		await this.auditLogService.create({ contract_id: saved.id, user_id: ctx.userId, action: 'CREATE_CONTRACT' });
		return saved;
	}

	async listContracts(query: any, userId: number) {
		const qb = this.contractRepository.createQueryBuilder('c').where('c.deleted_at IS NULL');
		if (query.status) qb.andWhere('c.status = :status', { status: query.status });
		if (query.type) qb.andWhere('c.contract_type = :type', { type: query.type });
		if (query.search) qb.andWhere('(c.name ILIKE :kw OR c.contract_code ILIKE :kw)', { kw: `%${query.search}%` });
		// Scope by access: owner or collaborator
		qb.andWhere(
			'(c.created_by = :userId OR EXISTS (SELECT 1 FROM collaborators col WHERE col.contract_id = c.id AND col.user_id = :userId AND col.active = true))',
			{ userId },
		);
		const page = parseInt(query.page || '1', 10);
		const limit = parseInt(query.limit || '10', 10);
		const [data, total] = await qb.orderBy('c.updated_at', 'DESC').skip((page - 1) * limit).take(limit).getManyAndCount();
		return { data, total, page, limit };
	}

	async getContract(id: string) {
		const c = await this.contractRepository.findOne({ where: { id } });
		if (!c) throw new NotFoundException('Hợp đồng không tồn tại');
		return c;
	}

	async updateContract(id: string, body: Partial<Contract>, userId: number) {
		const c = await this.contractRepository.findOne({ where: { id } });
		if (!c) throw new NotFoundException('Hợp đồng không tồn tại');
		await this.assertCanReadContract(userId, c);
		Object.assign(c, body);
		const saved = await this.contractRepository.save(c);
		await this.auditLogService.create({ contract_id: id, user_id: userId, action: 'UPDATE_CONTRACT' });
		return saved;
	}

	async softDelete(id: string, userId: number) {
		const c = await this.contractRepository.findOne({ where: { id } });
		if (!c) throw new NotFoundException('Hợp đồng không tồn tại');
		await this.assertCanReadContract(userId, c);
		c.deleted_at = new Date();
		c.deleted_by = String(userId);
		await this.contractRepository.save(c);
		await this.auditLogService.create({ contract_id: id, user_id: userId, action: 'DELETE_CONTRACT' });
		return { success: true };
	}

	// Milestones/Tasks simplified
	async createMilestone(contractId: string, dto: any, userId: number) {
		const c = await this.contractRepository.findOne({ where: { id: contractId } });
		if (!c) throw new NotFoundException('Hợp đồng không tồn tại');
		await this.assertCanReadContract(userId, c);
		const ent = this.milestoneRepository.create({ ...dto, contract_id: contractId, status: dto.status || 'pending', priority: dto.priority || 'medium' });
		const saved = await this.milestoneRepository.save(ent);
		await this.auditLogService.create({ contract_id: contractId, user_id: userId, action: 'CREATE_MILESTONE' });
		return saved;
	}

	async updateMilestone(mid: string, dto: any, userId: number) {
		const m = await this.milestoneRepository.findOne({ where: { id: mid } });
		if (!m) throw new NotFoundException('Milestone không tồn tại');
		const c = await this.contractRepository.findOne({ where: { id: m.contract_id } });
		if (!c) throw new NotFoundException('Hợp đồng không tồn tại');
		await this.assertCanReadContract(userId, c);
		Object.assign(m, dto);
		return this.milestoneRepository.save(m);
	}

	async deleteMilestone(mid: string, userId: number) {
		const m = await this.milestoneRepository.findOne({ where: { id: mid } });
		if (!m) throw new NotFoundException('Milestone không tồn tại');
		const c = await this.contractRepository.findOne({ where: { id: m.contract_id } });
		if (!c) throw new NotFoundException('Hợp đồng không tồn tại');
		await this.assertCanReadContract(userId, c);
		await this.milestoneRepository.delete(mid);
		await this.notificationService.cancelRemindersByMilestone(mid);
		await this.auditLogService.create({ contract_id: c.id, user_id: userId, action: 'DELETE_MILESTONE' });
		return { success: true };
	}

	async createTask(mid: string, dto: any, userId: number) {
		const m = await this.milestoneRepository.findOne({ where: { id: mid } });
		if (!m) throw new NotFoundException('Milestone không tồn tại');
		const c = await this.contractRepository.findOne({ where: { id: m.contract_id } });
		if (!c) throw new NotFoundException('Hợp đồng không tồn tại');
		await this.assertCanReadContract(userId, c);
		const ent = this.taskRepository.create({ ...dto, milestone_id: mid, status: dto.status || 'pending', priority: dto.priority || 'medium' });
		const saved = await this.taskRepository.save(ent);
		await this.auditLogService.create({ contract_id: c.id, user_id: userId, action: 'CREATE_TASK' });
		return saved;
	}

	async updateTask(tid: string, dto: any, userId: number) {
		const t = await this.taskRepository.findOne({ where: { id: tid } });
		if (!t) throw new NotFoundException('Task không tồn tại');
		const m = await this.milestoneRepository.findOne({ where: { id: t.milestone_id } });
		if (!m) throw new NotFoundException('Milestone không tồn tại');
		const c = await this.contractRepository.findOne({ where: { id: m.contract_id } });
		if (!c) throw new NotFoundException('Hợp đồng không tồn tại');
		await this.assertCanReadContract(userId, c);
		Object.assign(t, dto);
		return this.taskRepository.save(t);
	}

	async deleteTask(tid: string, userId: number) {
		const t = await this.taskRepository.findOne({ where: { id: tid } });
		if (!t) throw new NotFoundException('Task không tồn tại');
		const m = await this.milestoneRepository.findOne({ where: { id: t.milestone_id } });
		if (!m) throw new NotFoundException('Milestone không tồn tại');
		const c = await this.contractRepository.findOne({ where: { id: m.contract_id } });
		if (!c) throw new NotFoundException('Hợp đồng không tồn tại');
		await this.assertCanReadContract(userId, c);
		await this.taskRepository.delete(tid);
		await this.auditLogService.create({ contract_id: c.id, user_id: userId, action: 'DELETE_TASK' });
		return { success: true };
	}
}
