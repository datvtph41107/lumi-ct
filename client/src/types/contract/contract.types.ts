import type { BasicTemplateStructure, EditorTemplateStructure, UploadedFile } from "./contract-template.types";

export type ContractCreationMode = "basic" | "editor" | "upload";
export type ContractType = "service" | "purchase" | "employment" | "nda" | "partnership" | "rental" | "custom";
export type ContractCategory = "business" | "legal" | "hr" | "procurement" | "partnership";
export type ContractStatus = "draft" | "pending_review" | "active" | "completed" | "cancelled" | "expired";
export type Priority = "low" | "medium" | "high" | "critical";
export type ContractCreationStage = "template_selection" | "basic_info" | "content_draft" | "milestones_tasks" | "review_preview";

// Task and milestone status
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type MilestoneStatus = "pending" | "in_progress" | "completed" | "overdue" | "cancelled";

// Date range interface
export interface DateRange {
    startDate: string | null;
    endDate: string | null;
}

// File upload interface

export interface TimeRange {
    estimatedHours: number;
    actualHours?: number;
}

// Form-specific contract data
export interface BasicFormContractData extends BaseContractData {
    mode: "basic";
}

// Editor-specific contract data
export interface EditorContractData extends BaseContractData {
    mode: "editor";
}

// Upload-specific contract data
export interface UploadContractData extends BaseContractData {
    mode: "upload";
}

// Base contract form data
export interface BaseContractData {
    name: string;
    contractCode?: string;
    contractType: ContractType;
    drafter: string;
    manager: string;
    dateRange?: DateRange;
    milestones: ContractMilestone[];
    tags?: string[];
    notes?: string;
    structure?: ContractStructure;
    notificationSettings?: {
        contractNotifications: unknown[];
        milestoneNotifications: unknown[];
        taskNotifications: unknown[];
        globalSettings: {
            enableEmailNotifications: boolean;
            enableSMSNotifications: boolean;
            enableInAppNotifications: boolean;
            enablePushNotifications: boolean;
            defaultRecipients: string[];
            workingHours: {
                start: string;
                end: string;
                timezone: string;
            };
        };
    };
    attachments?: UploadedFile[];
    priority?: Priority;
    version?: VersionMetadata;

    // check bản nháp
    currentStage?: ContractCreationStage;
    isDraft?: boolean;
}

export interface ContractStructure {
    form?: BasicTemplateStructure; // Basic mode (form fields)
    editor?: EditorTemplateStructure; // Editor mode (TipTap/HTML)
}

export interface VersionMetadata {
    id: string;
    updatedBy: string;
    updatedAt: string;
    changeLog?: string;
}

export interface ContractMilestone {
    id: string;
    name: string;
    description?: string;
    dateRange: DateRange;
    assigneeId: string;
    tasks: ContractTask[];
    priority: Priority;
}

// Task interface with improved structure
export interface ContractTask {
    id: string;
    name: string;
    description?: string;
    assigneeId: string;
    timeRange: TimeRange;
    priority: Priority;
    dependencies: string[]; // Task IDs
    attachments: string[]; // File IDs
    comments?: string[];
}

export type ContractFormData = BasicFormContractData | EditorContractData | UploadContractData;

export type ContractCreationMode = "basic" | "editor" | "upload";
// ====== TEMPLATE STRUCTURE BASE ======
export interface BaseTemplateStructure {
    templateid: string; // Template ID
    name: string; // Template name
    description?: string; // Optional description
    version?: number; // Template version
}

// ====== BASIC MODE TEMPLATE STRUCTURE ======
export interface BasicTemplateStructure extends BaseTemplateStructure {
    sections: TemplateSection[]; // Form sections
    fields: TemplateField[]; // Form fields
}

export interface TemplateSection {
    id: string;
    name: string;
    title: string;
    description?: string;
    order: number;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    conditional?: ConditionalLogic;
}

export interface TemplateField {
    id: string;
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    defaultValue?: unknown;
    validation?: FieldValidation;
    options?: FieldOption[];
    conditional?: ConditionalLogic[];
    layout?: FieldLayout;
    helpText?: string;
    metadata?: Record<string, unknown>;
}

export type FieldType =
    | "text"
    | "textarea"
    | "number"
    | "date"
    | "dateRange"
    | "select"
    | "multiselect"
    | "checkbox"
    | "radio"
    | "file"
    | "currency"
    | "email"
    | "phone"
    | "url";

export interface FieldOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

export interface FieldValidation {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customValidator?: string;
    errorMessage?: string;
}

export interface FieldLayout {
    width: "full" | "half" | "third" | "quarter";
    order: number;
    section: string;
    column?: 1 | 2 | 3;
    breakAfter?: boolean;
}

export interface ConditionalLogic {
    dependsOn: string;
    value: unknown;
    operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "in" | "not_in";
    action: "show" | "hide" | "enable" | "disable" | "require";
}

// ====== EDITOR MODE TEMPLATE STRUCTURE ======
export interface EditorTemplateStructure extends BaseTemplateStructure {
    document: unknown; // TipTap JSON document
    variables: EditorContent;
    styles?: Record<string, unknown>;
    uploadedFile?: UploadedFile;
}

export interface EditorContent {
    content: string; // This can be a rich text object, HTML, or any other format
    plainText: string;
    metadata: {
        wordCount: number;
        characterCount: number;
        lastEditedAt: string;
        version: number;
    };
}

export interface UploadedFile {
    fileId: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    extractedContent?: {
        text: string;
        metadata: Record<string, unknown>;
    };
    uploadedAt: string;
}

// ====== UNIFIED TEMPLATE STRUCTURE ======
export type TemplateStructure = BasicTemplateStructure | EditorTemplateStructure;

export type ContractCreationStage = "template_selection" | "basic_info" | "content_draft" | "milestones_tasks" | "review_preview";

export type StageStatus = "locked" | "incomplete" | "valid" | "invalid";

export interface StageValidation {
    stage: ContractCreationStage;
    status: StageStatus;
    errors: string[]; // Mảng lỗi validate cụ thể từng stage
    warnings: string[]; // Cảnh báo, không chặn bước
    isAccessible: boolean; // Quyền truy cập stage này
    completedAt?: string; // Thời gian hoàn thành stage (có thể dùng để log)
    validatedData?: Record<string, unknown>; // Dữ liệu đã validate hoặc summary
}

export interface ContractCreationFlow {
    id: string;
    currentStage: ContractCreationStage;
    stageValidations: Record<ContractCreationStage, StageValidation>;
    canProceedToNext: boolean; // Điều kiện cho next bước
    autoSaveEnabled: boolean;
    lastAutoSave?: string; // timestamp auto-save
    createdAt: string;
    updatedAt: string;
}
