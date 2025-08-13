// src/modules/contracts/dto/collaborator.dto.ts
import { IsEnum, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { CollaboratorRole } from '@/core/domain/permission/collaborator-role.enum';

export class CreateCollaboratorDto {
    @IsNumber()
    user_id: number;

    @IsEnum(CollaboratorRole)
    role: CollaboratorRole;
}

export class UpdateCollaboratorDto {
    @IsOptional()
    @IsEnum(CollaboratorRole)
    role?: CollaboratorRole;

    @IsOptional()
    @IsBoolean()
    active?: boolean;
}

export class CollaboratorQueryDto {
    @IsOptional()
    @IsEnum(CollaboratorRole)
    role?: CollaboratorRole;

    @IsOptional()
    @IsBoolean()
    active?: boolean;
}
