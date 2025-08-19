import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractTemplate } from '@/core/domain/contract/contract-template.entity';
import { AuthGuardAccess } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser, Roles } from '@/core/shared/decorators/setmeta.decorator';
import type { HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';
import { RolesGuard } from '@/modules/auth/guards/role.guard';
import { Role } from '@/core/shared/enums/base.enums';

@Controller('contracts/templates')
@UseGuards(AuthGuardAccess, RolesGuard)
export class ContractTemplateController {
	constructor(@InjectRepository(ContractTemplate) private readonly repo: Repository<ContractTemplate>) {}

	@Get()
	async list() {
		const items = await this.repo.find({ where: { is_active: true } as any, order: { created_at: 'DESC' as any } });
		return items;
	}

	@Get(':id')
	async get(@Param('id') id: string) {
		return this.repo.findOne({ where: { id } });
	}

	@Post()
	@Roles(Role.MANAGER)
	async create(@Body() body: Partial<ContractTemplate>, @CurrentUser() user: HeaderUserPayload) {
		const ent = this.repo.create({ ...body, created_by: String(user.sub), updated_by: String(user.sub) } as any);
		return this.repo.save(ent);
	}

	@Patch(':id')
	@Roles(Role.MANAGER)
	async update(
		@Param('id') id: string,
		@Body() body: Partial<ContractTemplate>,
		@CurrentUser() user: HeaderUserPayload,
	) {
		await this.repo.update({ id } as any, { ...body, updated_by: String(user.sub) } as any);
		return this.repo.findOne({ where: { id } });
	}

	@Delete(':id')
	@Roles(Role.MANAGER)
	async remove(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
		await this.repo.update({ id } as any, { is_active: false, updated_by: String(user.sub) } as any);
		return { ok: true } as any;
	}
}
