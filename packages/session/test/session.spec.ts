import { describe, it, expect } from 'vitest';
import { buildSubject } from '@secure/authz-core';
import { generateRsaKeyPair, issueTokens, verifyToken } from '../src/index';

describe('Session tokens', () => {
  it('issues and verifies access token', async () => {
    const user = buildSubject({ id: 'u1', roles: ['ADMIN'], departmentIds: ['depA'] });
    const cfg = { issuer: 'secure.app', audience: 'secure.app', accessTokenTtlSec: 60, refreshTokenTtlSec: 3600 };
    const key = await generateRsaKeyPair();
    const { accessToken } = await issueTokens(user, cfg, key);
    const res = await verifyToken(accessToken, cfg, key);
    expect(res.valid).toBe(true);
  });
});

