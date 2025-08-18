import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuardAccess } from '@/modules/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/core/shared/decorators/setmeta.decorator';
import type { HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';
import { CollaboratorService } from './collaborator.service';
import { CollaboratorRoles } from '@/core/shared/decorators/setmeta.decorator';
import { CollaboratorRole } from '@/core/domain/permission/collaborator-role.enum';

@Controller('contracts')
@UseGuards(AuthGuardAccess)
@ApiTags('contracts')
@ApiBearerAuth()
export class CollaboratorController {
    constructor(private readonly collab: CollaboratorService) {}

    @Post(':id/collaborators')
    @ApiOperation({ summary: 'Add or reactivate a collaborator on a contract' })
    @ApiParam({ name: 'id', type: String })
    @CollaboratorRoles(CollaboratorRole.OWNER)
    async add(
        @Param('id') contractId: string,
        @Body() body: { user_id: number; role: CollaboratorRole; assignment_note?: string },
        @CurrentUser() user: HeaderUserPayload,
    ) {
        const saved = await this.collab.add(
            contractId,
            Number(body.user_id),
            body.role,
            Number(user.sub),
            { assignment_note: body.assignment_note },
        );
        return saved;
    }

    @Get(':id/collaborators')
    @ApiOperation({ summary: 'List collaborators' })
    @ApiParam({ name: 'id', type: String })
    async list(@Param('id') contractId: string, @Query() query: any) {
        // TODO: apply filters from query if needed
        const rows = await this.collab.list(contractId);
        return { data: rows, pagination: { page: 1, limit: rows.length, total: rows.length, total_pages: 1 } } as any;
    }

    private parseCollaboratorId(collaboratorId: string): { contract_id: string; user_id: number } {
        const [contract_id, userStr] = (collaboratorId || '').split('_');
        return { contract_id, user_id: parseInt(userStr) } as any;
    }

    @Patch('collaborators/:collaboratorId')
    @ApiOperation({ summary: 'Update collaborator role or deactivate' })
    @ApiParam({ name: 'collaboratorId', description: 'Format: <contract_id>_<user_id>', type: String })
    @CollaboratorRoles(CollaboratorRole.OWNER)
    async update(
        @Param('collaboratorId') collaboratorId: string,
        @Body() body: { role?: CollaboratorRole; active?: boolean },
        @CurrentUser() user: HeaderUserPayload,
    ) {
        const { contract_id, user_id } = this.parseCollaboratorId(collaboratorId);
        if (typeof body.active === 'boolean' && body.active === false) {
            return this.collab.remove(contract_id, user_id, Number(user.sub));
        }
        if (body.role) {
            return this.collab.updateRole(contract_id, user_id, body.role, Number(user.sub));
        }
        return { ok: true } as any;
    }

    @Delete('collaborators/:collaboratorId')
    @ApiOperation({ summary: 'Remove collaborator (revoke access)' })
    @ApiParam({ name: 'collaboratorId', description: 'Format: <contract_id>_<user_id>', type: String })
    @CollaboratorRoles(CollaboratorRole.OWNER)
    async remove(@Param('collaboratorId') collaboratorId: string, @CurrentUser() user: HeaderUserPayload) {
        const { contract_id, user_id } = this.parseCollaboratorId(collaboratorId);
        await this.collab.remove(contract_id, user_id, Number(user.sub));
        return { message: 'Removed' } as any;
    }

    @Post(':id/transfer-ownership')
    @ApiOperation({ summary: 'Transfer contract ownership to another collaborator' })
    @ApiParam({ name: 'id', type: String })
    @CollaboratorRoles(CollaboratorRole.OWNER)
    async transfer(
        @Param('id') contractId: string,
        @Body() body: { from_user_id: number; to_user_id: number },
        @CurrentUser() user: HeaderUserPayload,
    ) {
        await this.collab.transferOwnership(
            contractId,
            Number(body.from_user_id),
            Number(body.to_user_id),
            Number(user.sub),
        );
        return { success: true, message: 'Ownership transferred' } as any;
    }

    @Get(':id/permissions')
    @ApiOperation({ summary: 'Get effective collaborator permissions for current user' })
    @ApiParam({ name: 'id', type: String })
    async getPermissions(@Param('id') contractId: string, @CurrentUser() user: HeaderUserPayload) {
        const uid = Number(user.sub);
        const [is_owner, can_edit, can_review, can_view] = await Promise.all([
            this.collab.isOwner(contractId, uid),
            this.collab.canEdit(contractId, uid),
            this.collab.canReview(contractId, uid),
            this.collab.canView(contractId, uid),
        ]);
        return { permissions: { is_owner, can_edit, can_review, can_view } } as any;
    }
}
