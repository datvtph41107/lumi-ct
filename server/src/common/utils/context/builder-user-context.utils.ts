import { Department } from '@/core/domain/department';
import type { User } from '@/core/domain/user';
import { UserContext } from '@/core/shared/types/auth.types';
import type { DataSource } from 'typeorm';
import { Role } from '@/core/shared/enums/base.enums';

export async function buildUserContext(user: User, db: DataSource): Promise<UserContext> {
    const departmentRepo = db.getRepository(Department);
    const department = user.department_id ? await departmentRepo.findOne({ where: { id: user.department_id } }) : null;

    const isManager = user.role === Role.MANAGER;
    const capabilities = { is_manager: isManager };

    return { capabilities, department };
}
