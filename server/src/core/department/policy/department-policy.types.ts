export interface DepartmentPolicyContext {
	userId: number;
	roles?: string[];
	departmentId?: number | null;
	capabilities?: Record<string, any>;
}

export interface DepartmentPolicy {
	code: string; // e.g., 'HR', 'LEGAL', 'KT'
	name: string;
	// Optional feature toggles and constraints
	features?: Record<string, boolean>;
	constraints?: Record<string, any>;
	// Hooks for custom logic
	beforeContractCreate?(payload: any, ctx: DepartmentPolicyContext): Promise<void> | void;
	afterContractCreate?(contractId: string, ctx: DepartmentPolicyContext): Promise<void> | void;
	canApprove?(contractId: string, ctx: DepartmentPolicyContext): Promise<boolean> | boolean;
}