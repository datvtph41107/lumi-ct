import type { Queue, QueueJob } from './queue.types';

export class InMemoryQueue implements Queue {
    private readonly handlers = new Map<string, (job: QueueJob) => Promise<void> | void>();

    enqueue<T>(job: QueueJob<T>): void {
        const run = () => {
            const h = this.handlers.get(job.name);
            if (!h) return;
            void Promise.resolve(h(job));
        };
        if (job.delayMs && job.delayMs > 0) setTimeout(run, job.delayMs);
        else setImmediate(run);
    }

    process(jobName: string, handler: (job: QueueJob) => Promise<void> | void): void {
        this.handlers.set(jobName, handler);
    }
}
