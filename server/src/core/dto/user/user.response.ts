import { Role, Status } from '../../shared/enums/base.enums';

export class UserResponse {
    id: number;
    name: string;
    username: string;
    status: Status;
    role: Role;
    created_at: Date;
    updated_at: Date;
}
