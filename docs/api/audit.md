## API: Audit Logs

Contract scope:
- GET `/contracts/:id/audit` → query: `action?`, `user_id?`, `date_from?`, `date_to?`, `search?`, `page?`, `limit?`
- GET `/contracts/:id/audit/summary`

System/User scope (service có hỗ trợ):
- GET `/contracts/audit/user` (nếu expose) → tương tự `findByUser`
- GET `/contracts/audit/system` (nếu expose) → tương tự `getSystemAuditLogs`
