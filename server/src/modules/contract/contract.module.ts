// src/modules/contracts/contracts.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { AuditLogService } from './audit-log.service';
import { CollaboratorService } from './collaborator.service';
import { AuditInterceptor } from '@/core/shared/filters/audit.interceptor';

// Entities
import { Contract } from '@/core/domain/contract/contract.entity';
import { ContractDraft } from '@/core/domain/contract/contract-draft.entity';
import { Milestone } from '@/core/domain/contract/contract-milestones.entity';
import { Task } from '@/core/domain/contract/contract-taks.entity';
import { ContractFile } from '@/core/domain/contract/contract-file.entity';
import { ContractTemplate } from '@/core/domain/contract/contract-template.entity';
import { ContractContent } from '@/core/domain/contract/contract-content.entity';
import { ContractVersion } from '@/core/domain/contract/contract-versions.entity';
import { ContractDraftController } from './contract-draft.controller';
import { Collaborator } from '@/core/domain/permission/collaborator.entity';
import { AuditLog } from '@/core/domain/permission/audit-log.entity';
import { ContractDraftService } from './contract-draft.service';
import { NotificationModule } from '@/modules/notification/notification.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { LoggerModule } from '@/core/shared/logger/logger.module';
import { User } from '@/core/domain/user/user.entity';
import { DatabaseModule } from '@/providers/database';

@Module({
    imports: [
        LoggerModule,
        AuthModule,
        forwardRef(() => NotificationModule),
        DatabaseModule,
        TypeOrmModule.forFeature([
            Contract,
            ContractDraft,
            Milestone,
            Task,
            ContractFile,
            ContractTemplate,
            ContractContent,
            ContractVersion,
            Collaborator,
            AuditLog,
            User,
        ]),
    ],
    controllers: [ContractController, ContractDraftController],
    providers: [
        ContractService,
        { provide: AuditLogService, useClass: AuditLogService },
        CollaboratorService,
        ContractDraftService,
        { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    ],
    exports: [ContractService, CollaboratorService, AuditLogService, ContractDraftService],
})
export class ContractsModule {}
