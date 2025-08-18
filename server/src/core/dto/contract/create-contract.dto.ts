// src/modules/contracts/dto/create-contract.dto.ts
import { IsString, IsOptional, IsEnum, IsUUID, IsBoolean } from 'class-validator';
import { ContractMode, ContractPriority } from '../../domain/contract/contract.entity';

export class CreateContractDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    contract_code?: string;

    @IsOptional()
    @IsString()
    contract_type?: string;

    @IsOptional()
    @IsEnum(ContractPriority)
    priority?: ContractPriority;

    @IsEnum(ContractMode)
    mode: ContractMode;

    @IsOptional()
    @IsUUID()
    template_id?: string;

    @IsOptional()
    @IsBoolean()
    is_public?: boolean;
}
