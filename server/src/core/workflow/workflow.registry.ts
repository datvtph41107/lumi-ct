import type { WorkflowAugmentor, WorkflowDefinition } from './workflow.types';

export class WorkflowRegistry {
	private readonly definitions = new Map<string, WorkflowDefinition>();
	private readonly augmentors: WorkflowAugmentor[] = [];

	register(def: WorkflowDefinition): void {
		this.definitions.set(def.id, def);
	}

	get(id: string, departmentCode?: string): WorkflowDefinition | undefined {
		const base = this.definitions.get(id);
		if (!base) return undefined;
		if (!departmentCode) return base;
		let result = { ...base, steps: base.steps.map((s) => ({ ...s })) } as WorkflowDefinition;
		for (const aug of this.augmentors) {
			// naive apply: if augmentor applies, transform
			try {
				if (aug.appliesTo(departmentCode)) result = aug.augment(result);
			} catch (_e) {
				// ignore faulty augmentors to keep core safe
			}
		}
		return result;
	}

	use(augmentor: WorkflowAugmentor): void {
		this.augmentors.push(augmentor);
	}

	list(): WorkflowDefinition[] {
		return Array.from(this.definitions.values());
	}
}