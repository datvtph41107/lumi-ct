import { UploadProvider } from '@/core/shared/enums/base.enums';
import { ConfigService } from '@nestjs/config';
import { memoryStorage } from 'multer';

export class UploadConfig {
    constructor(private readonly configService: ConfigService) {}

    provider(): UploadProvider {
        const raw = this.configService.get<string>('UPLOAD_PROVIDER')?.toLocaleLowerCase();
        switch (raw) {
            case 's3':
                return UploadProvider.S3;
            case 'cloudinary':
                return UploadProvider.CLOUDINARY;
            default:
                return UploadProvider.LOCAL;
        }
    }

    get multerOptions() {
        return {
            storage: memoryStorage(),
            limits: {
                fileSize: 10 * 1024 * 1024,
            },
        };
    }
}
