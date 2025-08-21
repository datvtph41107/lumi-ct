import type { PolicyRegistry, ResourcePolicy, ResourceType } from './policy.types';

export class InMemoryPolicyRegistry implements PolicyRegistry {
	private readonly policies = new Map<ResourceType, ResourcePolicy>();

	register(resource: ResourceType, policy: ResourcePolicy): void {
		this.policies.set(resource, policy);
	}

	get(resource: ResourceType): ResourcePolicy | undefined {
		return this.policies.get(resource);
	}

	list(): Array<{ resource: ResourceType; policy: ResourcePolicy }> {
		return Array.from(this.policies.entries()).map(([resource, policy]) => ({ resource, policy }));
	}
}