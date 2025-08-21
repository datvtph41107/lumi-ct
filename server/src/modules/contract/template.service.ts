import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractTemplate } from '@/core/domain/contract/contract-template.entity';
import { ContractTemplateVersion } from '@/core/domain/contract/contract-template-version.entity';

@Injectable()
export class TemplateService {
    constructor(
        @InjectRepository(ContractTemplate) private readonly templateRepository: Repository<ContractTemplate>,
        @InjectRepository(ContractTemplateVersion)
        private readonly versionRepository: Repository<ContractTemplateVersion>,
    ) {}

    async listTemplates(query: {
        search?: string;
        type?: string; // basic | editor | upload
        category?: string;
        page?: number;
        size?: number;
        is_active?: boolean;
    }, userDepartmentId?: number | null) {
        const page = Number(query.page || 1);
        const size = Math.min(Number(query.size || 20), 100);

        const qb = this.templateRepository.createQueryBuilder('t').orderBy('t.updated_at', 'DESC' as any);

        if (query.search) {
            const kw = `%${String(query.search).toLowerCase()}%`;
            qb.andWhere('(LOWER(t.name) LIKE :kw OR LOWER(t.description) LIKE :kw)', { kw });
        }
        if (query.type) qb.andWhere('t.mode = :mode', { mode: query.type });
        if (query.category) qb.andWhere('t.category = :category', { category: query.category });
        if (typeof query.is_active === 'boolean') qb.andWhere('t.is_active = :ia', { ia: query.is_active });

        // Scope by department: shared (NULL) or same department or public
        if (typeof userDepartmentId === 'number') {
            qb.andWhere('(t.is_public = true OR t.department_id IS NULL OR t.department_id = :deptId)', {
                deptId: userDepartmentId,
            });
        } else {
            qb.andWhere('(t.is_public = true OR t.department_id IS NULL)');
        }

        const [rows, total] = await qb
            .skip((page - 1) * size)
            .take(size)
            .getManyAndCount();
        return {
            data: rows,
            pagination: { page, size, total, total_pages: Math.ceil(total / size) },
        };
    }

    async getTemplate(id: string) {
        return this.templateRepository.findOne({ where: { id } });
    }

    async createTemplate(payload: Partial<ContractTemplate>, userId: number) {
        // determine creator's department for scoping
        // Note: We avoid injecting UserRepository to keep module boundaries; rely on caller to pass department if needed
        const entity = this.templateRepository.create({
            name: payload.name || 'Untitled Template',
            description: payload.description,
            contract_type: (payload as any).contract_type || 'custom',
            category: payload.category || 'employment',
            mode: (payload as any).mode || 'basic',
            thumbnail_url: (payload as any).thumbnail || null,
            sections: payload.sections || null,
            fields: payload.fields || null,
            editor_structure: payload.editor_structure || null,
            editor_content: (payload as any).content || payload.editor_content || null,
            is_active: typeof payload.is_active === 'boolean' ? payload.is_active : true,
            is_public: typeof (payload as any).is_public === 'boolean' ? (payload as any).is_public : false,
            version: payload.version || '1.0.0',
            tags: payload.tags || null,
            department_id: (payload as any).department_id ?? null,
            created_by: String(userId),
            updated_by: String(userId),
        } as any);
        const saved = (await this.templateRepository.save(entity)) as unknown as ContractTemplate;
        await this.versionRepository.save(
            this.versionRepository.create({
                template_id: saved.id,
                version_number: 1,
                content_snapshot: {
                    fields: (saved as any).fields,
                    sections: (saved as any).sections,
                    editor_content: (saved as any).editor_content,
                    editor_structure: (saved as any).editor_structure,
                },
                created_by: String(userId),
                changelog: 'Initial version',
            }),
        );
        return saved;
    }

    async updateTemplate(id: string, updates: Partial<ContractTemplate>, userId: number) {
        const entity = await this.templateRepository.findOne({ where: { id } });
        if (!entity) return null;
        entity.name = updates.name ?? entity.name;
        entity.description = updates.description ?? entity.description;
        entity.category = (updates as any).category ?? entity.category;
        entity.mode = (updates as any).mode ?? entity.mode;
        entity.thumbnail_url = ((updates as any).thumbnail as any) ?? entity.thumbnail_url;
        entity.sections = updates.sections ?? entity.sections;
        entity.fields = updates.fields ?? entity.fields;
        entity.editor_structure = updates.editor_structure ?? entity.editor_structure;
        entity.editor_content = ((updates as any).content as any) ?? updates.editor_content ?? entity.editor_content;
        entity.is_active = typeof updates.is_active === 'boolean' ? updates.is_active : entity.is_active;
        entity.is_public =
            typeof (updates as any).is_public === 'boolean' ? (updates as any).is_public : entity.is_public;
        entity.tags = updates.tags ?? entity.tags;
        entity.updated_by = String(userId);
        const saved = await this.templateRepository.save(entity);
        return saved;
    }

    async deleteTemplate(id: string, userId: number) {
        await this.templateRepository.update({ id } as any, { is_active: false, updated_by: String(userId) } as any);
        return { ok: true } as any;
    }

    async listVersions(templateId: string) {
        const versions = await this.versionRepository.find({
            where: { template_id: templateId } as any,
            order: { version_number: 'DESC' as any },
        });
        return versions;
    }

    async createVersion(
        templateId: string,
        payload: { content?: any; placeholders?: any; changelog?: string },
        userId: number,
    ) {
        const latest = await this.versionRepository.findOne({
            where: { template_id: templateId } as any,
            order: { version_number: 'DESC' as any },
        });
        const nextNumber = (latest?.version_number || 0) + 1;
        const version = this.versionRepository.create({
            template_id: templateId,
            version_number: nextNumber,
            content_snapshot: payload.content ?? {},
            placeholders: payload.placeholders ?? null,
            changelog: payload.changelog,
            created_by: String(userId),
        });
        await this.versionRepository.save(version);
        return version;
    }
}
