## Client (React) Cấu trúc & Flow

- Core:
  - `core/http/clients`: `PrivateApiClient` chèn Bearer, tự refresh 401
  - `core/http/settings`: `AuthManager`, `SessionManager`
  - `redux/slices/auth.slice.ts`: login/logout/refresh/me/permissions
- Services (`/src/services/api`): `contract.service.ts`, `contract-draft.service.ts`, `collaborator.service.ts`, `notification-settings.service.ts`, `audit-log.service.ts`
- Pages/Components: Stages (`StageDraft`, `StageMilestones`, `StageNotifications`, `StagePreview`), Editor, SidebarLeft/Right
- Stores: `contract-store.ts`, `contract-draft-store.ts`, `contract-editor-store.ts`

Luồng người dùng:
1. `/contracts/create` → chọn mode
2. `/contracts/collection` → chọn template/draft
3. `/contracts/draft/:id` → soạn thảo; sidebar quản trị milestones, tasks, notifications
4. StageMilestones → StageNotifications → StagePreview
5. Export/Print
