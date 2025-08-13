// src/modules/contracts/dto/stage-save.dto.ts
import { IsObject, IsOptional, IsBoolean } from 'class-validator';

export class StageSaveDto {
    @IsObject()
    data: any;

    @IsOptional()
    @IsBoolean()
    autoSave?: boolean;

    @IsOptional()
    clientVersionToken?: string;
}
