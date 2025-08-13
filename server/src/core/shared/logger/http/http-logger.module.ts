// api-v1.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { HttpLoggerMiddleware } from './http-logger';
import { LoggerModule } from '../logger.module';

@Module({
    imports: [LoggerModule],
})
export class HttpLoggerModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(HttpLoggerMiddleware).forRoutes('{*splat}');
    }
}
