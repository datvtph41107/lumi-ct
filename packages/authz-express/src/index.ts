import type { NextFunction, Request, Response } from 'express';
import type { RequestContext, Subject } from '@secure/authz-core';
import { authorize } from '@secure/authz-core';

export interface AuthenticatedRequest extends Request {
  user?: Subject;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'unauthenticated' });
    return;
  }
  next();
}

export function enforce(requestBuilder: (req: AuthenticatedRequest) => RequestContext) {
  return function (req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const ctx = requestBuilder(req);
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'unauthenticated' });
      return;
    }
    const decision = authorize(user, ctx);
    if (!decision.allow) {
      res.status(403).json({ error: 'forbidden', reason: decision.reason, policy: decision.policy });
      return;
    }
    next();
  };
}

export * from './jwt';

