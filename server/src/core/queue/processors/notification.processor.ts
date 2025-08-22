import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { JOB_QUEUE } from '../queue.module';
import type { Queue, QueueJob } from '../queue.types';
import { EVENT_BUS } from '@/core/event/event-bus.module';
import type { EventBus } from '@/core/event/event-bus.types';

@Injectable()
export class NotificationProcessor implements OnModuleInit {
	constructor(
		@Inject(JOB_QUEUE) private readonly queue: Queue,
		@Inject(EVENT_BUS) private readonly events: EventBus,
	) {}

	onModuleInit() {
		this.queue.process('deliver.notification', async (job: QueueJob) => {
			this.events.publish({ name: 'notification.delivered', payload: job.payload, timestamp: new Date() });
		});
	}
}