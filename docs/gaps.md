## Báo cáo Chênh lệch (Gaps)

- Contract Milestones/Tasks APIs:
  - Client `contract.service.ts` có phương thức `/contracts/:id/milestones` và `/contracts/:id/tasks` (CRUD), nhưng server `ContractController` hiện chưa expose các endpoints này. Entities (`Milestone`, `Task`) và Notification cron đã có. Đề xuất: bổ sung controller routes hoặc điều chỉnh client.

- Contract Versions APIs:
  - Client có `/contracts/:id/versions` (CRUD), server chưa có controller cho versions (chỉ entity `ContractVersion`). Đề xuất: triển khai endpoints hoặc ẩn tính năng client.

- Draft vs Stage APIs:
  - Client có helper `saveStage`/`transitionStage` dưới `/contracts/:id/stage/...`, server đang dùng resource riêng `/contract-drafts`. Đề xuất: giữ `contract-drafts` làm chuẩn; sửa client gọi `contract-drafts` (đã có `contract-draft.service.ts`).

- Auth response naming:
  - Server login trả `{ access_token, user }`, refresh trả `{ accessToken, sessionId, tokenExpiry }`. Client Redux slice chấp nhận field `accessToken` nhưng cũng set từ `access_token` (đã tương thích qua thunks). Đồng bộ lại type để rõ ràng hơn nếu cần.

- CSRF middleware:
  - Có `CsrfMiddleware`, hiện chỉ áp cho `/auth/refresh` theo comment; thực tế refresh dùng cookie + endpoint `auth/refresh-token`. Kiểm tra lại middleware mount nếu sử dụng.

- Upload API:
  - Server có `/upload/file`; Client `contract.service` lại dùng `/contracts/:id/files`. Cần bổ sung file APIs hoặc đổi client dùng `/upload/file` rồi liên kết vào contract.

- Swagger:
  - Có cấu hình Swagger `/api` nhưng chưa annotate @Api trên controller. Đề xuất: thêm decorator để docs tự sinh đầy đủ DTO/schema.
