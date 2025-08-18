## API: Collaborators

Base: `/contracts` (Bearer)

- POST `/:id/collaborators` → thêm collaborator `{ user_id, role }`
- GET `/:id/collaborators` → danh sách (có pagination object)
- PATCH `/collaborators/:collaboratorId` → đổi role hoặc deactive
  - collaboratorId = `${contract_id}_${user_id}`
- DELETE `/collaborators/:collaboratorId` → remove
- POST `/:id/transfer-ownership` → chuyển owner `{ from_user_id, to_user_id }`
- GET `/:id/permissions` → `{ permissions: { is_owner, can_edit, can_review, can_view } }`
