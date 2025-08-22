import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractTemplate } from '@/core/domain/contract/contract-template.entity';
import { ContractTemplateVersion } from '@/core/domain/contract/contract-template-version.entity';
import { diffJson, JsonDiffChange } from '@/common/utils/json-diff.utils';
import * as crypto from 'crypto';

@Injectable()
export class TemplateService {
    constructor(
        @InjectRepository(ContractTemplate) private readonly templateRepository: Repository<ContractTemplate>,
        @InjectRepository(ContractTemplateVersion)
        private readonly versionRepository: Repository<ContractTemplateVersion>,
    ) {}

    async listTemplates(
        query: {
            search?: string;
            type?: string; // basic | editor | upload
            category?: string;
            page?: number;
            size?: number;
            is_active?: boolean;
        },
        userDepartmentId?: number | null,
    ) {
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
        const ent = await this.templateRepository.findOne({ where: { id } });
        if (!ent) return null;
        const etag = this.computeEtag((ent as any).editor_content || '');
        return { ...(ent as any), __etag: etag } as any;
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
        // Optional ETag concurrency control if client provides If-Match style header value in updates as (updates as any).__etag
        const ifMatch = (updates as any)?.__etag as string | undefined;
        if (ifMatch) {
            const currentEtag = this.computeEtag(entity.editor_content || '');
            if (currentEtag !== ifMatch) {
                throw new BadRequestException('Precondition failed: ETag mismatch');
            }
        }
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
        return { ...(saved as any), __etag: this.computeEtag((saved as any).editor_content || '') } as any;
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

    async publishTemplate(id: string, payload: { versionId?: string }, userId: number) {
        const entity = await this.templateRepository.findOne({ where: { id } });
        if (!entity) throw new NotFoundException('Template not found');
        // Basic validations before publish
        this.validateBeforePublish(entity);
        // If versionId provided, ensure it exists (optional pin)
        if (payload?.versionId) {
            const exists = await this.versionRepository.findOne({ where: { id: payload.versionId, template_id: id } });
            if (!exists) throw new BadRequestException('Version does not exist');
        }
        entity.is_active = true;
        entity.status = undefined as any; // status field may not exist on this entity; keeping for compatibility
        entity.updated_by = String(userId);
        entity.version = this.bumpVersion(entity.version || '1.0.0');
        await this.templateRepository.save(entity);
        return { success: true, version: entity.version } as any;
    }

    async previewTemplate(payload: { content?: any; versionId?: string; mockData?: Record<string, any> }) {
        let html: string | null = null;
        if (payload.versionId) {
            const ver = await this.versionRepository.findOne({ where: { id: payload.versionId } });
            if (!ver) throw new NotFoundException('Version not found');
            const snapshot = (ver as any).content_snapshot || {};
            html = snapshot?.editor_content || null;
        }
        if (!html) {
            html = (payload.content as any)?.editor_content || (payload.content as any) || '';
        }
        const sanitized = this.sanitizeHtml(String(html || ''));
        return { html: sanitized };
    }

    async diffVersions(
        templateId: string,
        sourceVersionId: string,
        targetVersionId: string,
    ): Promise<{ changes: JsonDiffChange[]; sourceVersion: number; targetVersion: number }> {
        const [source, target] = await Promise.all([
            this.versionRepository.findOne({ where: { id: sourceVersionId, template_id: templateId } }),
            this.versionRepository.findOne({ where: { id: targetVersionId, template_id: templateId } }),
        ]);
        if (!source || !target) throw new NotFoundException('One or both versions not found');
        const changes = diffJson((source as any).content_snapshot, (target as any).content_snapshot);
        return {
            changes,
            sourceVersion: (source as any).version_number,
            targetVersion: (target as any).version_number,
        };
    }

    async rollbackToVersion(templateId: string, versionId: string, userId: number) {
        const version = await this.versionRepository.findOne({ where: { id: versionId, template_id: templateId } });
        if (!version) throw new NotFoundException('Version not found');
        const entity = await this.templateRepository.findOne({ where: { id: templateId } });
        if (!entity) throw new NotFoundException('Template not found');
        const snapshot = (version as any).content_snapshot || {};
        entity.fields = snapshot.fields ?? entity.fields;
        entity.sections = snapshot.sections ?? entity.sections;
        entity.editor_structure = snapshot.editor_structure ?? entity.editor_structure;
        entity.editor_content = snapshot.editor_content ?? entity.editor_content;
        entity.updated_by = String(userId);
        await this.templateRepository.save(entity);

        // create a new version as rollback snapshot
        const latest = await this.versionRepository.findOne({
            where: { template_id: templateId } as any,
            order: { version_number: 'DESC' as any },
        });
        const nextNumber = ((latest?.version_number as any) || 0) + 1;
        const newVersion = this.versionRepository.create({
            template_id: templateId,
            version_number: nextNumber,
            content_snapshot: snapshot,
            changelog: `Rollback to version ${(version as any).version_number}`,
            created_by: String(userId),
        } as any);
        const saved = await this.versionRepository.save(newVersion);
        return { version_id: (saved as any).id } as any;
    }

    private bumpVersion(current: string): string {
        const parts = String(current || '1.0.0')
            .split('.')
            .map((n) => parseInt(n, 10));
        if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return '1.0.1';
        parts[2] += 1; // bump patch
        return parts.join('.');
    }

    private sanitizeHtml(html: string): string {
        // Minimal sanitization: strip <script/iframe/object/embed> and on* attributes
        let out = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
        out = out.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
        out = out.replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '');
        out = out.replace(/<embed[^>]*>[\s\S]*?<\/embed>/gi, '');
        out = out.replace(/ on[a-z]+\s*=\s*"[^"]*"/gi, '');
        out = out.replace(/ on[a-z]+\s*=\s*'[^']*'/gi, '');
        out = out.replace(/ on[a-z]+\s*=\s*[^\s>]+/gi, '');
        return out;
    }

    private computeEtag(content: string): string {
        return crypto
            .createHash('sha1')
            .update(String(content || ''))
            .digest('hex');
    }

    private validateBeforePublish(entity: ContractTemplate): void {
        const contentHtml = (entity as any).editor_content || '';
        if (!contentHtml || String(contentHtml).trim().length < 10) {
            throw new BadRequestException('Template content is empty');
        }
        const fields = (entity as any).fields || [];
        // Basic placeholder check: ensure no orphan "{{" without closing
        if (String(contentHtml).includes('{{') && !String(contentHtml).includes('}}')) {
            throw new BadRequestException('Detected malformed variable token');
        }
        // Example required field validation
        const requiredFields = Array.isArray(fields) ? fields.filter((f: any) => f?.required) : [];
        for (const rf of requiredFields) {
            const key = rf?.key;
            if (key && !String(contentHtml).includes(key)) {
                throw new BadRequestException(`Required field missing in content: ${key}`);
            }
        }
    }
}
