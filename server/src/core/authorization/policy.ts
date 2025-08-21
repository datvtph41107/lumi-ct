import { AdminRole, Role } from '@/core/shared/enums/base.enums';

export type ResourceType = 'ADMIN_PAGES' | 'DEPARTMENT' | 'CONTRACT';

export type Action = 'READ' | 'WRITE' | 'MANAGE' | 'APPROVE' | 'EXPORT';

export interface Subject {
    id: string | number;
    roles: Array<Role | AdminRole | string>;
    departmentId?: number | string | null;
}

export interface ContractContext {
    isPublic: boolean;
    participantUserIds: Array<string | number>;
    departmentId?: number | string | null;
}

export interface RequestContext {
    resourceType: ResourceType;
    action: Action;
    departmentId?: number | string | null;
    contract?: ContractContext;
}

export interface Decision {
    allow: boolean;
    reason: string;
    policy?: string;
}

function hasRole(subject: Subject, r: Role | AdminRole): boolean {
    return (subject.roles || []).map((x) => String(x).toUpperCase()).includes(String(r).toUpperCase());
}

export function authorize(subject: Subject, request: RequestContext): Decision {
    // Admin pages: only admin/super_admin
    if (request.resourceType === 'ADMIN_PAGES') {
        const ok = hasRole(subject, AdminRole.ADMIN) || hasRole(subject, AdminRole.SUPER_ADMIN);
        return { allow: ok, reason: ok ? 'ADMIN_ALLOWED' : 'ADMIN_ONLY', policy: 'ADMIN_PAGES' };
    }

    // Department: managers manage own department; admins override
    if (request.resourceType === 'DEPARTMENT') {
        if (hasRole(subject, AdminRole.ADMIN) || hasRole(subject, AdminRole.SUPER_ADMIN)) {
            return { allow: true, reason: 'ADMIN_OVERRIDE', policy: 'DEPARTMENT' };
        }
        const sameDepartment =
            subject.departmentId != null && request.departmentId != null && String(subject.departmentId) === String(request.departmentId);
        const ok = hasRole(subject, Role.MANAGER) && sameDepartment;
        return {
            allow: ok,
            reason: ok ? 'DEPARTMENT_MANAGER' : 'NOT_DEPARTMENT_MANAGER',
            policy: 'DEPARTMENT',
        };
    }

    // Contract: managers can READ all; STAFF can READ when public; private requires participant; WRITE requires participant
    if (request.resourceType === 'CONTRACT') {
        const ctx = request.contract;
        if (!ctx) return { allow: false, reason: 'MISSING_CONTRACT_CONTEXT', policy: 'CONTRACT' };

        // Admin override
        if (hasRole(subject, AdminRole.ADMIN) || hasRole(subject, AdminRole.SUPER_ADMIN)) {
            return { allow: true, reason: 'ADMIN_OVERRIDE', policy: 'CONTRACT' };
        }

        if (request.action === 'READ') {
            if (hasRole(subject, Role.MANAGER)) return { allow: true, reason: 'ALL_MANAGERS_CAN_READ', policy: 'CONTRACT' };
            if (ctx.isPublic && (hasRole(subject, Role.STAFF) || hasRole(subject, Role.MANAGER))) {
                return { allow: true, reason: 'PUBLIC_CONTRACT', policy: 'CONTRACT' };
            }
            const involved = ctx.participantUserIds.map(String).includes(String(subject.id));
            return { allow: involved, reason: involved ? 'PRIVATE_PARTICIPANT' : 'PRIVATE_NOT_PARTICIPANT', policy: 'CONTRACT' };
        }

        if (request.action === 'WRITE') {
            const involved = ctx.participantUserIds.map(String).includes(String(subject.id));
            return { allow: involved, reason: involved ? 'COLLABORATOR_WRITE' : 'WRITE_NOT_ALLOWED', policy: 'CONTRACT' };
        }

        if (request.action === 'EXPORT') {
            // Export follows read visibility, but allow managers
            if (hasRole(subject, Role.MANAGER)) return { allow: true, reason: 'MANAGER_EXPORT', policy: 'CONTRACT' };
            const involved = ctx.isPublic || ctx.participantUserIds.map(String).includes(String(subject.id));
            return { allow: involved, reason: involved ? 'VISIBLE_EXPORT' : 'EXPORT_NOT_ALLOWED', policy: 'CONTRACT' };
        }

        if (request.action === 'APPROVE') {
            const ok = hasRole(subject, Role.MANAGER);
            return { allow: ok, reason: ok ? 'MANAGER_APPROVE' : 'APPROVE_MANAGER_ONLY', policy: 'CONTRACT' };
        }

        return { allow: false, reason: 'DENY_BY_DEFAULT', policy: 'CONTRACT' };
    }

    return { allow: false, reason: 'NO_POLICY_MATCHED' };
}

export function can(subject: Subject, request: RequestContext): boolean {
    return authorize(subject, request).allow;
}

