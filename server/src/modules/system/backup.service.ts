import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir, readdir, unlink } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Create database backup
   */
  async createDatabaseBackup(filename: string): Promise<string> {
    const backupDir = this.configService.get<string>('BACKUP_DIR', './backups');
    const backupPath = join(backupDir, filename);

    // Ensure backup directory exists
    await mkdir(backupDir, { recursive: true });

    const dbConfig = {
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 3306),
      user: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASS'),
      database: this.configService.get<string>('DB_NAME'),
    };

    const mysqldumpCommand = `mysqldump -h ${dbConfig.host} -P ${dbConfig.port} -u ${dbConfig.user} -p${dbConfig.password} ${dbConfig.database} > ${backupPath}`;

    try {
      await execAsync(mysqldumpCommand);
      this.logger.log(`Database backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      this.logger.error('Database backup failed', error);
      throw new Error(`Database backup failed: ${error.message}`);
    }
  }

  /**
   * Create file backup
   */
  async createFileBackup(timestamp: string): Promise<string> {
    const uploadDir = this.configService.get<string>('STORAGE_PATH', './uploads');
    const backupDir = this.configService.get<string>('BACKUP_DIR', './backups');
    const backupPath = join(backupDir, `files-${timestamp}.tar.gz`);

    // Ensure backup directory exists
    await mkdir(backupDir, { recursive: true });

    const tarCommand = `tar -czf ${backupPath} -C ${uploadDir} .`;

    try {
      await execAsync(tarCommand);
      this.logger.log(`File backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      this.logger.error('File backup failed', error);
      throw new Error(`File backup failed: ${error.message}`);
    }
  }

  /**
   * Restore database from backup
   */
  async restoreDatabaseBackup(backupPath: string): Promise<void> {
    const dbConfig = {
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 3306),
      user: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASS'),
      database: this.configService.get<string>('DB_NAME'),
    };

    const mysqlCommand = `mysql -h ${dbConfig.host} -P ${dbConfig.port} -u ${dbConfig.user} -p${dbConfig.password} ${dbConfig.database} < ${backupPath}`;

    try {
      await execAsync(mysqlCommand);
      this.logger.log(`Database restored from backup: ${backupPath}`);
    } catch (error) {
      this.logger.error('Database restore failed', error);
      throw new Error(`Database restore failed: ${error.message}`);
    }
  }

  /**
   * Restore files from backup
   */
  async restoreFileBackup(backupPath: string): Promise<void> {
    const uploadDir = this.configService.get<string>('STORAGE_PATH', './uploads');

    const tarCommand = `tar -xzf ${backupPath} -C ${uploadDir}`;

    try {
      await execAsync(tarCommand);
      this.logger.log(`Files restored from backup: ${backupPath}`);
    } catch (error) {
      this.logger.error('File restore failed', error);
      throw new Error(`File restore failed: ${error.message}`);
    }
  }

  /**
   * Clean old backups
   */
  async cleanOldBackups(retentionDays: number = 30): Promise<void> {
    const backupDir = this.configService.get<string>('BACKUP_DIR', './backups');
    
    try {
      const files = await readdir(backupDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      for (const file of files) {
        const filePath = join(backupDir, file);
        const stats = await this.getFileStats(filePath);
        
        if (stats.mtime < cutoffDate) {
          await unlink(filePath);
          this.logger.log(`Deleted old backup: ${file}`);
        }
      }
    } catch (error) {
      this.logger.error('Clean old backups failed', error);
    }
  }

  /**
   * List available backups
   */
  async listBackups(): Promise<Array<{ name: string; size: number; created: Date }>> {
    const backupDir = this.configService.get<string>('BACKUP_DIR', './backups');
    
    try {
      const files = await readdir(backupDir);
      const backups = [];

      for (const file of files) {
        const filePath = join(backupDir, file);
        const stats = await this.getFileStats(filePath);
        
        backups.push({
          name: file,
          size: stats.size,
          created: stats.mtime,
        });
      }

      return backups.sort((a, b) => b.created.getTime() - a.created.getTime());
    } catch (error) {
      this.logger.error('List backups failed', error);
      return [];
    }
  }

  /**
   * Get backup statistics
   */
  async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    oldestBackup: Date | null;
    newestBackup: Date | null;
  }> {
    const backups = await this.listBackups();
    
    if (backups.length === 0) {
      return {
        totalBackups: 0,
        totalSize: 0,
        oldestBackup: null,
        newestBackup: null,
      };
    }

    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    const dates = backups.map(backup => backup.created);

    return {
      totalBackups: backups.length,
      totalSize,
      oldestBackup: new Date(Math.min(...dates.map(d => d.getTime()))),
      newestBackup: new Date(Math.max(...dates.map(d => d.getTime()))),
    };
  }

  /**
   * Create full system backup
   */
  async createFullBackup(): Promise<{
    databaseBackup: string;
    fileBackup: string;
    timestamp: string;
  }> {
    const timestamp = new Date().toISOString().split('T')[0];
    
    const [databaseBackup, fileBackup] = await Promise.all([
      this.createDatabaseBackup(`backup-${timestamp}.sql`),
      this.createFileBackup(timestamp),
    ]);

    return {
      databaseBackup,
      fileBackup,
      timestamp,
    };
  }

  private async getFileStats(filePath: string): Promise<{ size: number; mtime: Date }> {
    const { stat } = await import('fs/promises');
    const stats = await stat(filePath);
    return {
      size: stats.size,
      mtime: stats.mtime,
    };
  }
}