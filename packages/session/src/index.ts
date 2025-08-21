import { SignJWT, jwtVerify, JWTPayload, generateKeyPair, exportJWK, JWK, importJWK } from 'jose';
import type { Subject } from '@secure/authz-core';

export interface SessionUser extends Subject {}

export interface SessionConfig {
  issuer: string;
  audience: string;
  accessTokenTtlSec: number;
  refreshTokenTtlSec: number;
}

export interface KeyMaterial {
  alg: 'RS256';
  publicJwk: JWK;
  privateJwk: JWK;
}

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenIntrospection<T = JWTPayload> {
  valid: boolean;
  payload?: T;
  error?: string;
}

export async function generateRsaKeyPair(): Promise<KeyMaterial> {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const publicJwk = await exportJWK(publicKey);
  const privateJwk = await exportJWK(privateKey);
  publicJwk.alg = 'RS256';
  privateJwk.alg = 'RS256';
  return { alg: 'RS256', publicJwk, privateJwk };
}

export async function signAccessToken(user: SessionUser, config: SessionConfig, key: KeyMaterial): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    sub: user.id,
    roles: user.roles,
    departmentIds: user.departmentIds ?? [],
    iat: now,
  } as unknown as JWTPayload;

  const priv = await importJWK(key.privateJwk, 'RS256');
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer(config.issuer)
    .setAudience(config.audience)
    .setSubject(user.id)
    .setIssuedAt(now)
    .setExpirationTime(now + config.accessTokenTtlSec)
    .sign(priv);
}

export async function signRefreshToken(user: SessionUser, config: SessionConfig, key: KeyMaterial): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    sub: user.id,
    typ: 'refresh',
    iat: now,
  };
  const priv = await importJWK(key.privateJwk, 'RS256');
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer(config.issuer)
    .setAudience(config.audience)
    .setSubject(user.id)
    .setIssuedAt(now)
    .setExpirationTime(now + config.refreshTokenTtlSec)
    .sign(priv);
}

export async function issueTokens(user: SessionUser, config: SessionConfig, key: KeyMaterial): Promise<SessionTokens> {
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(user, config, key),
    signRefreshToken(user, config, key),
  ]);
  return { accessToken, refreshToken };
}

export async function verifyToken<T = JWTPayload>(token: string, config: SessionConfig, key: KeyMaterial): Promise<TokenIntrospection<T>> {
  try {
    const pub = await importJWK(key.publicJwk, 'RS256');
    const { payload } = await jwtVerify(token, pub, {
      issuer: config.issuer,
      audience: config.audience,
    });
    return { valid: true, payload: payload as unknown as T };
  } catch (err: any) {
    return { valid: false, error: err?.message ?? 'verify_failed' };
  }
}

