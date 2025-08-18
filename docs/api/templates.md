## API: Templates

Base: `/contracts/templates` (Bearer)

- GET `/` → danh sách active
- GET `/:id` → chi tiết
- POST `/` → tạo (yêu cầu quyền manage templates)
- PATCH `/:id` → cập nhật (quyền quản lý)
- DELETE `/:id` → soft-disable `is_active=false` (quyền quản lý)
