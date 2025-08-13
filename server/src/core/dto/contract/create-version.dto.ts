import { IsOptional, IsString, IsBoolean } from 'class-validator';
export class CreateVersionDto {
    @IsOptional() @IsString() note?: string;
    @IsOptional() @IsBoolean() publish?: boolean;
}
