import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Core modules
import { HttpLoggerModule } from '@/core/shared/logger/http/http-logger.module';
import { TypeOrmWinstonLogger } from '@/core/shared/logger/logger.typeorm';
import { DepartmentPolicyModule, DEPARTMENT_POLICY_REGISTRY } from '@/core/lib/department/policy/department-policy.module';
import { LegalDepartmentPolicy } from '@/core/lib/department/policy/features/legal.policy';
import { AdministrativeDepartmentPolicy } from '@/core/lib/department/policy/features/administrative.policy';
import { AccountingDepartmentPolicy } from '@/core/lib/department/policy/features/accounting.policy';
import type { DepartmentPolicyRegistry } from '@/core/lib/department/policy/department-policy.registry';
import { EventBusModule } from '@/core/event/event-bus.module';
import { ESignModule } from '@/core/lib/esign/esign.module';

// Feature modules
import { ContractsModule } from '@/modules/contract/contract.module';
import { NotificationModule } from '@/modules/notification/notification.module';

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
        DepartmentPolicyModule,
        ContractsModule,
        NotificationModule,
        EventBusModule,
        ESignModule,
    ],
})
export class AppModule {
    constructor(
        @((Reflect as any).metadata && (Reflect as any).metadata('design:paramtypes')
            ? (DEPARTMENT_POLICY_REGISTRY as any)
            : DEPARTMENT_POLICY_REGISTRY)
        private readonly deptRegistry: DepartmentPolicyRegistry,
    ) {}

    onModuleInit() {
        // Seed initial department policies
        this.deptRegistry.register(new LegalDepartmentPolicy());
        this.deptRegistry.register(new AdministrativeDepartmentPolicy());
        this.deptRegistry.register(new AccountingDepartmentPolicy());
    }
}
