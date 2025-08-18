import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { HeaderUserPayload } from '@/core/shared/interface/header-payload-req.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		const rawKey = process.env.ACCESS_TOKEN_PUBLIC_KEY || '';
		const secretOrKey = (rawKey.length > 0 ? rawKey : 'DEV_PUBLIC_KEY').replace(/\n/g, '\n');
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey,
			algorithms: ['RS256'],
		});
	}

	async validate(payload: HeaderUserPayload): Promise<HeaderUserPayload> {
		return payload;
	}
}