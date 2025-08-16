// src/modules/contracts/contracts.module.ts
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { AuditLogService } from './audit-log.service';
import { CollaboratorService } from './collaborator.service';
import { AuditInterceptor } from '@/core/shared/filters/audit.interceptor';
import { ContractDraftController } from './contract-draft.controller';
import { ContractDraftService } from './contract-draft.service';

@Module({
    controllers: [ContractController, ContractDraftController],
    providers: [
        ContractService,
        AuditLogService,
        CollaboratorService,
        ContractDraftService,
        { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    ],
    exports: [ContractService, CollaboratorService, AuditLogService, ContractDraftService],
})
export class ContractModule {}
