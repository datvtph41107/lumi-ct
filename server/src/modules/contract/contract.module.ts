import { Module, forwardRef } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { ContractController } from './contract.controller';
import { ContractDraftController } from './contract-draft.controller';
import { ContractTemplateController } from './template.controller';
import { CollaboratorController } from './collaborator.controller';

// Services
import { ContractService } from './contract.service';
import { ContractDraftService } from './contract-draft.service';
import { AuditLogService } from './audit-log.service';
import { CollaboratorService } from './collaborator.service';
import { ContractPolicyService } from './contract-policy.service';

// Interceptors
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
import { Collaborator } from '@/core/domain/permission/collaborator.entity';
import { AuditLog } from '@/core/domain/permission/audit-log.entity';

@Module({
    imports: [
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
        ]),
        // External module dependencies
        forwardRef(() => import('@/modules/auth/auth.module').then((m) => m.AuthModule)),
        forwardRef(() => import('@/modules/notification/notification.module').then((m) => m.NotificationModule)),
        forwardRef(() => import('@/modules/user/user.module').then((m) => m.UserModule)),
    ],
    controllers: [ContractController, ContractDraftController, ContractTemplateController, CollaboratorController],
    providers: [
        ContractService,
        ContractDraftService,
        AuditLogService,
        CollaboratorService,
        ContractPolicyService,
        {
            provide: APP_INTERCEPTOR,
            useClass: AuditInterceptor,
        },
    ],
    exports: [ContractService, ContractDraftService, CollaboratorService, AuditLogService, ContractPolicyService],
})
export class ContractsModule {}
