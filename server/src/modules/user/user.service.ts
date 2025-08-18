import { Department } from '@/core/domain/department';
import { UserPermission } from '@/core/domain/permission/user-permission.entity';
import { User } from '@/core/domain/user';
import { CreateUserRequest } from '@/core/dto/user/user.request';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role, Status } from '@/core/shared/enums/base.enums';
import { HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';
import { ERROR_MESSAGES } from '@/core/shared/constants/error-message';
import { UserPermissionFactory } from '@/common/utils/user-permission-factory,utils';

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
            const permissionRepo = queryRunner.manager.getRepository(UserPermission);

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
            if (users) {
                throw new ConflictException('No staff of this department');
            }
        } catch (error) {
            this.logger.APP.error('Get All Staff of depart error: ' + error);
            throw error;
        }
    }
}
