import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { TemplateService } from './template.service';
import { AuthGuardAccess } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/role.guard';
import { CurrentUser } from '@/core/shared/decorators/setmeta.decorator';
import type { HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';

@Controller('contracts/templates')
@UseGuards(AuthGuardAccess, RolesGuard)
export class TemplateController {
    constructor(private readonly templateService: TemplateService) {}

    @Get()
    async list(@Query() query: any, @CurrentUser() user: HeaderUserPayload) {
        const deptId = (user as any)?.department?.id ?? null;
        return this.templateService.listTemplates(query || {}, deptId);
    }

    @Get(':id')
    async get(@Param('id') id: string) {
        return this.templateService.getTemplate(id);
    }

    @Post()
    async create(@Body() body: any, @CurrentUser() user: HeaderUserPayload) {
        const payload = { ...body, department_id: (user as any)?.department?.id ?? null };
        return this.templateService.createTemplate(payload, Number(user.sub));
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

    @Post(':id/clone')
    async clone(
        @Param('id') id: string,
        @Body() body: { name: string },
        @CurrentUser() user: HeaderUserPayload,
    ) {
        if (!body?.name) return { error: 'Missing new name' } as any;
        return this.templateService.cloneTemplate(id, body.name, Number(user.sub));
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any, @CurrentUser() user: HeaderUserPayload) {
        return this.templateService.updateTemplate(id, body, Number(user.sub));
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @CurrentUser() user: HeaderUserPayload) {
        return this.templateService.deleteTemplate(id, Number(user.sub));
    }

    @Get(':id/versions')
    async listVersions(@Param('id') id: string) {
        return this.templateService.listVersions(id);
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
