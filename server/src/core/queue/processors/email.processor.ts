import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';

@Processor('default')
export class EmailProcessor {
	@Process('send.email')
	async handle(job: Job) {
		// Integrate with mailer provider here
		return true;
	}
}