# CONTRACT_DOCUMENT.md — Tài liệu tổng quan dự án Hệ thống Quản lý Hợp đồng (Template Ecosystem)

## 0. Tóm tắt nhanh
- Mục tiêu: Xây hệ sinh thái Template Management + Template-driven Editor (giống TopCV) cho hợp đồng nội bộ (HC/KT).
- Tính năng chính: Thư viện template, soạn thảo Tiptap + drag & drop, Variable/Fields Designer, versioning (snapshot/diff/rollback), preview A4, publish, clone, RBAC/ABAC, audit, bảo mật.
- Kiến trúc: Frontend (React TS + Vite), Backend (NestJS 11 + TypeORM 0.3, MySQL), Redis (session/cache/queue), BullMQ (kế hoạch export/notifications), Outbox (kế hoạch).
- Trạng thái: Đã có luồng quản lý Template end-to-end (tạo → soạn → preview → version → publish → clone), ETag optimistic update, scope phòng ban. Còn thiếu: UI version timeline/diff/rollback, builder nâng cao, export queue, sanitize nâng cao, IAM policy chi tiết, rate limit/CSRF.

---

## 1. Mục tiêu & Tiêu chí kỹ thuật
### 1.1 Mục tiêu
- Hệ sinh thái Template giống TopCV nhưng cho hợp đồng: kéo-thả bố cục, chèn biến `{{...}}`, quản lý version, preview/print, export chất lượng in.
- Quy trình chuẩn: Tạo Template → Thiết kế (Editor/Builder) → Fields Designer → Preview → Version → Publish → Clone → Diff/Rollback → Áp dụng tạo hợp đồng → Export.

### 1.2 Tiêu chí kỹ thuật
- NestJS modular-monolith theo domain, Entities TypeORM không relations, join thủ công.
- MySQL (DDL chuẩn, index, partition audit), Redis cho session/cache/queue, BullMQ (export/notification), Outbox.
- Bảo mật: JWT (RS256 access, HS256 refresh), CSRF (double-submit), sanitize HTML, rate limit, 2FA (tùy chọn).
- RBAC 3 tầng (system/department/collaborator) + ABAC theo trạng thái hợp đồng; IAM API `iam/can` minh bạch.
- Testable/Observable: unit/integration/E2E, logs/metrics/tracing, dashboards/alerts.

---

## 2. Phạm vi & Personas
- Phòng ban: Hành chính (HC), Kế toán (KT). Scope phòng ban bắt buộc.
- Vai trò hệ thống: Admin, Manager (phòng ban), Staff.
- Vai trò cộng tác viên (trên hợp đồng): Owner/Editor/Reviewer/Viewer.

---

## 3. Kiến trúc tổng thể
```
Frontend (React TS + Vite)
 ├─ Pages: /templates, /templates/:id, /contracts/new
 ├─ Components: TemplateEditor (Tiptap), FieldsDesigner, PlaceholderPanel, ClauseLibrary,
 │              VersionTimeline, PreviewPane, TemplateBuilder (drag-drop)
 ├─ State: redux/toolkit (auth/index), zustand (editor UI)
 ├─ Forms: react-hook-form + zod

Backend (NestJS)
 ├─ Modules: Auth, IAM, Templates (trong contract module), TemplateVersions,
 │           Fields, Contracts, Render, Export, Files, Audit, RBAC, Notification, Cron
 ├─ DB: MySQL (TypeORM 0.3, entities không relations, join thủ công)
 ├─ Cache/Queue: Redis, BullMQ (kế hoạch)
 ├─ Object Storage: S3/MinIO (kế hoạch cho export)
 ├─ Worker: PDF/DOCX renderer (Puppeteer/docxtemplater)
```

---

## 4. Cấu trúc repo
```
repo/
├─ server/
│  ├─ src/
│  │  ├─ modules/
│  │  │  ├─ auth/ ...
│  │  │  ├─ iam/ ...
│  │  │  ├─ contract/
│  │  │  │  ├─ template.controller.ts
│  │  │  │  ├─ template.service.ts
│  │  │  │  └─ ... (contract.service, collaborator, policy, ...)
│  │  │  ├─ notification/ ...
│  │  │  ├─ cron-task/ ...
│  │  ├─ core/
│  │  │  ├─ domain/ (entities không relations)
│  │  │  ├─ shared/ (decorators, enums, filters, types)
│  │  ├─ providers/database/ ...
│  │  └─ app.module.ts
│  └─ package.json
│
├─ client/
│  ├─ src/
│  │  ├─ page/Templates/
│  │  │  ├─ TemplateListPage.tsx (+ .module.scss)
│  │  │  ├─ TemplateDetailPage.tsx (+ .module.scss)
│  │  │  └─ components/
│  │  │     ├─ TemplateEditor.tsx (Tiptap + VariableToken)
│  │  │     ├─ TemplateBuilder.tsx (drag-drop scaffold)
│  │  │     └─ FieldsDesigner.tsx
│  │  ├─ services/api/template.service.ts (API client)
│  │  └─ components/Editor/Editor.tsx (editor chung)
│  └─ package.json
└─ CONTRACT_DOCUMENT.md (file tài liệu này)
```

---

## 5. Backend chi tiết
### 5.1 Entities tiêu biểu (không relations)
- `contract_templates`: id, name, category, mode, fields(json), sections(json), editor_content(text), tags[], is_public, is_active, version (semver), department_id, created_by, updated_by, timestamps.
- `contract_template_version`: id, template_id, version_number (int), content_snapshot(json), placeholders(json), changelog, created_by, created_at.
- Tham khảo thêm: `contracts`, `collaborators`, `audit_logs`, `user_sessions`, `revoked_tokens`.

### 5.2 Modules/Services
- Templates (trong `contract.module`):
  - `TemplateService`:
    - CRUD template; list theo scope `department_id`.
    - Versioning: `createVersion`, `listVersions`, `diffVersions`, `rollbackToVersion` (snapshot immutable).
    - Publish: `publishTemplate` (validateBeforePublish: content không rỗng, token hợp lệ, required fields có mặt; bump version patch).
    - Preview: `previewTemplate` (chuyển content/version thành HTML → sanitize cơ bản → trả `{ html }`).
    - Clone: `cloneTemplate` (tạo template mới + version 1).
    - ETag: `getTemplate`/`updateTemplate` trả/nhận `__etag` (sha1(editor_content)) để optimistic concurrency.
  - `TemplateController`: expose đầy đủ endpoints.
- IAM: `IamService` + `IamController` (GET `/api/iam/can`)
- Auth/Guard: `AuthGuardAccess`, `RolesGuard`, `CollaboratorGuard` (manager bypass theo `department_id` cùng hợp đồng).

### 5.3 Endpoints chính
- Template Library
  - `GET  /api/contracts/templates?q=&category=&status=&page=&size=`
  - `GET  /api/contracts/templates/:id`
  - `POST /api/contracts/templates`
  - `PATCH /api/contracts/templates/:id`
  - `DELETE /api/contracts/templates/:id`
- Versioning
  - `GET  /api/contracts/templates/:id/versions`
  - `POST /api/contracts/templates/:id/versions` { content, placeholders?, changelog?, draft? }
  - `POST /api/contracts/templates/:id/versions/:versionId/diff` { targetVersionId }
  - `POST /api/contracts/templates/:id/versions/:versionId/rollback`
- Preview/Publish/Clone
  - `POST /api/contracts/templates/:id/preview` { content|versionId, mockData? }
  - `POST /api/contracts/templates/:id/publish` { versionId? }
  - `POST /api/contracts/templates/:id/clone` { name }
- IAM
  - `GET  /api/iam/can?action=...&resourceType=template|contract&resourceId=:id`

### 5.4 Bảo mật & Concurrency
- JWT Access 15’ (RS256), Refresh 7–30 ngày (HS256, cookie, rotate), session idle, revoke.
- ETag optimistic update for template updates.
- Sanitization HTML (cơ bản: strip script/on*); khuyến nghị `sanitize-html`/DOMPurify server-side.
- CSRF double-submit (kế hoạch), Rate limit preview/export (kế hoạch).

### 5.5 Export/Rendering (kế hoạch)
- Pipeline: tiptap JSON + data → HTML → sanitize → Puppeteer (A4, fonts VN) → S3 → presigned link (BullMQ queue, idempotency).
- DOCX: docxtemplater dựa trên base .docx + variables mapping.

---

## 6. Frontend chi tiết
### 6.1 Tech stack
- React + TS + Vite; SCSS Modules; axios; redux/toolkit (auth/index), zustand (editor UI), react-hook-form + zod (forms), Tiptap (editor), dnd-kit/@hello-pangea/dnd (drag-drop).

### 6.2 Pages & Components
- `TemplateListPage`
  - List/search/filter; tạo mới; clone (gọi API); mở chi tiết.
- `TemplateDetailPage`
  - Tabs: Editor (Tiptap), Builder (drag-drop scaffold), Fields (FieldsDesigner), Preview (iframe), Versions, Settings.
  - Nút Preview (gọi `/preview`), Publish (gọi `/publish`).
  - ETag: gửi `__etag` khi PATCH để tránh ghi đè.
- `TemplateEditor` (Tiptap)
  - Cài đặt extensions cơ bản; thêm `VariableToken` để chèn `{{variables}}`.
- `TemplateBuilder` (scaffold)
  - Kéo thả field từ Toolbox sang Canvas; có thể mở rộng layout/grid/columns, properties panel.
- `FieldsDesigner`
  - Quản lý schema fields (key/label/type/required), lưu PATCH template.

### 6.3 Snippets trọng tâm
- VariableToken (Tiptap)
```ts
export const VariableToken = Node.create({
  name: 'variableToken', inline: true, group: 'inline', atom: true,
  addAttributes() { return { key: {}, label: {}, format: { default: 'text' } }; },
  parseHTML() { return [{ tag: 'span[data-var]' }]; },
  renderHTML({ node }) {
    return ['span', { 'data-var': node.attrs.key, class: 'var-chip' }, node.attrs.label || node.attrs.key];
  },
  addCommands() { return { insertVariable: (key, label) => ({ chain }) =>
    chain().focus().insertContent({ type: 'variableToken', attrs: { key, label: label || key } }).run() }; }
});
```
- DnD handler
```tsx
const onDragEnd = ({ active, over }: DragEndEvent) => {
  if (!over) return;
  if (active.data.current?.type === 'field') {
    insertFieldAtPosition(active.data.current.field, over.data.current?.position);
  }
};
```
- Puppeteer PDF (server)
```ts
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.addStyleTag({ content: '@page{size:A4;margin:20mm} *{font-family:Times New Roman, Arial, sans-serif}' });
const pdf = await page.pdf({ format: 'A4', printBackground: true });
```

---

## 7. Luồng nghiệp vụ Template (đang chạy)
1) Tạo template: POST `/api/contracts/templates` (server gán department).
2) Soạn thảo: Tab Editor/Builder; autosave debounce cập nhật content; có thể tạo version draft.
3) Fields: Tab Fields, cập nhật schema → PATCH template.
4) Preview: POST `/preview` { content|versionId } → trả `{ html }` (sanitize) → hiển thị iframe A4.
5) Version: POST `/versions` tạo snapshot; GET `/versions` liệt kê.
6) Publish: POST `/publish` (validateBeforePublish: content/variables/required fields, bump version patch).
7) Clone: POST `/clone` tạo template mới + version 1.
8) Diff/Rollback: POST `/versions/:id/diff`, `/versions/:id/rollback`.

---

## 8. RBAC/ABAC & Scope phòng ban
- System roles: admin/manager/staff.
- Department scope: mọi thao tác template bị giới hạn bởi `department_id` (manager trong cùng phòng ban).
- Collaborator (hợp đồng): Owner/Editor/Reviewer/Viewer; CollaboratorGuard: manager chỉ bypass khi cùng phòng ban.
- IAM `/api/iam/can`: đánh giá quyền động, trả `{ allow, reasons }` để FE ẩn/disable action.

---

## 9. Bảo mật/Validation & Concurrency
- Auth: Access JWT (RS256, 15’), Refresh JWT (HS256, 7–30 ngày, cookie), session idle, revoke.
- CSRF: double-submit cookie (kế hoạch, cần middleware FE/BE đồng bộ).
- XSS: sanitize server (cơ bản, nên chuyển sang `sanitize-html`/DOMPurify).
- Rate limit: preview/export (kế hoạch, dùng `@nestjs/throttler`).
- ETag optimistic update: `getTemplate` trả `__etag`; `updateTemplate` nhận `__etag` và kiểm tra mismatch.

---

## 10. Testing & Observability
- Unit (ưu tiên):
  - `validateBeforePublish`, `diffVersions`, `rollbackToVersion`, IAM `can`, ETag mismatch.
- Integration:
  - create/update/version/preview/publish/diff/rollback.
- E2E (Playwright):
  - Tạo template → chèn variable → publish → clone → diff → rollback.
- Observability:
  - Logs: winston.
  - Metrics: prom-client (preview_time_ms, publish_count, queue_depth khi triển khai export).
  - Errors: Sentry.

---

## 11. Build & Run (dev)
### Server
- Cài đặt: `cd server && npm ci`
- Build: `npx @nestjs/cli build` hoặc `npm run build`
- Env cần thiết:
  - DB: `DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME`
  - JWT: `ACCESS_TOKEN_PRIVATE_KEY, ACCESS_TOKEN_PUBLIC_KEY, REFRESH_TOKEN_SECRET`
  - App: `NODE_ENV, PORT, PREFIX, CLIENT_URL`
  - (Tùy chọn) Redis/S3/Queue: `REDIS_URL, S3_*`

### Client
- Cài đặt & chạy: `cd client && npm ci && npm run dev`
- Mở `/templates` để bắt đầu luồng quản lý template.

---

## 12. Matrix: Đã làm / Cần làm
### Đã làm
- BE: Template CRUD, versions (create/list/diff/rollback), publish (validate), preview (sanitize cơ bản), clone, ETag, scope phòng ban, IAM `/iam/can`.
- FE: TemplateList (styled, clone), TemplateDetail (tabs, Tiptap Editor, Builder scaffold, FieldsDesigner, Preview iframe, Publish), gửi `__etag` khi update.

### Cần làm (ưu tiên)
- FieldsDesigner nâng cao (validations, select options, conditional logic; generate zod schema).
- Builder layout/columns + snap-to-grid + properties panel đầy đủ; ClauseLibrary UI.
- VersionTimeline UI (jsondiffpatch viewer + rollback UX).
- sanitize-html/DOMPurify server; CSP headers; rate limit preview/export; CSRF middleware.
- Export pipeline: BullMQ + S3 + presigned URL; watermark/fonts; metrics export_time_ms.
- Search index (Meilisearch/Elastic); realtime collab (Yjs) phase sau; eSign.
- Tests đầy đủ (unit/integration/E2E) + metrics/tracing dashboards.

---

## 13. Roadmap (khuyến nghị)
- Sprint 1: FieldsDesigner nâng cao; sanitize-html; IAM check publish; rate limit preview.
- Sprint 2: VersionTimeline UI + diff viewer; rollback UX; ClauseLibrary (snippets).
- Sprint 3: Export queue (BullMQ) + S3 + watermark; download links; metrics.
- Sprint 4: Builder layout/columns + properties; conditional content/logic; field-level formatting.
- Sprint 5: Search index published templates; analytics; admin dashboards.
- Sprint 6: Realtime collab (Yjs); eSign; hardening/QA/security review.

---

## 14. Coding guidelines
- Backend: NestJS module theo domain; TypeORM entities không relations; join thủ công; DTO + class-validator; guards/interceptors rõ ràng; logs chuẩn; không throw loose errors.
- Frontend: Components rõ trách nhiệm; state phân tầng (redux vs zustand); debounce autosave; SCSS Modules BEM; không lẫn logic trình bày/logic nghiệp vụ.

---

## 15. FAQ
- Vì sao không dùng relations? Để kiểm soát join, tối ưu index, giảm chi phí ORM khi scale.
- Vì sao render server cho PDF? Đảm bảo chất lượng in (fonts, page-break) và an toàn (sanitize) tốt hơn client-side.
- Vì sao cần ETag? Tránh ghi đè xung đột khi nhiều người cùng chỉnh template.

---

## 16. Liên hệ & đóng góp
- Mở issue/PR theo module; tuân thủ guidelines; viết tests tương ứng; update tài liệu nếu thay đổi API/flow.