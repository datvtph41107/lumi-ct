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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
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
import { RolesGuard } from '@/modules/auth/guards/role.guard';

@Controller('contracts')
@UseGuards(AuthGuardAccess, RolesGuard)
@ApiTags('contracts')
@ApiBearerAuth()
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
    @ApiOperation({ summary: 'List contract versions' })
    @ApiParam({ name: 'id', type: String })
    async listVersions(@Param('id') id: string) {
        return this.contractService.listVersions(id);
    }
    @Get(':id/versions/:versionId')
    @ApiOperation({ summary: 'Get version by id' })
    @ApiParam({ name: 'id', type: String })
    @ApiParam({ name: 'versionId', type: String })
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
    @ApiOperation({ summary: 'Compare two versions' })
    @ApiParam({ name: 'id', type: String })
    @ApiParam({ name: 'versionId', description: 'Source version id', type: String })
    @ApiQuery({ name: 'target', description: 'Target version id', type: String, required: true })
    async diffVersion(
        @Param('id') id: string,
        @Param('versionId') versionId: string,
        @Query('target') target: string,
    ) {
        return this.contractService.diffVersions(id, versionId, target);
    }

    @Post(':id/versions/:versionId/rollback')
    @UseGuards(CollaboratorGuard)
    @CollaboratorRoles(CollaboratorRole.OWNER, CollaboratorRole.EDITOR)
    @ApiOperation({ summary: 'Rollback contract content to a specific version (creates a new version)' })
    @ApiParam({ name: 'id', type: String })
    @ApiParam({ name: 'versionId', description: 'Version id to rollback to', type: String })
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
        return this.contractService.listReminders(id);
    }
}
