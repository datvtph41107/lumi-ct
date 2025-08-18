export enum AdminRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
}

export enum Role {
    MANAGER = 'MANAGER',
    STAFF = 'STAFF',
    VIEWER = 'VIEWER',
}

export enum Permission {
    CREATE_CONTRACT = 'create_contract',
    CREATE_REPORT = 'create_report',
    READ = 'read',
    UPDATE = 'update',
    DELETE = 'delete',
    APPROVE = 'approve',
    ASSIGN = 'assign',
}

export enum TaskStatus {
    WAITING_CONFIRM = 'WAITING_CONFIRM',
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
}

export enum Department {
    ADMINISTRATIVE = 'HC',
    ACCOUNTING = 'KT',
}

export enum Status {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export enum ContractStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    APPROVED = 'approved',
    ACTIVE = 'active',
    EXPIRED = 'expired',
    CANCELLED = 'cancelled',
}

export enum ContractPhaseStatus {
    PENDING = 'PENDING', // Chưa bắt đầu
    IN_PROGRESS = 'IN_PROGRESS', // Đang thực hiện
    COMPLETED = 'COMPLETED', // Đã hoàn thành
    OVERDUE = 'OVERDUE', // Quá hạn
}

export enum ContractTaskStatus {
    WAITING_CONFIRM = 'WAITING_CONFIRM',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED',
}

export enum ContractType {
    LABOR = 'LABOR',
    PURCHASE = 'PURCHASE',
    SERVICE = 'SERVICE',
    PARTNERSHIP = 'PARTNERSHIP',
    LEASE = 'LEASE',
    NDA = 'NDA',
    FRAMEWORK = 'FRAMEWORK',
}

export enum NotificationType {
    CONTRACT_CREATED = 'CONTRACT_CREATED', // Tạo mới hợp đồng
    CONTRACT_REMINDER = 'CONTRACT_REMINDER', // Nhắc đến hạn hợp đồng
    CONTRACT_OVERDUE = 'CONTRACT_OVERDUE', // Hết hạn hợp đồng

    PHASE_REMINDER = 'PHASE_REMINDER', // Nhắc đến hạn pha
    PHASE_OVERDUE = 'PHASE_OVERDUE', // Pha quá hạn

    TASK_REMINDER = 'TASK_REMINDER', // Nhắc đến hạn công việc
    TASK_OVERDUE = 'TASK_OVERDUE', // Công việc quá hạn

    SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT', // Thông báo hệ thống
}

export enum UploadProvider {
    LOCAL = 'local',
    S3 = 's3',
    CLOUDINARY = 'cloudinary',
}
