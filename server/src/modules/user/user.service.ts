import { Department } from '@/core/domain/department';
import { Permission } from '@/core/domain/permission/permission.entity';
import { User } from '@/core/domain/user';
import { CreateUserRequest } from '@/core/dto/user/user.request';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role, Status } from '@/core/shared/enums/base.enums';
import { HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';
import { UserPermissionFactory } from '@/common/utils/user-permission-factory,utils';
import { ERROR_MESSAGES } from '@/core/shared/constants/error-message';

@Injectable()
export class UserService {
    constructor(
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        @Inject('DATA_SOURCE') private readonly db: DataSource,
    ) {}

    async getUserProfile(payload: HeaderUserPayload) {
        const userRepo = this.db.getRepository(User);
        const user = await userRepo.findOne({
            where: { id: payload.sub },
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
            const permissionRepo = queryRunner.manager.getRepository(Permission);

            if (creator.roles?.includes(Role.MANAGER)) {
                if (req.department_id !== creator.department?.id) {
                    throw new ForbiddenException(ERROR_MESSAGES.AUTH.FORBIDDEN);
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
            const userPermissionData = UserPermissionFactory.createDefaultPermissions(Role.STAFF, department.code);

            const newUser = userRepo.create({
                name: req.name,
                username: req.username,
                password: hashedPassword,
                department_id: req.department_id,
                role: Role.STAFF,
                status: Status.ACTIVE,
            });

            const savedUser = await userRepo.save(newUser);

            const userPermission = permissionRepo.create({
                user_id: savedUser.id,
                ...userPermissionData,
            });

            await permissionRepo.save(userPermission);

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

    async getAllStaffOfDepart(creator: HeaderUserPayload) {
        try {
            const userRepo = this.db.getRepository(User);
            const users = await userRepo.find({
                where: { role: Role.STAFF, department_id: creator.department?.id },
            });
            
            if (!users || users.length === 0) {
                throw new ConflictException('No staff of this department');
            }
            
            return users;
        } catch (error) {
            this.logger.APP.error('Get All Staff of depart error: ' + error);
            throw error;
        }
    }

    async getUserById(userId: number) {
        try {
            const userRepo = this.db.getRepository(User);
            const user = await userRepo.findOne({
                where: { id: userId },
            });
            
            if (!user) {
                throw new BadRequestException('User not found');
            }
            
            return user;
        } catch (error) {
            this.logger.APP.error('Get user by ID error: ' + error);
            throw error;
        }
    }

    async updateUser(userId: number, updateData: Partial<User>) {
        try {
            const userRepo = this.db.getRepository(User);
            const user = await userRepo.findOne({
                where: { id: userId },
            });
            
            if (!user) {
                throw new BadRequestException('User not found');
            }
            
            Object.assign(user, updateData);
            const updatedUser = await userRepo.save(user);
            
            return updatedUser;
        } catch (error) {
            this.logger.APP.error('Update user error: ' + error);
            throw error;
        }
    }

    async deleteUser(userId: number) {
        try {
            const userRepo = this.db.getRepository(User);
            const user = await userRepo.findOne({
                where: { id: userId },
            });
            
            if (!user) {
                throw new BadRequestException('User not found');
            }
            
            await userRepo.remove(user);
            
            return { message: 'User deleted successfully' };
        } catch (error) {
            this.logger.APP.error('Delete user error: ' + error);
            throw error;
        }
    }
}
