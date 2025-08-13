import { IsString, IsOptional, IsNumber } from 'class-validator';

export class DepartmentRequest {
    @IsString()
    name: string;

    @IsString()
    code: string;

    @IsOptional()
    @IsNumber({}, { message: 'manager_id must be a number' })
    manager_id?: number;
}
