import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

export const JOB_QUEUE = 'JOB_QUEUE';

@Global()
@Module({
	imports: [
		BullModule.forRoot({
			redis: {
				host: process.env.REDIS_HOST || 'localhost',
				port: Number(process.env.REDIS_PORT || 6379),
				password: process.env.REDIS_PASSWORD || undefined,
			},
		}),
		BullModule.registerQueue({ name: 'default' }),
	],
	exports: [BullModule],
})
export class QueueModule {}