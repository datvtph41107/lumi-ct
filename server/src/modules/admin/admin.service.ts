import { Department } from '@/core/domain/department';
import { User } from '@/core/domain/user';
import { DepartmentResponse, ManagerInfo } from '@/core/dto/department/department.response';
import { CreateUserRequest } from '@/core/dto/user/user.request';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Role, Status } from '@/core/shared/enums/base.enums';
// import { UserPermission } from '@/core/domain/permission';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ERROR_MESSAGES } from '@/core/shared/constants/error-message';
import { UserPermission } from '@/core/domain/permission';
import { UserPermissionFactory } from '@/common/utils/user-permission-factory,utils';

@Injectable()
export class AdminService {
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        @Inject('DATA_SOURCE') private readonly db: DataSource,
    ) {}

    async getAllDepartments(): Promise<DepartmentResponse[]> {
        const repo = this.db.getRepository(Department);
        const departments = await repo.find({
            select: ['id', 'name', 'code', 'created_at', 'updated_at', 'manager_id'],
        });

        if (!departments.length) {
            this.logger.APP.info('No departments found');
            throw new BadRequestException(ERROR_MESSAGES.DEPARTMENT.NOT_FOUND);
        }

        const result: DepartmentResponse[] = [];
        //  const groupDepartments: Array<Department & { manager: Partial<User> | null }> = [];
        for (const dept of departments) {
            const manager = await this.getManagerInfo(dept.manager_id);
            result.push({
                id: dept.id,
                name: dept.name,
                code: dept.code,
                created_at: dept.created_at,
                updated_at: dept.updated_at,
                manager,
            });
        }

        return result;
    }

    async getOneDepartment(id: number): Promise<DepartmentResponse> {
        try {
            const repo = this.db.getRepository(Department);
            const department = await repo.findOne({
                where: { id },
                select: ['id', 'name', 'code', 'created_at', 'updated_at'],
            });

            if (!department) {
                this.logger.APP.info(`Department with id ${id} not found`);
                throw new BadRequestException(ERROR_MESSAGES.DEPARTMENT.NOT_FOUND);
            }

            const manager = await this.getManagerInfo(department.manager_id);
            return {
                ...department,
                manager,
            };
        } catch (error) {
            this.logger.APP.error('Get department error: ' + error);
            throw error;
        }
    }

    async getAllManagers(departmentId: number) {
        try {
            const userRepo = this.db.getRepository(User);

            const managers = await userRepo.find({
                where: {
                    role: Role.MANAGER,
                    department_id: departmentId,
                },
                select: ['id', 'name', 'username', 'department_id', 'created_at', 'updated_at'],
                order: {
                    name: 'ASC',
                },
            });

            return managers;
        } catch (error) {
            this.logger.APP.error('Get all managers error: ' + error);
            throw new Error('Can not get all managers');
        }
    }

    async updateManagerDepartment(id: number, idManager: number) {
        try {
            const departmentRepo = this.db.getRepository(Department);
            const department = await departmentRepo.findOne({ where: { id } });
            if (!department) {
                throw new BadRequestException(ERROR_MESSAGES.DEPARTMENT.NOT_FOUND);
            }

            department.manager_id = idManager;
            await departmentRepo.save(department);
        } catch (error) {
            this.logger.APP.error('Update manager failed: ' + error);
            throw error;
        }
    }

    async createManagerUser(req: CreateUserRequest) {
        const queryRunner = this.db.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const userRepo = this.db.getRepository(User);
            const departmentRepo = this.db.getRepository(Department);
            const permissionRepo = queryRunner.manager.getRepository(UserPermission);

            const department = await departmentRepo.findOne({ where: { id: req.department_id } });
            if (!department) {
                throw new BadRequestException(ERROR_MESSAGES.DEPARTMENT.NOT_FOUND);
            }

            const existingManager = await userRepo.findOne({
                where: {
                    username: req.username,
                    name: req.name,
                    department_id: req.department_id,
                },
            });

            if (existingManager) {
                throw new BadRequestException(ERROR_MESSAGES.MANAGER.ALREADY_EXIST);
            }

            const hashedPassword = await bcrypt.hash(req.password, 10);

            const newUser = userRepo.create({
                name: req.name,
                username: req.username,
                password: hashedPassword,
                department_id: req.department_id,
                role: Role.MANAGER,
                status: Status.ACTIVE,
            });

            const savedUser = await userRepo.save(newUser);

            if (req.is_department_manager) {
                department.manager_id = savedUser.id;
                await departmentRepo.save(department);
            }

            const userPermissionData = UserPermissionFactory.createDefaultPermissions(Role.MANAGER, department.code);
            const userPermission = permissionRepo.create({
                user_id: savedUser.id,
                ...userPermissionData,
            });

            await permissionRepo.save(userPermission);

            await queryRunner.commitTransaction();

            return {
                id: savedUser.id,
                username: savedUser.username,
                role: savedUser.role,
                manager_of_department: req.is_department_manager,
                department: {
                    id: department.id,
                    name: department.name,
                },
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.APP.error('Transaction create manager failed: ' + error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private async getManagerInfo(manager_id?: number | null): Promise<ManagerInfo | null> {
        if (!manager_id) return null;

        const userRepo = this.db.getRepository(User);
        const user = await userRepo.findOne({
            where: { id: manager_id },
            select: ['id', 'name', 'username', 'created_at', 'updated_at'],
        });

        if (!user) return null;

        const managerInfo: ManagerInfo = {
            id: user.id,
            name: user.name,
            username: user.username,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };

        return managerInfo;
    }
}
