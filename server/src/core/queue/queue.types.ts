export interface QueueJob<T = any> {
    name: string;
    payload: T;
    priority?: 'low' | 'normal' | 'high';
    delayMs?: number;
}

export interface Queue {
    enqueue<T>(job: QueueJob<T>): Promise<void> | void;
    process(jobName: string, handler: (job: QueueJob) => Promise<void> | void): void;
}
