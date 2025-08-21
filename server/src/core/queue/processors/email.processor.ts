import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QueueService, EmailJobData } from '../queue.service';
import { EmailService } from '@/modules/notification/email.service';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly queueService: QueueService,
  ) {}

  @Process('send-email')
  async handleSendEmail(job: Job<EmailJobData>) {
    this.logger.log(`Processing email job ${job.id}`);
    
    try {
      const { to, subject, template, context, attachments } = job.data;
      
      await this.emailService.sendEmail({
        to,
        subject,
        template,
        context,
        attachments,
      });

      this.logger.log(`Email sent successfully to ${to}`);
      
      // Update job progress
      await job.progress(100);
      
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      
      // If job fails after max attempts, log the error
      if (job.attemptsMade >= job.opts.attempts) {
        this.logger.error(`Email job ${job.id} failed permanently after ${job.attemptsMade} attempts`);
      }
      
      throw error;
    }
  }

  @Process('send-bulk-email')
  async handleSendBulkEmail(job: Job<{ emails: EmailJobData[] }>) {
    this.logger.log(`Processing bulk email job ${job.id}`);
    
    try {
      const { emails } = job.data;
      const totalEmails = emails.length;
      
      for (let i = 0; i < totalEmails; i++) {
        const emailData = emails[i];
        
        await this.emailService.sendEmail({
          to: emailData.to,
          subject: emailData.subject,
          template: emailData.template,
          context: emailData.context,
          attachments: emailData.attachments,
        });
        
        // Update progress
        const progress = Math.round(((i + 1) / totalEmails) * 100);
        await job.progress(progress);
        
        // Add small delay to prevent overwhelming email service
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      this.logger.log(`Bulk email job completed successfully. Sent ${totalEmails} emails`);
      
    } catch (error) {
      this.logger.error(`Failed to send bulk email: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('send-delayed-email')
  async handleSendDelayedEmail(job: Job<EmailJobData & { delay: number }>) {
    this.logger.log(`Processing delayed email job ${job.id}`);
    
    try {
      const { delay, ...emailData } = job.data;
      
      // Wait for the specified delay
      await new Promise(resolve => setTimeout(resolve, delay));
      
      await this.emailService.sendEmail(emailData);
      
      this.logger.log(`Delayed email sent successfully to ${emailData.to}`);
      
    } catch (error) {
      this.logger.error(`Failed to send delayed email: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('send-scheduled-email')
  async handleSendScheduledEmail(job: Job<EmailJobData & { scheduledAt: Date }>) {
    this.logger.log(`Processing scheduled email job ${job.id}`);
    
    try {
      const { scheduledAt, ...emailData } = job.data;
      
      // Check if it's time to send the email
      const now = new Date();
      if (now < scheduledAt) {
        // Reschedule the job for later
        const delay = scheduledAt.getTime() - now.getTime();
        await this.queueService.addDelayedEmailJob(emailData, delay);
        return;
      }
      
      await this.emailService.sendEmail(emailData);
      
      this.logger.log(`Scheduled email sent successfully to ${emailData.to}`);
      
    } catch (error) {
      this.logger.error(`Failed to send scheduled email: ${error.message}`, error.stack);
      throw error;
    }
  }
}