// src/modules/contracts/services/collaborator.service.ts
import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { LoggerTypes } from '@/core/shared/logger/logger.types';
import { Collaborator } from '@/core/domain/permission/collaborator.entity';
import { CollaboratorRole } from '@/core/domain/permission/collaborator-role.enum';

@Injectable()
export class CollaboratorService {
    private readonly collabRepo: Repository<Collaborator>;

    constructor(
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        @Inject('LOGGER') private readonly logger: LoggerTypes,
    ) {
        this.collabRepo = this.db.getRepository(Collaborator);
    }

    async add(contract_id: string, user_id: number, role: CollaboratorRole): Promise<Collaborator> {
        try {
            const existing = await this.collabRepo.findOne({ where: { contract_id, user_id } });
            if (existing) {
                existing.role = role;
                existing.active = true;
                return await this.collabRepo.save(existing);
            }

            const ent = this.collabRepo.create({ contract_id, user_id, role, active: true });
            return await this.collabRepo.save(ent);
        } catch (err) {
            this.logger.APP.error('CollaboratorService.add error', err);
            throw new BadRequestException('Không thể thêm collaborator');
        }
    }

    async remove(contract_id: string, user_id: number): Promise<Collaborator> {
        const ent = await this.collabRepo.findOne({ where: { contract_id, user_id } });
        if (!ent) throw new NotFoundException('Collaborator không tồn tại');
        ent.active = false;
        return await this.collabRepo.save(ent);
    }

    async update(collabId: string, dto: Partial<{ role: CollaboratorRole; active: boolean }>, userId: number): Promise<Collaborator> {
        try {
            // Find collaborator by contract_id and user_id (collabId format: contract_id:user_id)
            const [contract_id, user_id] = collabId.split(':');
            if (!contract_id || !user_id) {
                throw new BadRequestException('Invalid collaborator ID format');
            }

            const ent = await this.collabRepo.findOne({ 
                where: { contract_id, user_id: parseInt(user_id) } 
            });
            
            if (!ent) {
                throw new NotFoundException('Collaborator không tồn tại');
            }

            // Validate that the user making the change has permission
            const currentUserRole = await this.getUserRole(contract_id, userId);
            if (!this.canModifyCollaborator(currentUserRole, ent.role)) {
                throw new ForbiddenException('Không có quyền cập nhật collaborator này');
            }

            // Update fields
            if (dto.role !== undefined) {
                ent.role = dto.role;
            }
            if (dto.active !== undefined) {
                ent.active = dto.active;
            }

            return await this.collabRepo.save(ent);
        } catch (err) {
            this.logger.APP.error('CollaboratorService.update error', err);
            if (err instanceof ForbiddenException || err instanceof NotFoundException) {
                throw err;
            }
            throw new BadRequestException('Không thể cập nhật collaborator');
        }
    }

    async removeById(collabId: string, userId: number): Promise<Collaborator> {
        try {
            // Find collaborator by contract_id and user_id (collabId format: contract_id:user_id)
            const [contract_id, user_id] = collabId.split(':');
            if (!contract_id || !user_id) {
                throw new BadRequestException('Invalid collaborator ID format');
            }

            const ent = await this.collabRepo.findOne({ 
                where: { contract_id, user_id: parseInt(user_id) } 
            });
            
            if (!ent) {
                throw new NotFoundException('Collaborator không tồn tại');
            }

            // Validate that the user making the change has permission
            const currentUserRole = await this.getUserRole(contract_id, userId);
            if (!this.canModifyCollaborator(currentUserRole, ent.role)) {
                throw new ForbiddenException('Không có quyền xóa collaborator này');
            }

            // Prevent removing the last owner
            if (ent.role === CollaboratorRole.OWNER) {
                const owners = await this.collabRepo.count({ 
                    where: { contract_id, role: CollaboratorRole.OWNER, active: true } 
                });
                if (owners <= 1) {
                    throw new BadRequestException('Không thể xóa owner cuối cùng');
                }
            }

            ent.active = false;
            return await this.collabRepo.save(ent);
        } catch (err) {
            this.logger.APP.error('CollaboratorService.removeById error', err);
            if (err instanceof ForbiddenException || err instanceof NotFoundException || err instanceof BadRequestException) {
                throw err;
            }
            throw new BadRequestException('Không thể xóa collaborator');
        }
    }

    async list(contract_id: string): Promise<Collaborator[]> {
        return await this.collabRepo.find({ where: { contract_id, active: true } });
    }

    async hasRole(contract_id: string, user_id: number, requiredRoles: CollaboratorRole[]): Promise<boolean> {
        const ent = await this.collabRepo.findOne({ where: { contract_id, user_id, active: true } });
        if (!ent) return false;
        return requiredRoles.includes(ent.role);
    }

    async getUserRole(contract_id: string, user_id: number): Promise<CollaboratorRole | null> {
        const ent = await this.collabRepo.findOne({ where: { contract_id, user_id, active: true } });
        return ent ? ent.role : null;
    }

    async getCollaboratorById(collabId: string): Promise<Collaborator | null> {
        try {
            const [contract_id, user_id] = collabId.split(':');
            if (!contract_id || !user_id) {
                return null;
            }

            return await this.collabRepo.findOne({ 
                where: { contract_id, user_id: parseInt(user_id), active: true } 
            });
        } catch (err) {
            this.logger.APP.error('CollaboratorService.getCollaboratorById error', err);
            return null;
        }
    }

    private canModifyCollaborator(currentUserRole: CollaboratorRole | null, targetUserRole: CollaboratorRole): boolean {
        if (!currentUserRole) return false;

        // Owner can modify anyone except themselves (to prevent removing last owner)
        if (currentUserRole === CollaboratorRole.OWNER) {
            return true;
        }

        // Editor can modify viewers and reviewers
        if (currentUserRole === CollaboratorRole.EDITOR) {
            return targetUserRole === CollaboratorRole.VIEWER || targetUserRole === CollaboratorRole.REVIEWER;
        }

        // Reviewer and Viewer cannot modify anyone
        return false;
    }

    async getCollaboratorsWithDetails(contract_id: string): Promise<any[]> {
        const collaborators = await this.collabRepo
            .createQueryBuilder('collab')
            .leftJoin('user', 'user', 'user.id = collab.user_id')
            .select([
                'collab.contract_id',
                'collab.user_id',
                'collab.role',
                'collab.active',
                'collab.created_at',
                'collab.updated_at',
                'user.email',
                'user.full_name',
                'user.avatar'
            ])
            .where('collab.contract_id = :contract_id', { contract_id })
            .andWhere('collab.active = :active', { active: true })
            .getRawMany();

        return collaborators.map(collab => ({
            contract_id: collab.collab_contract_id,
            user_id: collab.collab_user_id,
            role: collab.collab_role,
            active: collab.collab_active,
            created_at: collab.collab_created_at,
            updated_at: collab.collab_updated_at,
            user: {
                email: collab.user_email,
                full_name: collab.user_full_name,
                avatar: collab.user_avatar
            }
        }));
    }
}
