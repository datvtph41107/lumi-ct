import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileUploadController } from './upload-file.controller';
import { FileUploadService } from './upload-file.service';
import { LocalUploadStrategy } from './strategy/local.strategy';
import { UploadConfig } from '@/config/upload.config';

@Module({
    imports: [ConfigModule],
    controllers: [FileUploadController],
    providers: [FileUploadService, UploadConfig, LocalUploadStrategy],
    exports: [FileUploadService],
})
export class FileUploadModule {}
