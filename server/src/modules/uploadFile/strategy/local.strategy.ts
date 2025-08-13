import { ConflictException, Injectable } from '@nestjs/common';
import { UploadStrategy } from './upload-file.types';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import { ERROR_MESSAGES } from '@/core/shared/constants/error-message';

@Injectable()
export class LocalUploadStrategy implements UploadStrategy {
    upload(
        file: Express.Multer.File,
        dir = '',
    ): Promise<{
        provider: string;
        originalname: string;
        filename: string;
        mimetype: string;
        url: string;
        size: number;
    }> {
        const uploadsDir = path.resolve(`./src/common/storage/uploads/${dir}`);
        const ext = extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        const filename = `${baseName}-${Date.now()}${ext}`;
        const fullPath = path.join(uploadsDir, filename);

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        if (fs.existsSync(fullPath)) {
            throw new ConflictException(ERROR_MESSAGES.FILE.ALREADY_EXISTS);
        }

        fs.writeFileSync(fullPath, file.buffer);

        return Promise.resolve({
            provider: 'local',
            originalname: file.originalname,
            filename: filename,
            mimetype: file.mimetype,
            url: fullPath,
            size: file.size,
        });
    }
}
