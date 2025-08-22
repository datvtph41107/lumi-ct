import { DepartmentPolicy, DepartmentPolicyContext } from '../department-policy.types';

export class AccountingDepartmentPolicy implements DepartmentPolicy {
    code = 'KT';
    name = 'Phòng Kế toán';
    features = { financialControls: true };

    canApprove(_contractId: string, ctx: DepartmentPolicyContext): boolean {
        // KT approval requires manager role
        return (ctx.roles || []).includes('MANAGER');
    }
}
