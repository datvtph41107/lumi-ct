export type Role = 'ADMIN' | 'MANAGER' | 'STAFF' | 'USER' | 'COLLABORATOR';

export type ResourceType =
  | 'ADMIN_PAGES'
  | 'DEPARTMENT'
  | 'CONTRACT'
  | 'CONTRACT_PUBLIC';

export interface Subject {
  id: string;
  roles: Role[];
  departmentIds?: string[];
}

export interface ContractContext {
  departmentId: string;
  isPublic: boolean;
  participantUserIds: string[];
}

export interface RequestContext {
  resourceType: ResourceType;
  resourceId?: string;
  departmentId?: string;
  contract?: ContractContext;
  action: 'READ' | 'WRITE' | 'MANAGE';
}

export interface Decision {
  allow: boolean;
  reason: string;
}

export interface Policy {
  name: string;
  evaluate(subject: Subject, request: RequestContext): Decision;
}

function hasRole(subject: Subject, role: Role): boolean {
  return subject.roles.includes(role);
}

function isManagerOfDepartment(subject: Subject, departmentId?: string): boolean {
  if (!departmentId) return false;
  if (!hasRole(subject, 'MANAGER')) return false;
  return (subject.departmentIds ?? []).includes(departmentId);
}

const policies: Policy[] = [
  {
    name: 'Admin pages only ADMIN',
    evaluate(subject, request) {
      if (request.resourceType !== 'ADMIN_PAGES') return { allow: false, reason: 'NOT_APPLICABLE' };
      return hasRole(subject, 'ADMIN')
        ? { allow: true, reason: 'ADMIN_ONLY' }
        : { allow: false, reason: 'ADMIN_ONLY' };
    },
  },
  {
    name: 'Departments managed by department MANAGER',
    evaluate(subject, request) {
      if (request.resourceType !== 'DEPARTMENT') return { allow: false, reason: 'NOT_APPLICABLE' };
      if (hasRole(subject, 'ADMIN')) return { allow: true, reason: 'ADMIN_OVERRIDE' };
      const allowed = isManagerOfDepartment(subject, request.departmentId);
      return allowed
        ? { allow: true, reason: 'DEPARTMENT_MANAGER' }
        : { allow: false, reason: 'NOT_DEPARTMENT_MANAGER' };
    },
  },
  {
    name: 'Contracts readable by all MANAGER; public by STAFF; private by participants',
    evaluate(subject, request) {
      if (request.resourceType !== 'CONTRACT' && request.resourceType !== 'CONTRACT_PUBLIC') {
        return { allow: false, reason: 'NOT_APPLICABLE' };
      }
      const contract = request.contract;
      if (!contract) return { allow: false, reason: 'MISSING_CONTEXT' };

      if (hasRole(subject, 'ADMIN')) return { allow: true, reason: 'ADMIN_OVERRIDE' };

      // Participants (collaborators) can write the contracts they are involved in
      if (request.action === 'WRITE') {
        const involved = contract.participantUserIds.includes(subject.id);
        return involved
          ? { allow: true, reason: 'CONTRACT_COLLABORATOR_WRITE' }
          : { allow: false, reason: 'WRITE_NOT_PARTICIPANT' };
      }

      if (hasRole(subject, 'MANAGER') && request.action === 'READ') {
        return { allow: true, reason: 'ALL_MANAGERS_CAN_READ_CONTRACT' };
      }

      if (contract.isPublic && request.action === 'READ') {
        if (hasRole(subject, 'STAFF') || hasRole(subject, 'MANAGER') || hasRole(subject, 'ADMIN')) {
          return { allow: true, reason: 'PUBLIC_CONTRACT' };
        }
      }

      if (!contract.isPublic && request.action === 'READ') {
        const involved = contract.participantUserIds.includes(subject.id);
        return involved ? { allow: true, reason: 'PRIVATE_CONTRACT_PARTICIPANT' } : { allow: false, reason: 'PRIVATE_CONTRACT_NOT_PARTICIPANT' };
      }

      return { allow: false, reason: 'DENY_BY_DEFAULT' };
    },
  },
];

export interface AuthorizationResult extends Decision {
  policy?: string;
}

export function authorize(subject: Subject, request: RequestContext): AuthorizationResult {
  for (const policy of policies) {
    const decision = policy.evaluate(subject, request);
    if (decision.reason !== 'NOT_APPLICABLE') {
      return { ...decision, policy: policy.name };
    }
  }
  return { allow: false, reason: 'NO_POLICY_MATCHED' };
}

export function can(subject: Subject, request: RequestContext): boolean {
  return authorize(subject, request).allow;
}

export function buildSubject(input: Partial<Subject> & { id: string }): Subject {
  return {
    id: input.id,
    roles: input.roles ?? [],
    departmentIds: input.departmentIds ?? [],
  };
}

