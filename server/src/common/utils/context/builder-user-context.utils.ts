import { Department } from '@/core/domain/department';
import { UserPermission } from '@/core/domain/permission';
import type { User } from '@/core/domain/user';
import type { DataSource } from 'typeorm';

export interface UserContext {
    permissions: {
        create_contract: boolean;
        create_report: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
        approve: boolean;
        assign: boolean;
    };
    department: Department | null;
}

export async function buildUserContext(user: User, db: DataSource): Promise<UserContext> {
    const permissionRepo = db.getRepository(UserPermission);
    const permissions = await permissionRepo.findOne({ where: { user_id: user.id } });

    const departmentRepo = db.getRepository(Department);
    const department = user.department_id ? await departmentRepo.findOne({ where: { id: user.department_id } }) : null;

    return {
        permissions: {
            create_contract: permissions?.create_contract ?? false,
            create_report: permissions?.create_report ?? false,
            read: permissions?.read ?? false,
            update: permissions?.update ?? false,
            delete: permissions?.delete ?? false,
            approve: permissions?.approve ?? false,
            assign: permissions?.assign ?? false,
        },
        department,
    };
}
