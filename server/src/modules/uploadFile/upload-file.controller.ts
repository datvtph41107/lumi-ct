import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './upload-file.service';
import { FileSizeValidationPipe } from '@/core/shared/filters/validate/upload-files.validate';
import { ConfigService } from '@nestjs/config';
import { UploadConfig } from '@/config/upload.config';
// import { s3Storage } from './strategy/s3.strategy';
// import { cloudinaryStorage } from './strategy/cloudinary.strategy';

@Controller('upload')
export class FileUploadController {
    constructor(private readonly uploadService: FileUploadService) {}

    @Post('file')
    @UseInterceptors(FileInterceptor('file', new UploadConfig(new ConfigService()).multerOptions))
    async uploadFile(@UploadedFile(FileSizeValidationPipe) file: Express.Multer.File) {
        const result = await this.uploadService.upload(file);
        return {
            message: 'File uploaded successfully',
            data: result,
        };
    }
}
