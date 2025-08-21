import { describe, it, expect } from 'vitest';
import { authorize, buildSubject } from '../src/index';

describe('Authorization policies', () => {
  const admin = buildSubject({ id: 'u1', roles: ['ADMIN'] });
  const managerA = buildSubject({ id: 'u2', roles: ['MANAGER'], departmentIds: ['depA'] });
  const managerB = buildSubject({ id: 'u3', roles: ['MANAGER'], departmentIds: ['depB'] });
  const staff = buildSubject({ id: 'u4', roles: ['STAFF'] });
  const collaborator = buildSubject({ id: 'u5', roles: ['COLLABORATOR'] });

  it('admin pages: only admin allowed', () => {
    expect(authorize(admin, { resourceType: 'ADMIN_PAGES', action: 'READ' }).allow).toBe(true);
    expect(authorize(managerA, { resourceType: 'ADMIN_PAGES', action: 'READ' }).allow).toBe(false);
  });

  it('department: only manager of that department (or admin)', () => {
    expect(authorize(managerA, { resourceType: 'DEPARTMENT', departmentId: 'depA', action: 'MANAGE' }).allow).toBe(true);
    expect(authorize(managerA, { resourceType: 'DEPARTMENT', departmentId: 'depB', action: 'MANAGE' }).allow).toBe(false);
    expect(authorize(admin, { resourceType: 'DEPARTMENT', departmentId: 'depB', action: 'MANAGE' }).allow).toBe(true);
  });

  it('contracts: managers can read all', () => {
    const contract = { departmentId: 'depA', isPublic: false, participantUserIds: [] };
    expect(authorize(managerA, { resourceType: 'CONTRACT', action: 'READ', contract }).allow).toBe(true);
    expect(authorize(managerB, { resourceType: 'CONTRACT', action: 'READ', contract }).allow).toBe(true);
  });

  it('contracts: public readable by staff', () => {
    const contract = { departmentId: 'depA', isPublic: true, participantUserIds: [] };
    expect(authorize(staff, { resourceType: 'CONTRACT', action: 'READ', contract }).allow).toBe(true);
    expect(authorize(collaborator, { resourceType: 'CONTRACT', action: 'READ', contract }).allow).toBe(false);
  });

  it('contracts: private readable only by participants', () => {
    const contract = { departmentId: 'depA', isPublic: false, participantUserIds: ['u5'] };
    expect(authorize(collaborator, { resourceType: 'CONTRACT', action: 'READ', contract }).allow).toBe(true);
    expect(authorize(staff, { resourceType: 'CONTRACT', action: 'READ', contract }).allow).toBe(false);
  });

  it('contracts: participants can write their contracts; others cannot', () => {
    const contract = { departmentId: 'depA', isPublic: false, participantUserIds: ['u5'] };
    expect(authorize(collaborator, { resourceType: 'CONTRACT', action: 'WRITE', contract }).allow).toBe(true);
    expect(authorize(managerA, { resourceType: 'CONTRACT', action: 'WRITE', contract }).allow).toBe(false);
    expect(authorize(staff, { resourceType: 'CONTRACT', action: 'WRITE', contract }).allow).toBe(false);
  });
});

