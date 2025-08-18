## DTOs

### CreateContractDto
- name (string)
- contract_code? (string)
- contract_type? (string)
- category? (string)
- priority? (enum ContractPriority)
- mode (enum ContractMode: basic/editor/upload)
- template_id? (uuid)

### CreateMilestoneDto
- title (string)
- description? (string)
- start_at? (ISO date string)
- due_at? (ISO date string)
- assigned_to? (number)

### CreateCollaboratorDto
- user_id (number)
- role (enum CollaboratorRole: owner/editor/reviewer/viewer)

### Approval DTOs
- ApproveContractDto: comment?
- RejectContractDto: reason (required), comment?
- RequestChangesDto: changes (string[]), comment?

### Notification/Reminder (service-level DTO)
- CreateNotificationDto: contract_id, milestone_id?, task_id?, user_id, type, channel, title, message, scheduled_at?, metadata?
- CreateReminderDto: contract_id, milestone_id?, task_id?, user_id, type, frequency, title, message, trigger_date, advance_days?, notification_channels?, recipients?, conditions?, max_triggers?, metadata?
