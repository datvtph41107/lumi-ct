import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
    transform(file: any) {
        if (!file) return file;
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size && file.size > maxSize) {
            throw new BadRequestException('File size exceeds the allowed limit');
        }
        return file;
    }
}
