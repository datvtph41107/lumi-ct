import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SystemService } from './system.service';
import { NotificationService } from '@/modules/notification/notification.service';

export interface SystemMetrics {
  cpu: {
    usage: number;
    load: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
  };
  uptime: number;
  timestamp: Date;
}

export interface PerformanceAlert {
  type: 'cpu_high' | 'memory_high' | 'disk_full' | 'error_rate_high';
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private readonly alerts: PerformanceAlert[] = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly systemService: SystemService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Collect system metrics
   */
  async collectSystemMetrics(): Promise<SystemMetrics> {
    const [cpu, memory, disk, network, uptime] = await Promise.all([
      this.getCpuMetrics(),
      this.getMemoryMetrics(),
      this.getDiskMetrics(),
      this.getNetworkMetrics(),
      this.getUptime(),
    ]);

    const metrics: SystemMetrics = {
      cpu,
      memory,
      disk,
      network,
      uptime,
      timestamp: new Date(),
    };

    // Store metrics
    await this.systemService.createSystemMetric({
      name: 'system_performance',
      value: memory.usage,
      unit: 'percent',
      tags: { type: 'memory_usage' },
    });

    // Check for alerts
    await this.checkPerformanceAlerts(metrics);

    return metrics;
  }

  /**
   * Get CPU metrics
   */
  private async getCpuMetrics(): Promise<{ usage: number; load: number[] }> {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      // Get CPU usage
      const { stdout: cpuUsage } = await execAsync('top -bn1 | grep "Cpu(s)" | awk \'{print $2}\' | awk -F\'%\' \'{print $1}\'');
      const usage = parseFloat(cpuUsage.trim()) || 0;

      // Get load average
      const { stdout: loadAvg } = await execAsync('uptime | awk -F\'load average:\' \'{print $2}\' | awk \'{print $1, $2, $3}\'');
      const load = loadAvg.trim().split(',').map(l => parseFloat(l) || 0);

      return { usage, load };
    } catch (error) {
      this.logger.error('Failed to get CPU metrics', error);
      return { usage: 0, load: [0, 0, 0] };
    }
  }

  /**
   * Get memory metrics
   */
  private async getMemoryMetrics(): Promise<{ total: number; used: number; free: number; usage: number }> {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      const { stdout } = await execAsync('free -m');
      const lines = stdout.trim().split('\n');
      const memLine = lines[1].split(/\s+/);

      const total = parseInt(memLine[1]) * 1024 * 1024; // Convert to bytes
      const used = parseInt(memLine[2]) * 1024 * 1024;
      const free = parseInt(memLine[3]) * 1024 * 1024;
      const usage = (used / total) * 100;

      return { total, used, free, usage };
    } catch (error) {
      this.logger.error('Failed to get memory metrics', error);
      return { total: 0, used: 0, free: 0, usage: 0 };
    }
  }

  /**
   * Get disk metrics
   */
  private async getDiskMetrics(): Promise<{ total: number; used: number; free: number; usage: number }> {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      const { stdout } = await execAsync('df -h / | tail -1');
      const parts = stdout.trim().split(/\s+/);

      const total = this.parseSize(parts[1]);
      const used = this.parseSize(parts[2]);
      const free = this.parseSize(parts[3]);
      const usage = (used / total) * 100;

      return { total, used, free, usage };
    } catch (error) {
      this.logger.error('Failed to get disk metrics', error);
      return { total: 0, used: 0, free: 0, usage: 0 };
    }
  }

  /**
   * Get network metrics
   */
  private async getNetworkMetrics(): Promise<{ bytesIn: number; bytesOut: number }> {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      const { stdout } = await execAsync('cat /proc/net/dev | grep eth0');
      const parts = stdout.trim().split(/\s+/);

      const bytesIn = parseInt(parts[1]) || 0;
      const bytesOut = parseInt(parts[9]) || 0;

      return { bytesIn, bytesOut };
    } catch (error) {
      this.logger.error('Failed to get network metrics', error);
      return { bytesIn: 0, bytesOut: 0 };
    }
  }

  /**
   * Get system uptime
   */
  private async getUptime(): Promise<number> {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      const { stdout } = await execAsync('uptime -p');
      const uptimeStr = stdout.trim();
      
      // Parse uptime string like "up 2 days, 3 hours, 45 minutes"
      const days = (uptimeStr.match(/(\d+) days?/) || [0, 0])[1];
      const hours = (uptimeStr.match(/(\d+) hours?/) || [0, 0])[1];
      const minutes = (uptimeStr.match(/(\d+) minutes?/) || [0, 0])[1];

      return (parseInt(days) * 24 * 60 + parseInt(hours) * 60 + parseInt(minutes)) * 60; // Convert to seconds
    } catch (error) {
      this.logger.error('Failed to get uptime', error);
      return process.uptime();
    }
  }

  /**
   * Check performance alerts
   */
  private async checkPerformanceAlerts(metrics: SystemMetrics): Promise<void> {
    const alerts: PerformanceAlert[] = [];

    // CPU usage alert
    if (metrics.cpu.usage > 80) {
      alerts.push({
        type: 'cpu_high',
        message: `CPU usage is high: ${metrics.cpu.usage.toFixed(1)}%`,
        value: metrics.cpu.usage,
        threshold: 80,
        timestamp: new Date(),
      });
    }

    // Memory usage alert
    if (metrics.memory.usage > 85) {
      alerts.push({
        type: 'memory_high',
        message: `Memory usage is high: ${metrics.memory.usage.toFixed(1)}%`,
        value: metrics.memory.usage,
        threshold: 85,
        timestamp: new Date(),
      });
    }

    // Disk usage alert
    if (metrics.disk.usage > 90) {
      alerts.push({
        type: 'disk_full',
        message: `Disk usage is high: ${metrics.disk.usage.toFixed(1)}%`,
        value: metrics.disk.usage,
        threshold: 90,
        timestamp: new Date(),
      });
    }

    // Send alerts if any
    for (const alert of alerts) {
      await this.sendPerformanceAlert(alert);
    }

    // Store alerts
    this.alerts.push(...alerts);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.splice(0, this.alerts.length - 100);
    }
  }

  /**
   * Send performance alert
   */
  private async sendPerformanceAlert(alert: PerformanceAlert): Promise<void> {
    try {
      await this.notificationService.sendAdminAlert({
        type: 'performance_alert',
        title: 'System Performance Alert',
        message: alert.message,
        data: {
          alertType: alert.type,
          value: alert.value,
          threshold: alert.threshold,
          timestamp: alert.timestamp,
        },
      });

      this.logger.warn(`Performance alert sent: ${alert.message}`);
    } catch (error) {
      this.logger.error('Failed to send performance alert', error);
    }
  }

  /**
   * Get performance alerts
   */
  getPerformanceAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: SystemMetrics;
    alerts: PerformanceAlert[];
  }> {
    const metrics = await this.collectSystemMetrics();
    const alerts = this.getPerformanceAlerts();

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (metrics.cpu.usage > 90 || metrics.memory.usage > 95 || metrics.disk.usage > 95) {
      status = 'unhealthy';
    } else if (metrics.cpu.usage > 70 || metrics.memory.usage > 80 || metrics.disk.usage > 85) {
      status = 'degraded';
    }

    return { status, metrics, alerts };
  }

  /**
   * Parse size string (e.g., "100G" to bytes)
   */
  private parseSize(sizeStr: string): number {
    const units: { [key: string]: number } = {
      'K': 1024,
      'M': 1024 * 1024,
      'G': 1024 * 1024 * 1024,
      'T': 1024 * 1024 * 1024 * 1024,
    };

    const match = sizeStr.match(/^(\d+(?:\.\d+)?)([KMGT])?$/);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2] || 'B';

    return value * (units[unit] || 1);
  }
}