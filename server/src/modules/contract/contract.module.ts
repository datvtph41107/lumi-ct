import { Module, forwardRef } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { ContractController } from './contract.controller';
import { TemplateController } from './template.controller';

// Services
import { ContractService } from './contract.service';
import { TemplateService } from './template.service';
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
import { ContractTemplateVersion } from '@/core/domain/contract/contract-template-version.entity';
import { Collaborator } from '@/core/domain/permission/collaborator.entity';
import { AuditLog } from '@/core/domain/permission/audit-log.entity';
import { POLICY_REGISTRY_TOKEN } from '@/core/policy/policy.tokens';
import type { PolicyRegistry } from '@/core/policy/policy.types';
import { ContractResourcePolicy } from '@/core/policy/policies/contract.policy';

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
			ContractTemplateVersion,
		]),
		// External module dependencies
		forwardRef(() => import('@/modules/auth/auth.module').then((m) => m.AuthModule)),
		forwardRef(() => import('@/modules/notification/notification.module').then((m) => m.NotificationModule)),
		forwardRef(() => import('@/modules/user/user.module').then((m) => m.UserModule)),
	],
	controllers: [ContractController, TemplateController],
	providers: [
		ContractService,
		AuditLogService,
		CollaboratorService,
		TemplateService,
		ContractPolicyService,
		{
			provide: APP_INTERCEPTOR,
			useClass: AuditInterceptor,
		},
        ContractResourcePolicy,
	],
	exports: [ContractService, CollaboratorService, AuditLogService, ContractPolicyService],
})
export class ContractsModule {
	constructor(
		@((Reflect as any).metadata && (Reflect as any).metadata('design:paramtypes') ? (POLICY_REGISTRY_TOKEN as any) : POLICY_REGISTRY_TOKEN) private readonly _policyRegistry: PolicyRegistry,
		private readonly _contractPolicy: ContractResourcePolicy,
	) {
		// no-op
	}

	onModuleInit() {
		// Register contract policy into registry at module init
		this._policyRegistry.register('contract', this._contractPolicy);
	}
}
