import { IsString, IsOptional, IsArray, IsObject, IsBoolean, IsEnum } from 'class-validator';

export enum TemplateType {
    FORM = 'form',
    EDITOR = 'editor',
    HYBRID = 'hybrid',
}

export enum TemplateCategory {
    EMPLOYMENT = 'employment',
    SERVICE = 'service',
    PARTNERSHIP = 'partnership',
    PURCHASE = 'purchase',
    LEASE = 'lease',
    OTHER = 'other',
}

export class CreateTemplateDto {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsEnum(TemplateType)
    type: TemplateType;

    @IsEnum(TemplateCategory)
    category: TemplateCategory;

    @IsObject()
    structure: any; // Template structure with fields, validation rules

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    @IsBoolean()
    is_active?: boolean = true;

    @IsOptional()
    @IsString()
    version?: string = '1.0.0';
}

export class UpdateTemplateDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(TemplateType)
    type?: TemplateType;

    @IsOptional()
    @IsEnum(TemplateCategory)
    category?: TemplateCategory;

    @IsOptional()
    @IsObject()
    structure?: any;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsString()
    version?: string;
}

export class TemplateQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(TemplateType)
    type?: TemplateType;

    @IsOptional()
    @IsEnum(TemplateCategory)
    category?: TemplateCategory;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}
