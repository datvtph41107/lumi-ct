import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SystemService } from './system.service';
import { BackupService } from './backup.service';
import { MonitoringService } from './monitoring.service';
import { ConfigurationService } from './configuration.service';
import { AuthGuardAccess } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/role.guard';
import { Roles } from '@/core/shared/decorators/roles.decorator';
import { Role } from '@/core/shared/enums/base.enums';
import { CurrentUser } from '@/core/shared/decorators/setmeta.decorator';
import { User } from '@/core/domain/user/user.entity';

export class UpdateConfigDto {
  @ApiOperation({ description: 'Configuration value' })
  value: any;
}

export class CreateBackupDto {
  @ApiOperation({ description: 'Backup type' })
  type: 'database' | 'files' | 'full';
}

export class RestoreBackupDto {
  @ApiOperation({ description: 'Backup filename' })
  filename: string;
}

@ApiTags('System')
@Controller('system')
@UseGuards(AuthGuardAccess, RolesGuard)
@ApiBearerAuth()
export class SystemController {
  constructor(
    private readonly systemService: SystemService,
    private readonly backupService: BackupService,
    private readonly monitoringService: MonitoringService,
    private readonly configurationService: ConfigurationService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'System health retrieved successfully' })
  async getSystemHealth() {
    return this.systemService.getSystemHealth();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get system statistics' })
  @ApiResponse({ status: 200, description: 'System statistics retrieved successfully' })
  async getSystemStats() {
    return this.systemService.getSystemStats();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get system metrics' })
  @ApiResponse({ status: 200, description: 'System metrics retrieved successfully' })
  async getSystemMetrics() {
    return this.monitoringService.collectSystemMetrics();
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get system performance data' })
  @ApiResponse({ status: 200, description: 'Performance data retrieved successfully' })
  async getSystemPerformance() {
    return this.monitoringService.getSystemHealth();
  }

  @Get('config')
  @ApiOperation({ summary: 'Get system configurations' })
  @ApiResponse({ status: 200, description: 'Configurations retrieved successfully' })
  async getSystemConfigs(@Query('category') category?: string) {
    if (category) {
      return this.configurationService.getConfigsByCategory(category);
    }
    return this.configurationService.getAllConfigs();
  }

  @Put('config/:key')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update system configuration' })
  @ApiResponse({ status: 200, description: 'Configuration updated successfully' })
  async updateSystemConfig(
    @Param('key') key: string,
    @Body() body: UpdateConfigDto,
    @CurrentUser() user: User,
  ) {
    return this.configurationService.setConfig(key, body.value, { userId: user.id });
  }

  @Delete('config/:key')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete system configuration' })
  @ApiResponse({ status: 200, description: 'Configuration deleted successfully' })
  async deleteSystemConfig(
    @Param('key') key: string,
    @CurrentUser() user: User,
  ) {
    await this.configurationService.deleteConfig(key, user.id);
    return { success: true, message: 'Configuration deleted successfully' };
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get system logs' })
  @ApiResponse({ status: 200, description: 'System logs retrieved successfully' })
  async getSystemLogs(
    @Query('level') level?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.systemService.getSystemLogs({
      level,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      userId,
      page,
      limit,
    });
  }

  @Post('maintenance')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Perform system maintenance' })
  @ApiResponse({ status: 200, description: 'Maintenance completed successfully' })
  async performMaintenance() {
    return this.systemService.performMaintenance();
  }

  @Get('backups')
  @ApiOperation({ summary: 'List available backups' })
  @ApiResponse({ status: 200, description: 'Backups listed successfully' })
  async listBackups() {
    return this.backupService.listBackups();
  }

  @Get('backups/stats')
  @ApiOperation({ summary: 'Get backup statistics' })
  @ApiResponse({ status: 200, description: 'Backup statistics retrieved successfully' })
  async getBackupStats() {
    return this.backupService.getBackupStats();
  }

  @Post('backups')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create system backup' })
  @ApiResponse({ status: 200, description: 'Backup created successfully' })
  async createBackup(@Body() body: CreateBackupDto) {
    switch (body.type) {
      case 'database':
        const timestamp = new Date().toISOString().split('T')[0];
        const dbBackup = await this.backupService.createDatabaseBackup(`backup-${timestamp}.sql`);
        return { success: true, backup: dbBackup };
      
      case 'files':
        const fileTimestamp = new Date().toISOString().split('T')[0];
        const fileBackup = await this.backupService.createFileBackup(fileTimestamp);
        return { success: true, backup: fileBackup };
      
      case 'full':
        const fullBackup = await this.backupService.createFullBackup();
        return { success: true, backup: fullBackup };
      
      default:
        throw new Error('Invalid backup type');
    }
  }

  @Post('backups/restore')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Restore from backup' })
  @ApiResponse({ status: 200, description: 'Backup restored successfully' })
  async restoreBackup(@Body() body: RestoreBackupDto) {
    if (body.filename.endsWith('.sql')) {
      await this.backupService.restoreDatabaseBackup(body.filename);
    } else if (body.filename.endsWith('.tar.gz')) {
      await this.backupService.restoreFileBackup(body.filename);
    } else {
      throw new Error('Invalid backup file format');
    }
    
    return { success: true, message: 'Backup restored successfully' };
  }

  @Post('backups/cleanup')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Clean old backups' })
  @ApiResponse({ status: 200, description: 'Old backups cleaned successfully' })
  async cleanupBackups(@Query('retentionDays') retentionDays?: number) {
    await this.backupService.cleanOldBackups(retentionDays);
    return { success: true, message: 'Old backups cleaned successfully' };
  }

  @Get('cache/stats')
  @ApiOperation({ summary: 'Get cache statistics' })
  @ApiResponse({ status: 200, description: 'Cache statistics retrieved successfully' })
  async getCacheStats() {
    return this.configurationService.getCacheStats();
  }

  @Post('cache/clear')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Clear configuration cache' })
  @ApiResponse({ status: 200, description: 'Cache cleared successfully' })
  async clearCache() {
    this.configurationService.clearCache();
    return { success: true, message: 'Cache cleared successfully' };
  }

  @Post('config/init')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Initialize default configurations' })
  @ApiResponse({ status: 200, description: 'Default configurations initialized successfully' })
  async initializeConfigs() {
    await this.configurationService.initializeDefaultConfigs();
    return { success: true, message: 'Default configurations initialized successfully' };
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get performance alerts' })
  @ApiResponse({ status: 200, description: 'Performance alerts retrieved successfully' })
  async getPerformanceAlerts() {
    return this.monitoringService.getPerformanceAlerts();
  }
}