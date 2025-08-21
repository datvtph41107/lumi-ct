import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '@/core/domain/system/system-config.entity';
import { SystemLog } from '@/core/domain/system/system-log.entity';
import { SystemMetric } from '@/core/domain/system/system-metric.entity';
import { BackupService } from './backup.service';
import { MonitoringService } from './monitoring.service';
import { ConfigurationService } from './configuration.service';
import { QueueService } from '@/core/queue/queue.service';

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: boolean;
    redis: boolean;
    queue: boolean;
    storage: boolean;
  };
  uptime: number;
  version: string;
  timestamp: Date;
}

export interface SystemStats {
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  contracts: {
    total: number;
    active: number;
    draft: number;
    expired: number;
  };
  storage: {
    used: number;
    available: number;
    total: number;
  };
  performance: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);

  constructor(
    @InjectRepository(SystemConfig)
    private readonly configRepository: Repository<SystemConfig>,
    @InjectRepository(SystemLog)
    private readonly logRepository: Repository<SystemLog>,
    @InjectRepository(SystemMetric)
    private readonly metricRepository: Repository<SystemMetric>,
    private readonly backupService: BackupService,
    private readonly monitoringService: MonitoringService,
    private readonly configurationService: ConfigurationService,
    private readonly queueService: QueueService,
  ) {}

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const checks = {
      database: await this.checkDatabaseHealth(),
      redis: await this.checkRedisHealth(),
      queue: await this.checkQueueHealth(),
      storage: await this.checkStorageHealth(),
    };

    const allHealthy = Object.values(checks).every(check => check);
    const anyDegraded = Object.values(checks).some(check => !check);

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (!allHealthy && anyDegraded) {
      status = 'degraded';
    } else if (!allHealthy) {
      status = 'unhealthy';
    }

    return {
      status,
      checks,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date(),
    };
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<SystemStats> {
    const [userStats, contractStats, storageStats, performanceStats] = await Promise.all([
      this.getUserStats(),
      this.getContractStats(),
      this.getStorageStats(),
      this.getPerformanceStats(),
    ]);

    return {
      users: userStats,
      contracts: contractStats,
      storage: storageStats,
      performance: performanceStats,
    };
  }

  /**
   * Get system configuration
   */
  async getSystemConfig(category?: string): Promise<SystemConfig[]> {
    const query = this.configRepository.createQueryBuilder('config');
    
    if (category) {
      query.where('config.category = :category', { category });
    }
    
    return query.orderBy('config.category', 'ASC').addOrderBy('config.key', 'ASC').getMany();
  }

  /**
   * Update system configuration
   */
  async updateSystemConfig(key: string, value: string, userId: string): Promise<SystemConfig> {
    const config = await this.configRepository.findOne({ where: { key } });
    
    if (!config) {
      throw new Error(`Configuration key '${key}' not found`);
    }
    
    if (!config.is_editable) {
      throw new Error(`Configuration key '${key}' is not editable`);
    }

    config.value = value;
    config.updated_by = userId;
    config.updated_at = new Date();

    return this.configRepository.save(config);
  }

  /**
   * Create system log entry
   */
  async createSystemLog(data: {
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    context?: any;
    userId?: string;
    ip?: string;
    userAgent?: string;
  }): Promise<SystemLog> {
    const log = this.logRepository.create({
      level: data.level,
      message: data.message,
      context: data.context ? JSON.stringify(data.context) : null,
      user_id: data.userId,
      ip: data.ip,
      user_agent: data.userAgent,
    });

    return this.logRepository.save(log);
  }

  /**
   * Get system logs
   */
  async getSystemLogs(filters: {
    level?: string;
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ logs: SystemLog[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;

    const query = this.logRepository.createQueryBuilder('log');

    if (filters.level) {
      query.andWhere('log.level = :level', { level: filters.level });
    }

    if (filters.startDate) {
      query.andWhere('log.created_at >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('log.created_at <= :endDate', { endDate: filters.endDate });
    }

    if (filters.userId) {
      query.andWhere('log.user_id = :userId', { userId: filters.userId });
    }

    const [logs, total] = await query
      .orderBy('log.created_at', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { logs, total };
  }

  /**
   * Create system metric
   */
  async createSystemMetric(data: {
    name: string;
    value: number;
    unit: string;
    tags?: any;
  }): Promise<SystemMetric> {
    const metric = this.metricRepository.create({
      name: data.name,
      value: data.value,
      unit: data.unit,
      tags: data.tags ? JSON.stringify(data.tags) : null,
    });

    return this.metricRepository.save(metric);
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics(filters: {
    name?: string;
    startDate?: Date;
    endDate?: Date;
    interval?: string;
  }): Promise<SystemMetric[]> {
    const query = this.metricRepository.createQueryBuilder('metric');

    if (filters.name) {
      query.andWhere('metric.name = :name', { name: filters.name });
    }

    if (filters.startDate) {
      query.andWhere('metric.created_at >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('metric.created_at <= :endDate', { endDate: filters.endDate });
    }

    return query.orderBy('metric.created_at', 'DESC').getMany();
  }

  /**
   * Perform system maintenance
   */
  async performMaintenance(): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log('Starting system maintenance...');

      // Clean up old logs
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      await this.logRepository
        .createQueryBuilder()
        .delete()
        .where('created_at < :date', { date: thirtyDaysAgo })
        .execute();

      // Clean up old metrics
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      await this.metricRepository
        .createQueryBuilder()
        .delete()
        .where('created_at < :date', { date: sevenDaysAgo })
        .execute();

      // Create backup
      await this.backupService.createBackup();

      this.logger.log('System maintenance completed successfully');
      
      return { success: true, message: 'System maintenance completed successfully' };
    } catch (error) {
      this.logger.error('System maintenance failed', error.stack);
      return { success: false, message: 'System maintenance failed' };
    }
  }

  // Private helper methods
  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      await this.configRepository.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  private async checkRedisHealth(): Promise<boolean> {
    try {
      const stats = await this.queueService.getQueueStats();
      return true;
    } catch {
      return false;
    }
  }

  private async checkQueueHealth(): Promise<boolean> {
    try {
      const stats = await this.queueService.getQueueStats();
      return true;
    } catch {
      return false;
    }
  }

  private async checkStorageHealth(): Promise<boolean> {
    try {
      // Check if storage directory is accessible
      const fs = require('fs');
      const path = require('path');
      const storagePath = path.join(process.cwd(), 'uploads');
      fs.accessSync(storagePath, fs.constants.R_OK | fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  private async getUserStats() {
    // Implementation for user statistics
    return {
      total: 0,
      active: 0,
      inactive: 0,
    };
  }

  private async getContractStats() {
    // Implementation for contract statistics
    return {
      total: 0,
      active: 0,
      draft: 0,
      expired: 0,
    };
  }

  private async getStorageStats() {
    // Implementation for storage statistics
    return {
      used: 0,
      available: 0,
      total: 0,
    };
  }

  private async getPerformanceStats() {
    // Implementation for performance statistics
    return {
      cpu: 0,
      memory: 0,
      disk: 0,
    };
  }
}