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

import { CurrentUser } from '@/core/shared/decorators/setmeta.decorator';
import type { HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';
import { CollaboratorGuard } from '../auth/guards/collaborator.guard';
import { CollaboratorRoles } from '@/core/shared/decorators/setmeta.decorator';
import { CollaboratorRole } from '@/core/domain/permission/collaborator-role.enum';
import { CreateContractDto } from '@/core/dto/contract/create-contract.dto';
import { AuthGuardAccess } from '../auth/guards/jwt-auth.guard';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { Roles } from '@/core/shared/decorators/setmeta.decorator';
import { Role } from '@/core/shared/enums/base.enums';

@Controller('contracts')
@UseGuards(AuthGuardAccess)
export class ContractController {
    constructor(
        private readonly contractService: ContractService,
        @Inject('LOGGER') private readonly logger: LoggerTypes,
    ) {}

    @Post()
    async create(@Body() body: CreateContractDto, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.create(body, { userId: Number(user.sub) });
    }

    @Get()
    async list(@Query() query: any, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.listContracts(query, Number(user.sub));
    }

    @Get(':id')
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
    async remove(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.softDelete(id, Number(user.sub));
    }

    @Get(':id/preview')
    async preview(@Param('id') id: string) {
        return this.contractService.generatePrintView(id);
    }

    // ===== AUDIT LOG =====
    @Get(':id/audit')
    async getAuditLogs(@Param('id') id: string, @Query() query: any) {
        return this.contractService.getAuditLogs(id, query);
    }

    @Get(':id/audit/summary')
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

    // Reviewer routes
    @Post(':id/reviews')
    @UseGuards(CollaboratorGuard)
    @CollaboratorRoles(CollaboratorRole.REVIEWER, CollaboratorRole.OWNER)
    async submitReview(
        @Param('id') id: string,
        @Body() body: { summary: string; status: 'approved' | 'changes_requested' },
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.contractService.submitReview(id, body, Number(user.sub));
    }

    // ===== EXPORT & PRINT =====
    @Get(':id/export/pdf')
    async exportPdf(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.exportPdf(id, Number(user.sub));
    }
    @Get(':id/export/docx')
    async exportDocx(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.exportDocx(id, Number(user.sub));
    }

    @Get(':id/print')
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
        return this.contractService.listReminders(id);
    }
}
