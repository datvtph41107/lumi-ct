import { Department } from '@/core/domain/department';
import { User } from '@/core/domain/user';
import { CreateUserRequest } from '@/core/dto/user/user.request';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role, Status } from '@/core/shared/enums/base.enums';
import { HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';
import { ERROR_MESSAGES } from '@/core/shared/constants/error-message';
import { RoleService } from '@/core/shared/services/role.service';
import {
    UserResponse,
    PaginatedResponse,
    UpdateUserRequest,
    UserRolesResponse,
    RoleAssignmentRequest,
    UserCapabilitiesResponse,
    ApiSuccessResponse
} from '@/core/shared/types/api-response.types';

@Injectable()
export class UserService {
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        private readonly roleService: RoleService,
    ) {}

    async getUserProfile(payload: HeaderUserPayload) {
        const userRepo = this.db.getRepository(User);
        const user = await userRepo.findOne({
            where: { id: Number(payload.sub) },
            select: ['id', 'username', 'name', 'role', 'department_id'],
        });

        if (!user) throw new Error('User not found');

        return user;
    }

    async createNewStaff(req: CreateUserRequest, creator: HeaderUserPayload) {
        const queryRunner = this.db.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const userRepo = this.db.getRepository(User);
            const departmentRepo = this.db.getRepository(Department);

            if (creator.roles?.includes(Role.MANAGER)) {
                if (req.department_id !== creator.department?.id) {
                    throw new ForbiddenException(ERROR_MESSAGES.AUTH.FORBIDDEN);
                    // 'Manager can only create staff in their own department'
                }
            }

            const department = await departmentRepo.findOne({ where: { id: req.department_id } });
            if (!department) {
                throw new BadRequestException(ERROR_MESSAGES.DEPARTMENT.NOT_FOUND);
            }

            const existingUserByUsername = await userRepo.findOne({
                where: { username: req.username, department_id: req.department_id },
            });
            if (existingUserByUsername) {
                throw new ConflictException('Username already exists');
            }

            const existingUserDept = await userRepo.findOne({
                where: {
                    name: req.name,
                    department_id: Number(req.department_id),
                    role: Role.STAFF,
                },
            });
            if (existingUserDept) {
                throw new ConflictException('Staff with this name already exists in the department');
            }

            const hashedPassword = await bcrypt.hash(req.password, 10);

            const newUser = userRepo.create({
                name: req.name,
                username: req.username,
                password: hashedPassword,
                department_id: req.department_id,
                role: Role.STAFF,
                status: Status.ACTIVE,
            });

            const savedUser = await userRepo.save(newUser);

            // No separate permission entity; permissions are derived from role

            await queryRunner.commitTransaction();

            return {
                id: savedUser.id,
                name: savedUser.name,
                role: savedUser.role,
                department: {
                    id: department.id,
                    name: department.name,
                    code: department.code,
                },
                            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.APP.error('Transaction create staff failed: ' + error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getAllStaffOfDepart(creator: HeaderUserPayload): Promise<UserResponse[]> {
        try {
            const userRepo = this.db.getRepository(User);
            const users = await userRepo.find({
                where: { role: Role.STAFF, department_id: creator.department?.id },
                relations: ['department'],
            });
            
            return users.map(user => ({
                id: user.id,
                username: user.username,
                role: user.role,
                isActive: user.is_active,
                department: user.department ? {
                    id: user.department.id,
                    name: user.department.name,
                    code: user.department.code,
                } : undefined,
            }));
        } catch (error) {
            this.logger.APP.error('Get All Staff of depart error: ' + error);
            throw error;
        }
    }

    // ==== User Management Methods (moved from admin) ====
    async listUsers(query: any): Promise<PaginatedResponse<UserResponse>> {
        const userRepo = this.db.getRepository(User);
        const [users, total] = await userRepo.findAndCount({
            relations: ['department'],
            take: query.limit || 50,
            skip: query.offset || 0,
        });

        const data: UserResponse[] = users.map(user => ({
            id: user.id,
            username: user.username,
            role: user.role,
            isActive: user.is_active,
            department: user.department ? {
                id: user.department.id,
                name: user.department.name,
                code: user.department.code,
            } : undefined,
        }));

        return { data, total };
    }

    async createUser(body: CreateUserRequest): Promise<UserResponse> {
        const userRepo = this.db.getRepository(User);
        const departmentRepo = this.db.getRepository(Department);

        // Check if username already exists
        const existingUser = await userRepo.findOne({ where: { username: body.username } });
        if (existingUser) {
            throw new ConflictException('Username already exists');
        }

        // Validate department if provided
        let department: Department | undefined;
        if (body.departmentId) {
            department = await departmentRepo.findOne({ where: { id: body.departmentId } });
            if (!department) {
                throw new BadRequestException('Department not found');
            }
        }

        const hashedPassword = await bcrypt.hash(body.password, 10);
        
        const newUser = userRepo.create({
            username: body.username,
            password: hashedPassword,
            role: body.role === 'MANAGER' ? Role.MANAGER : Role.STAFF,
            department_id: body.departmentId,
            is_active: true,
        });

        const savedUser = await userRepo.save(newUser);

        return {
            id: savedUser.id,
            username: savedUser.username,
            role: savedUser.role,
            isActive: savedUser.is_active,
            department: department ? {
                id: department.id,
                name: department.name,
                code: department.code,
            } : undefined,
        };
    }

    async updateUser(id: number, body: UpdateUserRequest): Promise<UserResponse> {
        const userRepo = this.db.getRepository(User);
        const user = await userRepo.findOne({ where: { id }, relations: ['department'] });
        
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (body.username) user.username = body.username;
        if (body.role) user.role = body.role === 'MANAGER' ? Role.MANAGER : Role.STAFF;
        if (body.departmentId !== undefined) user.department_id = body.departmentId;
        if (body.isActive !== undefined) user.is_active = body.isActive;

        const updatedUser = await userRepo.save(user);

        return {
            id: updatedUser.id,
            username: updatedUser.username,
            role: updatedUser.role,
            isActive: updatedUser.is_active,
            department: updatedUser.department ? {
                id: updatedUser.department.id,
                name: updatedUser.department.name,
                code: updatedUser.department.code,
            } : undefined,
        };
    }

    async deactivateUser(id: number): Promise<ApiSuccessResponse> {
        const userRepo = this.db.getRepository(User);
        const result = await userRepo.update(id, { is_active: false });
        
        if (result.affected === 0) {
            throw new NotFoundException('User not found');
        }

        return { success: true, message: 'User deactivated successfully' };
    }

    async getUserRoles(userId: number): Promise<UserRolesResponse> {
        const userRepo = this.db.getRepository(User);
        const user = await userRepo.findOne({ where: { id: userId } });
        
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const roleName = this.roleService.getPrimaryRole({ role: user.role });
        return { roles: [roleName] };
    }

    async assignUserRoles(userId: number, body: RoleAssignmentRequest): Promise<ApiSuccessResponse> {
        const userRepo = this.db.getRepository(User);
        const user = await userRepo.findOne({ where: { id: userId } });
        
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const wantsManager = body.roles.some(r => 
            r.roleId.toLowerCase() === 'manager' || r.roleId.toUpperCase() === 'MANAGER'
        );
        
        user.role = wantsManager ? Role.MANAGER : Role.STAFF;
        await userRepo.save(user);

        return { success: true, message: 'User roles updated successfully' };
    }

    async getEffectivePermissions(userId: number): Promise<UserCapabilitiesResponse> {
        const userRepo = this.db.getRepository(User);
        const user = await userRepo.findOne({ where: { id: userId } });
        
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isManager = this.roleService.isManager({ role: user.role });
        return { capabilities: { is_manager: isManager } };
    }
}
