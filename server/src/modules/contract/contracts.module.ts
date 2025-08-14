import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { ContractDraftController } from './contract-draft.controller';
import { ContractDraftService } from './contract-draft.service';
import { TemplateService } from './template.service';
import { WorkflowService } from './workflow.service';
import { NotificationService } from '../notification/notification.service';
import { AuditLogService } from './audit-log.service';
import { CollaboratorService } from './collaborator.service';

// Entities
import { Contract } from '../../core/domain/contract/contract.entity';
import { ContractDraft } from '../../core/domain/contract/contract-draft.entity';
import { ContractTemplate } from '../../core/domain/contract/contract-template.entity';
import { ContractContent } from '../../core/domain/contract/contract-content.entity';
import { ContractVersion } from '../../core/domain/contract/contract-version.entity';
import { Milestone } from '../../core/domain/contract/milestone.entity';
import { Task } from '../../core/domain/contract/task.entity';
import { ContractFile } from '../../core/domain/contract/contract-file.entity';
import { ContractNotification } from '../../core/domain/contract/contract-notification.entity';
import { ContractReminder } from '../../core/domain/contract/contract-reminder.entity';
import { Collaborator } from '../../core/domain/contract/collaborator.entity';
import { AuditLog } from '../../core/domain/contract/audit-log.entity';
import { User } from '../../core/domain/user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contract,
      ContractDraft,
      ContractTemplate,
      ContractContent,
      ContractVersion,
      Milestone,
      Task,
      ContractFile,
      ContractNotification,
      ContractReminder,
      Collaborator,
      AuditLog,
      User
    ]),
  ],
  controllers: [
    ContractController,
    ContractDraftController
  ],
  providers: [
    ContractService,
    ContractDraftService,
    TemplateService,
    WorkflowService,
    NotificationService,
    AuditLogService,
    CollaboratorService
  ],
  exports: [
    ContractService,
    ContractDraftService,
    TemplateService,
    WorkflowService,
    NotificationService,
    AuditLogService,
    CollaboratorService
  ],
})
export class ContractsModule {}