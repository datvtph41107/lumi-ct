import { Global, Module } from '@nestjs/common';
import { POLICY_REGISTRY_TOKEN } from './policy.tokens';
import { InMemoryPolicyRegistry } from './policy.registry';

@Global()
@Module({
	providers: [
		{ provide: POLICY_REGISTRY_TOKEN, useClass: InMemoryPolicyRegistry },
	],
	exports: [POLICY_REGISTRY_TOKEN],
})
export class PolicyModule {}