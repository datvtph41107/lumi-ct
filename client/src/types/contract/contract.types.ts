import type { BasicTemplateStructure, EditorTemplateStructure, UploadedFile, TemplateField } from "./contract-template.types";

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

// ====== CONTRACT CONTENT (MODE-SPECIFIC) ======
export type ContractContent =
    | {
          mode: "basic";
          templateId?: string;
          fieldValues?: Record<string, unknown>;
          description?: string;
          terms?: string;
          conditions?: string;
      }
    | {
          mode: "editor";
          templateId?: string;
          editorContent: EditorContent;
      }
    | {
          mode: "upload";
          templateId?: string;
          uploadedFile: UploadedFile;
          editorContent?: EditorContent;
      };

// ====== CONTRACT DATA (DRAFT PAYLOAD) ======
export interface ContractData {
    name: string;
    contractCode?: string;
    contractType: ContractType;
    category?: ContractCategory;
    priority?: Priority;
    drafterId?: string;
    drafterName?: string;
    managerId?: string;
    managerName?: string;
    content: ContractContent;
    dateRange: DateRange;
    milestones: ContractMilestone[];
    tags?: string[];
    attachments?: UploadedFile[];
    notes?: string;
    status: ContractStatus;
    createdAt: string;
    updatedAt: string;
}

// ====== TEMPLATE MODEL ======
export interface ContractTemplate {
    id: string;
    name: string;
    description?: string;
    contractType: ContractType;
    category?: string;
    mode: ContractCreationMode;
    thumbnail?: string;
    // For basic templates
    fields?: TemplateField[];
    // For editor templates
    editorContent?: string | EditorContent | EditorTemplateStructure;
    isActive: boolean;
    isPublic?: boolean;
    version?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
}

export type CustomTemplate = ContractTemplate;

// ====== CREATION FLOW WITH SELECTION CONTEXT ======
export interface ContractCreationFlow {
    id: string;
    currentStage: ContractCreationStage;
    stageValidations: Record<ContractCreationStage, StageValidation>;
    canProceedToNext: boolean; // Điều kiện cho next bước
    autoSaveEnabled: boolean;
    lastAutoSave?: string; // timestamp auto-save
    // Selection context
    selectedMode: ContractCreationMode;
    selectedTemplate?: ContractTemplate | null;
    createdAt: string;
    updatedAt: string;
}

// ====== DRAFT MODEL ======
export interface ContractDraft {
    id: string;
    contractData: ContractData;
    flow: ContractCreationFlow;
    isDraft: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

// ====== VIEW/EDITOR STRUCTS ======
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
