## Kiến trúc & Modules

- Server: NestJS, cấu trúc modules đúng repo
  - `auth`, `user`, `admin`, `contract`, `notification`, `cron-task`, `uploadFile`
  - Global:
    - `main.ts`: CORS + Swagger `/api` + `ResponseInterceptor` + `ValidationPipe` + cookie-parser
    - `app.module.ts`: `TypeOrmModule` (MySQL), `ScheduleModule`, `ServeStaticModule`
- Client: React TS
  - API client `axios` with `withCredentials`
  - AccessToken lưu Memory qua `AuthManager`; RefreshToken lưu HttpOnly cookie (server set `refreshToken`)
  - `SessionManager`: idle detection 15 phút + cảnh báo 1 phút + broadcast giữa tabs + `beforeunload` logout

## Chuẩn hóa Endpoint Prefix
- Server dùng `app.setGlobalPrefix(process.env.PREFIX)`; Swagger `/api`.
- Client `ConfigManager` trỏ baseURL phù hợp.

## Mapping Modules ↔ Repo
- Contract: controllers/services có đủ CRUD cơ bản, audit, export, notifications, reminders
- Drafts: `contract-drafts` controller + service
- Collaborators: controller + service, role enum owner/editor/reviewer/viewer
- Templates: controller TypeORM repo
- Notifications: controller + service + `SystemNotificationSettings`
- Cron-task: job minutely/hourly/daily trong `NotificationService` + `CronTaskService`
