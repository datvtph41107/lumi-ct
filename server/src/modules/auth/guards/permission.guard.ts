import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AuthValidatorService } from './validate_req';
import { HeaderRequest } from '@/core/shared/interface/header-payload-req.interface';
import { PermissionMetadata, PERMISSIONS_METADATA_KEY } from '@/core/shared/decorators/setmeta.decorator';
import { ERROR_MESSAGES } from '@/core/shared/constants/error-message';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector, // @Anotation..() check exist metadata
        @Inject('DATA_SOURCE') private readonly db: DataSource,
        private readonly authValidator: AuthValidatorService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const configs = this.reflector.getAllAndOverride<PermissionMetadata[]>(PERMISSIONS_METADATA_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!configs || configs.length === 0) return true;

        const request = context.switchToHttp().getRequest<HeaderRequest>();
        const user = request.user;

        for (const config of configs) {
            const result = await this.authValidator.validateRequestPermissions(user, config, this.db);
            if (result) return true;
        }

        throw new ForbiddenException(ERROR_MESSAGES.AUTH.FORBIDDEN);
        // 'Access denied: Missing required permissions or invalid department'
    }
}
