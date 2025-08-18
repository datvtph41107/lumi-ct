import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserJwtPayload } from '@/core/shared/types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: (process.env.ACCESS_TOKEN_PUBLIC_KEY || '').replace(/\\n/g, '\n'),
            algorithms: ['RS256'],
        });
    }

    validate(payload: UserJwtPayload): UserJwtPayload {
        return payload;
    }
}
