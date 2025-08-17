import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../core/domain/user/user.entity';
import { Role } from '../../core/domain/auth/role.entity';
import { Department } from '../../core/domain/user/department.entity';
import { AuditLogService } from './audit-log.service';

export interface CreateUserDto {
    username: string;
    password: string;
    email: string;
    full_name: string;
    role: string;
    department_id?: number;
    is_active?: boolean;
}

export interface UpdateUserDto {
    username?: string;
    email?: string;
    full_name?: string;
    role?: string;
    department_id?: number;
    is_active?: boolean;
}

export interface UserFiltersDto {
    search?: string;
    role?: string;
    status?: string;
    department_id?: number;
    page?: number;
    limit?: number;
}

export interface UsersResponseDto {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Injectable()
export class UserManagementService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(Department)
        private readonly departmentRepository: Repository<Department>,
        private readonly auditLogService: AuditLogService,
    ) {}

    async getUsers(filters: UserFiltersDto, currentUser: User): Promise<UsersResponseDto> {
        const { search, role, status, department_id, page = 1, limit = 10 } = filters;
        
        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.department', 'department')
            .leftJoinAndSelect('user.roles', 'userRoles')
            .leftJoinAndSelect('userRoles.role', 'role');

        // Apply filters
        if (search) {
            queryBuilder.andWhere(
                '(user.username LIKE :search OR user.full_name LIKE :search OR user.email LIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (role) {
            queryBuilder.andWhere('role.name = :role', { role });
        }

        if (status) {
            queryBuilder.andWhere('user.is_active = :status', { 
                status: status === 'active' ? true : false 
            });
        }

        if (department_id) {
            queryBuilder.andWhere('department.id = :department_id', { department_id });
        }

        // Count total
        const total = await queryBuilder.getCount();

        // Apply pagination
        const offset = (page - 1) * limit;
        queryBuilder.skip(offset).take(limit);

        // Order by
        queryBuilder.orderBy('user.created_at', 'DESC');

        const users = await queryBuilder.getMany();

        // Log audit
        await this.auditLogService.log({
            user_id: currentUser.id,
            action: 'user_list_viewed',
            resource_type: 'user',
            resource_id: null,
            details: { filters, total },
        });

        return {
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getUser(userId: string, currentUser: User): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['department', 'roles', 'roles.role'],
        });

        if (!user) {
            throw new NotFoundException('Người dùng không tồn tại');
        }

        // Log audit
        await this.auditLogService.log({
            user_id: currentUser.id,
            action: 'user_viewed',
            resource_type: 'user',
            resource_id: userId,
            details: { viewed_user_id: userId },
        });

        return user;
    }

    async createUser(userData: CreateUserDto, currentUser: User): Promise<User> {
        // Check if username exists
        const existingUsername = await this.userRepository.findOne({
            where: { username: userData.username },
        });

        if (existingUsername) {
            throw new ConflictException('Tên đăng nhập đã tồn tại');
        }

        // Check if email exists
        const existingEmail = await this.userRepository.findOne({
            where: { email: userData.email },
        });

        if (existingEmail) {
            throw new ConflictException('Email đã tồn tại');
        }

        // Validate role
        const role = await this.roleRepository.findOne({
            where: { name: userData.role },
        });

        if (!role) {
            throw new BadRequestException('Vai trò không hợp lệ');
        }

        // Validate department if provided
        if (userData.department_id) {
            const department = await this.departmentRepository.findOne({
                where: { id: userData.department_id },
            });

            if (!department) {
                throw new BadRequestException('Phòng ban không tồn tại');
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        // Create user
        const user = this.userRepository.create({
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            full_name: userData.full_name,
            is_active: userData.is_active ?? true,
            department_id: userData.department_id,
        });

        const savedUser = await this.userRepository.save(user);

        // Assign role
        await this.assignRole(savedUser.id, userData.role, currentUser);

        // Log audit
        await this.auditLogService.log({
            user_id: currentUser.id,
            action: 'user_created',
            resource_type: 'user',
            resource_id: savedUser.id,
            details: { 
                created_user: {
                    username: userData.username,
                    email: userData.email,
                    full_name: userData.full_name,
                    role: userData.role,
                }
            },
        });

        return this.getUser(savedUser.id, currentUser);
    }

    async updateUser(userId: string, userData: UpdateUserDto, currentUser: User): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('Người dùng không tồn tại');
        }

        // Check if username exists (if being updated)
        if (userData.username && userData.username !== user.username) {
            const existingUsername = await this.userRepository.findOne({
                where: { username: userData.username },
            });

            if (existingUsername) {
                throw new ConflictException('Tên đăng nhập đã tồn tại');
            }
        }

        // Check if email exists (if being updated)
        if (userData.email && userData.email !== user.email) {
            const existingEmail = await this.userRepository.findOne({
                where: { email: userData.email },
            });

            if (existingEmail) {
                throw new ConflictException('Email đã tồn tại');
            }
        }

        // Update user
        Object.assign(user, userData);
        const updatedUser = await this.userRepository.save(user);

        // Update role if provided
        if (userData.role) {
            await this.assignRole(userId, userData.role, currentUser);
        }

        // Log audit
        await this.auditLogService.log({
            user_id: currentUser.id,
            action: 'user_updated',
            resource_type: 'user',
            resource_id: userId,
            details: { updated_fields: userData },
        });

        return this.getUser(userId, currentUser);
    }

    async deleteUser(userId: string, currentUser: User): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('Người dùng không tồn tại');
        }

        // Prevent self-deletion
        if (userId === currentUser.id) {
            throw new BadRequestException('Không thể xóa tài khoản của chính mình');
        }

        // Soft delete
        user.deleted_at = new Date();
        user.deleted_by = currentUser.id;
        await this.userRepository.save(user);

        // Log audit
        await this.auditLogService.log({
            user_id: currentUser.id,
            action: 'user_deleted',
            resource_type: 'user',
            resource_id: userId,
            details: { deleted_user: { username: user.username, email: user.email } },
        });
    }

    async bulkDeleteUsers(userIds: string[], currentUser: User): Promise<void> {
        const users = await this.userRepository.find({
            where: { id: In(userIds) },
        });

        if (users.length !== userIds.length) {
            throw new NotFoundException('Một số người dùng không tồn tại');
        }

        // Prevent self-deletion
        if (userIds.includes(currentUser.id)) {
            throw new BadRequestException('Không thể xóa tài khoản của chính mình');
        }

        // Soft delete all users
        const updatePromises = users.map(user => {
            user.deleted_at = new Date();
            user.deleted_by = currentUser.id;
            return this.userRepository.save(user);
        });

        await Promise.all(updatePromises);

        // Log audit
        await this.auditLogService.log({
            user_id: currentUser.id,
            action: 'users_bulk_deleted',
            resource_type: 'user',
            resource_id: null,
            details: { 
                deleted_user_ids: userIds,
                deleted_users: users.map(u => ({ username: u.username, email: u.email }))
            },
        });
    }

    async activateUser(userId: string, currentUser: User): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('Người dùng không tồn tại');
        }

        user.is_active = true;
        const updatedUser = await this.userRepository.save(user);

        // Log audit
        await this.auditLogService.log({
            user_id: currentUser.id,
            action: 'user_activated',
            resource_type: 'user',
            resource_id: userId,
            details: { activated_user: { username: user.username } },
        });

        return this.getUser(userId, currentUser);
    }

    async deactivateUser(userId: string, currentUser: User): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('Người dùng không tồn tại');
        }

        // Prevent self-deactivation
        if (userId === currentUser.id) {
            throw new BadRequestException('Không thể vô hiệu hóa tài khoản của chính mình');
        }

        user.is_active = false;
        const updatedUser = await this.userRepository.save(user);

        // Log audit
        await this.auditLogService.log({
            user_id: currentUser.id,
            action: 'user_deactivated',
            resource_type: 'user',
            resource_id: userId,
            details: { deactivated_user: { username: user.username } },
        });

        return this.getUser(userId, currentUser);
    }

    async assignRole(userId: string, roleName: string, currentUser: User): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles'],
        });

        if (!user) {
            throw new NotFoundException('Người dùng không tồn tại');
        }

        const role = await this.roleRepository.findOne({
            where: { name: roleName },
        });

        if (!role) {
            throw new BadRequestException('Vai trò không tồn tại');
        }

        // Remove existing roles
        user.roles = [];
        await this.userRepository.save(user);

        // Assign new role
        user.roles = [{ role } as any];
        await this.userRepository.save(user);

        // Log audit
        await this.auditLogService.log({
            user_id: currentUser.id,
            action: 'user_role_assigned',
            resource_type: 'user',
            resource_id: userId,
            details: { assigned_role: roleName },
        });
    }

    async resetPassword(userId: string, currentUser: User): Promise<{ temporaryPassword: string }> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('Người dùng không tồn tại');
        }

        // Generate temporary password
        const temporaryPassword = this.generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

        user.password = hashedPassword;
        user.password_reset_required = true;
        await this.userRepository.save(user);

        // Log audit
        await this.auditLogService.log({
            user_id: currentUser.id,
            action: 'user_password_reset',
            resource_type: 'user',
            resource_id: userId,
            details: { reset_user: { username: user.username } },
        });

        return { temporaryPassword };
    }

    private generateTemporaryPassword(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 12; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}