## Entities (Domain Model)

### Contract (`contracts`)
- id (uuid), name, contract_code?, contract_type, category, priority(enum), mode(enum), status(enum), template_id?
- start_date?, end_date?, current_stage?, version, current_version_id?
- tags(json[]), notes(text)
- flags: auto_save_enabled, is_draft
- audit: created_by, updated_by, deleted_at, deleted_by

### Milestone (`milestones`)
- id, contract_id, name, description?, date_range{start_date,end_date}, assignee_id, assignee_name
- status(enum), priority(enum), progress, deliverables(json[]), updated_by?

### Task (`tasks`)
- id, milestone_id, name, description?, assignee_id, assignee_name, time_range json, status(enum), priority(enum)
- due_date?, dependencies[], attachments[], comments[], updated_by?

### ContractContent (`contract_contents`)
- contract_id (PK), mode, basic_content?, editor_content?, uploaded_file?

### ContractDraft (`contract_drafts`)
- id, contract_id, stage, data(json), version, created_by

### ContractVersion (`contract_versions`)
- id, contract_id, version_number, content_snapshot(json), edited_by, edited_at, change_summary?

### ContractFile (`contract_files`)
- id, contract_id, file_name, file_url, file_size, mime_type, version, is_latest?, description?

### Notification (`notifications`)
- id, contract_id, milestone_id?, task_id?, user_id, type(enum), status(enum), channel(enum)
- title, message, metadata(json), scheduled_at?, sent_at?, retry_count, next_retry_at?, error_message?, is_read, read_at?

### ContractReminder (`contract_reminders`)
- id, contract_id, milestone_id?, task_id?, user_id, type(enum), frequency(enum), status(enum)
- title, message, trigger_date, advance_days, notification_channels[], recipients[], conditions?, last_triggered_at?, trigger_count, max_triggers, metadata?, created_by?, updated_by?

### AuditLog (`audit_logs`)
- id, contract_id?, user_id?, action, meta(json)?, description?, created_at

### CollaboratorRole (enum)
- owner, editor, reviewer, viewer

### SystemNotificationSettings
- enable_email_notifications, enable_sms_notifications, enable_inapp_notifications, enable_push_notifications
- working_hours{start,end,timezone,workingDays[]}, quiet_hours{enabled,start,end}
- escalation_rules{enabled, escalateAfter{value,unit}, escalateTo[]}, default_recipients[]
