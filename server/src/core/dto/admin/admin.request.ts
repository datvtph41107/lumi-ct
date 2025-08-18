import { IsString, IsOptional, IsEnum, IsUUID, IsArray, IsNumber, IsBoolean } from 'class-validator';

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
}

export class CreateUserDto {
    @IsString()
    name: string;

    @IsString()
    username: string;

    @IsString()
    password: string;

    @IsNumber()
    department_id: number;

    @IsEnum(['MANAGER', 'EMPLOYEE'])
    role: string;

    @IsOptional()
    @IsBoolean()
    is_department_manager?: boolean;
}

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsNumber()
    department_id?: number;

    @IsOptional()
    @IsEnum(['MANAGER', 'EMPLOYEE'])
    role?: string;

    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;
}

export class CreateRoleDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    displayName?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    priority?: number;
}

export class UpdateRoleDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    displayName?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    priority?: number;
}

export class AssignUserRolesDto {
    @IsArray()
    @IsUUID(undefined, { each: true })
    roles: Array<{ roleId: string; scope?: string; scopeId?: number }>;
}

export class SetRolePermissionsDto {
    @IsArray()
    permissions: Array<{ resource: string; action: string; conditions?: any }>;
}

export class CreateSystemNotificationDto {
    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsString()
    type: string; // 'company_wide', 'department', 'individual'

    @IsOptional()
    @IsArray()
    @IsNumber(undefined, { each: true })
    department_ids?: number[];

    @IsOptional()
    @IsArray()
    @IsNumber(undefined, { each: true })
    user_ids?: number[];

    @IsOptional()
    @IsString()
    scheduled_at?: string;

    @IsOptional()
    @IsString()
    repeat_pattern?: string; // 'once', 'daily', 'weekly', 'monthly'
}