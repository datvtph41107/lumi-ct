import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuardAccess } from '../auth/guards/jwt-auth.guard';
import { ContractDraftService } from './contract-draft.service';
import { CurrentUser } from '@/core/shared/decorators/setmeta.decorator';
import type { HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';
import { LoggerTypes } from '@/core/shared/logger/logger.types';

@Controller('contract-drafts')
@UseGuards(AuthGuardAccess)
export class ContractDraftController {
    constructor(
        private readonly draftService: ContractDraftService,
        @Inject('LOGGER') private readonly logger: LoggerTypes,
    ) {}

    @Get()
    async listDrafts(@Query() query: Record<string, unknown>, @CurrentUser() user: HeaderUserPayload) {
        const result = await this.draftService.listDrafts((query || {}) as any, Number(user.sub));
        return { success: true, ...result } as const;
    }

    @Get(':id')
    async getDraft(@Param('id') id: string) {
        const data = await this.draftService.getDraft(id);
        return { success: true, data } as const;
    }

    @Post()
    async createDraft(
        @Body()
        body: {
            contractData?: {
                name?: string;
                contractCode?: string;
                contractType?: string;
                category?: string;
                priority?: string;
                content?: { mode?: string; templateId?: string };
            };
            flow?: { selectedMode?: string; currentStage?: string };
            selectedTemplate?: { id?: string } | null;
        },
        @CurrentUser() user: HeaderUserPayload,
    ) {
        const name = body?.contractData?.name || 'Untitled Contract';
        const mode = body?.flow?.selectedMode || body?.contractData?.content?.mode || 'basic';
        const template_id = body?.contractData?.content?.templateId || body?.selectedTemplate?.id;
        const result = await this.draftService.createDraft(
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
        return { success: true, data: result } as const;
    }

    @Patch(':id')
    async updateDraft(
        @Param('id') id: string,
        @Body() updates: Record<string, unknown>,
        @CurrentUser() user: HeaderUserPayload,
    ) {
        const updated = await this.draftService.updateDraft(id, updates, Number(user.sub));
        return { success: true, data: updated } as const;
    }

    @Delete(':id')
    async deleteDraft(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
        const res = await this.draftService.deleteDraft(id, Number(user.sub));
        return { success: true, data: res } as const;
    }
}
