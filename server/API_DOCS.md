# Contract Management API

Base URL: `/api` (prefix)
Auth: Bearer token via HTTPOnly cookie/session
Response shape:
- Success: `{ success: true, message: string, data: T }`
- Error: `{ success: false, message, statusCode, timestamp, path, error? }`

## Auth
- POST /auth/login
- POST /auth/logout
- GET  /auth/me

## Contracts
- POST   /contracts
- GET    /contracts?status=&type=&search=&page=&limit=
- GET    /contracts/:id
- PATCH  /contracts/:id
- DELETE /contracts/:id

### Stages
- PATCH /contracts/:id/autosave
- PATCH /contracts/:id/stage/:stage/save
- GET   /contracts/:id/stage/:stage
- POST  /contracts/:id/transition { from, to }
- GET   /contracts/:id/preview

### Versions
- POST /contracts/:id/versions
- GET  /contracts/:id/versions
- GET  /contracts/:id/versions/:vid
- POST /contracts/:id/versions/:vid/publish
- POST /contracts/:id/versions/:vid/rollback

### Milestones & Tasks
- POST   /contracts/:id/milestones
- GET    /contracts/:id/milestones
- PATCH  /contracts/milestones/:mid
- DELETE /contracts/milestones/:mid
- POST   /contracts/milestones/:mid/tasks
- GET    /contracts/milestones/:mid/tasks
- PATCH  /contracts/tasks/:tid
- DELETE /contracts/tasks/:tid

### Collaborators & Permissions
- POST   /contracts/:id/collaborators
- GET    /contracts/:id/collaborators
- PATCH  /contracts/collaborators/:cid
- DELETE /contracts/collaborators/:cid
- POST   /contracts/:id/transfer-ownership
- GET    /contracts/:id/permissions

### Files
- POST   /contracts/:id/files
- GET    /contracts/:id/files
- DELETE /contracts/files/:fid

### Approval
- POST /contracts/:id/approve
- POST /contracts/:id/reject
- POST /contracts/:id/request-changes

### Export & Print
- GET /contracts/:id/export/pdf -> { filename, contentBase64, contentType }
- GET /contracts/:id/export/docx -> { filename, contentBase64, contentType }
- GET /contracts/:id/print -> { html }

### Audit & Analytics
- GET /contracts/:id/audit?user_id=&action=&date_from=&date_to=&search=&page=&limit=
- GET /contracts/:id/audit/summary
- GET /contracts/audit/user?date_from=&date_to=&action=&page=&limit=
- GET /contracts/audit/system?user_id=&action=&date_from=&date_to=&page=&limit=
- GET /contracts/:id/analytics
- GET /contracts/dashboard/stats

### Templates
- GET    /contracts/templates?search=&type=&category=&is_active=
- GET    /contracts/templates/:tid
- POST   /contracts/templates
- PATCH  /contracts/templates/:tid
- DELETE /contracts/templates/:tid

## Drafts
- GET    /contract-drafts?page=&limit=&search=
- GET    /contract-drafts/:id
- POST   /contract-drafts
- PATCH  /contract-drafts/:id
- DELETE /contract-drafts/:id

## Notifications
- GET  /notifications/settings
- PUT  /notifications/settings
- GET  /notifications/pending
- GET  /notifications/failed
- POST /notifications/:id/retry

### Contract notifications
- POST /contracts/:id/notifications
- GET  /contracts/:id/notifications
- POST /contracts/:id/reminders
- GET  /contracts/:id/reminders

## Admin (RBAC/User)
- GET    /admin/users
- POST   /admin/users
- PATCH  /admin/users/:id
- POST   /admin/users/:id/deactivate
- GET    /admin/users/:id/permissions
- POST   /admin/users/:id/assign-roles
- GET    /admin/roles
- POST   /admin/roles
- PATCH  /admin/roles/:id
- DELETE /admin/roles/:id
- GET    /admin/roles/:id/permissions
- POST   /admin/roles/:id/permissions
- GET    /admin/permissions/catalog