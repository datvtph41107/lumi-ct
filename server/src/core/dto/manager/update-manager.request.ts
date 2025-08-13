import { IsInt } from 'class-validator';

export class UpdateManagerRequest {
    @IsInt()
    id_manager: number;
}
