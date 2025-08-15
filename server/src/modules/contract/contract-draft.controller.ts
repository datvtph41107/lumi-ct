import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuardAccess } from '../auth/guards/jwt-auth.guard';
import { ContractService } from './contract.service';
import { CurrentUser } from '@/core/shared/decorators/setmeta.decorator';
import type { HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';
import { LoggerTypes } from '@/core/shared/logger/logger.types';

@Controller('contract-drafts')
@UseGuards(AuthGuardAccess)
export class ContractDraftController {
    constructor(
        private readonly contractService: ContractService,
        @Inject('LOGGER') private readonly logger: LoggerTypes,
    ) {}

    @Get()
    async listDrafts(@Query() query: any, @CurrentUser() user: HeaderUserPayload) {
        const merged = { ...(query || {}), status: 'draft' };
        const result = await this.contractService.listContracts(merged as any, Number(user.sub));
        return {
            success: true,
            data: result.data.map((c: any) => ({
                id: c.id,
                isDraft: c.is_draft,
                contractData: {
                    name: c.name,
                    contractType: c.contract_type,
                    category: c.category,
                    priority: c.priority,
                },
                flow: {
                    id: c.id,
                    currentStage: c.current_stage || 'template_selection',
                    selectedMode: c.mode,
                    selectedTemplate: c.template_id ? { id: c.template_id } : null,
                    stageValidations: {},
                    canProceedToNext: true,
                    autoSaveEnabled: c.auto_save_enabled,
                },
                createdBy: c.created_by,
            })),
            pagination: result.pagination,
        };
    }

    @Get(':id')
    async getDraft(@Param('id') id: string) {
        const contract = await this.contractService.getContract(id);
        return {
            success: true,
            data: {
                id: contract.id,
                isDraft: contract.is_draft,
                contractData: {
                    name: contract.name,
                    contractType: contract.contract_type,
                    category: contract.category,
                    priority: contract.priority,
                    structure: (contract as any).stage_data?.content_draft?.data?.structure || undefined,
                    notes: contract.notes,
                    tags: contract.tags,
                },
                flow: {
                    id: contract.id,
                    currentStage: contract.current_stage || 'template_selection',
                    selectedMode: contract.mode,
                    selectedTemplate: contract.template_id ? { id: contract.template_id } : null,
                    stageValidations: {},
                    canProceedToNext: true,
                    autoSaveEnabled: contract.auto_save_enabled,
                    lastAutoSave: contract.last_auto_save,
                },
                createdBy: contract.created_by,
            },
        };
    }

    @Post()
    async createDraft(@Body() body: any, @CurrentUser() user: HeaderUserPayload) {
        const name = body?.contractData?.name || 'Untitled Contract';
        const mode = body?.flow?.selectedMode || body?.contractData?.content?.mode || 'basic';
        const template_id = body?.contractData?.content?.templateId || body?.selectedTemplate?.id;
        const createRes = await this.contractService.create(
            {
                name,
                contract_code: body?.contractData?.contractCode,
                contract_type: body?.contractData?.contractType || 'custom',
                category: body?.contractData?.category || 'business',
                priority: body?.contractData?.priority || 'medium',
                mode,
                template_id,
            } as any,
            { userId: Number(user.sub) },
        );

        if (body?.contractData) {
            await this.contractService.saveStage(
                createRes.id,
                'content_draft',
                { data: body.contractData } as any,
                Number(user.sub),
            );
        }

        return this.getDraft(createRes.id);
    }

    @Patch(':id')
    async updateDraft(@Param('id') id: string, @Body() updates: any, @CurrentUser() user: HeaderUserPayload) {
        const stage = updates?.flow?.currentStage || 'content_draft';
        const data = updates?.contractData || updates;
        await this.contractService.saveStage(id, stage, { data } as any, Number(user.sub));
        if (updates?.contractData?.name) {
            await this.contractService.updateContract(id, { name: updates.contractData.name } as any, Number(user.sub));
        }
        return this.getDraft(id);
    }

    @Delete(':id')
    async deleteDraft(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
        await this.contractService.softDelete(id, Number(user.sub));
        return { success: true, data: { ok: true } };
    }
}
