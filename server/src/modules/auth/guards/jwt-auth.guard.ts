import { ERROR_MESSAGES } from '@/core/shared/constants/error-message';
import { AdminRole, Role } from '@/core/shared/enums/base.enums';
import type { HeaderRequest } from '@/core/shared/interface/header-payload-req.interface';
import { type ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { TokenService } from '../jwt/jwt.service';

@Injectable()
export class AuthGuardAccess extends AuthGuard('jwt') {
	constructor(@Inject(TokenService) private readonly tokenService: TokenService) {
		super();
	}

	async canActivate(ctx: ExecutionContext): Promise<boolean> {
		const isAuthenticated = await super.canActivate(ctx);

		if (!isAuthenticated) return false;

		const request = ctx.switchToHttp().getRequest<HeaderRequest>();
		const user = request.user;

		if (!user || !user.roles) {
			throw new UnauthorizedException(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
		}

		// Check if token is revoked
		if (user.jti) {
			const isRevoked = await this.tokenService.isTokenRevoked(user.jti);
			if (isRevoked) {
				throw new UnauthorizedException('Token has been revoked');
			}
		}

        // Do not enforce path-based admin filtering here.
        // Route-level @Roles and specific guards handle fine-grained access.

		return true;
	}

	handleRequest<HeaderRequest>(err: any, user: any, info: any): HeaderRequest {
		if (err || !user) {
			if (info instanceof TokenExpiredError) {
				throw new UnauthorizedException(ERROR_MESSAGES.TOKEN.EXPIRED);
			}
			console.log(err, user, info);
			throw new UnauthorizedException(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
		}
		return user as HeaderRequest;
	}
}
