## @secure/authz-core

Core authorization evaluator implementing role-based and context-aware policies:

- ADMIN pages: only ADMIN
- Departments: managed by department MANAGER, ADMIN override
- Contracts: all MANAGER can read; public visible to STAFF; private visible to participants

Exports:

- `authorize(subject, request)` -> { allow, reason, policy }
- `can(subject, request)` -> boolean
- `buildSubject({ id, roles, departmentIds })` -> Subject

