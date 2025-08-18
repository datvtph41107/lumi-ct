import { Department } from '@/core/domain/department';
import { User } from '@/core/domain/user';
import { DepartmentResponse, ManagerInfo } from '@/core/dto/department/department.response';
import { CreateUserRequest } from '@/core/dto/user/user.request';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Role, Status } from '@/core/shared/enums/base.enums';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ERROR_MESSAGES } from '@/core/shared/constants/error-message';
import { UserPermission } from '@/core/domain/permission';
import { Role as RoleEntity } from '@/core/domain/permission/role.entity';
import { 
    CreateUserDto, 
    UpdateUserDto, 
    CreateRoleDto, 
    UpdateRoleDto, 
    AssignUserRolesDto, 
    SetRolePermissionsDto,
    CreateSystemNotificationDto 
} from '@/core/dto/admin/admin.request';
import { 
    UserResponse, 
    RoleResponse, 
    PermissionResponse, 
    UserPermissionResponse, 
    RolePermissionResponse,
    SystemNotificationResponse,
    AuditLogResponse,
    PaginatedResponse 
} from '@/core/dto/admin/admin.response';

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

            const userPermissionData = {
                user_id: savedUser.id,
                read_users: true,
                create_users: true,
                update_users: true,
                delete_users: true,
                read_roles: true,
                create_roles: true,
                update_roles: true,
                delete_roles: true,
                read_permissions: true,
                create_permissions: true,
                update_permissions: true,
                delete_permissions: true,
                read_departments: true,
                create_departments: true,
                update_departments: true,
                delete_departments: true,
                read_system_notifications: true,
                create_system_notifications: true,
                update_system_notifications: true,
                delete_system_notifications: true,
                read_audit_logs: true,
                create_audit_logs: true,
                update_audit_logs: true,
                delete_audit_logs: true,
            };
            const userPermission = permissionRepo.create(userPermissionData);

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

    // ==== User Management ====
    async listUsers(query: any): Promise<PaginatedResponse<UserResponse>> {
        try {
            const userRepo = this.db.getRepository(User);
            const { page = 1, limit = 10, search, department_id, role, status } = query;
            
            const queryBuilder = userRepo.createQueryBuilder('user')
                .leftJoin('user.department', 'department')
                .select([
                    'user.id',
                    'user.name',
                    'user.username',
                    'user.role',
                    'user.status',
                    'user.department_id',
                    'user.created_at',
                    'user.updated_at',
                    'department.name as department_name'
                ]);

            if (search) {
                queryBuilder.where('user.name LIKE :search OR user.username LIKE :search', { search: `%${search}%` });
            }

            if (department_id) {
                queryBuilder.andWhere('user.department_id = :department_id', { department_id });
            }

            if (role) {
                queryBuilder.andWhere('user.role = :role', { role });
            }

            if (status) {
                queryBuilder.andWhere('user.status = :status', { status });
            }

            const total = await queryBuilder.getCount();
            const users = await queryBuilder
                .skip((page - 1) * limit)
                .take(limit)
                .getRawMany();

            const result: UserResponse[] = users.map(user => ({
                id: user.user_id,
                name: user.user_name,
                username: user.user_username,
                role: user.user_role,
                status: user.user_status,
                department_id: user.user_department_id,
                department_name: user.department_name,
                created_at: user.user_created_at,
                updated_at: user.user_updated_at,
            }));

            return {
                data: result,
                total,
                page: Number(page),
                limit: Number(limit),
                total_pages: Math.ceil(total / limit),
            };
        } catch (error) {
            this.logger.APP.error('List users error: ' + error);
            throw error;
        }
    }

    async createUser(body: CreateUserDto): Promise<UserResponse> {
        try {
            const userRepo = this.db.getRepository(User);
            const departmentRepo = this.db.getRepository(Department);

            const department = await departmentRepo.findOne({ where: { id: body.department_id } });
            if (!department) {
                throw new BadRequestException(ERROR_MESSAGES.DEPARTMENT.NOT_FOUND);
            }

            const existingUser = await userRepo.findOne({
                where: { username: body.username }
            });

            if (existingUser) {
                throw new BadRequestException('Username already exists');
            }

            const hashedPassword = await bcrypt.hash(body.password, 10);

            const newUser = userRepo.create({
                name: body.name,
                username: body.username,
                password: hashedPassword,
                department_id: body.department_id,
                role: body.role as Role,
                status: Status.ACTIVE,
            });

            const savedUser = await userRepo.save(newUser);

            return {
                id: savedUser.id,
                name: savedUser.name,
                username: savedUser.username,
                role: savedUser.role,
                status: savedUser.status,
                department_id: savedUser.department_id,
                department_name: department.name,
                created_at: savedUser.created_at,
                updated_at: savedUser.updated_at,
            };
        } catch (error) {
            this.logger.APP.error('Create user error: ' + error);
            throw error;
        }
    }

    async updateUser(id: number, body: UpdateUserDto): Promise<UserResponse> {
        try {
            const userRepo = this.db.getRepository(User);
            const departmentRepo = this.db.getRepository(Department);

            const user = await userRepo.findOne({ where: { id } });
            if (!user) {
                throw new BadRequestException('User not found');
            }

            if (body.department_id) {
                const department = await departmentRepo.findOne({ where: { id: body.department_id } });
                if (!department) {
                    throw new BadRequestException(ERROR_MESSAGES.DEPARTMENT.NOT_FOUND);
                }
            }

            Object.assign(user, body);
            const updatedUser = await userRepo.save(user);

            const department = await departmentRepo.findOne({ where: { id: updatedUser.department_id } });

            return {
                id: updatedUser.id,
                name: updatedUser.name,
                username: updatedUser.username,
                role: updatedUser.role,
                status: updatedUser.status,
                department_id: updatedUser.department_id,
                department_name: department?.name,
                created_at: updatedUser.created_at,
                updated_at: updatedUser.updated_at,
            };
        } catch (error) {
            this.logger.APP.error('Update user error: ' + error);
            throw error;
        }
    }

    async deactivateUser(id: number): Promise<{ success: boolean }> {
        try {
            const userRepo = this.db.getRepository(User);
            const user = await userRepo.findOne({ where: { id } });
            if (!user) {
                throw new BadRequestException('User not found');
            }

            user.status = Status.INACTIVE;
            await userRepo.save(user);

            return { success: true };
        } catch (error) {
            this.logger.APP.error('Deactivate user error: ' + error);
            throw error;
        }
    }

    // ==== Role Management ====
    async listRoles(): Promise<PaginatedResponse<RoleResponse>> {
        try {
            const roleRepo = this.db.getRepository(RoleEntity);
            const roles = await roleRepo.find();

            const result: RoleResponse[] = roles.map(role => ({
                id: role.id,
                name: role.name,
                displayName: role.display_name,
                description: role.description,
                priority: role.priority,
                created_at: role.created_at,
                updated_at: role.updated_at,
            }));

            return {
                data: result,
                total: result.length,
                page: 1,
                limit: result.length,
                total_pages: 1,
            };
        } catch (error) {
            this.logger.APP.error('List roles error: ' + error);
            throw error;
        }
    }

    async createRole(body: CreateRoleDto): Promise<RoleResponse> {
        try {
            const roleRepo = this.db.getRepository(RoleEntity);
            const newRole = roleRepo.create({
                name: body.name,
                display_name: body.displayName,
                description: body.description,
                priority: body.priority,
            });
            const savedRole = await roleRepo.save(newRole);

            return {
                id: savedRole.id,
                name: savedRole.name,
                displayName: savedRole.display_name,
                description: savedRole.description,
                priority: savedRole.priority,
                created_at: savedRole.created_at,
                updated_at: savedRole.updated_at,
            };
        } catch (error) {
            this.logger.APP.error('Create role error: ' + error);
            throw error;
        }
    }

    async updateRole(id: string, body: UpdateRoleDto): Promise<RoleResponse> {
        try {
            const roleRepo = this.db.getRepository(RoleEntity);
            const role = await roleRepo.findOne({ where: { id } });
            if (!role) {
                throw new BadRequestException('Role not found');
            }

            if (body.name) role.name = body.name;
            if (body.displayName) role.display_name = body.displayName;
            if (body.description) role.description = body.description;
            if (body.priority) role.priority = body.priority;

            const updatedRole = await roleRepo.save(role);

            return {
                id: updatedRole.id,
                name: updatedRole.name,
                displayName: updatedRole.display_name,
                description: updatedRole.description,
                priority: updatedRole.priority,
                created_at: updatedRole.created_at,
                updated_at: updatedRole.updated_at,
            };
        } catch (error) {
            this.logger.APP.error('Update role error: ' + error);
            throw error;
        }
    }

    async deleteRole(id: string): Promise<{ success: boolean }> {
        try {
            const roleRepo = this.db.getRepository(RoleEntity);
            const role = await roleRepo.findOne({ where: { id } });
            if (!role) {
                throw new BadRequestException('Role not found');
            }

            await roleRepo.remove(role);
            return { success: true };
        } catch (error) {
            this.logger.APP.error('Delete role error: ' + error);
            throw error;
        }
    }

    async getRolePermissions(id: string): Promise<RolePermissionResponse> {
        try {
            // Implementation depends on your permission structure
            return {
                role_id: id,
                permissions: [],
            };
        } catch (error) {
            this.logger.APP.error('Get role permissions error: ' + error);
            throw error;
        }
    }

    async setRolePermissions(id: string, body: SetRolePermissionsDto): Promise<{ success: boolean }> {
        try {
            // Implementation depends on your permission structure
            return { success: true };
        } catch (error) {
            this.logger.APP.error('Set role permissions error: ' + error);
            throw error;
        }
    }

    // ==== System Notifications ====
    async createSystemNotification(body: CreateSystemNotificationDto): Promise<SystemNotificationResponse> {
        try {
            // Implementation depends on your notification structure
            return {
                id: 'temp-id',
                title: body.title,
                message: body.message,
                type: body.type,
                department_ids: body.department_ids,
                user_ids: body.user_ids,
                scheduled_at: body.scheduled_at ? new Date(body.scheduled_at) : undefined,
                repeat_pattern: body.repeat_pattern,
                created_at: new Date(),
                updated_at: new Date(),
            };
        } catch (error) {
            this.logger.APP.error('Create system notification error: ' + error);
            throw error;
        }
    }

    async listSystemNotifications(): Promise<PaginatedResponse<SystemNotificationResponse>> {
        try {
            // Implementation depends on your notification structure
            return {
                data: [],
                total: 0,
                page: 1,
                limit: 10,
                total_pages: 0,
            };
        } catch (error) {
            this.logger.APP.error('List system notifications error: ' + error);
            throw error;
        }
    }

    // ==== Audit Log ====
    async getAuditLogs(query: any): Promise<PaginatedResponse<AuditLogResponse>> {
        try {
            // Implementation depends on your audit log structure
            return {
                data: [],
                total: 0,
                page: 1,
                limit: 10,
                total_pages: 0,
            };
        } catch (error) {
            this.logger.APP.error('Get audit logs error: ' + error);
            throw error;
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
