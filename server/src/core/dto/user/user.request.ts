// src/core/dto/user/create-user.dto.ts
import { IsString, IsEnum, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Role } from '../../shared/enums/base.enums';

export class CreateUserRequest {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @IsOptional()
    @IsNumber()
    department_id?: number;

    @IsBoolean()
    is_department_manager: boolean;
}
