export type WorkflowStatus = 'active' | 'completed' | 'cancelled' | 'escalated';

export interface WorkflowStep {
	id: string;
	name: string;
	actions: Array<'approve' | 'reject' | 'request_changes' | 'assign' | 'comment'>;
	conditions?: Record<string, any>;
}

export interface WorkflowDefinition {
	id: string;
	name: string;
	contractType: string;
	steps: WorkflowStep[];
}

export interface WorkflowInstance {
	id: string;
	contractId: string;
	workflowId: string;
	currentStepIndex: number;
	status: WorkflowStatus;
	metadata?: Record<string, any>;
}

export interface WorkflowAugmentor {
	appliesTo(departmentCode: string): boolean;
	augment(definition: WorkflowDefinition): WorkflowDefinition;
}