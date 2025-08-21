import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QueueService, ContractJobData } from '../queue.service';
import { ContractService } from '@/modules/contract/contract.service';
import { NotificationService } from '@/modules/notification/notification.service';

@Processor('contract')
export class ContractProcessor {
  private readonly logger = new Logger(ContractProcessor.name);

  constructor(
    private readonly contractService: ContractService,
    private readonly notificationService: NotificationService,
    private readonly queueService: QueueService,
  ) {}

  @Process('process-contract')
  async handleProcessContract(job: Job<ContractJobData>) {
    this.logger.log(`Processing contract job ${job.id}`);
    
    try {
      const { contractId, action, userId, data } = job.data;
      
      switch (action) {
        case 'approve':
          await this.handleContractApproval(contractId, userId, data);
          break;
        case 'reject':
          await this.handleContractRejection(contractId, userId, data);
          break;
        case 'expire':
          await this.handleContractExpiration(contractId, userId, data);
          break;
        case 'renew':
          await this.handleContractRenewal(contractId, userId, data);
          break;
        default:
          throw new Error(`Unknown contract action: ${action}`);
      }

      this.logger.log(`Contract ${action} processed successfully for contract ${contractId}`);
      
      // Update job progress
      await job.progress(100);
      
    } catch (error) {
      this.logger.error(`Failed to process contract: ${error.message}`, error.stack);
      
      // If job fails after max attempts, log the error
      if (job.attemptsMade >= job.opts.attempts) {
        this.logger.error(`Contract job ${job.id} failed permanently after ${job.attemptsMade} attempts`);
      }
      
      throw error;
    }
  }

  @Process('contract-reminder')
  async handleContractReminder(job: Job<{ contractId: string; reminderType: string; userId: string }>) {
    this.logger.log(`Processing contract reminder job ${job.id}`);
    
    try {
      const { contractId, reminderType, userId } = job.data;
      
      // Get contract details
      const contract = await this.contractService.getContract(contractId);
      if (!contract) {
        throw new Error(`Contract ${contractId} not found`);
      }

      // Send reminder notification
      await this.notificationService.createNotification({
        user_id: userId,
        type: 'contract_reminder',
        title: 'Contract Reminder',
        message: `Contract "${contract.name}" requires your attention. Type: ${reminderType}`,
        data: {
          contractId,
          contractName: contract.name,
          reminderType,
        },
        is_read: false,
      });

      this.logger.log(`Contract reminder sent successfully for contract ${contractId}`);
      
      // Update job progress
      await job.progress(100);
      
    } catch (error) {
      this.logger.error(`Failed to send contract reminder: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('contract-expiry-check')
  async handleContractExpiryCheck(job: Job<{ daysBeforeExpiry: number }>) {
    this.logger.log(`Processing contract expiry check job ${job.id}`);
    
    try {
      const { daysBeforeExpiry } = job.data;
      
      // Get contracts expiring soon
      const expiringContracts = await this.contractService.getExpiringContracts(daysBeforeExpiry);
      
      for (const contract of expiringContracts) {
        // Send expiry notification to contract owner
        await this.notificationService.createNotification({
          user_id: contract.created_by,
          type: 'contract_expiry',
          title: 'Contract Expiry Warning',
          message: `Contract "${contract.name}" will expire in ${daysBeforeExpiry} days`,
          data: {
            contractId: contract.id,
            contractName: contract.name,
            expiryDate: contract.expires_at,
            daysRemaining: daysBeforeExpiry,
          },
          is_read: false,
        });

        // Send notification to collaborators
        const collaborators = await this.contractService.getContractCollaborators(contract.id);
        for (const collaborator of collaborators) {
          await this.notificationService.createNotification({
            user_id: collaborator.user_id,
            type: 'contract_expiry',
            title: 'Contract Expiry Warning',
            message: `Contract "${contract.name}" will expire in ${daysBeforeExpiry} days`,
            data: {
              contractId: contract.id,
              contractName: contract.name,
              expiryDate: contract.expires_at,
              daysRemaining: daysBeforeExpiry,
            },
            is_read: false,
          });
        }
      }

      this.logger.log(`Contract expiry check completed. Found ${expiringContracts.length} expiring contracts`);
      
      // Update job progress
      await job.progress(100);
      
    } catch (error) {
      this.logger.error(`Failed to check contract expiry: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('contract-auto-archive')
  async handleContractAutoArchive(job: Job<{ daysAfterExpiry: number }>) {
    this.logger.log(`Processing contract auto-archive job ${job.id}`);
    
    try {
      const { daysAfterExpiry } = job.data;
      
      // Get expired contracts that should be archived
      const expiredContracts = await this.contractService.getExpiredContracts(daysAfterExpiry);
      
      for (const contract of expiredContracts) {
        await this.contractService.archiveContract(contract.id, 'system');
      }

      this.logger.log(`Contract auto-archive completed. Archived ${expiredContracts.length} contracts`);
      
      // Update job progress
      await job.progress(100);
      
    } catch (error) {
      this.logger.error(`Failed to auto-archive contracts: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('contract-analytics')
  async handleContractAnalytics(job: Job<{ contractId: string; analyticsType: string }>) {
    this.logger.log(`Processing contract analytics job ${job.id}`);
    
    try {
      const { contractId, analyticsType } = job.data;
      
      // Generate analytics based on type
      switch (analyticsType) {
        case 'usage':
          await this.generateContractUsageAnalytics(contractId);
          break;
        case 'performance':
          await this.generateContractPerformanceAnalytics(contractId);
          break;
        case 'compliance':
          await this.generateContractComplianceAnalytics(contractId);
          break;
        default:
          throw new Error(`Unknown analytics type: ${analyticsType}`);
      }

      this.logger.log(`Contract analytics generated successfully for contract ${contractId}`);
      
      // Update job progress
      await job.progress(100);
      
    } catch (error) {
      this.logger.error(`Failed to generate contract analytics: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Private helper methods
  private async handleContractApproval(contractId: string, userId: string, data?: any) {
    await this.contractService.approveContract(contractId, userId, data?.comment);
    
    // Send approval notification
    await this.notificationService.createNotification({
      user_id: userId,
      type: 'contract_approved',
      title: 'Contract Approved',
      message: `Contract has been approved successfully`,
      data: { contractId, approvedBy: userId },
      is_read: false,
    });
  }

  private async handleContractRejection(contractId: string, userId: string, data?: any) {
    await this.contractService.rejectContract(contractId, userId, data?.reason);
    
    // Send rejection notification
    await this.notificationService.createNotification({
      user_id: userId,
      type: 'contract_rejected',
      title: 'Contract Rejected',
      message: `Contract has been rejected: ${data?.reason || 'No reason provided'}`,
      data: { contractId, rejectedBy: userId, reason: data?.reason },
      is_read: false,
    });
  }

  private async handleContractExpiration(contractId: string, userId: string, data?: any) {
    await this.contractService.expireContract(contractId, userId);
    
    // Send expiration notification
    await this.notificationService.createNotification({
      user_id: userId,
      type: 'contract_expired',
      title: 'Contract Expired',
      message: `Contract has expired`,
      data: { contractId, expiredBy: userId },
      is_read: false,
    });
  }

  private async handleContractRenewal(contractId: string, userId: string, data?: any) {
    await this.contractService.renewContract(contractId, userId, data?.newExpiryDate);
    
    // Send renewal notification
    await this.notificationService.createNotification({
      user_id: userId,
      type: 'contract_renewed',
      title: 'Contract Renewed',
      message: `Contract has been renewed successfully`,
      data: { contractId, renewedBy: userId, newExpiryDate: data?.newExpiryDate },
      is_read: false,
    });
  }

  private async generateContractUsageAnalytics(contractId: string) {
    // TODO: Implement contract usage analytics
    // This would track how often the contract is accessed, viewed, etc.
    this.logger.log(`Generating usage analytics for contract ${contractId}`);
  }

  private async generateContractPerformanceAnalytics(contractId: string) {
    // TODO: Implement contract performance analytics
    // This would track contract performance metrics
    this.logger.log(`Generating performance analytics for contract ${contractId}`);
  }

  private async generateContractComplianceAnalytics(contractId: string) {
    // TODO: Implement contract compliance analytics
    // This would track compliance with contract terms
    this.logger.log(`Generating compliance analytics for contract ${contractId}`);
  }
}