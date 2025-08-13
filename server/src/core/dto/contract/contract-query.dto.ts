import { IsOptional, IsString, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ContractStatus {
    DRAFT = 'draft',
    PENDING_REVIEW = 'pending_review',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    EXPIRED = 'expired',
}

export enum ContractPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
}

export class ContractQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(ContractStatus)
    status?: ContractStatus;

    @IsOptional()
    @IsEnum(ContractPriority)
    priority?: ContractPriority;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    contract_type?: string;

    @IsOptional()
    @IsString()
    drafter_id?: string;

    @IsOptional()
    @IsString()
    manager_id?: string;

    @IsOptional()
    @IsDateString()
    created_from?: string;

    @IsOptional()
    @IsDateString()
    created_to?: string;

    @IsOptional()
    @IsDateString()
    effective_from?: string;

    @IsOptional()
    @IsDateString()
    effective_to?: string;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    page?: number = 1;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    limit?: number = 10;

    @IsOptional()
    @IsString()
    sort_by?: string = 'created_at';

    @IsOptional()
    @IsString()
    sort_order?: 'asc' | 'desc' = 'desc';
}
