import { Global, Module } from '@nestjs/common';
import { DepartmentPolicyRegistry } from './department-policy.registry';

export const DEPARTMENT_POLICY_REGISTRY = 'DEPARTMENT_POLICY_REGISTRY';

@Global()
@Module({
	providers: [
		{ provide: DEPARTMENT_POLICY_REGISTRY, useClass: DepartmentPolicyRegistry },
	],
	exports: [DEPARTMENT_POLICY_REGISTRY],
})
export class DepartmentPolicyModule {}