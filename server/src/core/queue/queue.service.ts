import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { JobOptions, Queue } from 'bull';

@Injectable()
export class QueueService {
	constructor(@InjectQueue('default') private readonly queue: Queue) {}

	async enqueue<T>(name: string, payload: T, opts?: JobOptions) {
		await this.queue.add(name, payload as any, opts);
	}
}