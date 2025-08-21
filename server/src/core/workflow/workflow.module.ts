import { Global, Module } from '@nestjs/common';
import { WorkflowRegistry } from './workflow.registry';

export const WORKFLOW_REGISTRY = 'WORKFLOW_REGISTRY';

@Global()
@Module({
	providers: [
		{ provide: WORKFLOW_REGISTRY, useClass: WorkflowRegistry },
	],
	exports: [WORKFLOW_REGISTRY],
})
export class WorkflowModule {}