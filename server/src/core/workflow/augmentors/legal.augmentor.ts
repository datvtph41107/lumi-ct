import type { WorkflowAugmentor, WorkflowDefinition } from '../workflow.types';

export class LegalWorkflowAugmentor implements WorkflowAugmentor {
	appliesTo(departmentCode: string): boolean {
		return String(departmentCode || '').toUpperCase() === 'LEGAL';
	}

	augment(definition: WorkflowDefinition): WorkflowDefinition {
		// Insert a legal-review step before the final step if not present
		const steps = [...definition.steps];
		const hasLegalReview = steps.some((s) => s.id === 'legal_review');
		if (!hasLegalReview) {
			const approvalIndex = Math.max(0, steps.length - 1);
			steps.splice(approvalIndex, 0, {
				id: 'legal_review',
				name: 'Duyệt Pháp lý',
				actions: ['approve', 'reject', 'request_changes', 'comment'],
				conditions: { department: 'LEGAL' },
			});
		}
		return { ...definition, steps };
	}
}