import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';

@Processor('default')
export class AuditProcessor {
	@Process('audit.log')
	async audit(job: Job) {
		// Persist or forward audit logs
		return true;
	}
}