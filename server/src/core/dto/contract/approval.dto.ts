import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';

export class ApproveContractDto {
    @IsOptional()
    @IsString()
    comment?: string;
}

export class RejectContractDto {
    @IsString()
    @IsNotEmpty()
    reason: string;

    @IsOptional()
    @IsString()
    comment?: string;
}

export class RequestChangesDto {
    @IsArray()
    @IsString({ each: true })
    changes: string[];

    @IsOptional()
    @IsString()
    comment?: string;
}
