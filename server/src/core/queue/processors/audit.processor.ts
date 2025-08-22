import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QueueService, AuditJobData } from '../queue.service';
import { AuditLogService } from '@/modules/contract/audit-log.service';

@Processor('audit')
export class AuditProcessor {
    private readonly logger = new Logger(AuditProcessor.name);

    constructor(
        private readonly auditLogService: AuditLogService,
        private readonly queueService: QueueService,
    ) {}

    @Process('log-audit')
    async handleLogAudit(job: Job<AuditJobData>) {
        this.logger.log(`Processing audit job ${job.id}`);

        try {
            const { userId, action, resource, resourceId, changes, ip, userAgent } = job.data;

            await this.auditLogService.logAction({
                userId,
                action,
                resource,
                resourceId,
                changes,
                ip,
                userAgent,
            });

            this.logger.log(`Audit log created successfully for action: ${action}`);

            // Update job progress
            await job.progress(100);
        } catch (error) {
            this.logger.error(`Failed to log audit: ${error.message}`, error.stack);

            // If job fails after max attempts, log the error
            if (job.attemptsMade >= job.opts.attempts) {
                this.logger.error(`Audit job ${job.id} failed permanently after ${job.attemptsMade} attempts`);
            }

            throw error;
        }
    }

    @Process('bulk-audit-log')
    async handleBulkAuditLog(job: Job<{ audits: AuditJobData[] }>) {
        this.logger.log(`Processing bulk audit job ${job.id}`);

        try {
            const { audits } = job.data;
            const totalAudits = audits.length;

            for (let i = 0; i < totalAudits; i++) {
                const auditData = audits[i];

                await this.auditLogService.logAction({
                    userId: auditData.userId,
                    action: auditData.action,
                    resource: auditData.resource,
                    resourceId: auditData.resourceId,
                    changes: auditData.changes,
                    ip: auditData.ip,
                    userAgent: auditData.userAgent,
                });

                // Update progress
                const progress = Math.round(((i + 1) / totalAudits) * 100);
                await job.progress(progress);

                // Add small delay to prevent overwhelming database
                await new Promise((resolve) => setTimeout(resolve, 10));
            }

            this.logger.log(`Bulk audit job completed successfully. Logged ${totalAudits} audit entries`);
        } catch (error) {
            this.logger.error(`Failed to process bulk audit: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Process('audit-analytics')
    async handleAuditAnalytics(
        job: Job<{
            resource?: string;
            action?: string;
            startDate?: Date;
            endDate?: Date;
            userId?: string;
        }>,
    ) {
        this.logger.log(`Processing audit analytics job ${job.id}`);

        try {
            const { resource, action, startDate, endDate, userId } = job.data;

            // Generate audit analytics
            const analytics = await this.auditLogService.generateAnalytics({
                resource,
                action,
                startDate,
                endDate,
                userId,
            });

            this.logger.log(`Audit analytics generated successfully`);

            // Update job progress
            await job.progress(100);

            return analytics;
        } catch (error) {
            this.logger.error(`Failed to generate audit analytics: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Process('audit-cleanup')
    async handleAuditCleanup(job: Job<{ retentionDays: number }>) {
        this.logger.log(`Processing audit cleanup job ${job.id}`);

        try {
            const { retentionDays } = job.data;

            // Clean up old audit logs
            const deletedCount = await this.auditLogService.cleanupOldLogs(retentionDays);

            this.logger.log(`Audit cleanup completed. Deleted ${deletedCount} old audit entries`);

            // Update job progress
            await job.progress(100);

            return { deletedCount };
        } catch (error) {
            this.logger.error(`Failed to cleanup audit logs: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Process('audit-export')
    async handleAuditExport(
        job: Job<{
            format: 'csv' | 'json' | 'pdf';
            filters: {
                resource?: string;
                action?: string;
                startDate?: Date;
                endDate?: Date;
                userId?: string;
            };
        }>,
    ) {
        this.logger.log(`Processing audit export job ${job.id}`);

        try {
            const { format, filters } = job.data;

            // Export audit logs
            const exportData = await this.auditLogService.exportLogs(format, filters);

            this.logger.log(`Audit export completed successfully in ${format} format`);

            // Update job progress
            await job.progress(100);

            return exportData;
        } catch (error) {
            this.logger.error(`Failed to export audit logs: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Process('audit-compliance-check')
    async handleAuditComplianceCheck(
        job: Job<{
            complianceRules: Array<{
                resource: string;
                action: string;
                requiredFields: string[];
                maxFrequency?: number;
            }>;
            startDate: Date;
            endDate: Date;
        }>,
    ) {
        this.logger.log(`Processing audit compliance check job ${job.id}`);

        try {
            const { complianceRules, startDate, endDate } = job.data;

            const complianceResults = [];

            for (const rule of complianceRules) {
                const result = await this.auditLogService.checkCompliance(rule, startDate, endDate);
                complianceResults.push(result);
            }

            this.logger.log(`Audit compliance check completed. Checked ${complianceRules.length} rules`);

            // Update job progress
            await job.progress(100);

            return { complianceResults };
        } catch (error) {
            this.logger.error(`Failed to check audit compliance: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Process('audit-anomaly-detection')
    async handleAuditAnomalyDetection(
        job: Job<{
            detectionType: 'frequency' | 'pattern' | 'user_behavior';
            threshold: number;
            timeWindow: number; // in minutes
        }>,
    ) {
        this.logger.log(`Processing audit anomaly detection job ${job.id}`);

        try {
            const { detectionType, threshold, timeWindow } = job.data;

            let anomalies;

            switch (detectionType) {
                case 'frequency':
                    anomalies = await this.detectFrequencyAnomalies(threshold, timeWindow);
                    break;
                case 'pattern':
                    anomalies = await this.detectPatternAnomalies(threshold, timeWindow);
                    break;
                case 'user_behavior':
                    anomalies = await this.detectUserBehaviorAnomalies(threshold, timeWindow);
                    break;
                default:
                    throw new Error(`Unknown detection type: ${detectionType}`);
            }

            this.logger.log(`Audit anomaly detection completed. Found ${anomalies.length} anomalies`);

            // Update job progress
            await job.progress(100);

            return { anomalies };
        } catch (error) {
            this.logger.error(`Failed to detect audit anomalies: ${error.message}`, error.stack);
            throw error;
        }
    }

    // Private helper methods for anomaly detection
    private async detectFrequencyAnomalies(threshold: number, timeWindow: number) {
        // TODO: Implement frequency-based anomaly detection
        // This would detect unusual frequency of actions
        this.logger.log(
            `Detecting frequency anomalies with threshold ${threshold} and time window ${timeWindow} minutes`,
        );
        return [];
    }

    private async detectPatternAnomalies(threshold: number, timeWindow: number) {
        // TODO: Implement pattern-based anomaly detection
        // This would detect unusual patterns in audit logs
        this.logger.log(
            `Detecting pattern anomalies with threshold ${threshold} and time window ${timeWindow} minutes`,
        );
        return [];
    }

    private async detectUserBehaviorAnomalies(threshold: number, timeWindow: number) {
        // TODO: Implement user behavior anomaly detection
        // This would detect unusual user behavior patterns
        this.logger.log(
            `Detecting user behavior anomalies with threshold ${threshold} and time window ${timeWindow} minutes`,
        );
        return [];
    }
}
