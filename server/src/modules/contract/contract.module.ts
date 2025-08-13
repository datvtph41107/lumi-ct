// src/modules/contracts/contracts.module.ts
import { Module } from '@nestjs/common';
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
import { ContractMilestones } from '@/core/domain/contract/contract-milestones.entity';
import { ContractTasks } from '@/core/domain/contract/contract-taks.entity';
import { ContractFile } from '@/core/domain/contract/contract-file.entity';
import { ContractTemplate } from '@/core/domain/contract/contract-template.entity';
import { ContractContent } from '@/core/domain/contract/contract-content.entity';
import { ContractVersions } from '@/core/domain/contract/contract-versions.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Contract,
            ContractDraft,
            ContractMilestones,
            ContractTasks,
            ContractFile,
            ContractTemplate,
            ContractContent,
            ContractVersions,
        ]),
    ],
    controllers: [ContractController],
    providers: [
        ContractService,
        AuditLogService,
        CollaboratorService,
        { provide: APP_INTERCEPTOR, useClass: AuditInterceptor }, // global audit for module
    ],
    exports: [ContractService, CollaboratorService],
})
export class ContractsModule {}
