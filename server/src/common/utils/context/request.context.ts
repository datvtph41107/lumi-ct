// src/common/context/request-context.ts
import { Request } from 'express';

export class RequestContext {
    private static currentRequest: Request;

    static setRequest(req: Request) {
        this.currentRequest = req;
    }

    static getRequest(): Request {
        return this.currentRequest;
    }

    static getBaseUrl(): string {
        const req = this.getRequest();
        if (!req) return '';
        return `${req.protocol}://${req.get('host')}${req.originalUrl?.split('?')[0] || ''}`;
    }
}
