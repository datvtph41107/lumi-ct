## API: Auth

- POST `auth/login`
  - body: `{ username, password, is_manager_login? }`
  - set cookie: `refreshToken` (HttpOnly), `sessionId` (HttpOnly)
  - data: `{ access_token, user }`
- POST `auth/refresh-token`
  - cookie: `refreshToken`
  - data: `{ accessToken, sessionId, tokenExpiry }`
- GET `auth/me` (Bearer)
- POST `auth/logout`
- GET `auth/verify-session`
- POST `auth/update-activity`
