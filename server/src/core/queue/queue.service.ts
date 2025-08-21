import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';

export interface EmailJobData {
  to: string;
  subject: string;
  template: string;
  context: any;
  attachments?: any[];
}

export interface NotificationJobData {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
}

export interface ContractJobData {
  contractId: string;
  action: 'approve' | 'reject' | 'expire' | 'renew';
  userId: string;
  data?: any;
}

export interface AuditJobData {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: any;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue<EmailJobData>,
    @InjectQueue('notification') private readonly notificationQueue: Queue<NotificationJobData>,
    @InjectQueue('contract') private readonly contractQueue: Queue<ContractJobData>,
    @InjectQueue('audit') private readonly auditQueue: Queue<AuditJobData>,
  ) {}

  /**
   * Add email job to queue
   */
  async addEmailJob(data: EmailJobData, options?: any): Promise<Job<EmailJobData>> {
    return this.emailQueue.add('send-email', data, {
      priority: 1,
      delay: 0,
      ...options,
    });
  }

  /**
   * Add notification job to queue
   */
  async addNotificationJob(data: NotificationJobData, options?: any): Promise<Job<NotificationJobData>> {
    return this.notificationQueue.add('send-notification', data, {
      priority: 2,
      delay: 0,
      ...options,
    });
  }

  /**
   * Add contract job to queue
   */
  async addContractJob(data: ContractJobData, options?: any): Promise<Job<ContractJobData>> {
    return this.contractQueue.add('process-contract', data, {
      priority: 3,
      delay: 0,
      ...options,
    });
  }

  /**
   * Add audit job to queue
   */
  async addAuditJob(data: AuditJobData, options?: any): Promise<Job<AuditJobData>> {
    return this.auditQueue.add('log-audit', data, {
      priority: 4,
      delay: 0,
      ...options,
    });
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const [emailStats, notificationStats, contractStats, auditStats] = await Promise.all([
      this.emailQueue.getJobCounts(),
      this.notificationQueue.getJobCounts(),
      this.contractQueue.getJobCounts(),
      this.auditQueue.getJobCounts(),
    ]);

    return {
      email: emailStats,
      notification: notificationStats,
      contract: contractStats,
      audit: auditStats,
    };
  }

  /**
   * Get failed jobs
   */
  async getFailedJobs(queueName: string, limit: number = 10) {
    const queue = this.getQueueByName(queueName);
    return queue.getFailed(0, limit);
  }

  /**
   * Retry failed job
   */
  async retryJob(queueName: string, jobId: string) {
    const queue = this.getQueueByName(queueName);
    const job = await queue.getJob(jobId);
    if (job) {
      await job.retry();
      return { success: true, message: 'Job retried successfully' };
    }
    return { success: false, message: 'Job not found' };
  }

  /**
   * Remove job from queue
   */
  async removeJob(queueName: string, jobId: string) {
    const queue = this.getQueueByName(queueName);
    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
      return { success: true, message: 'Job removed successfully' };
    }
    return { success: false, message: 'Job not found' };
  }

  /**
   * Clear queue
   */
  async clearQueue(queueName: string) {
    const queue = this.getQueueByName(queueName);
    await queue.empty();
    return { success: true, message: 'Queue cleared successfully' };
  }

  /**
   * Pause queue
   */
  async pauseQueue(queueName: string) {
    const queue = this.getQueueByName(queueName);
    await queue.pause();
    return { success: true, message: 'Queue paused successfully' };
  }

  /**
   * Resume queue
   */
  async resumeQueue(queueName: string) {
    const queue = this.getQueueByName(queueName);
    await queue.resume();
    return { success: true, message: 'Queue resumed successfully' };
  }

  /**
   * Get queue by name
   */
  private getQueueByName(queueName: string): Queue {
    switch (queueName) {
      case 'email':
        return this.emailQueue;
      case 'notification':
        return this.notificationQueue;
      case 'contract':
        return this.contractQueue;
      case 'audit':
        return this.auditQueue;
      default:
        throw new Error(`Queue ${queueName} not found`);
    }
  }

  /**
   * Add delayed email job
   */
  async addDelayedEmailJob(data: EmailJobData, delay: number): Promise<Job<EmailJobData>> {
    return this.emailQueue.add('send-email', data, {
      delay,
      priority: 1,
    });
  }

  /**
   * Add recurring contract job
   */
  async addRecurringContractJob(data: ContractJobData, cronExpression: string): Promise<Job<ContractJobData>> {
    return this.contractQueue.add('process-contract', data, {
      repeat: {
        cron: cronExpression,
      },
      priority: 3,
    });
  }

  /**
   * Add bulk notification jobs
   */
  async addBulkNotificationJobs(data: NotificationJobData[]): Promise<Job<NotificationJobData>[]> {
    const jobs = data.map((item) => ({
      name: 'send-notification',
      data: item,
      opts: {
        priority: 2,
        delay: 0,
      },
    }));

    return this.notificationQueue.addBulk(jobs);
  }
}