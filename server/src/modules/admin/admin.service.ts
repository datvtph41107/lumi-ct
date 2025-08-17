import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
    constructor() {}

    // This service is now mainly for backward compatibility
    // Most functionality has been moved to specific services:
    // - UserManagementService for user operations
    // - PermissionManagementService for role/permission operations
    // - SystemSettingsService for system configuration
    // - AuditLogService for audit logging
}
