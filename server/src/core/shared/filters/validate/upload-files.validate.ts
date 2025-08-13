import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
    private readonly allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    private readonly maxSizeInBytes = 5 * 1024 * 1024; // 5MB

    transform(file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('File is required.');
        }

        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(`Invalid file type. Only PDF or Word documents are allowed.`);
        }

        if (file.size > this.maxSizeInBytes) {
            throw new BadRequestException(`File size exceeds the limit of 5MB.`);
        }

        return file;
    }
}
