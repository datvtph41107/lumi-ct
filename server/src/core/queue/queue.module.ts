import { Global, Module } from '@nestjs/common';
import { InMemoryQueue } from './queue.memory';

export const JOB_QUEUE = 'JOB_QUEUE';

@Global()
@Module({
	providers: [
		{ provide: JOB_QUEUE, useClass: InMemoryQueue },
	],
	exports: [JOB_QUEUE],
})
export class QueueModule {}