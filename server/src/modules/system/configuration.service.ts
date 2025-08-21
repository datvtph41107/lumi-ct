import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '@/core/domain/system/system-config.entity';

export interface ConfigValue {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description?: string;
  category: string;
  isEncrypted: boolean;
  isEditable: boolean;
}

@Injectable()
export class ConfigurationService {
  private readonly logger = new Logger(ConfigurationService.name);
  private readonly cache = new Map<string, any>();
  private readonly cacheExpiry = 5 * 60 * 1000; // 5 minutes

  constructor(
    @InjectRepository(SystemConfig)
    private readonly configRepository: Repository<SystemConfig>,
  ) {}

  /**
   * Get configuration value
   */
  async getConfig(key: string, defaultValue?: any): Promise<any> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }

    const config = await this.configRepository.findOne({ where: { key } });
    
    if (!config) {
      return defaultValue;
    }

    let value: any;
    try {
      switch (config.type) {
        case 'number':
          value = parseFloat(config.value);
          break;
        case 'boolean':
          value = config.value === 'true' || config.value === '1';
          break;
        case 'json':
          value = JSON.parse(config.value);
          break;
        case 'array':
          value = JSON.parse(config.value);
          break;
        default:
          value = config.value;
      }
    } catch (error) {
      this.logger.error(`Failed to parse config value for key: ${key}`, error);
      return defaultValue;
    }

    // Cache the value
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.cacheExpiry,
    });

    return value;
  }

  /**
   * Set configuration value
   */
  async setConfig(key: string, value: any, options?: {
    type?: 'string' | 'number' | 'boolean' | 'json' | 'array';
    description?: string;
    category?: string;
    isEncrypted?: boolean;
    isEditable?: boolean;
    userId?: string;
  }): Promise<SystemConfig> {
    let stringValue: string;
    
    switch (options?.type || this.getTypeFromValue(value)) {
      case 'number':
        stringValue = value.toString();
        break;
      case 'boolean':
        stringValue = value.toString();
        break;
      case 'json':
      case 'array':
        stringValue = JSON.stringify(value);
        break;
      default:
        stringValue = value.toString();
    }

    let config = await this.configRepository.findOne({ where: { key } });
    
    if (config) {
      // Update existing config
      config.value = stringValue;
      config.type = options?.type || config.type;
      config.description = options?.description || config.description;
      config.category = options?.category || config.category;
      config.is_encrypted = options?.isEncrypted ?? config.is_encrypted;
      config.is_editable = options?.isEditable ?? config.is_editable;
      config.updated_by = options?.userId;
      config.updated_at = new Date();
    } else {
      // Create new config
      config = this.configRepository.create({
        key,
        value: stringValue,
        type: options?.type || this.getTypeFromValue(value),
        description: options?.description,
        category: options?.category || 'system',
        is_encrypted: options?.isEncrypted || false,
        is_editable: options?.isEditable !== false,
        created_by: options?.userId,
        updated_by: options?.userId,
      });
    }

    const savedConfig = await this.configRepository.save(config);
    
    // Clear cache
    this.cache.delete(key);
    
    this.logger.log(`Configuration updated: ${key} = ${stringValue}`);
    
    return savedConfig;
  }

  /**
   * Get all configurations by category
   */
  async getConfigsByCategory(category: string): Promise<ConfigValue[]> {
    const configs = await this.configRepository.find({
      where: { category },
      order: { key: 'ASC' },
    });

    return configs.map(config => ({
      key: config.key,
      value: this.parseValue(config.value, config.type),
      type: config.type,
      description: config.description,
      category: config.category,
      isEncrypted: config.is_encrypted,
      isEditable: config.is_editable,
    }));
  }

  /**
   * Get all configurations
   */
  async getAllConfigs(): Promise<ConfigValue[]> {
    const configs = await this.configRepository.find({
      order: { category: 'ASC', key: 'ASC' },
    });

    return configs.map(config => ({
      key: config.key,
      value: this.parseValue(config.value, config.type),
      type: config.type,
      description: config.description,
      category: config.category,
      isEncrypted: config.is_encrypted,
      isEditable: config.is_editable,
    }));
  }

  /**
   * Delete configuration
   */
  async deleteConfig(key: string, userId?: string): Promise<void> {
    const config = await this.configRepository.findOne({ where: { key } });
    
    if (!config) {
      throw new Error(`Configuration key '${key}' not found`);
    }

    if (!config.is_editable) {
      throw new Error(`Configuration key '${key}' is not editable`);
    }

    await this.configRepository.remove(config);
    
    // Clear cache
    this.cache.delete(key);
    
    this.logger.log(`Configuration deleted: ${key}`);
  }

  /**
   * Initialize default configurations
   */
  async initializeDefaultConfigs(): Promise<void> {
    const defaultConfigs = [
      {
        key: 'system.name',
        value: 'Contract Management System',
        type: 'string' as const,
        description: 'System name',
        category: 'system',
      },
      {
        key: 'system.version',
        value: '1.0.0',
        type: 'string' as const,
        description: 'System version',
        category: 'system',
      },
      {
        key: 'security.session_timeout',
        value: '28800',
        type: 'number' as const,
        description: 'Session timeout in seconds',
        category: 'security',
      },
      {
        key: 'security.max_login_attempts',
        value: '5',
        type: 'number' as const,
        description: 'Maximum login attempts',
        category: 'security',
      },
      {
        key: 'security.password_min_length',
        value: '8',
        type: 'number' as const,
        description: 'Minimum password length',
        category: 'security',
      },
      {
        key: 'email.enabled',
        value: 'true',
        type: 'boolean' as const,
        description: 'Enable email notifications',
        category: 'email',
      },
      {
        key: 'email.smtp_host',
        value: 'smtp.gmail.com',
        type: 'string' as const,
        description: 'SMTP host',
        category: 'email',
      },
      {
        key: 'email.smtp_port',
        value: '587',
        type: 'number' as const,
        description: 'SMTP port',
        category: 'email',
      },
      {
        key: 'notification.enabled',
        value: 'true',
        type: 'boolean' as const,
        description: 'Enable in-app notifications',
        category: 'notification',
      },
      {
        key: 'contract.auto_save_interval',
        value: '30000',
        type: 'number' as const,
        description: 'Auto save interval in milliseconds',
        category: 'contract',
      },
      {
        key: 'contract.max_file_size',
        value: '10485760',
        type: 'number' as const,
        description: 'Maximum file size in bytes',
        category: 'contract',
      },
      {
        key: 'contract.allowed_file_types',
        value: '["pdf", "doc", "docx", "txt"]',
        type: 'array' as const,
        description: 'Allowed file types',
        category: 'contract',
      },
    ];

    for (const config of defaultConfigs) {
      const existing = await this.configRepository.findOne({ where: { key: config.key } });
      if (!existing) {
        await this.setConfig(config.key, config.value, {
          type: config.type,
          description: config.description,
          category: config.category,
        });
      }
    }

    this.logger.log('Default configurations initialized');
  }

  /**
   * Clear configuration cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.log('Configuration cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Parse value based on type
   */
  private parseValue(value: string, type: string): any {
    try {
      switch (type) {
        case 'number':
          return parseFloat(value);
        case 'boolean':
          return value === 'true' || value === '1';
        case 'json':
        case 'array':
          return JSON.parse(value);
        default:
          return value;
      }
    } catch (error) {
      this.logger.error(`Failed to parse value: ${value} with type: ${type}`, error);
      return value;
    }
  }

  /**
   * Get type from value
   */
  private getTypeFromValue(value: any): 'string' | 'number' | 'boolean' | 'json' | 'array' {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'json';
    return 'string';
  }
}