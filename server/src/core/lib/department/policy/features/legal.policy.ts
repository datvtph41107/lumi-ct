import { DepartmentPolicy, DepartmentPolicyContext } from '../department-policy.types';

export class LegalDepartmentPolicy implements DepartmentPolicy {
    code = 'LEGAL';
    name = 'Phòng Pháp chế';
    features = { dualApproval: true };

    canApprove(_contractId: string, ctx: DepartmentPolicyContext): boolean {
        // Require manager or someone flagged by capability (e.g., legal_approver)
        const isManager = (ctx.roles || []).includes('MANAGER');
        const isLegalApprover = !!ctx.capabilities?.legal_approver;
        return isManager || isLegalApprover;
    }
}
