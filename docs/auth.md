## Xác thực & Phiên (Auth)

- Login: `POST auth/login` trả `access_token`, set cookie `refreshToken` (HttpOnly) và `sessionId` (HttpOnly)
- Refresh: `POST auth/refresh-token` đọc refresh từ cookie, trả về `{ accessToken, sessionId, tokenExpiry }`
- Me: `GET auth/me` (Bearer)
- Logout: `POST auth/logout` (xóa cookies + revoke session)
- Verify session: `GET auth/verify-session`
- Update activity: `POST auth/update-activity`

Client:
- `AuthManager` giữ `accessToken` trong bộ nhớ; tự refresh nếu còn hạn hoặc gần hết hạn
- `SessionManager` theo dõi idle 15 phút (API và browser), cảnh báo 1 phút, tự logout, broadcast tabs, gửi beacon logout khi đóng trang

Bảo mật:
- CORS bật `credentials: true`
- Cookie refresh `httpOnly`, `sameSite: strict`
- JWT Access RS256, refresh HS256
