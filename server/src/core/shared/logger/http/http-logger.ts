import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerTypes } from '../logger.types';
import { RequestContext } from '@/common/utils/context/request.context';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
    constructor(@Inject('LOGGER') private readonly logger: LoggerTypes) {}

    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl, ip } = req;
        // const body = ['POST', 'PUT', 'PATCH'].includes(method) ? (req.body as object) : '';
        // if (['POST', 'PUT', 'PATCH'].includes(method)) {
        //     req.data = {
        //         ...(req.body as Record<string, unknown>),
        //         injected: true,
        //     };
        // }
        RequestContext.setRequest(req);
        res.on('finish', () => {
            const statusCode = res.statusCode;
            this.logger.HTTP.info({
                type: 'HTTP_REQUEST',
                ip,
                method,
                path: originalUrl,
                message: {
                    statusCode,
                    // parameters: body,
                },
            });
        });
        next();
    }
}
