## @secure/session

JWT-based session tokens using JOSE (RS256):

- `generateRsaKeyPair()` -> JWK key material
- `issueTokens(user, config, key)` -> access + refresh tokens
- `verifyToken(token, config, key)` -> verification result

Payloads include `roles` and `departmentIds` for FE/BE authorization decisions.

