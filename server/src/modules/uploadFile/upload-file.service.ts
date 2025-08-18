import { Injectable } from '@nestjs/common';
import { UploadStrategy } from './strategy/upload-file.types';
import { LocalUploadStrategy } from './strategy/local.strategy';
import { UploadConfig } from '@/config/upload.config';
// import { S3UploadStrategy } from './strategy/s3.strategy';
// import { CloudinaryUploadStrategy } from './strategy/cloudinary.strategy';

@Injectable()
export class FileUploadService {
    constructor(
        private readonly config: UploadConfig,
        private readonly local: LocalUploadStrategy,
        // private readonly s3: S3UploadStrategy,
        // private readonly cloudinary: CloudinaryUploadStrategy,
    ) {}

    async upload(file: Express.Multer.File, dir?: string) {
        return this.getStrategy().upload(file, dir);
    }

    private getStrategy(): UploadStrategy {
        switch (this.config.provider()) {
            // case UploadProvider.S3:
            //     return this.s3;
            // case UploadProvider.CLOUDINARY:
            //     return this.cloudinary;
            default:
                return this.local;
        }
    }
}
