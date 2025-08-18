## Thiết kế tổng thể hệ thống quản lý hợp đồng

### Modules
- auth: xác thực, phiên, guards, jwt
- user: hồ sơ, staff theo phòng ban
- admin: phòng ban, manager, roles/permissions
- contract: hợp đồng, draft, templates, collaborators, audit, export
- notification: thông báo, reminders, thiết lập hệ thống, cron
- cron-task: tác vụ định kỳ
- uploadFile: upload tệp
- core: dto, entities, filters, logger, decorators, providers

### Chức năng chính theo module
- auth: login, refresh-token, me, verify-session, update-activity, logout
- user: get profile, tạo staff, list staff
- admin: departments CRUD tối thiểu, tạo manager, gán roles/permissions, catalog
- contract: CRUD hợp đồng, draft stages, templates CRUD, collaborators, audit endpoints, export/print stub
- notification: hệ thống thông báo, reminders, hàng đợi giả lập, cron xử lý retry, global settings
- cron-task: gom cron chạy notification
- uploadFile: upload file với validate pipe

### Lưu ý kỹ thuật
- Token: Access (RAM), Refresh (HttpOnly cookie). Idle timeout và revoke session handled tại TokenService
- DTO: định nghĩa tại core/dto/*
- Entities: không dùng relation; sử dụng id primitive và where thủ công
- Logger: Winston + daily rotate, TypeORM custom logger
- Response: Interceptor chuẩn hóa success/error