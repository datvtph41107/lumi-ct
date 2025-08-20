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
    async list(@Query() query: any) {
        return this.templateService.listTemplates(query || {});
    }

    @Get(':id')
    async get(@Param('id') id: string) {
        return this.templateService.getTemplate(id);
    }

    @Post()
    async create(@Body() body: any, @CurrentUser() user: HeaderUserPayload) {
        return this.templateService.createTemplate(body, Number(user.sub));
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
