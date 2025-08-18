# Tài liệu Thiết kế & Triển khai Hệ thống Quản lý Hợp đồng Nội bộ

Tài liệu này là bản chuẩn hóa, hợp nhất giữa thiết kế và triển khai hiện có (client + server). Dùng để:
- Đối chiếu nhanh với mã nguồn thật (NestJS + React TS)
- Tra cứu API, DTO, Entity, RBAC, workflow và cron-jobs
- Kiểm thử tính năng và phát hiện chênh lệch (gap) giữa client/server

## Mục lục
- Kiến trúc & Modules: xem `architecture.md`
- Chuẩn Response: xem `response.md`
- Xác thực & Phiên: xem `auth.md`
- Phân quyền (RBAC) & Guard: xem `authorization.md`
- Quy trình hợp đồng (workflow): xem `workflow.md`
- API chi tiết:
  - `api/auth.md`
  - `api/contracts.md`
  - `api/contract-drafts.md`
  - `api/templates.md`
  - `api/collaborators.md`
  - `api/notifications.md`
  - `api/audit.md`
- DTOs: xem `dtos.md`
- Entities (domain model): xem `entities.md`
- Thông báo & Cron-jobs: xem `notifications-cron.md`
- Client (React) cấu trúc & flow: xem `client.md`
- Báo cáo chênh lệch (Gaps): xem `gaps.md`

Gợi ý: Backend đã bật Swagger ở đường dẫn `/api`. Khi chạy server, có thể mở để đối chiếu nhanh mô tả API.
