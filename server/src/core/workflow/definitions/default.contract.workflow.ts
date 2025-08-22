import type { WorkflowDefinition } from '../workflow.types';

export const DefaultContractWorkflow: WorkflowDefinition = {
	id: 'default_contract',
	name: 'Default Contract Workflow',
	contractType: 'generic',
	steps: [
		{ id: 'draft', name: 'Soạn thảo', actions: ['assign', 'comment'] },
		{ id: 'review', name: 'Duyệt', actions: ['approve', 'reject', 'request_changes', 'comment'] },
		{ id: 'approval', name: 'Phê duyệt', actions: ['approve', 'reject', 'comment'] },
		{ id: 'signature', name: 'Ký kết', actions: ['approve', 'comment'] },
	],
};