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
