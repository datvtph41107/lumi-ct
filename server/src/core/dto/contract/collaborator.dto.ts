// src/modules/contracts/dto/collaborator.dto.ts
import { IsNumber, IsEnum } from 'class-validator';

export enum CollaboratorRoleDtoEnum {
    OWNER = 'owner',
    EDITOR = 'editor',
    REVIEWER = 'reviewer',
    VIEWER = 'viewer',
}

export class CreateCollaboratorDto {
    @IsNumber() user_id: number;
    @IsEnum(CollaboratorRoleDtoEnum) role: CollaboratorRoleDtoEnum;
}
