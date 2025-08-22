// src/modules/contracts/contracts.controller.ts
import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    UseGuards,
    Delete,
    HttpCode,
    HttpStatus,
    Inject,
    Query,
    Put,
} from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractPolicyService } from './contract-policy.service';

import { CurrentUser, Roles } from '@/core/shared/decorators/setmeta.decorator';
import type { HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';
import { CollaboratorGuard } from '../auth/guards/collaborator.guard';
import { CollaboratorRoles } from '@/core/shared/decorators/setmeta.decorator';
import { CollaboratorRole } from '@/core/domain/permission/collaborator-role.enum';
import { CreateContractDto } from '@/core/dto/contract/create-contract.dto';
import { AuthGuardAccess } from '../auth/guards/jwt-auth.guard';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { Role } from '@/core/shared/enums/base.enums';
import { RolesGuard } from '@/modules/auth/guards/role.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractTemplate } from '@/core/domain/contract/contract-template.entity';
import { StageSaveDto } from '@/core/dto/contract/stage-save.dto';
import { listDepartmentBlocks } from '@/core/lib/department/blocks/department-blocks.registry';

@Controller('contracts')
@UseGuards(AuthGuardAccess, RolesGuard)
export class ContractController {
    constructor(
        private readonly contractService: ContractService,
        private readonly policy: ContractPolicyService,
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        @InjectRepository(ContractTemplate) private readonly templateRepo: Repository<ContractTemplate>,
    ) {}

    @Post()
    async create(@Body() body: CreateContractDto, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.create(body, { userId: Number(user.sub) });
    }

    @Get()
    async getAllContracts(
        @CurrentUser() user: HeaderUserPayload,
        @Query('query') query?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('page') page: number = 1,
        @Query('size') size: number = 20,
        @Query('asc') asc?: boolean,
        @Query('type') type?: string,
        @Query('status') status?: string,
        @Query('department_id') departmentId?: number,
    ) {
        return this.contractService.getAllContracts(
            user,
            { query, startDate, endDate, page: Number(page), size: Number(size) } as any,
            type,
            status,
            asc,
            departmentId,
        );
    }

    // === Stage save & transition (for Draft flow) ===
    @Patch(':id/stage/:stage/save')
    @UseGuards(CollaboratorGuard)
    @CollaboratorRoles(
        CollaboratorRole.OWNER,
        CollaboratorRole.EDITOR,
        CollaboratorRole.REVIEWER,
        CollaboratorRole.VIEWER,
    )
    @HttpCode(HttpStatus.OK)
    async saveStage(
        @Param('id') id: string,
        @Param('stage') stage: string,
        @Body() payload: StageSaveDto,
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.contractService.saveStage(id, stage, { data: payload.data }, Number(user.sub));
    }

    @Post(':id/transition')
    @UseGuards(CollaboratorGuard)
    @CollaboratorRoles(
        CollaboratorRole.OWNER,
        CollaboratorRole.EDITOR,
        CollaboratorRole.REVIEWER,
        CollaboratorRole.VIEWER,
    )
    @HttpCode(HttpStatus.OK)
    async transition(
        @Param('id') id: string,
        @Body() body: { from: string; to: string },
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.contractService.transitionStage(id, body.from, body.to, Number(user.sub));
    }

    // === Department blocks (for Stage Milestones UI)
    @Get(':id/departments/blocks')
    @UseGuards(CollaboratorGuard)
    @CollaboratorRoles(
        CollaboratorRole.OWNER,
        CollaboratorRole.EDITOR,
        CollaboratorRole.REVIEWER,
        CollaboratorRole.VIEWER,
    )
    async getDepartmentBlocks(@Param('id') id: string) {
        // For now return static HC & KT blocks; later tailor by contract type/status
        return { blocks: listDepartmentBlocks(['HC', 'KT']) } as any;
    }

    @Get(':id/departments/catalog')
    @UseGuards(CollaboratorGuard)
    @CollaboratorRoles(
        CollaboratorRole.OWNER,
        CollaboratorRole.EDITOR,
        CollaboratorRole.REVIEWER,
        CollaboratorRole.VIEWER,
    )
    async getDepartmentCatalog(@Param('id') id: string, @Query('department') dept?: string) {
        const departments = (dept ? [dept] : ['HC', 'KT']).map((d) => d.toUpperCase());
        const items = departments.flatMap((d) => (listDepartmentBlocks([d]) || []));
        return {
            departments,
            items,
        } as any;
    }

    // === Draft routes (migrated) ===
    @Get('drafts')
    async listDrafts(@Query() query: any, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.listDrafts(query || {}, Number(user.sub));
    }
    @Get('drafts/:id')
    async getDraft(@Param('id') id: string) {
        return this.contractService.getDraft(id);
    }
    @Post('drafts')
    async createDraft(@Body() body: any, @CurrentUser() user: HeaderUserPayload) {
        const name = body?.contractData?.name || 'Untitled Contract';
        const mode = body?.flow?.selectedMode || body?.contractData?.content?.mode || 'basic';
        const template_id = body?.contractData?.content?.templateId || body?.selectedTemplate?.id;
        return this.contractService.createDraft(
            {
                name,
                contract_code: body?.contractData?.contractCode,
                contract_type: body?.contractData?.contractType || 'custom',
                category: body?.contractData?.category || 'business',
                priority: body?.contractData?.priority || 'medium',
                mode,
                template_id,
                initialData: body?.contractData || undefined,
            },
            Number(user.sub),
        );
    }
    @Patch('drafts/:id')
    async updateDraft(@Param('id') id: string, @Body() updates: any, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.updateDraft(id, updates, Number(user.sub));
    }
    @Delete('drafts/:id')
    async deleteDraft(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.deleteDraft(id, Number(user.sub));
    }

    @Get(':id')
    @UseGuards(CollaboratorGuard)
    @CollaboratorRoles(
        CollaboratorRole.OWNER,
        CollaboratorRole.EDITOR,
        CollaboratorRole.REVIEWER,
        CollaboratorRole.VIEWER,
    )
    async get(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.getContract(id, Number(user.sub));
    }

    @Patch(':id')
    @UseGuards(CollaboratorGuard)
    @CollaboratorRoles(CollaboratorRole.OWNER, CollaboratorRole.EDITOR)
    async update(
        @Param('id') id: string,
        @Body() body: Partial<CreateContractDto>,
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.contractService.updateContract(id, body, Number(user.sub));
    }

    @Delete(':id')
    @UseGuards(CollaboratorGuard)
    @CollaboratorRoles(CollaboratorRole.OWNER)
    async remove(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.softDelete(id, Number(user.sub));
    }

    @Get(':id/preview')
    @UseGuards(CollaboratorGuard)
    @CollaboratorRoles(
        CollaboratorRole.OWNER,
        CollaboratorRole.EDITOR,
        CollaboratorRole.REVIEWER,
        CollaboratorRole.VIEWER,
    )
    async preview(@Param('id') id: string) {
        return this.contractService.generatePrintView(id);
    }

    // ===== AUDIT LOG =====
    @Get(':id/audit')
    @UseGuards(CollaboratorGuard)
    @CollaboratorRoles(
        CollaboratorRole.OWNER,
        CollaboratorRole.EDITOR,
        CollaboratorRole.REVIEWER,
        CollaboratorRole.VIEWER,
    )
    async getAuditLogs(@Param('id') id: string, @Query() query: any) {
        return this.contractService.getAuditLogs(id, query);
    }

    @Get(':id/audit/summary')
    @UseGuards(CollaboratorGuard)
    @CollaboratorRoles(
        CollaboratorRole.OWNER,
        CollaboratorRole.EDITOR,
        CollaboratorRole.REVIEWER,
        CollaboratorRole.VIEWER,
    )
    async getAuditSummary(@Param('id') id: string) {
        return this.contractService.getAuditSummary(id);
    }

    // ===== APPROVAL FLOW (MANAGER ONLY) =====
    @Post(':id/approve')
    @Roles(Role.MANAGER)
    async approve(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.updateStatus('contract', id, 'approved');
    }
    @Post(':id/reject')
    @Roles(Role.MANAGER)
    async reject(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.updateStatus('contract', id, 'rejected');
    }

    // ===== VERSIONS =====
    @Get(':id/versions')
    async listVersions(@Param('id') id: string) {
        return this.contractService.listVersions(id);
    }
    @Get(':id/versions/:versionId')
    async getVersion(@Param('id') id: string, @Param('versionId') versionId: string) {
        return this.contractService.getVersion(id, versionId);
    }

    // ===== VERSION DIFF & ROLLBACK =====
    @Get(':id/versions/:versionId/diff')
    @UseGuards(CollaboratorGuard)
    @CollaboratorRoles(
        CollaboratorRole.OWNER,
        CollaboratorRole.EDITOR,
        CollaboratorRole.REVIEWER,
        CollaboratorRole.VIEWER,
    )
    async diffVersion(@Param('id') id: string, @Param('versionId') versionId: string, @Query('target') target: string) {
        return this.contractService.diffVersions(id, versionId, target);
    }

    @Post(':id/versions/:versionId/rollback')
    @UseGuards(CollaboratorGuard)
    @CollaboratorRoles(CollaboratorRole.OWNER, CollaboratorRole.EDITOR)
    async rollbackVersion(
        @Param('id') id: string,
        @Param('versionId') versionId: string,
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.contractService.rollbackToVersion(id, versionId, Number(user.sub));
    }

    // Reviewer routes
    @Post(':id/reviews')
    @UseGuards(CollaboratorGuard)
    @CollaboratorRoles(CollaboratorRole.REVIEWER, CollaboratorRole.OWNER, CollaboratorRole.EDITOR)
    async submitReview(
        @Param('id') id: string,
        @Body() body: { summary: string; status: 'approved' | 'changes_requested' },
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.contractService.submitReview(id, body, Number(user.sub));
    }

    // ===== EXPORT & PRINT =====
    @Get(':id/export/pdf')
    @UseGuards(CollaboratorGuard)
    @CollaboratorRoles(CollaboratorRole.OWNER, CollaboratorRole.EDITOR)
    async exportPdf(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.exportPdf(id, Number(user.sub));
    }
    @Get(':id/export/docx')
    @UseGuards(CollaboratorGuard)
    @CollaboratorRoles(CollaboratorRole.OWNER, CollaboratorRole.EDITOR)
    async exportDocx(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.exportDocx(id, Number(user.sub));
    }

    @Get(':id/print')
    @UseGuards(CollaboratorGuard)
    @CollaboratorRoles(
        CollaboratorRole.OWNER,
        CollaboratorRole.EDITOR,
        CollaboratorRole.REVIEWER,
        CollaboratorRole.VIEWER,
    )
    async printContract(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.generatePrintView(id, Number(user.sub));
    }

    // ===== NOTIFICATION & REMINDERS =====
    @Post(':id/notifications')
    @UseGuards(CollaboratorGuard)
    @CollaboratorRoles(CollaboratorRole.OWNER, CollaboratorRole.EDITOR)
    async createNotification(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.createNotification(id, dto, Number(user.sub));
    }

    @Get(':id/notifications')
    async listNotifications(@Param('id') id: string) {
        return this.contractService.listNotifications(id);
    }

    @Post(':id/reminders')
    @UseGuards(CollaboratorGuard)
    @CollaboratorRoles(CollaboratorRole.OWNER, CollaboratorRole.EDITOR)
    async updateReminder(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.createReminder(id, dto, Number(user.sub));
    }

    @Get(':id/reminders')
    async listReminders(@Param('id') id: string) {
        return this.contractService.getRemindersByContract(id);
    }

    // Unified capabilities for UI
    @Get(':id/permissions')
    @UseGuards(CollaboratorGuard)
    @CollaboratorRoles(
        CollaboratorRole.OWNER,
        CollaboratorRole.EDITOR,
        CollaboratorRole.REVIEWER,
        CollaboratorRole.VIEWER,
    )
    async getPermissions(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
        const caps = await this.policy.getCapabilities(id, user);
        return { permissions: caps } as any;
    }

    // === Templates (migrated) ===
    @Get('templates')
    @Roles(Role.MANAGER)
    async listTemplates() {
        return this.templateRepo.find({ where: { is_active: true } as any, order: { created_at: 'DESC' as any } });
    }
    @Get('templates/:id')
    @Roles(Role.MANAGER)
    async getTemplate(@Param('id') id: string) {
        return this.templateRepo.findOne({ where: { id } });
    }
    @Post('templates')
    @Roles(Role.MANAGER)
    async createTemplate(@Body() body: Partial<ContractTemplate>, @CurrentUser() user: HeaderUserPayload) {
        const ent = this.templateRepo.create({
            ...body,
            created_by: String(user.sub),
            updated_by: String(user.sub),
        } as any);
        return this.templateRepo.save(ent);
    }
    @Patch('templates/:id')
    @Roles(Role.MANAGER)
    async updateTemplate(
        @Param('id') id: string,
        @Body() body: Partial<ContractTemplate>,
        @CurrentUser() user: HeaderUserPayload,
    ) {
        await this.templateRepo.update({ id } as any, { ...body, updated_by: String(user.sub) } as any);
        return this.templateRepo.findOne({ where: { id } });
    }
    @Delete('templates/:id')
    @Roles(Role.MANAGER)
    async removeTemplate(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
        await this.templateRepo.update({ id } as any, { is_active: false, updated_by: String(user.sub) } as any);
        return { ok: true } as any;
    }
}
