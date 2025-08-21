import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from './index';
import type { KeyMaterial, SessionConfig } from '@secure/session';
import { verifyToken } from '@secure/session';

export function jwtUser(config: SessionConfig, key: KeyMaterial) {
  return async function (req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    const header = req.headers['authorization'];
    if (!header?.startsWith('Bearer ')) return next();
    const token = header.slice('Bearer '.length);
    const result = await verifyToken(token, config, key);
    if (result.valid && result.payload) {
      const { sub, roles = [], departmentIds = [] } = result.payload as any;
      req.user = { id: String(sub), roles: roles as any, departmentIds: departmentIds as any };
    }
    next();
  };
}

