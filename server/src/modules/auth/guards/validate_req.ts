import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class ValidateReqGuard implements CanActivate {
	async canActivate(_context: ExecutionContext): Promise<boolean> {
		return true;
	}
}
