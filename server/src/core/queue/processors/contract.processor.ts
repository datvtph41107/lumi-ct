import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';

@Processor('default')
export class ContractProcessor {
	@Process('contract.export')
	async exportContract(job: Job) {
		// Generate export file here
		return true;
	}
}