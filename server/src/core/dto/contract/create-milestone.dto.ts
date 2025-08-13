// src/modules/contracts/dto/create-milestone.dto.ts
import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateMilestoneDto {
    @IsString() title: string;
    @IsOptional() @IsString() description?: string;
    @IsOptional() @IsDateString() start_at?: string;
    @IsOptional() @IsDateString() due_at?: string;
    @IsOptional() @IsNumber() assigned_to?: number;
}
