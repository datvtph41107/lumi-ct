import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { EVENT_BUS } from '@/core/event/event-bus.module';
import type { EventBus } from '@/core/event/event-bus.types';
import { Inject } from '@nestjs/common';

@Processor('default')
export class NotificationProcessor {
	constructor(@Inject(EVENT_BUS) private readonly events: EventBus) {}

	@Process('deliver.notification')
	async handleDeliver(job: Job) {
		this.events.publish({ name: 'notification.delivered', payload: job.data, timestamp: new Date() });
	}
}