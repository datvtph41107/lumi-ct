import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { TemplateService } from './template.service';
import { AuthGuardAccess } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/core/shared/decorators/setmeta.decorator';
import { HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';
import type { ApiResponse } from '@/core/shared/types/common.types';

@Controller('contracts/templates')
@UseGuards(AuthGuardAccess)
export class TemplateController {
    constructor(private readonly templateService: TemplateService) {}

    @Get()
    async listTemplates(@Query() query: any, @CurrentUser() user: HeaderUserPayload): Promise<ApiResponse> {
        const result = await this.templateService.listTemplates(query, (user as any).department?.id);
        return { success: true, message: 'OK', data: result } as any;
    }

    @Get(':id')
    async getTemplate(@Param('id') id: string): Promise<ApiResponse> {
        const result = await this.templateService.getTemplate(id);
        return { success: true, message: 'OK', data: result } as any;
    }

    @Post()
    async createTemplate(@Body() body: any, @CurrentUser() user: HeaderUserPayload): Promise<ApiResponse> {
        const result = await this.templateService.createTemplate(body, Number(user.sub));
        return { success: true, message: 'Created', data: result } as any;
    }

    @Post(':id/publish')
    async publish(
        @Param('id') id: string,
        @Body() body: { versionId?: string },
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.templateService.publishTemplate(id, body || {}, Number(user.sub));
    }

    @Post(':id/preview')
    async preview(
        @Param('id') _id: string,
        @Body() body: { content?: any; versionId?: string; mockData?: Record<string, any> },
    ) {
        return this.templateService.previewTemplate(body || {});
    }

    @Post(':id/versions/:versionId/diff')
    async diff(
        @Param('id') id: string,
        @Param('versionId') versionId: string,
        @Body() body: { targetVersionId: string },
    ) {
        return this.templateService.diffVersions(id, versionId, (body || {}).targetVersionId);
    }

    @Post(':id/versions/:versionId/rollback')
    async rollback(
        @Param('id') id: string,
        @Param('versionId') versionId: string,
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.templateService.rollbackToVersion(id, versionId, Number(user.sub));
    }

    // Clone endpoint disabled until implementation is ready

    @Patch(':id')
    async updateTemplate(
        @Param('id') id: string,
        @Body() body: any,
        @CurrentUser() user: HeaderUserPayload,
    ): Promise<ApiResponse> {
        const result = await this.templateService.updateTemplate(id, body, Number(user.sub));
        return { success: true, message: 'Updated', data: result } as any;
    }

    @Delete(':id')
    async deleteTemplate(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload): Promise<ApiResponse> {
        const result = await this.templateService.deleteTemplate(id, Number(user.sub));
        return { success: true, message: 'Deleted', data: result } as any;
    }

    @Get(':id/versions')
    async listVersions(@Param('id') id: string): Promise<ApiResponse> {
        const result = await this.templateService.listVersions(id);
        return { success: true, message: 'OK', data: result } as any;
    }

    @Post(':id/versions')
    async createVersion(
        @Param('id') id: string,
        @Body() payload: { content?: any; placeholders?: any; changelog?: string; draft?: boolean },
        @CurrentUser() user: HeaderUserPayload,
    ) {
        return this.templateService.createVersion(id, payload, Number(user.sub));
    }
}
