# Client Documentation (React + TypeScript)

## 1. Kiến trúc & Thư mục
```
client/
  src/
    App.tsx, main.tsx
    assets/, components/, constants/, contexts/
    core/
      auth/ (AuthCoreService, PermissionGuard, Auth, session)
      contract/ (helper core cho hợp đồng)
      http/
        api/ (ApiClient, BaseApiSliceBuilder, createApiSlice)
        clients/ (BaseApiClient, PublicApiClient, PrivateApiClient)
        settings/ (Config/Auth/Session managers)
      types/ (Api types dùng chung)
      Logger.ts
    hooks/ (useContractForm, useAutoSave, useInactiveTimeout, ...)
    layouts/
    page/
      Contract/
        CreateContract.tsx
        ContractCollection.tsx
        ContractDaft.tsx
        components/
          stages/
            StageDraft.tsx
            Milestones/StageMilestones.tsx
            Notification/StageNotifications.tsx
            Preview/StagePreview.tsx
          DaftContract/ (EditorPage, HeaderBar, SidebarLeft, SidebarRight,...)
          Sidebar/ (ProgressSidebar, ContractSummary)
      admin/
        UserManagement/
        RolePermissionManagement/
        SystemNotifications/
      Dashboard/, ...
    redux/ (store, slices)
    routes/ (routes.tsx)
    services/api/ (service chia theo domain)
    store/ (zustand stores cho draft/editor/contract)
    types/ (types domain: contract, notifications, auth, admin)
    utils/
```

- Phân tầng
  - Core Http: chuẩn hóa request/response, token/refresh, session/idle.
  - Services: gọi API theo domain, mỗi service trả về `ApiResponse<T>` với `data` đã chuẩn hóa.
  - State: Redux (auth/permission/api slice), Zustand (contract draft/editor stores), React state cục bộ.
  - UI: page/components tách biệt, Editor Tiptap trong StageDraft.

## 2. Điều hướng & Workflow
- Luồng tạo hợp đồng:
  1) `/contracts/create` → chọn mode (basic | editor | upload)
  2) `/contracts/collection` → lựa chọn template hoặc tiếp tục nháp
  3) `/page/create/daft?draftId=...` → Stage 1..4:
     - Stage 1: Draft (Basic/Editor/Upload)
     - Stage 2: Milestones & Tasks
     - Stage 3: Notification Rules
     - Stage 4: Preview/Print/Export

- StageFlow: `useContractStore` quản lý `currentStep` (1..4), mỗi stage validate & nextStep.

## 3. State Management
- Redux Toolkit (auth/sessions/permissions): `redux/slices/auth.slice.ts`
  - AuthCoreService: cung cấp helper kiểm tra quyền (resource/action), tải permissions.
  - PermissionGuard: bọc UI actions nhạy cảm (export/delete/transfer ownership).

- Zustand (contract):
  - `store/contract-draft-store.ts`: quản lý draft flow (selectedMode, stageValidations, currentDraft), gọi `contract-draft.service`.
  - `store/contract-editor-store.ts`: quản lý editor pages/blocks/UI state.
  - `store/contract-store.ts`: danh sách hợp đồng, step flow đơn giản (1..4) cho màn tạo.

## 4. Types & Chuẩn hóa
- Chuẩn types domain tại `types/contract/contract.types.ts`:
  - ContractFormData, ContractMilestone/ContractTask, Milestone/Task (UI alias), VersionMetadata, ContractTemplate/Draft
- Alias legacy: `types/milestone.types.ts` để giữ tương thích thành phần cũ (milestone-form, task-form, timeline, edit modals).
- Notifications: `types/notifications.types.ts`
- Auth/Admin: `types/auth/*`, `types/admin/*`
- API types: `core/types/api.types.ts` là nguồn chuẩn (đã được re-export trong `types/api.types.ts`).

Quy tắc type
- Xuất type theo domain, tái sử dụng `DateRange/TimeRange`, gom alias cho UI.
- Tránh any/unknown không cần thiết; đặt tên đầy đủ (Clean Code).

## 5. HTTP & API Services
- ApiClient (axios instance public/private):
  - Private client tự động đính kèm Bearer, refresh 401, track session activity.
- BaseApiClient: trả `ApiResponse<T>`; ném lỗi `{ message, statusCode, details }`.
- Services tại `services/api/`:
  - contract.service.ts: CRUD, stages, versions, milestones/tasks, collaborators, files, approval, export/print, analytics, dashboard stats, templates.
  - contract-draft.service.ts: draft CRUD.
  - contract-template.service.ts: danh sách/chi tiết template.
  - audit-log.service.ts: audit endpoints.
  - collaborator.service.ts: collaborators + permissions.
  - notification-settings.service.ts: global settings + queue + contract notifications/reminders.
  - admin-user.service.ts, admin-rbac.service.ts: RBAC/User APIs.

Response chuẩn
- Server interceptor trả `{ success: true, message, data }`; client `ApiResponse<T>` hỗ trợ cả trường hợp có/không `success/status/message`.
- UI chỉ đọc `response.data`. Lỗi đọc `message` từ exception ném ra.

## 6. Editor & Export/Print
- Tiptap editor trong `components/Editor/Editor.tsx`.
- `HeaderBar.tsx`:
  - Export HTML (client-side từ editor.getHTML())
  - Download PDF/DOCX (server endpoints) – bọc `PermissionGuard`(contract:export)
  - Print: `window.print()` + CSS print (`GlobalStyles.scss`) ẩn sidebar/chrome.

## 7. Notifications
- StageNotifications: quản lý rule theo hợp đồng/mốc/task + global settings; gọi `notification-settings.service`.
- Trang admin: `/admin/notifications` (global), `/admin/notifications/queue` (pending/failed, retry).

## 8. Collaborators & Audit
- `SidebarRight` nhúng `CollaboratorManagement` và tab “Hoạt động” lấy từ `audit-log.service`.
- Quyền collaborator hiển thị action quản lý phù hợp role/permission.

## 9. Linting & Coding Guidelines
- ESLint + Prettier cấu hình sẵn.
- Quy ước:
  - Tên biến/hàm có nghĩa; không viết tắt khó hiểu.
  - Sử dụng early-return, hạn chế nesting sâu.
  - Không thêm comment dư thừa; comment giải thích “tại sao” thay vì “như thế nào”.
  - Không reformat code ngoài phạm vi chỉnh sửa.

## 10. Build & Deploy (Client)
- Scripts: `npm run build` tạo `dist/`.
- Docker: `client/Dockerfile` build & serve qua nginx (xem `DOCKER.md`).

## 11. Checklist refactor (đã làm)
- Đồng bộ hoá ApiResponse giữa `types/api.types.ts` và `core/types/api.types.ts` (re-export).
- Thêm `types/milestone.types.ts` để tương thích thành phần cũ.
- Bọc Export/Print bằng `PermissionGuard`.
- Kiểm soát redirect route admin qua barrel index files.

## 12. Hướng dẫn mở rộng
- Thêm Approval Stage (5) và UI duyệt/ghi chú.
- Tối ưu export (Playwright/Puppeteer, DOCX template).
- Thêm test E2E (Playwright/Cypress) luồng tạo → nháp → milestones → notifications → export.