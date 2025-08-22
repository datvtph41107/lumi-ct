export const POLICY_REGISTRY_TOKEN = 'POLICY_REGISTRY_TOKEN';

export type KnownResourceType = 'contract' | 'template' | 'collaborator';
export type ResourceType = KnownResourceType | (string & {});

export interface PolicyContext {
    userId: number;
    roles?: string[];
    departmentId?: number | null;
    capabilities?: Record<string, any>;
    extra?: Record<string, any>;
}

export interface ResourcePolicy<TResourceId = string> {
    resource: ResourceType;
    canView(resourceId: TResourceId, ctx: PolicyContext): Promise<boolean> | boolean;
    canCreate?(payload: any, ctx: PolicyContext): Promise<boolean> | boolean;
    canUpdate?(resourceId: TResourceId, payload: any, ctx: PolicyContext): Promise<boolean> | boolean;
    canDelete?(resourceId: TResourceId, ctx: PolicyContext): Promise<boolean> | boolean;
    getCapabilities?(
        resourceId: TResourceId,
        ctx: PolicyContext,
    ): Promise<Record<string, boolean>> | Record<string, boolean>;
}

export interface PolicyRegistry {
    register(resource: ResourceType, policy: ResourcePolicy): void;
    get(resource: ResourceType): ResourcePolicy | undefined;
    list(): Array<{ resource: ResourceType; policy: ResourcePolicy }>;
}
