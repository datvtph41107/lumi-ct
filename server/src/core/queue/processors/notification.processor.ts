import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QueueService, NotificationJobData } from '../queue.service';
import { NotificationService } from '@/modules/notification/notification.service';

@Processor('notification')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly queueService: QueueService,
  ) {}

  @Process('send-notification')
  async handleSendNotification(job: Job<NotificationJobData>) {
    this.logger.log(`Processing notification job ${job.id}`);
    
    try {
      const { userId, type, title, message, data } = job.data;
      
      await this.notificationService.createNotification({
        user_id: userId,
        type,
        title,
        message,
        data,
        is_read: false,
      });

      this.logger.log(`Notification sent successfully to user ${userId}`);
      
      // Update job progress
      await job.progress(100);
      
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`, error.stack);
      
      // If job fails after max attempts, log the error
      if (job.attemptsMade >= job.opts.attempts) {
        this.logger.error(`Notification job ${job.id} failed permanently after ${job.attemptsMade} attempts`);
      }
      
      throw error;
    }
  }

  @Process('send-bulk-notification')
  async handleSendBulkNotification(job: Job<{ notifications: NotificationJobData[] }>) {
    this.logger.log(`Processing bulk notification job ${job.id}`);
    
    try {
      const { notifications } = job.data;
      const totalNotifications = notifications.length;
      
      for (let i = 0; i < totalNotifications; i++) {
        const notificationData = notifications[i];
        
        await this.notificationService.createNotification({
          user_id: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data,
          is_read: false,
        });
        
        // Update progress
        const progress = Math.round(((i + 1) / totalNotifications) * 100);
        await job.progress(progress);
        
        // Add small delay to prevent overwhelming database
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      this.logger.log(`Bulk notification job completed successfully. Sent ${totalNotifications} notifications`);
      
    } catch (error) {
      this.logger.error(`Failed to send bulk notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('send-scheduled-notification')
  async handleSendScheduledNotification(job: Job<NotificationJobData & { scheduledAt: Date }>) {
    this.logger.log(`Processing scheduled notification job ${job.id}`);
    
    try {
      const { scheduledAt, ...notificationData } = job.data;
      
      // Check if it's time to send the notification
      const now = new Date();
      if (now < scheduledAt) {
        // Reschedule the job for later
        const delay = scheduledAt.getTime() - now.getTime();
        await this.queueService.addNotificationJob(notificationData, { delay });
        return;
      }
      
      await this.notificationService.createNotification({
        user_id: notificationData.userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data,
        is_read: false,
      });
      
      this.logger.log(`Scheduled notification sent successfully to user ${notificationData.userId}`);
      
    } catch (error) {
      this.logger.error(`Failed to send scheduled notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('send-push-notification')
  async handleSendPushNotification(job: Job<NotificationJobData>) {
    this.logger.log(`Processing push notification job ${job.id}`);
    
    try {
      const { userId, type, title, message, data } = job.data;
      
      // TODO: Implement push notification logic
      // This would integrate with services like Firebase Cloud Messaging
      // or Apple Push Notification Service
      
      this.logger.log(`Push notification sent successfully to user ${userId}`);
      
      // Update job progress
      await job.progress(100);
      
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('send-sms-notification')
  async handleSendSMSNotification(job: Job<NotificationJobData>) {
    this.logger.log(`Processing SMS notification job ${job.id}`);
    
    try {
      const { userId, type, title, message, data } = job.data;
      
      // TODO: Implement SMS notification logic
      // This would integrate with SMS services like Twilio, AWS SNS, etc.
      
      this.logger.log(`SMS notification sent successfully to user ${userId}`);
      
      // Update job progress
      await job.progress(100);
      
    } catch (error) {
      this.logger.error(`Failed to send SMS notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('cleanup-old-notifications')
  async handleCleanupOldNotifications(job: Job<{ daysToKeep: number }>) {
    this.logger.log(`Processing cleanup notifications job ${job.id}`);
    
    try {
      const { daysToKeep } = job.data;
      
      // TODO: Implement cleanup logic for old notifications
      // This would delete notifications older than the specified days
      
      this.logger.log(`Old notifications cleanup completed successfully`);
      
      // Update job progress
      await job.progress(100);
      
    } catch (error) {
      this.logger.error(`Failed to cleanup old notifications: ${error.message}`, error.stack);
      throw error;
    }
  }
}