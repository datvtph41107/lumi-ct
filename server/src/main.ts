import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from '@/core/shared/filters/response.interceptor';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import 'reflect-metadata';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: [process.env.CLIENT_URL || 'http://localhost:5173'],
        credentials: true, // Important: Allow cookies
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['Set-Cookie'],
    });

    // Cookie parser middleware
    app.use(cookieParser());
    app.setGlobalPrefix(process.env.PREFIX as string);
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
    console.error('Error starting application:', error);
    process.exit(1);
});
