import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class LoginDto {
    @IsString()
    username: string;

    @IsString()
    password: string;

    @IsOptional()
    @IsBoolean()
    isManager?: boolean;
}
