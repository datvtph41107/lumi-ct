import { Department } from '@/core/domain/department';
import { UserPermission } from '@/core/domain/permission/user-permission.entity';
import type { User } from '@/core/domain/user';
import { UserContext } from '@/core/shared/types/auth.types';
import type { DataSource } from 'typeorm';

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
