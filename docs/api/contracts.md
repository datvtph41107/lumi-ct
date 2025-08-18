## API: Contracts

Base: `/contracts` (Bearer)

- POST `/` → tạo hợp đồng mới (CreateContractDto)
- GET `/` → danh sách (page, limit)
- GET `/:id` → chi tiết
- PATCH `/:id` → cập nhật (CollaboratorGuard áp dụng ở server)
- DELETE `/:id` → soft delete

- GET `/:id/preview` → HTML preview
- GET `/:id/export/pdf` → PDF (base64 stub)
- GET `/:id/export/docx` → DOCX (stub url)
- GET `/:id/print` → HTML print

- GET `/:id/audit` → audit logs (query: action, user_id, date_from, date_to, search, page, limit)
- GET `/:id/audit/summary` → tổng hợp

Notifications & Reminders:
- POST `/:id/notifications`
- GET `/:id/notifications`
- POST `/:id/reminders`
- GET `/:id/reminders`
