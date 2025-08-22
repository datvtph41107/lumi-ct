import type { DepartmentPolicy } from './department-policy.types';

export class DepartmentPolicyRegistry {
    private readonly policies = new Map<string, DepartmentPolicy>();

    register(policy: DepartmentPolicy): void {
        this.policies.set(policy.code.toUpperCase(), policy);
    }

    get(code?: string | null): DepartmentPolicy | undefined {
        if (!code) return undefined;
        return this.policies.get(String(code).toUpperCase());
    }

    list(): DepartmentPolicy[] {
        return Array.from(this.policies.values());
    }
}
