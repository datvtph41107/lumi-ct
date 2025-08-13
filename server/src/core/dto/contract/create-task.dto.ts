// src/modules/contracts/dto/create-task.dto.ts
import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateTaskDto {
    @IsString() title: string;
    @IsOptional() @IsString() description?: string;
    @IsOptional() @IsDateString() due_at?: string;
    @IsOptional() @IsNumber() assigned_to?: number;
}
