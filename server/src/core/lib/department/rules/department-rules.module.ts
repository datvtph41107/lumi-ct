import { Global, Module } from '@nestjs/common';
import { DEPARTMENT_POLICY_REGISTRY } from '@/core/lib/department/policy/department-policy.module';

export const DEPARTMENT_RULES_REGISTRY = DEPARTMENT_POLICY_REGISTRY;

@Global()
@Module({
    exports: [DEPARTMENT_RULES_REGISTRY],
})
export class DepartmentRulesModule {}
