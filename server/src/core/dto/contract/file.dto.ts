import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';

export enum FileType {
    CONTRACT_DOCUMENT = 'contract_document',
    ATTACHMENT = 'attachment',
    TEMPLATE = 'template',
    SIGNATURE = 'signature',
}

export class UploadFileDto {
    @IsString()
    filename: string;

    @IsString()
    original_name: string;

    @IsString()
    mime_type: string;

    @IsString()
    file_path: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsEnum(FileType)
    file_type: FileType;

    @IsOptional()
    @IsUUID()
    milestone_id?: string;

    @IsOptional()
    @IsUUID()
    task_id?: string;
}

export class UpdateFileDto {
    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    filename?: string;
}
