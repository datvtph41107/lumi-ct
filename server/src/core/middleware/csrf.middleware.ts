import { Injectable, type NestMiddleware, ForbiddenException } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

interface RequestWithCsrf extends Request {
    csrfToken?: string;
    cookies: {
        rfp?: string;
        csrf_token?: string;
        [key: string]: any;
    };
}

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
    private readonly CSRF_HEADER = 'x-csrf-token';
    private readonly CSRF_COOKIE = 'csrf_token';
    private readonly CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret';

    use(req: RequestWithCsrf, res: Response, next: NextFunction) {
        // ✅ Skip CSRF for GET requests (safe methods)
        if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
            return next();
        }

        // ✅ Only apply CSRF to refresh endpoint
        if (!req.path.includes('/auth/refresh')) {
            return next();
        }

        // ✅ Check if refresh token exists (có session)
        if (!req.cookies?.rfp) {
            throw new ForbiddenException('No active session');
        }

        const csrfTokenFromHeader = req.headers[this.CSRF_HEADER] as string;
        const csrfTokenFromCookie = req.cookies[this.CSRF_COOKIE];

        // ✅ Both tokens must exist
        if (!csrfTokenFromHeader || !csrfTokenFromCookie) {
            throw new ForbiddenException('CSRF token missing');
        }

        // ✅ Tokens must match (Double Submit Cookie pattern)
        if (csrfTokenFromHeader !== csrfTokenFromCookie) {
            throw new ForbiddenException('CSRF token mismatch');
        }

        // ✅ Verify token signature
        if (!this.verifyCsrfToken(csrfTokenFromHeader)) {
            throw new ForbiddenException('Invalid CSRF token');
        }

        req.csrfToken = csrfTokenFromHeader;
        next();
    }

    // ✅ Generate CSRF token
    generateCsrfToken(): string {
        const timestamp = Date.now().toString();
        const randomBytes = crypto.randomBytes(16).toString('hex');
        const payload = `${timestamp}.${randomBytes}`;
        const signature = crypto.createHmac('sha256', this.CSRF_SECRET).update(payload).digest('hex');

        return `${payload}.${signature}`;
    }

    // ✅ Verify CSRF token
    private verifyCsrfToken(token: string): boolean {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return false;

            const [timestamp, randomBytes, signature] = parts;
            const payload = `${timestamp}.${randomBytes}`;

            const expectedSignature = crypto.createHmac('sha256', this.CSRF_SECRET).update(payload).digest('hex');

            // ✅ Verify signature
            if (signature !== expectedSignature) return false;

            // ✅ Check token age (max 1 hour)
            const tokenAge = Date.now() - Number.parseInt(timestamp);
            const maxAge = 60 * 60 * 1000; // 1 hour

            return tokenAge <= maxAge;
        } catch {
            return false;
        }
    }

    // ✅ Set CSRF cookie
    setCsrfCookie(res: Response, token: string): void {
        const isProduction = process.env.NODE_ENV === 'production';
        const domain = process.env.COOKIE_DOMAIN;

        res.cookie(this.CSRF_COOKIE, token, {
            httpOnly: false, // ✅ Frontend cần đọc được để gửi trong header
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 60 * 60 * 1000, // 1 hour
            path: '/',
            ...(domain && { domain }),
        });
    }
}
