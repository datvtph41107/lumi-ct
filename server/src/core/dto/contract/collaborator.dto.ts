// src/modules/contracts/dto/collaborator.dto.ts
import { CollaboratorRole } from '@/core/domain/permission/collaborator-role.enum';
import { IsNumber, IsEnum } from 'class-validator';

export class CreateCollaboratorDto {
    @IsNumber() user_id: number;
    @IsEnum(CollaboratorRole) role: CollaboratorRole;
}
