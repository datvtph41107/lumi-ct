import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Core modules
import { HttpLoggerModule } from '@/core/shared/logger/http/http-logger.module';
import { TypeOrmWinstonLogger } from '@/core/shared/logger/logger.typeorm';
import { PolicyModule } from '@/core/policy/policy.module';
import { DepartmentPolicyModule, DEPARTMENT_POLICY_REGISTRY } from '@/core/department/policy/department-policy.module';
import { WorkflowModule, WORKFLOW_REGISTRY } from '@/core/workflow/workflow.module';
import { LegalDepartmentPolicy } from '@/core/department/policy/policies/legal.policy';
import { DefaultContractWorkflow } from '@/core/workflow/definitions/default.contract.workflow';
import type { DepartmentPolicyRegistry } from '@/core/department/policy/department-policy.registry';
import type { WorkflowRegistry } from '@/core/workflow/workflow.registry';
import { EventBusModule } from '@/core/event/event-bus.module';
import { QueueModule } from '@/core/queue/queue.module';

// Feature modules
import { AuthModule } from '@/modules/auth/auth.module';
import { AdminModule } from '@/modules/admin/admin.module';
import { UserModule } from '@/modules/user/user.module';
import { ContractsModule } from '@/modules/contract/contract.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { CronTaskModule } from '@/modules/cron-task/cron-task.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql' as const,
                host: configService.get<string>('DB_HOST', 'localhost'),
                port: configService.get<number>('DB_PORT', 3306),
                username: configService.get<string>('DB_USER'),
                password: configService.get<string>('DB_PASS'),
                database: configService.get<string>('DB_NAME'),
                synchronize: configService.get<string>('NODE_ENV') !== 'production',
                logging: configService.get<string>('NODE_ENV') === 'development',
                logger: new TypeOrmWinstonLogger(),
                entities: [join(__dirname, 'core/domain/**/*.entity.{js,ts}')],
                migrations: [join(__dirname, 'providers/database/migrations/*.{js,ts}')],
                migrationsRun: false,
            }),
        }),
        ScheduleModule.forRoot(),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'src/common/storage/uploads'),
            serveRoot: '/uploads',
        }),
        HttpLoggerModule,
        PolicyModule,
        DepartmentPolicyModule,
        WorkflowModule,
        AuthModule,
        AdminModule,
        UserModule,
        ContractsModule,
        NotificationModule,
        CronTaskModule,
        EventBusModule,
        QueueModule,
    ],
})
export class AppModule {
	constructor(
		@((Reflect as any).metadata && (Reflect as any).metadata('design:paramtypes') ? (DEPARTMENT_POLICY_REGISTRY as any) : DEPARTMENT_POLICY_REGISTRY) private readonly deptRegistry: DepartmentPolicyRegistry,
		@((Reflect as any).metadata && (Reflect as any).metadata('design:paramtypes') ? (WORKFLOW_REGISTRY as any) : WORKFLOW_REGISTRY) private readonly workflowRegistry: WorkflowRegistry,
	) {}

	onModuleInit() {
		// Seed initial department policies
		this.deptRegistry.register(new LegalDepartmentPolicy());
		// Seed default workflow
		this.workflowRegistry.register(DefaultContractWorkflow);
	}
}
