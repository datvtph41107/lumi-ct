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
import { ContractDraftService } from './contract-draft.service';
import { CurrentUser } from '@/core/shared/decorators/setmeta.decorator';
import type { HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';
import { CollaboratorGuard } from '../auth/guards/collaborator.guard';
import { CreateContractDto } from '@/core/dto/contract/create-contract.dto';
import { AuthGuardAccess } from '../auth/guards/jwt-auth.guard';
import { StageSaveDto } from '@/core/dto/contract/stage-save.dto';
import { CreateVersionDto } from '@/core/dto/contract/create-version.dto';
import { CreateMilestoneDto } from '@/core/dto/contract/create-milestone.dto';
import { CreateTaskDto } from '@/core/dto/contract/create-task.dto';
import { CreateCollaboratorDto } from '@/core/dto/contract/collaborator.dto';
import { LoggerTypes } from '@/core/shared/logger/logger.types';

@Controller('contracts')
@UseGuards(AuthGuardAccess)
export class ContractController {
    constructor(
        private readonly contractService: ContractService,
        private readonly contractDraftService: ContractDraftService,
        @Inject('LOGGER') private readonly logger: LoggerTypes,
    ) {}

    // ===== CONTRACT CRUD =====
    @Post()
    async create(@Body() body: CreateContractDto, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.createContract(body as any, Number(user.sub));
    }

    @Get()
    async list(@Query() query: any, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.listContracts(query as any, { page: query.page, limit: query.limit }, Number(user.sub));
    }

    @Get(':id')
    async get(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.getContract(Number(id), Number(user.sub));
    }

    @Patch(':id')
    @UseGuards(CollaboratorGuard)
    async update(
        @Param('id') id: string,
        @Body() body: Partial<CreateContractDto>,
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.contractService.updateContract(Number(id), body as any, Number(user.sub));
    }

    @Delete(':id')
    async softDelete(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.deleteContract(Number(id), Number(user.sub));
    }

    // ===== DRAFT & STAGE MANAGEMENT =====
    @Patch(':id/autosave')
    @HttpCode(HttpStatus.OK)
    async autosave(@Param('id') id: string, @Body() dto: StageSaveDto, @CurrentUser() user: HeaderUserPayload) {
        return this.contractDraftService.updateDraft(id, dto as any, Number(user.sub));
    }

    @Patch(':id/stage/:stage/save')
    @UseGuards(CollaboratorGuard)
    async saveStage(
        @Param('id') id: string,
        @Param('stage') stage: string,
        @Body() dto: StageSaveDto,
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.contractDraftService.saveStage(id, stage, dto as any, Number(user.sub));
    }

    @Get(':id/stage/:stage')
    async getStage(@Param('id') id: string, @Param('stage') stage: string) {
        return this.contractDraftService.getDraft(id);
    }

    @Post(':id/transition')
    @UseGuards(CollaboratorGuard)
    async transition(
        @Param('id') id: string,
        @Body() body: { from: string; to: string },
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.contractService.submitForReview(Number(id), Number(user.sub));
    }

    @Get(':id/preview')
    async preview(@Param('id') id: string) {
        return this.contractService.generatePrintView(id);
    }

    // ===== VERSIONING =====
    @Post(':id/versions')
    @UseGuards(CollaboratorGuard)
    async createVersion(
        @Param('id') id: string,
        @Body() dto: CreateVersionDto,
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.contractService.updateContract(Number(id), { changes: dto?.summary }, Number(user.sub));
    }

    @Get(':id/versions')
    async listVersions(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.getContract(Number(id), Number(user?.sub || 0));
    }

    @Get(':id/versions/:vid')
    async getVersion(@Param('id') id: string, @Param('vid') vid: string) {
        return { id, vid } as any; // stub
    }

    @Post(':id/versions/:vid/publish')
    @UseGuards(CollaboratorGuard)
    async publishVersion(@Param('id') id: string, @Param('vid') vid: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.updateContract(Number(id), { changes: 'publish version ' + vid } as any, Number(user.sub));
    }

    @Post(':id/versions/:vid/rollback')
    @UseGuards(CollaboratorGuard)
    async rollbackVersion(@Param('id') id: string, @Param('vid') vid: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.updateContract(Number(id), { changes: 'rollback version ' + vid } as any, Number(user.sub));
    }

    // ===== MILESTONE & TASK MANAGEMENT =====
    @Post(':id/milestones')
    @UseGuards(CollaboratorGuard)
    async createMilestone(
        @Param('id') id: string,
        @Body() dto: CreateMilestoneDto,
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.contractService.createMilestone(Number(id), dto, Number(user.sub));
    }

    @Get(':id/milestones')
    async listMilestones(@Param('id') id: string) {
        return []; // stub list until service methods implemented
    }

    @Patch('milestones/:mid')
    @UseGuards(CollaboratorGuard)
    async updateMilestone(
        @Param('mid') mid: string,
        @Body() dto: Partial<CreateMilestoneDto>,
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.contractService.updateMilestone(Number(mid), dto, Number(user.sub));
    }

    @Delete('milestones/:mid')
    @UseGuards(CollaboratorGuard)
    async deleteMilestone(@Param('mid') mid: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.deleteMilestone(mid, Number(user.sub));
    }

    @Post('milestones/:mid/tasks')
    @UseGuards(CollaboratorGuard)
    async createTask(@Param('mid') mid: string, @Body() dto: CreateTaskDto, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.createTask(mid, dto, Number(user.sub));
    }

    @Get('milestones/:mid/tasks')
    async listTasks(@Param('mid') mid: string) {
        return [];
    }

    @Patch('tasks/:tid')
    @UseGuards(CollaboratorGuard)
    async updateTask(
        @Param('tid') tid: string,
        @Body() dto: Partial<CreateTaskDto>,
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return {};
    }

    @Delete('tasks/:tid')
    @UseGuards(CollaboratorGuard)
    async deleteTask(@Param('tid') tid: string, @CurrentUser() user: HeaderUserPayload) {
        return { ok: true };
    }

    // ===== COLLABORATOR MANAGEMENT =====
    @Post(':id/collaborators')
    @UseGuards(CollaboratorGuard)
    async addCollaborator(
        @Param('id') id: string,
        @Body() dto: CreateCollaboratorDto,
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.contractService.addCollaborator(id, dto, Number(user.sub));
    }

    @Get(':id/collaborators')
    async listCollaborators(@Param('id') id: string) {
        return this.contractService.listCollaborators(id);
    }

    @Patch('collaborators/:cid')
    @UseGuards(CollaboratorGuard)
    async updateCollaborator(
        @Param('cid') cid: string,
        @Body() dto: Partial<CreateCollaboratorDto>,
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.contractService.updateCollaborator(cid, dto, Number(user.sub));
    }

    @Delete('collaborators/:cid')
    @UseGuards(CollaboratorGuard)
    async removeCollaborator(@Param('cid') cid: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.removeCollaborator(cid, Number(user.sub));
    }

    @Post(':id/transfer-ownership')
    @UseGuards(CollaboratorGuard)
    async transferOwnership(
        @Param('id') id: string,
        @Body() body: { to_user_id: number },
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.contractService.transferOwnership(id, body.to_user_id, Number(user.sub));
    }

    @Get(':id/permissions')
    async getPermissions(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.getCollaboratorPermissions(id, Number(user.sub));
    }

    // ===== FILE MANAGEMENT =====
    @Post(':id/files')
    @UseGuards(CollaboratorGuard)
    async uploadFile(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.uploadFile(id, dto, Number(user.sub));
    }

    @Get(':id/files')
    async listFiles(@Param('id') id: string) {
        return this.contractService.listFiles(id);
    }

    @Delete('files/:fid')
    @UseGuards(CollaboratorGuard)
    async deleteFile(@Param('fid') fid: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.deleteFile(fid, Number(user.sub));
    }

    // ===== APPROVAL WORKFLOW =====
    @Post(':id/approve')
    @UseGuards(CollaboratorGuard)
    async approveContract(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.approveContract(id, Number(user.sub));
    }

    @Post(':id/reject')
    @UseGuards(CollaboratorGuard)
    async rejectContract(
        @Param('id') id: string,
        @Body() body: { reason: string },
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.contractService.rejectContract(id, body.reason, Number(user.sub));
    }

    @Post(':id/request-changes')
    @UseGuards(CollaboratorGuard)
    async requestChanges(
        @Param('id') id: string,
        @Body() body: { changes: string[] },
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.contractService.requestChanges(id, body.changes, Number(user.sub));
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

    // ===== AUDIT & ANALYTICS =====
    @Get(':id/audit')
    async audit(@Param('id') id: string, @Query() query: any) {
        const filters = {
            action: query.action,
            user_id: query.user_id ? parseInt(query.user_id) : undefined,
            date_from: query.date_from ? new Date(query.date_from) : undefined,
            date_to: query.date_to ? new Date(query.date_to) : undefined,
            search: query.search,
        };

        const pagination = {
            page: query.page ? parseInt(query.page) : 1,
            limit: query.limit ? parseInt(query.limit) : 50,
        };

        return this.contractService.getAuditLogs(id, filters, pagination);
    }

    @Get(':id/audit/summary')
    async auditSummary(@Param('id') id: string) {
        return this.contractService.getAuditSummary(id);
    }

    @Get('audit/user')
    async userAuditLogs(@Query() query: any, @CurrentUser() user: HeaderUserPayload) {
        const filters = {
            action: query.action,
            date_from: query.date_from ? new Date(query.date_from) : undefined,
            date_to: query.date_to ? new Date(query.date_to) : undefined,
            search: query.search,
        };

        const pagination = {
            page: query.page ? parseInt(query.page) : 1,
            limit: query.limit ? parseInt(query.limit) : 50,
        };

        return this.contractService.getUserAuditLogs(Number(user.sub), filters, pagination);
    }

    @Get('audit/system')
    async systemAuditLogs(@Query() query: any) {
        const filters = {
            action: query.action,
            user_id: query.user_id ? parseInt(query.user_id) : undefined,
            date_from: query.date_from ? new Date(query.date_from) : undefined,
            date_to: query.date_to ? new Date(query.date_to) : undefined,
            search: query.search,
        };

        const pagination = {
            page: query.page ? parseInt(query.page) : 1,
            limit: query.limit ? parseInt(query.limit) : 50,
        };

        return this.contractService.getSystemAuditLogs(filters, pagination);
    }

    @Get(':id/analytics')
    async analytics(@Param('id') id: string) {
        return this.contractService.getContractAnalytics(id);
    }

    @Get('dashboard/stats')
    async dashboardStats(@CurrentUser() user: HeaderUserPayload) {
        return this.contractService.getDashboardStats(Number(user.sub));
    }

    // ===== TEMPLATE MANAGEMENT =====
    @Get('templates')
    async listTemplates(@Query() query: any) {
        return this.contractService.listTemplates(query);
    }

    @Get('templates/:tid')
    async getTemplate(@Param('tid') tid: string) {
        return this.contractService.getTemplate(tid);
    }

    @Post('templates')
    @UseGuards(CollaboratorGuard)
    async createTemplate(@Body() dto: any, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.createTemplate(dto, Number(user.sub));
    }

    @Patch('templates/:tid')
    @UseGuards(CollaboratorGuard)
    async updateTemplate(@Param('tid') tid: string, @Body() dto: any, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.updateTemplate(tid, dto, Number(user.sub));
    }

    @Delete('templates/:tid')
    @UseGuards(CollaboratorGuard)
    async deleteTemplate(@Param('tid') tid: string, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.deleteTemplate(tid, Number(user.sub));
    }

    // ===== NOTIFICATION & REMINDERS =====
    @Post(':id/notifications')
    @UseGuards(CollaboratorGuard)
    async createNotification(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.createNotification(id, dto, Number(user.sub));
    }

    @Get(':id/notifications')
    async listNotifications(@Param('id') id: string) {
        return this.contractService.listNotifications(id);
    }

    @Post(':id/reminders')
    @UseGuards(CollaboratorGuard)
    async updateReminder(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: HeaderUserPayload) {
        return this.contractService.createReminder(id, dto, Number(user.sub));
    }

    @Get(':id/reminders')
    async listReminders(@Param('id') id: string) {
        return this.contractService.listReminders(id);
    }
}
