// src/modules/contracts/services/collaborator.service.ts
import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { Collaborator } from '@/core/domain/permission/collaborator.entity';
import { CollaboratorRole } from '@/core/domain/permission/collaborator-role.enum';
import { AuditLogService } from './audit-log.service';
import { NotificationService } from '@/modules/notification/notification.service';
import { NotificationChannel } from '@/core/domain/notification/notification.entity';
import { NotificationType } from '@/core/shared/enums/base.enums';

export interface CollaboratorWithUser {
    id: string;
    contract_id: string;
    user_id: number;
    role: CollaboratorRole;
    active: boolean;
    user_name?: string;
    user_email?: string;
    user_avatar?: string;
    created_at: Date;
    updated_at: Date;
}

@Injectable()
export class CollaboratorService {
    private readonly collabRepo: Repository<Collaborator>;

    constructor(
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        @Inject('LOGGER') private readonly logger: LoggerTypes,
        private readonly auditService: AuditLogService,
        private readonly notificationService: NotificationService,
    ) {
        this.collabRepo = this.db.getRepository(Collaborator);
    }

    async add(
        contract_id: string,
        user_id: number,
        role: CollaboratorRole,
        added_by: number,
        options?: { assignment_note?: string },
    ): Promise<Collaborator> {
        try {
            // Check if user is already a collaborator
            const existing = await this.collabRepo.findOne({ where: { contract_id, user_id } });
            if (existing) {
                if (existing.active) {
                    throw new BadRequestException('User is already a collaborator on this contract');
                }
                // Reactivate existing collaborator
                existing.role = role;
                existing.active = true;
                const updated = await this.collabRepo.save(existing);

                await this.auditService.create({
                    contract_id,
                    user_id: added_by,
                    action: 'REACTIVATE_COLLABORATOR',
                    meta: {
                        collaborator_user_id: user_id,
                        role,
                        previous_role: existing.role,
                    },
                    description: `Reactivated collaborator with role: ${role}`,
                });

                // Notify user re-activated
                await this.notificationService.createNotification({
                    contract_id,
                    user_id,
                    type: NotificationType.COLLABORATOR_ADDED,
                    channel: NotificationChannel.IN_APP,
                    title: 'Bạn được kích hoạt lại trong hợp đồng',
                    message: `Vai trò: ${role}`,
                    scheduled_at: new Date(),
                    metadata: { assignment_note: options?.assignment_note },
                });

                return updated;
            }

            // Create new collaborator
            const ent = this.collabRepo.create({
                contract_id,
                user_id,
                role,
                active: true,
            });
            const saved = await this.collabRepo.save(ent);

            await this.auditService.create({
                contract_id,
                user_id: added_by,
                action: 'ADD_COLLABORATOR',
                meta: {
                    collaborator_user_id: user_id,
                    role,
                },
                description: `Added collaborator with role: ${role}`,
            });

            // Notify assigned user
            await this.notificationService.createNotification({
                contract_id,
                user_id,
                type: NotificationType.COLLABORATOR_ADDED,
                channel: NotificationChannel.IN_APP,
                title: 'Bạn được phân công vào hợp đồng',
                message: `Vai trò: ${role}`,
                scheduled_at: new Date(),
                metadata: { assignment_note: options?.assignment_note },
            });

            return saved;
        } catch (err) {
            this.logger.APP.error('CollaboratorService.add error', err);
            if (err instanceof BadRequestException) {
                throw err;
            }
            throw new BadRequestException('Không thể thêm collaborator');
        }
    }

    async updateRole(
        contract_id: string,
        user_id: number,
        new_role: CollaboratorRole,
        updated_by: number,
    ): Promise<Collaborator> {
        const ent = await this.collabRepo.findOne({ where: { contract_id, user_id, active: true } });
        if (!ent) {
            throw new NotFoundException('Collaborator không tồn tại hoặc đã bị vô hiệu hóa');
        }

        const old_role = ent.role;
        ent.role = new_role;
        const updated = await this.collabRepo.save(ent);

        await this.auditService.create({
            contract_id,
            user_id: updated_by,
            action: 'UPDATE_COLLABORATOR_ROLE',
            meta: {
                collaborator_user_id: user_id,
                old_role,
                new_role,
            },
            description: `Updated collaborator role from ${old_role} to ${new_role}`,
        });

        // Notify user role updated
        await this.notificationService.createNotification({
            contract_id,
            user_id,
            type: NotificationType.SYSTEM_ANNOUNCEMENT,
            channel: NotificationChannel.IN_APP,
            title: 'Cập nhật vai trò trên hợp đồng',
            message: `Vai trò mới: ${new_role}`,
            scheduled_at: new Date(),
        });

        return updated;
    }

    async remove(contract_id: string, user_id: number, removed_by: number): Promise<Collaborator> {
        const ent = await this.collabRepo.findOne({ where: { contract_id, user_id, active: true } });
        if (!ent) {
            throw new NotFoundException('Collaborator không tồn tại hoặc đã bị vô hiệu hóa');
        }

        // Prevent removing the last owner
        if (ent.role === CollaboratorRole.OWNER) {
            const ownerCount = await this.collabRepo.count({
                where: { contract_id, role: CollaboratorRole.OWNER, active: true },
            });
            if (ownerCount <= 1) {
                throw new BadRequestException('Không thể xóa owner cuối cùng của hợp đồng');
            }
        }

        ent.active = false;
        const removed = await this.collabRepo.save(ent);

        await this.auditService.create({
            contract_id,
            user_id: removed_by,
            action: 'REMOVE_COLLABORATOR',
            meta: {
                collaborator_user_id: user_id,
                role: ent.role,
            },
            description: `Removed collaborator with role: ${ent.role}`,
        });

        // Notify user removed
        await this.notificationService.createNotification({
            contract_id,
            user_id,
            type: NotificationType.COLLABORATOR_REMOVED,
            channel: NotificationChannel.IN_APP,
            title: 'Bạn đã bị gỡ khỏi hợp đồng',
            message: `Vai trò trước đó: ${ent.role}`,
            scheduled_at: new Date(),
        });

        return removed;
    }

    async list(contract_id: string): Promise<CollaboratorWithUser[]> {
        const collaborators = await this.collabRepo.find({
            where: { contract_id, active: true },
            order: { created_at: 'ASC' },
        });

        // TODO: Join with user table to get user details
        return collaborators.map((collab) => ({
            id: `${collab.contract_id}_${collab.user_id}`,
            contract_id: collab.contract_id,
            user_id: collab.user_id,
            role: collab.role,
            active: collab.active,
            // expose custom privileges if needed
            // @ts-ignore
            can_export: (collab as any).can_export,
            // @ts-ignore
            can_manage_collaborators: (collab as any).can_manage_collaborators,
            user_name: `User ${collab.user_id}`, // Placeholder
            user_email: `user${collab.user_id}@example.com`, // Placeholder
            user_avatar: null as any,
            created_at: collab.created_at,
            updated_at: collab.updated_at,
        }));
    }

    async hasRole(contract_id: string, user_id: number, requiredRoles: CollaboratorRole[]): Promise<boolean> {
        const ent = await this.collabRepo.findOne({ where: { contract_id, user_id, active: true } });
        if (!ent) return false;
        return requiredRoles.includes(ent.role);
    }

    async getRole(contract_id: string, user_id: number): Promise<CollaboratorRole | null> {
        const ent = await this.collabRepo.findOne({ where: { contract_id, user_id, active: true } });
        return ent ? ent.role : null;
    }

    async isOwner(contract_id: string, user_id: number): Promise<boolean> {
        return this.hasRole(contract_id, user_id, [CollaboratorRole.OWNER]);
    }

    async canEdit(contract_id: string, user_id: number): Promise<boolean> {
        // Owner and Editor can edit
        return this.hasRole(contract_id, user_id, [CollaboratorRole.OWNER, CollaboratorRole.EDITOR]);
    }

    async canReview(contract_id: string, user_id: number): Promise<boolean> {
        return this.hasRole(contract_id, user_id, [
            CollaboratorRole.OWNER,
            CollaboratorRole.EDITOR,
            CollaboratorRole.REVIEWER,
        ]);
    }

    async canView(contract_id: string, user_id: number): Promise<boolean> {
        return this.hasRole(contract_id, user_id, [
            CollaboratorRole.OWNER,
            CollaboratorRole.EDITOR,
            CollaboratorRole.REVIEWER,
            CollaboratorRole.VIEWER,
        ]);
    }

    async getCollaboratorsByRole(contract_id: string, role: CollaboratorRole): Promise<Collaborator[]> {
        return this.collabRepo.find({
            where: { contract_id, role, active: true },
            order: { created_at: 'ASC' },
        });
    }

    async getContractOwners(contract_id: string): Promise<Collaborator[]> {
        return this.getCollaboratorsByRole(contract_id, CollaboratorRole.OWNER);
    }

    async transferOwnership(
        contract_id: string,
        from_user_id: number,
        to_user_id: number,
        transferred_by: number,
    ): Promise<void> {
        const qr = this.db.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            // Verify current owner
            const currentOwner = await this.collabRepo.findOne({
                where: { contract_id, user_id: from_user_id, role: CollaboratorRole.OWNER, active: true },
            });
            if (!currentOwner) {
                throw new BadRequestException('User is not an owner of this contract');
            }

            // Verify new owner exists and is active
            const newOwner = await this.collabRepo.findOne({
                where: { contract_id, user_id: to_user_id, active: true },
            });
            if (!newOwner) {
                throw new BadRequestException('Target user is not a collaborator on this contract');
            }

            // Update roles: demote previous owner to viewer by default
            currentOwner.role = CollaboratorRole.VIEWER;
            newOwner.role = CollaboratorRole.OWNER;

            await qr.manager.save([currentOwner, newOwner]);

            await this.auditService.create({
                contract_id,
                user_id: transferred_by,
                action: 'TRANSFER_OWNERSHIP',
                meta: {
                    from_user_id,
                    to_user_id,
                },
                description: `Transferred ownership from user ${from_user_id} to user ${to_user_id}`,
            });

            // Notify both users about ownership transfer
            await Promise.all([
                this.notificationService.createNotification({
                    contract_id,
                    user_id: from_user_id,
                    type: NotificationType.OWNERSHIP_TRANSFERRED,
                    channel: NotificationChannel.IN_APP,
                    title: 'Bạn không còn là Owner của hợp đồng',
                    message: `Quyền sở hữu đã chuyển cho người dùng ${to_user_id}`,
                    scheduled_at: new Date(),
                }),
                this.notificationService.createNotification({
                    contract_id,
                    user_id: to_user_id,
                    type: NotificationType.OWNERSHIP_TRANSFERRED,
                    channel: NotificationChannel.IN_APP,
                    title: 'Bạn đã được chuyển quyền Owner',
                    message: `Từ người dùng ${from_user_id}`,
                    scheduled_at: new Date(),
                }),
            ]);

            await qr.commitTransaction();
        } catch (err) {
            await qr.rollbackTransaction();
            throw err;
        } finally {
            await qr.release();
        }
    }

    async canExport(contract_id: string, user_id: number): Promise<boolean> {
        const ent = await this.collabRepo.findOne({ where: { contract_id, user_id, active: true } });
        if (!ent) return false;
        // Only owner/editor with explicit export flag
        const isOwnerOrEditor = [CollaboratorRole.OWNER, CollaboratorRole.EDITOR].includes(ent.role);
        return isOwnerOrEditor && !!ent.can_export;
    }
}
