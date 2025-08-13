import { ForbiddenException as NestForbiddenException } from '@nestjs/common';

export class ForbiddenException extends NestForbiddenException {
    constructor(message: string = 'You don’t have permission.') {
        super(message);
    }
}
