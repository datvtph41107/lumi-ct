export class ManagerInfo {
    id: number;
    name: string;
    username: string;
    created_at: Date;
    updated_at: Date;
}

export class DepartmentResponse {
    id: number;
    name: string;
    code: string;
    created_at: Date;
    updated_at: Date;
    manager: ManagerInfo | null;
}
