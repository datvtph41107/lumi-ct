# Contract Management System - Architecture & Flows

## Overview
- Departments: Administration, Accounting
- Roles: Manager, Staff; plus contract-level collaborators: owner, editor, reviewer, viewer
- Modes: Basic Form, Editor (Tiptap), Upload→Editor
- Workflow stages: Draft → Milestones/Tasks → Notifications → Preview/Review → Approval/Archive

## Server (NestJS)
- Global response: ResponseInterceptor wraps results as { success, message, data } and normalizes errors
- Modules
  - contracts: CRUD, drafts, stages, milestones/tasks, files, versions, collaborators, permissions, export/print, audit, templates
  - notifications: global settings, contract notifications/reminders, queue (pending/failed), retry; cron for reminders/escalation
  - cron-task: scheduled checks to send reminders and mark overdue
  - admin: RBAC (roles, permissions), user management endpoints
- Entities (core/domain)
  - contract, contract-content, contract-draft, contract-versions, contract-template
  - contract-milestones, contract-taks (tasks), contract-reminder, contract-notification
  - system-notification-settings
- Export/Print endpoints
  - GET /contracts/:id/export/pdf|docx returns { filename, contentBase64, contentType }
  - GET /contracts/:id/print returns { html }
- Audit endpoints
  - /contracts/:id/audit, /contracts/:id/audit/summary, /contracts/audit/(user|system)

## Client (React TS)
- State
  - Redux Toolkit: auth/permissions/session (AuthCoreService + PermissionGuard)
  - Zustand: contract stores for creation flow, editor state
- HTTP
  - ApiClient with public/private axios, HTTPOnly cookies; BaseApiClient returns ApiResponse<{ data }>
  - Adjusted ApiResponse typing to be compatible with server interceptor
- Core flows
  - CreateContract → ContractCollection → ContractDaft
  - ContractDaft stages (Zustand `useContractStore` currentStep 1..4):
    1. StageDraft (Basic | Editor | Upload)
    2. StageMilestones
    3. StageNotifications
    4. StagePreview
- Editor
  - `components/Editor/Editor.tsx` (Tiptap) inside StageDraft editor layout with `print-layout` class
  - HeaderBar: Export PDF/DOCX/HTML and Print; guarded by PermissionGuard(contract, export)
  - Print CSS: `GlobalStyles.scss` @media print hides sidebars and chrome, shows `.editor-print`
- Notifications
  - StageNotifications manages contract/milestone/task rules and global settings via `notification-settings.service`
  - Admin pages: `/admin/notifications` (settings) and `/admin/notifications/queue` (pending/failed)
- RBAC UI
  - Admin pages: `/admin/users`, `/admin/roles-permissions`
  - `PermissionGuard` used to protect sensitive actions (export/transfer ownership)
- Collaborator & Audit
  - `SidebarRight` embeds `CollaboratorManagement` and recent activity via `audit-log.service`

## Types & Compatibility
- Standardized contract types in `types/contract/contract.types.ts` including ContractMilestone/ContractTask and UI aliases Milestone/Task
- Added `types/milestone.types.ts` as a legacy alias for older milestone components to keep build green
- ApiResponse typing unified to accept both legacy and interceptor shapes

## Response & Error Handling
- Server: `ResponseInterceptor` wraps success and converts exceptions into normalized error structure { success: false, message, error }
- Client: BaseApiClient returns ApiResponse<T>; services only read `data` and optional `message`. Errors thrown carry { message, statusCode, details }

## Queues & Scheduling
- Cron-based scheduling in `cron-task` for reminders and overdue marking
- Notifications queue lists pending/failed; retry endpoint available; can be migrated to a message queue later (BullMQ/RabbitMQ) if needed

## Next Steps
- Hook StageMilestones save to persist to drafts
- Enable Approval stage and endpoints in UI
- Expand export service to real PDF/DOCX (Playwright/Puppeteer, docx templates)
- Add E2E tests for create→draft→milestones→notifications→export/print