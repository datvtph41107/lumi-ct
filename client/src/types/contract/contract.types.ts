// Core contract creation modes and stages
export type ContractCreationMode = "basic" | "editor" | "upload";
export type ContractCreationStage = "template_selection" | "basic_info" | "content_draft" | "milestones_tasks" | "review_preview";

// Domain enums
export type ContractType = "service" | "purchase" | "employment" | "nda" | "partnership" | "rental" | "custom";
export type ContractCategory = "business" | "legal" | "hr" | "procurement" | "partnership";
export type ContractStatus = "draft" | "pending_review" | "active" | "completed" | "cancelled" | "expired";
export type Priority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type MilestoneStatus = "pending" | "in_progress" | "completed" | "overdue" | "cancelled";

// Shared structures
export interface DateRange { startDate: string | null; endDate: string | null }
export interface TimeRange { estimatedHours: number; actualHours?: number }

// Template structures (basic form/editor/upload)
export interface TemplateSection { id: string; name: string; title: string; description?: string; order: number; collapsible?: boolean; defaultCollapsed?: boolean }
export type FieldType = "text" | "textarea" | "number" | "date" | "dateRange" | "select" | "multiselect" | "checkbox" | "radio" | "file" | "currency" | "email" | "phone" | "url";
export interface FieldOption { value: string; label: string; description?: string; disabled?: boolean }
export interface FieldValidation { required?: boolean; min?: number; max?: number; minLength?: number; maxLength?: number; pattern?: string; errorMessage?: string }
export interface FieldLayout { width: "full" | "half" | "third" | "quarter"; order: number; section: string; column?: 1 | 2 | 3; breakAfter?: boolean }
export interface TemplateField { id: string; name: string; label: string; type: FieldType; placeholder?: string; defaultValue?: unknown; validation?: FieldValidation; options?: FieldOption[]; layout?: FieldLayout; helpText?: string; metadata?: Record<string, unknown> }

export interface BasicTemplateStructure { templateid: string; name: string; description?: string; version?: number; sections: TemplateSection[]; fields: TemplateField[] }
export interface EditorContentMeta { wordCount: number; characterCount: number; lastEditedAt: string; version: number }
export interface EditorContent { content: string; plainText: string; metadata: EditorContentMeta }
export interface UploadedFile { fileId: string; fileName: string; fileUrl: string; fileSize: number; mimeType: string; uploadedAt: string }
export interface EditorTemplateStructure { templateid: string; name: string; description?: string; version?: number; document: unknown; variables: EditorContent; styles?: Record<string, unknown>; uploadedFile?: UploadedFile }
export type TemplateStructure = BasicTemplateStructure | EditorTemplateStructure;

// Contract form data per mode
export interface BaseContractData {
  name: string;
  contractCode?: string;
  contractType: ContractType;
  drafter?: string;
  manager?: string;
  dateRange?: DateRange;
  milestones: ContractMilestone[];
  tags?: string[];
  notes?: string;
  structure?: ContractStructure;
  attachments?: UploadedFile[];
  priority?: Priority;
  version?: VersionMetadata;
  currentStage?: ContractCreationStage;
  isDraft?: boolean;
}
export interface BasicFormContractData extends BaseContractData { mode: "basic"; content?: { mode: "basic"; templateId?: string; fieldValues?: Record<string, unknown>; description?: string } }
export interface EditorContractData extends BaseContractData { mode: "editor"; content?: { mode: "editor"; editorContent: EditorContent } }
export interface UploadContractData extends BaseContractData { mode: "upload"; content?: { mode: "upload"; uploadedFile: UploadedFile } }
export type ContractFormData = BasicFormContractData | EditorContractData | UploadContractData;

// Structures aggregations
export interface ContractStructure { form?: BasicTemplateStructure; editor?: EditorTemplateStructure }
export interface VersionMetadata { id: string; updatedBy: string; updatedAt: string; changeLog?: string }
export interface ContractMilestone { id: string; name: string; description?: string; dateRange: DateRange; assigneeId: string; tasks: ContractTask[]; priority: Priority }
export interface ContractTask { id: string; name: string; description?: string; assigneeId: string; timeRange: TimeRange; priority: Priority; dependencies: string[]; attachments: string[]; comments?: string[] }

// Stage validation/flow
export type StageStatus = "locked" | "incomplete" | "valid" | "invalid";
export interface StageValidation { stage: ContractCreationStage; status: StageStatus; errors: string[]; warnings: string[]; isAccessible: boolean; completedAt?: string; validatedData?: Record<string, unknown> }
export interface ContractCreationFlow { id: string; currentStage: ContractCreationStage; stageValidations: Record<ContractCreationStage, StageValidation>; canProceedToNext: boolean; autoSaveEnabled: boolean; lastAutoSave?: string; createdAt: string; updatedAt: string }

// Entities for store/UI
export interface ContractTemplate {
  id: string;
  name: string;
  description?: string;
  contractType: ContractType;
  category: ContractCategory;
  mode: ContractCreationMode;
  thumbnail?: string;
  fields?: TemplateField[];
  editorContent?: string;
  isActive?: boolean;
  isPublic?: boolean;
  version?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface ContractDraft {
  id: string;
  contractData: ContractFormData & {
    createdAt?: string;
    updatedAt?: string;
  };
  flow: ContractCreationFlow & { selectedMode: ContractCreationMode; selectedTemplate?: ContractTemplate | null };
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
