## API: Contract Drafts

Base: `/contract-drafts` (Bearer)

- GET `/` → danh sách draft của user (page, limit, search, mode)
- GET `/:id` → chi tiết draft (ghép Contract + bản stage mới nhất)
- POST `/` → tạo draft từ initialData (fields: name, mode, template_id, initialData)
- PATCH `/:id` → cập nhật draft + lưu stage (`stage` từ `flow.currentStage`)
- DELETE `/:id` → xóa draft (soft delete contract)
