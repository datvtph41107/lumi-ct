import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserManagementService } from './user-management.service';
import { PermissionManagementService } from './permission-management.service';
import { SystemSettingsService } from './system-settings.service';
import { AuditLogService } from './audit-log.service';

// Entities
import { User } from '../../core/domain/user/user.entity';
import { Role } from '../../core/domain/auth/role.entity';
import { Permission } from '../../core/domain/auth/permission.entity';
import { UserRole } from '../../core/domain/auth/user-role.entity';
import { Department } from '../../core/domain/user/department.entity';
import { AuditLog } from '../../core/domain/permission/audit-log.entity';
import { SystemSetting } from '../../core/domain/system/system-setting.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Role,
            Permission,
            UserRole,
            Department,
            AuditLog,
            SystemSetting,
        ]),
    ],
    controllers: [AdminController],
    providers: [
        AdminService,
        UserManagementService,
        PermissionManagementService,
        SystemSettingsService,
        AuditLogService,
    ],
    exports: [
        AdminService,
        UserManagementService,
        PermissionManagementService,
        SystemSettingsService,
        AuditLogService,
    ],
})
export class AdminModule {}
