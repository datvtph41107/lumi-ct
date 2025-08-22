import { DepartmentPolicy, DepartmentPolicyContext } from '../department-policy.types';

export class AdministrativeDepartmentPolicy implements DepartmentPolicy {
    code = 'HC';
    name = 'Phòng Hành chính';
    features = { canDraftContracts: true };

    canApprove(_contractId: string, ctx: DepartmentPolicyContext): boolean {
        // Typically HC does not approve final financial steps; allow managers only
        return (ctx.roles || []).includes('MANAGER');
    }
}
